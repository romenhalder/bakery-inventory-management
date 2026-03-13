package com.romen.inventory.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class BookingRequest {
    private String customerName;
    private String customerMobile;
    private String customerEmail;
    private String eventType;
    private String cakeDescription;
    private String flavor;
    private BigDecimal weightKg;
    private Integer tierCount;
    private String messageOnCake;
    private String deliveryDate;
    private String deliveryTime;
    private String deliveryAddress;
    private String designNotes;
    private BigDecimal estimatedPrice;
    private Integer depositPercentage;
    private BigDecimal depositAmount;
    private Boolean depositPaid;
    private String paymentMethod;
    private Long catalogItemId;
    private Boolean isCustom;
    private String notes;
    private String status;
}
