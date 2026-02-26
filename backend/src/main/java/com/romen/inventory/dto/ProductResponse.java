// dto/ProductResponse.java
package com.romen.inventory.dto;

import com.romen.inventory.entity.Product;
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
public class ProductResponse {

    private Long id;
    private String name;
    private String description;
    private String sku;
    private String barcode;
    private String hsnCode;
    private String productCode;
    private Long categoryId;
    private String categoryName;
    private Product.ProductType productType;
    private String unitOfMeasure;
    private BigDecimal price;
    private BigDecimal costPrice;
    private BigDecimal taxRate;
    private String brandName;
    private String flavor;
    private BigDecimal weight;
    private String imageUrl;
    private Integer minStockLevel;
    private Integer maxStockLevel;
    private Integer reorderPoint;
    private Integer expiryDays;
    private Boolean isPerishable;
    private Boolean isActive;
    private Boolean isSellable;
    private Long supplierId;
    private String supplierName;
    private String createdByName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Inventory information
    private Integer currentStock;
    private Integer availableStock;
    private Boolean isLowStock;
    private Boolean isOutOfStock;
}
