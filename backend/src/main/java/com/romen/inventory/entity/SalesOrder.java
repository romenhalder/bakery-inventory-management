package com.romen.inventory.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "sales_orders",
        indexes = {
                @Index(name = "idx_sales_order_number", columnList = "order_number"),
                @Index(name = "idx_sales_customer_mobile", columnList = "customer_mobile"),
                @Index(name = "idx_sales_date", columnList = "created_at"),
                @Index(name = "idx_sales_sold_by", columnList = "sold_by")
        })
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalesOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_number", unique = true, nullable = false, length = 50)
    private String orderNumber;

    @Column(name = "customer_name", length = 200)
    private String customerName;

    @Column(name = "customer_mobile", length = 20)
    private String customerMobile;

    @Column(name = "subtotal", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(name = "tax_amount", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @Column(name = "discount_amount", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "total_amount", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method", length = 20)
    @Builder.Default
    private PaymentMethod paymentMethod = PaymentMethod.CASH;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", length = 20)
    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.COMPLETED;

    @Enumerated(EnumType.STRING)
    @Column(name = "order_status", length = 20)
    @Builder.Default
    private OrderStatus orderStatus = OrderStatus.COMPLETED;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sold_by", nullable = false)
    private User soldBy;

    @OneToMany(mappedBy = "salesOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<SalesItem> items = new ArrayList<>();

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Version
    private Long version;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum PaymentMethod {
        CASH, CARD, UPI, BANK_TRANSFER, CREDIT
    }

    public enum PaymentStatus {
        PENDING, COMPLETED, FAILED, REFUNDED
    }

    public enum OrderStatus {
        PENDING, PROCESSING, COMPLETED, CANCELLED, RETURNED
    }

    public void addItem(SalesItem item) {
        items.add(item);
        item.setSalesOrder(this);
    }

    public void removeItem(SalesItem item) {
        items.remove(item);
        item.setSalesOrder(null);
    }

    public void calculateTotals() {
        this.subtotal = BigDecimal.ZERO;
        this.taxAmount = BigDecimal.ZERO;
        
        for (SalesItem item : items) {
            subtotal = subtotal.add(item.getTotalPrice());
            taxAmount = taxAmount.add(item.getTaxAmount() != null ? item.getTaxAmount() : BigDecimal.ZERO);
        }
        
        this.totalAmount = subtotal.add(taxAmount).subtract(discountAmount != null ? discountAmount : BigDecimal.ZERO);
    }

    @PrePersist
    private void generateOrderNumber() {
        if (orderNumber == null) {
            orderNumber = "SAL-" + System.currentTimeMillis();
        }
    }
}
