package com.romen.inventory.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class CatalogRequest {
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
}
