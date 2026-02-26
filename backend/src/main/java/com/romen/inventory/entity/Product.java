// entity/Product.java
package com.romen.inventory.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "products",
        indexes = {
                @Index(name = "idx_products_name", columnList = "name"),
                @Index(name = "idx_products_sku", columnList = "sku"),
                @Index(name = "idx_products_barcode", columnList = "barcode"),
                @Index(name = "idx_products_category", columnList = "category_id"),
                @Index(name = "idx_products_type", columnList = "product_type"),
                @Index(name = "idx_products_brand", columnList = "brand_name"),
                @Index(name = "idx_products_flavor", columnList = "flavor"),
                @Index(name = "idx_products_active", columnList = "is_active")
        })
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "sku", unique = true, length = 50)
    private String sku;

    @Column(name = "barcode", length = 100)
    private String barcode;

    @Column(name = "hsn_code", length = 20)
    private String hsnCode;

    @Column(name = "product_code", unique = true, length = 50)
    private String productCode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "product_type", nullable = false, length = 20)
    private ProductType productType;

    @Column(name = "unit_of_measure", length = 20)
    private String unitOfMeasure;

    @Column(precision = 10, scale = 2)
    private BigDecimal price;

    @Column(name = "cost_price", precision = 10, scale = 2)
    private BigDecimal costPrice;

    @Column(name = "tax_rate", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal taxRate = BigDecimal.ZERO;

    @Column(name = "brand_name", length = 100)
    private String brandName;

    @Column(length = 100)
    private String flavor;

    @Column(precision = 10, scale = 3)
    private BigDecimal weight;

    @Column(name = "image_url")
    private String imageUrl;

    @Builder.Default
    @Column(name = "min_stock_level")
    private Integer minStockLevel = 10;

    @Builder.Default
    @Column(name = "max_stock_level")
    private Integer maxStockLevel = 1000;

    @Builder.Default
    @Column(name = "reorder_point")
    private Integer reorderPoint = 20;

    @Column(name = "expiry_days")
    private Integer expiryDays;

    @Builder.Default
    @Column(name = "is_perishable")
    private Boolean isPerishable = false;

    @Builder.Default
    @Column(name = "is_active")
    private Boolean isActive = true;

    @Builder.Default
    @Column(name = "is_sellable")
    private Boolean isSellable = true;

    @Version
    private Long version;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum ProductType {
        FINISHED_GOOD,
        RAW_MATERIAL
    }

    @PrePersist
    @PreUpdate
    private void validate() {
        if (minStockLevel != null && maxStockLevel != null && minStockLevel > maxStockLevel) {
            throw new IllegalArgumentException("Minimum stock level cannot be greater than maximum stock level");
        }
        if (reorderPoint != null && maxStockLevel != null && reorderPoint > maxStockLevel) {
            throw new IllegalArgumentException("Reorder point cannot be greater than maximum stock level");
        }
        if (taxRate == null) {
            taxRate = BigDecimal.ZERO;
        }
        if (sku == null || sku.isEmpty()) {
            sku = generateSKU();
        }
    }

    private String generateSKU() {
        String categoryPrefix = category != null ? category.getName().substring(0, 3).toUpperCase() : "PRD";
        String timestamp = String.valueOf(System.currentTimeMillis()).substring(6);
        return categoryPrefix + "-" + timestamp;
    }
}
