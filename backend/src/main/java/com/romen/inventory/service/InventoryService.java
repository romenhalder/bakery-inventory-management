// service/InventoryService.java
package com.romen.inventory.service;

import com.romen.inventory.dto.InventoryResponse;
import com.romen.inventory.dto.StockTransactionResponse;
import com.romen.inventory.dto.StockUpdateRequest;
import com.romen.inventory.entity.Alert;
import com.romen.inventory.entity.Inventory;
import com.romen.inventory.entity.Product;
import com.romen.inventory.entity.StockTransaction;
import com.romen.inventory.entity.User;
import com.romen.inventory.exception.ResourceNotFoundException;
import com.romen.inventory.repository.AlertRepository;
import com.romen.inventory.repository.InventoryRepository;
import com.romen.inventory.repository.ProductRepository;
import com.romen.inventory.repository.StockTransactionRepository;
import com.romen.inventory.repository.SupplierRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final ProductRepository productRepository;
    private final StockTransactionRepository transactionRepository;
    private final AlertRepository alertRepository;
    private final SupplierRepository supplierRepository;

    public List<InventoryResponse> getAllInventory() {
        return inventoryRepository.findAll().stream()
                .map(this::mapToInventoryResponse)
                .collect(Collectors.toList());
    }

    public InventoryResponse getInventoryByProduct(Long productId) {
        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found for product"));
        return mapToInventoryResponse(inventory);
    }

    public List<InventoryResponse> getLowStockItems() {
        return inventoryRepository.findAllLowStock().stream()
                .map(this::mapToInventoryResponse)
                .collect(Collectors.toList());
    }

    public List<InventoryResponse> getOutOfStockItems() {
        return inventoryRepository.findByIsOutOfStockTrue().stream()
                .map(this::mapToInventoryResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public InventoryResponse updateStock(StockUpdateRequest request, User user) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        Inventory inventory = inventoryRepository.findByProductId(request.getProductId())
                .orElse(Inventory.builder()
                        .product(product)
                        .currentQuantity(0)
                        .build());

        Integer previousQuantity = inventory.getCurrentQuantity();
        Integer newQuantity;

        // Calculate new quantity based on transaction type
        switch (request.getType()) {
            case STOCK_IN:
                newQuantity = previousQuantity + request.getQuantity();
                inventory.setLastStockIn(LocalDateTime.now());
                break;
            case STOCK_OUT:
                newQuantity = previousQuantity - request.getQuantity();
                if (newQuantity < 0) {
                    throw new IllegalArgumentException("Insufficient stock. Available: " + previousQuantity);
                }
                inventory.setLastStockOut(LocalDateTime.now());
                break;
            case ADJUSTMENT:
                newQuantity = request.getQuantity(); // Direct adjustment to specific quantity
                break;
            case RETURN:
                newQuantity = previousQuantity - request.getQuantity();
                if (newQuantity < 0) {
                    throw new IllegalArgumentException("Insufficient stock for return");
                }
                break;
            case WASTAGE:
                newQuantity = previousQuantity - request.getQuantity();
                if (newQuantity < 0) {
                    throw new IllegalArgumentException("Insufficient stock to record wastage");
                }
                break;
            default:
                throw new IllegalArgumentException("Invalid transaction type");
        }

        inventory.setCurrentQuantity(newQuantity);
        
        // Set batch and expiry if provided
        if (request.getBatchNumber() != null) {
            inventory.setBatchNumber(request.getBatchNumber());
        }
        if (request.getExpiryDate() != null) {
            inventory.setExpiryDate(request.getExpiryDate());
        }

        inventory = inventoryRepository.save(inventory);

        // Create transaction record
        StockTransaction transaction = StockTransaction.builder()
                .product(product)
                .transactionType(request.getType())
                .quantity(request.getType() == StockTransaction.TransactionType.STOCK_IN ? 
                        request.getQuantity() : -request.getQuantity())
                .previousQuantity(previousQuantity)
                .newQuantity(newQuantity)
                .unitPrice(request.getUnitPrice())
                .reason(request.getReason())
                .referenceNumber(request.getReferenceNumber())
                .batchNumber(request.getBatchNumber())
                .expiryDate(request.getExpiryDate())
                .user(user)
                .supplier(request.getSupplierId() != null ? 
                        supplierRepository.findById(request.getSupplierId()).orElse(null) : null)
                .notes(request.getNotes())
                .build();

        transactionRepository.save(transaction);

        // Check and create alerts
        checkAndCreateAlerts(product, inventory, previousQuantity, newQuantity);

        return mapToInventoryResponse(inventory);
    }

    @Transactional
    public void checkAndCreateAlerts(Product product, Inventory inventory, Integer previousQty, Integer newQty) {
        // Check for low stock
        if (newQty <= product.getMinStockLevel() && previousQty > product.getMinStockLevel()) {
            createAlert(product, Alert.AlertType.LOW_STOCK, 
                    "Low stock alert: " + product.getName() + " has only " + newQty + " units remaining",
                    newQty, product.getMinStockLevel());
        }

        // Check for out of stock
        if (newQty <= 0 && previousQty > 0) {
            createAlert(product, Alert.AlertType.OUT_OF_STOCK,
                    "Out of stock: " + product.getName() + " is now out of stock",
                    newQty, 0);
        }

        // Check for reorder point
        if (newQty <= product.getReorderPoint() && previousQty > product.getReorderPoint()) {
            createAlert(product, Alert.AlertType.REORDER_POINT,
                    "Reorder point reached: " + product.getName() + " has " + newQty + " units",
                    newQty, product.getReorderPoint());
        }

        // Check expiry
        if (inventory.getExpiryDate() != null) {
            LocalDateTime expiryWarningDate = LocalDateTime.now().plusDays(7);
            if (inventory.getExpiryDate().isBefore(expiryWarningDate) && inventory.getExpiryDate().isAfter(LocalDateTime.now())) {
                if (!alertRepository.existsByProductIdAndAlertTypeAndIsResolvedFalse(product.getId(), Alert.AlertType.EXPIRING_SOON)) {
                    createAlert(product, Alert.AlertType.EXPIRING_SOON,
                            "Expiring soon: " + product.getName() + " will expire on " + inventory.getExpiryDate(),
                            newQty, 0);
                }
            }
            if (inventory.getExpiryDate().isBefore(LocalDateTime.now())) {
                if (!alertRepository.existsByProductIdAndAlertTypeAndIsResolvedFalse(product.getId(), Alert.AlertType.EXPIRED)) {
                    createAlert(product, Alert.AlertType.EXPIRED,
                            "Expired: " + product.getName() + " has expired on " + inventory.getExpiryDate(),
                            newQty, 0);
                }
            }
        }
    }

    @Transactional
    public void createAlert(Product product, Alert.AlertType type, String message, Integer currentQty, Integer threshold) {
        Alert alert = Alert.builder()
                .product(product)
                .alertType(type)
                .message(message)
                .currentQuantity(currentQty)
                .thresholdQuantity(threshold)
                .isRead(false)
                .isResolved(false)
                .build();
        alertRepository.save(alert);
        log.info("Alert created: {} for product {}", type, product.getName());
    }

    public List<StockTransactionResponse> getAllTransactions() {
        return transactionRepository.findAll().stream()
                .map(this::mapToTransactionResponse)
                .collect(Collectors.toList());
    }

    public List<StockTransactionResponse> getTransactionsByProduct(Long productId) {
        return transactionRepository.findByProductIdOrderByTransactionDateDesc(productId).stream()
                .map(this::mapToTransactionResponse)
                .collect(Collectors.toList());
    }

    public List<StockTransactionResponse> getRecentTransactions() {
        return transactionRepository.findTop10ByOrderByTransactionDateDesc().stream()
                .map(this::mapToTransactionResponse)
                .collect(Collectors.toList());
    }

    private InventoryResponse mapToInventoryResponse(Inventory inventory) {
        Product product = inventory.getProduct();
        return InventoryResponse.builder()
                .id(inventory.getId())
                .productId(product.getId())
                .productName(product.getName())
                .productCode(product.getProductCode())
                .categoryName(product.getCategory().getName())
                .productType(product.getProductType().name())
                .currentQuantity(inventory.getCurrentQuantity())
                .reservedQuantity(inventory.getReservedQuantity())
                .availableQuantity(inventory.getAvailableQuantity())
                .lastStockIn(inventory.getLastStockIn())
                .lastStockOut(inventory.getLastStockOut())
                .expiryDate(inventory.getExpiryDate())
                .batchNumber(inventory.getBatchNumber())
                .isLowStock(inventory.getIsLowStock())
                .isOutOfStock(inventory.getIsOutOfStock())
                .location(inventory.getLocation())
                .notes(inventory.getNotes())
                .createdAt(inventory.getCreatedAt())
                .updatedAt(inventory.getUpdatedAt())
                .build();
    }

    private StockTransactionResponse mapToTransactionResponse(StockTransaction transaction) {
        return StockTransactionResponse.builder()
                .id(transaction.getId())
                .productId(transaction.getProduct().getId())
                .productName(transaction.getProduct().getName())
                .productCode(transaction.getProduct().getProductCode())
                .transactionType(transaction.getTransactionType())
                .quantity(transaction.getQuantity())
                .previousQuantity(transaction.getPreviousQuantity())
                .newQuantity(transaction.getNewQuantity())
                .unitPrice(transaction.getUnitPrice())
                .totalAmount(transaction.getTotalAmount())
                .reason(transaction.getReason())
                .referenceNumber(transaction.getReferenceNumber())
                .batchNumber(transaction.getBatchNumber())
                .expiryDate(transaction.getExpiryDate())
                .userId(transaction.getUser().getId())
                .userName(transaction.getUser().getFullName())
                .supplierId(transaction.getSupplier() != null ? transaction.getSupplier().getId() : null)
                .supplierName(transaction.getSupplier() != null ? transaction.getSupplier().getName() : null)
                .transactionDate(transaction.getTransactionDate())
                .notes(transaction.getNotes())
                .build();
    }
}
