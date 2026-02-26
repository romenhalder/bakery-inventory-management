package com.romen.inventory.service;

import com.romen.inventory.dto.SalesRequest;
import com.romen.inventory.dto.SalesResponse;
import com.romen.inventory.entity.*;
import com.romen.inventory.exception.ResourceNotFoundException;
import com.romen.inventory.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SalesService {

    private final SalesOrderRepository salesOrderRepository;
    private final SalesItemRepository salesItemRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final StockTransactionRepository stockTransactionRepository;

    @Transactional
    public SalesResponse createSale(SalesRequest request, User currentUser) {
        log.info("Creating new sale by user: {}", currentUser.getEmail());

        SalesOrder order = SalesOrder.builder()
                .customerName(request.getCustomerName())
                .customerMobile(request.getCustomerMobile())
                .discountAmount(request.getDiscountAmount() != null ? request.getDiscountAmount() : BigDecimal.ZERO)
                .paymentMethod(request.getPaymentMethod() != null
                        ? SalesOrder.PaymentMethod.valueOf(request.getPaymentMethod())
                        : SalesOrder.PaymentMethod.CASH)
                .soldBy(currentUser)
                .notes(request.getNotes())
                .build();

        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal totalTax = BigDecimal.ZERO;

        for (SalesRequest.SalesItemRequest itemRequest : request.getItems()) {
            Product product = productRepository.findById(itemRequest.getProductId())
                    .orElseThrow(
                            () -> new ResourceNotFoundException("Product not found: " + itemRequest.getProductId()));

            if (!product.getIsSellable()) {
                throw new IllegalArgumentException("Product is not for sale: " + product.getName());
            }

            Inventory inventory = inventoryRepository.findByProductIdWithLock(product.getId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Inventory not found for product: " + product.getName()));

            int availableQty = inventory.getAvailableQuantity();
            if (availableQty < itemRequest.getQuantity()) {
                throw new IllegalArgumentException(
                        String.format("Insufficient stock for product: %s. Available: %d, Requested: %d",
                                product.getName(), availableQty, itemRequest.getQuantity()));
            }

            BigDecimal unitPrice = itemRequest.getUnitPrice() != null ? itemRequest.getUnitPrice() : product.getPrice();
            BigDecimal taxAmount = itemRequest.getTaxAmount() != null ? itemRequest.getTaxAmount() : BigDecimal.ZERO;
            BigDecimal discountAmount = itemRequest.getDiscountAmount() != null ? itemRequest.getDiscountAmount()
                    : BigDecimal.ZERO;

            BigDecimal lineTotal = unitPrice.multiply(new BigDecimal(itemRequest.getQuantity()));
            BigDecimal lineTax = taxAmount.multiply(new BigDecimal(itemRequest.getQuantity()));
            BigDecimal totalPrice = lineTotal.add(lineTax).subtract(discountAmount);

            SalesItem salesItem = SalesItem.builder()
                    .product(product)
                    .quantity(itemRequest.getQuantity())
                    .unitPrice(unitPrice)
                    .taxAmount(lineTax)
                    .discountAmount(discountAmount)
                    .totalPrice(totalPrice)
                    .build();

            order.addItem(salesItem);
            subtotal = subtotal.add(lineTotal);
            totalTax = totalTax.add(lineTax);

            int previousQty = inventory.getCurrentQuantity();
            int newQty = previousQty - itemRequest.getQuantity();
            inventory.setCurrentQuantity(newQty);
            inventory.setLastStockOut(LocalDateTime.now());
            inventoryRepository.save(inventory);

            StockTransaction transaction = StockTransaction.builder()
                    .product(product)
                    .transactionType(StockTransaction.TransactionType.STOCK_OUT)
                    .quantity(-itemRequest.getQuantity())
                    .previousQuantity(previousQty)
                    .newQuantity(newQty)
                    .unitPrice(unitPrice)
                    .totalAmount(lineTotal)
                    .reason("SALE - Order: " + order.getOrderNumber())
                    .user(currentUser)
                    .notes("POS Sale")
                    .build();
            stockTransactionRepository.save(transaction);

            checkAndCreateStockAlerts(product, inventory, newQty);
        }

        order.setSubtotal(subtotal);
        order.setTaxAmount(totalTax);
        order.calculateTotals();

        SalesOrder savedOrder = salesOrderRepository.save(order);
        log.info("Sale created successfully: Order #{}", savedOrder.getOrderNumber());

        return SalesResponse.fromEntity(savedOrder);
    }

    private void checkAndCreateStockAlerts(Product product, Inventory inventory, int newQty) {
        if (newQty <= product.getMinStockLevel() && newQty > 0) {
            log.warn("Low stock alert for product: {} - Quantity: {}", product.getName(), newQty);
        }
        if (newQty <= 0) {
            log.warn("Out of stock alert for product: {}", product.getName());
        }
    }

    @Transactional(readOnly = true)
    public SalesResponse getSaleById(Long id) {
        SalesOrder order = salesOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sale not found"));
        return SalesResponse.fromEntity(order);
    }

    @Transactional(readOnly = true)
    public SalesResponse getSaleByOrderNumber(String orderNumber) {
        SalesOrder order = salesOrderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Sale not found"));
        return SalesResponse.fromEntity(order);
    }

    @Transactional(readOnly = true)
    public List<SalesResponse> getAllSales() {
        return salesOrderRepository.findAll().stream()
                .map(SalesResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SalesResponse> getRecentSales(int limit) {
        LocalDateTime since = LocalDate.now().atStartOfDay();
        return salesOrderRepository.findRecentSales(since).stream()
                .limit(limit)
                .map(SalesResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SalesResponse> getRecentSalesByUser(Long userId, int limit) {
        LocalDateTime since = LocalDate.now().atStartOfDay();
        return salesOrderRepository.findRecentSalesByUser(userId, since).stream()
                .limit(limit)
                .map(SalesResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SalesResponse> getSalesByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        return salesOrderRepository.findByDateRange(startDate, endDate).stream()
                .map(SalesResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SalesResponse> getSalesByCustomerMobile(String mobile) {
        return salesOrderRepository.findByCustomerMobile(mobile).stream()
                .map(SalesResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public BigDecimal getTodaySales() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        LocalDateTime endOfDay = LocalDate.now().atTime(LocalTime.MAX);
        BigDecimal total = salesOrderRepository.calculateTotalSales(startOfDay, endOfDay);
        return total != null ? total : BigDecimal.ZERO;
    }

    @Transactional(readOnly = true)
    public Long getTodaySalesCount() {
        LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
        Long count = salesOrderRepository.countSalesToday(startOfDay);
        return count != null ? count : 0L;
    }

    @Transactional(readOnly = true)
    public BigDecimal getSalesSummary(LocalDateTime startDate, LocalDateTime endDate) {
        BigDecimal total = salesOrderRepository.calculateTotalSales(startDate, endDate);
        return total != null ? total : BigDecimal.ZERO;
    }
}
