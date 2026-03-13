package com.romen.inventory.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Data
@Builder
public class BookingResponse {
    private Long id;
    private String bookingNumber;
    private String customerName;
    private String customerMobile;
    private String customerEmail;
    private String eventType;
    private String cakeDescription;
    private String flavor;
    private BigDecimal weightKg;
    private Integer tierCount;
    private String messageOnCake;
    private LocalDate deliveryDate;
    private LocalTime deliveryTime;
    private String deliveryAddress;
    private String designNotes;
    private BigDecimal estimatedPrice;
    private Integer depositPercentage;
    private BigDecimal depositAmount;
    private Boolean depositPaid;
    private BigDecimal remainingAmount;
    private BigDecimal finalAmount;
    private Boolean fullyPaid;
    private String paymentMethod;
    private String status;
    private Long catalogItemId;
    private String catalogItemName;
    private Boolean isCustom;
    private String createdByName;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
