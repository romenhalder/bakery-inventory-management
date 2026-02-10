// dto/StockTransactionResponse.java
package com.romen.inventory.dto;

import com.romen.inventory.entity.StockTransaction;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockTransactionResponse {

    private Long id;
    private Long productId;
    private String productName;
    private String productCode;
    private StockTransaction.TransactionType transactionType;
    private Integer quantity;
    private Integer previousQuantity;
    private Integer newQuantity;
    private BigDecimal unitPrice;
    private BigDecimal totalAmount;
    private String reason;
    private String referenceNumber;
    private String batchNumber;
    private LocalDateTime expiryDate;
    private Long userId;
    private String userName;
    private Long supplierId;
    private String supplierName;
    private LocalDateTime transactionDate;
    private String notes;
}
