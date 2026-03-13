package com.romen.inventory.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "cake_catalog", indexes = {
        @Index(name = "idx_catalog_category", columnList = "category"),
        @Index(name = "idx_catalog_active", columnList = "is_active")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CakeCatalog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private CakeCategory category;

    @Column(name = "base_price", precision = 10, scale = 2)
    private BigDecimal basePrice;

    @Column(name = "price_per_kg", precision = 10, scale = 2)
    private BigDecimal pricePerKg;

    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Column(length = 500)
    private String flavors;

    @Column(name = "available_weights", length = 200)
    private String availableWeights;

    @Column(name = "available_tiers", length = 100)
    private String availableTiers;

    @Column(name = "min_order_hours")
    @Builder.Default
    private Integer minOrderHours = 24;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum CakeCategory {
        BIRTHDAY, WEDDING, ANNIVERSARY, PHOTO, DESIGNER, THEME, FESTIVAL, EGGLESS, CUSTOM
    }
}
