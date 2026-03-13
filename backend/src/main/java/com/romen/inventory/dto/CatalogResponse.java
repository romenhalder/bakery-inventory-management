package com.romen.inventory.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class CatalogResponse {
    private Long id;
    private String name;
    private String description;
    private String category;
    private BigDecimal basePrice;
    private BigDecimal pricePerKg;
    private String imageUrl;
    private String flavors;
    private String availableWeights;
    private String availableTiers;
    private Integer minOrderHours;
    private Boolean isActive;
    private LocalDateTime createdAt;
}
