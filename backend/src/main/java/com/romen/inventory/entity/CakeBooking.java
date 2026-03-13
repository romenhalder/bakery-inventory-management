package com.romen.inventory.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Entity
@Table(name = "cake_bookings", indexes = {
        @Index(name = "idx_booking_number", columnList = "booking_number"),
        @Index(name = "idx_booking_status", columnList = "status"),
        @Index(name = "idx_booking_delivery", columnList = "delivery_date"),
        @Index(name = "idx_booking_customer", columnList = "customer_mobile")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CakeBooking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "booking_number", unique = true, nullable = false, length = 50)
    private String bookingNumber;

    @Column(name = "customer_name", nullable = false, length = 200)
    private String customerName;

    @Column(name = "customer_mobile", nullable = false, length = 20)
    private String customerMobile;

    @Column(name = "customer_email", length = 200)
    private String customerEmail;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", length = 30)
    @Builder.Default
    private EventType eventType = EventType.BIRTHDAY;

    @Column(name = "cake_description", columnDefinition = "TEXT")
    private String cakeDescription;

    @Column(length = 100)
    private String flavor;

    @Column(name = "weight_kg", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal weightKg = new BigDecimal("1.0");

    @Column(name = "tier_count")
    @Builder.Default
    private Integer tierCount = 1;

    @Column(name = "message_on_cake", length = 200)
    private String messageOnCake;

    @Column(name = "delivery_date")
    private LocalDate deliveryDate;

    @Column(name = "delivery_time")
    private LocalTime deliveryTime;

    @Column(name = "delivery_address", columnDefinition = "TEXT")
    private String deliveryAddress;

    @Column(name = "design_notes", columnDefinition = "TEXT")
    private String designNotes;

    @Column(name = "estimated_price", precision = 10, scale = 2)
    private BigDecimal estimatedPrice;

    @Column(name = "deposit_percentage")
    @Builder.Default
    private Integer depositPercentage = 50;

    @Column(name = "deposit_amount", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal depositAmount = BigDecimal.ZERO;

    @Column(name = "deposit_paid")
    @Builder.Default
    private Boolean depositPaid = false;

    @Column(name = "remaining_amount", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal remainingAmount = BigDecimal.ZERO;

    @Column(name = "final_amount", precision = 10, scale = 2)
    private BigDecimal finalAmount;

    @Column(name = "fully_paid")
    @Builder.Default
    private Boolean fullyPaid = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", length = 20)
    @Builder.Default
    private SalesOrder.PaymentMethod paymentMethod = SalesOrder.PaymentMethod.CASH;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    @Builder.Default
    private BookingStatus status = BookingStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "catalog_item_id")
    private CakeCatalog catalogItem;

    @Column(name = "is_custom")
    @Builder.Default
    private Boolean isCustom = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum EventType {
        BIRTHDAY, WEDDING, RECEPTION, ANNIVERSARY, CORPORATE, FESTIVAL, OTHER
    }

    public enum BookingStatus {
        PENDING, CONFIRMED, IN_PROGRESS, READY, DELIVERED, CANCELLED
    }

    @PrePersist
    private void generateBookingNumber() {
        if (bookingNumber == null) {
            bookingNumber = "BK-" + System.currentTimeMillis();
        }
    }
}
