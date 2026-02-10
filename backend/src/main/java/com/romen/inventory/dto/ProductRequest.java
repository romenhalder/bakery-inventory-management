// dto/ProductRequest.java
package com.romen.inventory.dto;

import com.romen.inventory.entity.Product;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductRequest {

    @NotBlank(message = "Product name is required")
    private String name;

    private String description;

    private String productCode;

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    @NotNull(message = "Product type is required")
    private Product.ProductType productType;

    private String unitOfMeasure;

    private BigDecimal price;

    private BigDecimal costPrice;

    private MultipartFile image;

    @Min(value = 0, message = "Minimum stock level cannot be negative")
    private Integer minStockLevel = 10;

    @Min(value = 0, message = "Maximum stock level cannot be negative")
    private Integer maxStockLevel = 1000;

    @Min(value = 0, message = "Reorder point cannot be negative")
    private Integer reorderPoint = 20;

    private Integer expiryDays;

    private Boolean isActive = true;

    private Boolean isSellable = true;

    private Long supplierId;
}
