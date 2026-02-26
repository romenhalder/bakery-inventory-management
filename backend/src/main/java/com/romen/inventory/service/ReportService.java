// service/ReportService.java
package com.romen.inventory.service;

import com.romen.inventory.dto.InventoryResponse;
import com.romen.inventory.dto.StockTransactionResponse;
import com.romen.inventory.entity.StockTransaction;
import com.romen.inventory.repository.AlertRepository;
import com.romen.inventory.repository.InventoryRepository;
import com.romen.inventory.repository.ProductRepository;
import com.romen.inventory.repository.StockTransactionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.PrintWriter;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportService {

    private final InventoryRepository inventoryRepository;
    private final StockTransactionRepository transactionRepository;
    private final ProductRepository productRepository;
    private final AlertRepository alertRepository;
    private final InventoryService inventoryService;

    public Map<String, Object> generateStockReport(LocalDateTime startDate, LocalDateTime endDate) {
        Map<String, Object> report = new HashMap<>();

        // Current stock summary
        report.put("totalProducts", productRepository.countActiveProducts());
        report.put("finishedGoods",
                productRepository.countByProductType(com.romen.inventory.entity.Product.ProductType.FINISHED_GOOD));
        report.put("rawMaterials",
                productRepository.countByProductType(com.romen.inventory.entity.Product.ProductType.RAW_MATERIAL));
        report.put("lowStockCount", inventoryRepository.countLowStock());
        report.put("outOfStockCount", inventoryRepository.countOutOfStock());
        report.put("totalStockQuantity", inventoryRepository.getTotalStockQuantity());

        // Stock details
        List<InventoryResponse> inventory = inventoryRepository.findAll().stream()
                .filter(inv -> inv.getProduct().getIsActive())
                .map(inv -> inventoryService.getInventoryByProduct(inv.getProduct().getId()))
                .collect(Collectors.toList());
        report.put("inventoryDetails", inventory);

        // Date range
        report.put("startDate", startDate.format(DateTimeFormatter.ISO_DATE));
        report.put("endDate", endDate.format(DateTimeFormatter.ISO_DATE));
        report.put("generatedAt", LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));

        return report;
    }

    public Map<String, Object> generateSalesReport(LocalDateTime startDate, LocalDateTime endDate) {
        Map<String, Object> report = new HashMap<>();

        // Transaction summary
        Integer totalStockIn = transactionRepository.getTotalStockIn(startDate, endDate);
        Integer totalStockOut = transactionRepository.getTotalStockOut(startDate, endDate);
        java.math.BigDecimal totalSalesAmount = transactionRepository.getTotalSalesAmount(startDate, endDate);
        Long totalTransactions = transactionRepository.countTransactions(startDate, endDate);

        report.put("totalStockIn", totalStockIn != null ? totalStockIn : 0);
        report.put("totalStockOut", totalStockOut != null ? totalStockOut : 0);
        report.put("totalSalesAmount", totalSalesAmount != null ? totalSalesAmount : java.math.BigDecimal.ZERO);
        report.put("totalTransactions", totalTransactions != null ? totalTransactions : 0);

        // Transactions by type
        List<StockTransaction> stockOutTransactions = transactionRepository.findByTypeAndDateRange(
                StockTransaction.TransactionType.STOCK_OUT, startDate, endDate);

        List<StockTransactionResponse> salesDetails = stockOutTransactions.stream()
                .map(this::mapToTransactionResponse)
                .collect(Collectors.toList());
        report.put("salesDetails", salesDetails);

        // Date range
        report.put("startDate", startDate.format(DateTimeFormatter.ISO_DATE));
        report.put("endDate", endDate.format(DateTimeFormatter.ISO_DATE));
        report.put("generatedAt", LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));

        return report;
    }

    public Map<String, Object> generateUsageReport(LocalDateTime startDate, LocalDateTime endDate) {
        Map<String, Object> report = new HashMap<>();

        // Get all transactions in date range
        List<StockTransaction> transactions = transactionRepository.findByDateRange(startDate, endDate);

        // Group by transaction type
        Map<StockTransaction.TransactionType, List<StockTransaction>> byType = transactions.stream()
                .collect(Collectors.groupingBy(StockTransaction::getTransactionType));

        // Summary statistics
        report.put("totalTransactions", transactions.size());
        report.put("stockInCount", byType.getOrDefault(StockTransaction.TransactionType.STOCK_IN, List.of()).size());
        report.put("stockOutCount", byType.getOrDefault(StockTransaction.TransactionType.STOCK_OUT, List.of()).size());
        report.put("adjustmentCount",
                byType.getOrDefault(StockTransaction.TransactionType.ADJUSTMENT, List.of()).size());
        report.put("wastageCount", byType.getOrDefault(StockTransaction.TransactionType.WASTAGE, List.of()).size());
        report.put("returnCount", byType.getOrDefault(StockTransaction.TransactionType.RETURN, List.of()).size());

        // Transaction details
        List<StockTransactionResponse> transactionDetails = transactions.stream()
                .map(this::mapToTransactionResponse)
                .collect(Collectors.toList());
        report.put("transactionDetails", transactionDetails);

        // Date range
        report.put("startDate", startDate.format(DateTimeFormatter.ISO_DATE));
        report.put("endDate", endDate.format(DateTimeFormatter.ISO_DATE));
        report.put("generatedAt", LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));

        return report;
    }

    public byte[] generateStockReportCSV(LocalDateTime startDate, LocalDateTime endDate) {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        PrintWriter writer = new PrintWriter(outputStream, true, StandardCharsets.UTF_8);

        // Header
        writer.println("Stock Report - " + startDate.toLocalDate() + " to " + endDate.toLocalDate());
        writer.println("Generated at: " + LocalDateTime.now());
        writer.println();

        // Column headers
        writer.println(
                "Product ID,Product Code,Product Name,Category,Type,Current Stock,Min Stock,Max Stock,Status,Location");

        // Data
        inventoryRepository.findAll().stream().filter(inv -> inv.getProduct().getIsActive()).forEach(inv -> {
            String status = inv.getIsOutOfStock() ? "OUT_OF_STOCK" : (inv.getIsLowStock() ? "LOW_STOCK" : "IN_STOCK");
            writer.printf("%d,%s,%s,%s,%s,%d,%d,%d,%s,%s%n",
                    inv.getProduct().getId(),
                    inv.getProduct().getProductCode(),
                    inv.getProduct().getName(),
                    inv.getProduct().getCategory().getName(),
                    inv.getProduct().getProductType(),
                    inv.getCurrentQuantity(),
                    inv.getProduct().getMinStockLevel(),
                    inv.getProduct().getMaxStockLevel(),
                    status,
                    inv.getLocation() != null ? inv.getLocation() : "");
        });

        writer.flush();
        return outputStream.toByteArray();
    }

    public byte[] generateSalesReportCSV(LocalDateTime startDate, LocalDateTime endDate) {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        PrintWriter writer = new PrintWriter(outputStream, true, StandardCharsets.UTF_8);

        // Header
        writer.println("Sales Report - " + startDate.toLocalDate() + " to " + endDate.toLocalDate());
        writer.println("Generated at: " + LocalDateTime.now());
        writer.println();

        // Column headers
        writer.println("Transaction ID,Date,Product,Product Code,Quantity,Unit Price,Total Amount,User,Reference");

        // Data
        List<StockTransaction> transactions = transactionRepository.findByTypeAndDateRange(
                StockTransaction.TransactionType.STOCK_OUT, startDate, endDate);

        transactions.forEach(t -> {
            writer.printf("%d,%s,%s,%s,%d,%s,%s,%s,%s%n",
                    t.getId(),
                    t.getTransactionDate().format(DateTimeFormatter.ISO_DATE_TIME),
                    t.getProduct().getName(),
                    t.getProduct().getProductCode(),
                    Math.abs(t.getQuantity()),
                    t.getUnitPrice() != null ? t.getUnitPrice() : "",
                    t.getTotalAmount() != null ? t.getTotalAmount() : "",
                    t.getUser().getFullName(),
                    t.getReferenceNumber() != null ? t.getReferenceNumber() : "");
        });

        writer.flush();
        return outputStream.toByteArray();
    }

    public byte[] generateUsageReportCSV(LocalDateTime startDate, LocalDateTime endDate) {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        PrintWriter writer = new PrintWriter(outputStream, true, StandardCharsets.UTF_8);

        // Header
        writer.println("Usage Report - " + startDate.toLocalDate() + " to " + endDate.toLocalDate());
        writer.println("Generated at: " + LocalDateTime.now());
        writer.println();

        // Column headers
        writer.println("Transaction ID,Date,Product,Type,Quantity,Previous Qty,New Qty,User,Reason");

        // Data
        List<StockTransaction> transactions = transactionRepository.findByDateRange(startDate, endDate);

        transactions.forEach(t -> {
            writer.printf("%d,%s,%s,%s,%d,%d,%d,%s,%s%n",
                    t.getId(),
                    t.getTransactionDate().format(DateTimeFormatter.ISO_DATE_TIME),
                    t.getProduct().getName(),
                    t.getTransactionType(),
                    t.getQuantity(),
                    t.getPreviousQuantity(),
                    t.getNewQuantity(),
                    t.getUser().getFullName(),
                    t.getReason() != null ? t.getReason() : "");
        });

        writer.flush();
        return outputStream.toByteArray();
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
