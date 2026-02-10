// dto/InventoryResponse.java
package com.romen.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryResponse {

    private Long id;
    private Long productId;
    private String productName;
    private String productCode;
    private String categoryName;
    private String productType;
    private Integer currentQuantity;
    private Integer reservedQuantity;
    private Integer availableQuantity;
    private LocalDateTime lastStockIn;
    private LocalDateTime lastStockOut;
    private LocalDateTime expiryDate;
    private String batchNumber;
    private Boolean isLowStock;
    private Boolean isOutOfStock;
    private String location;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
