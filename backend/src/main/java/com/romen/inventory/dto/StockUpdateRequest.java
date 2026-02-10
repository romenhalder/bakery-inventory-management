// dto/StockUpdateRequest.java
package com.romen.inventory.dto;

import com.romen.inventory.entity.StockTransaction;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
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
public class StockUpdateRequest {

    @NotNull(message = "Product ID is required")
    private Long productId;

    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    @NotNull(message = "Transaction type is required")
    private StockTransaction.TransactionType type;

    private String reason;

    private BigDecimal unitPrice;

    private String referenceNumber;

    private String batchNumber;

    private LocalDateTime expiryDate;

    private Long supplierId;

    private String notes;
}
