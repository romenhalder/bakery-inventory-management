// entity/StockTransaction.java
package com.romen.inventory.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "stock_transactions",
        indexes = {
                @Index(name = "idx_transactions_product", columnList = "product_id"),
                @Index(name = "idx_transactions_type", columnList = "transaction_type"),
                @Index(name = "idx_transactions_date", columnList = "transaction_date"),
                @Index(name = "idx_transactions_user", columnList = "user_id")
        })
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Enumerated(EnumType.STRING)
    @Column(name = "transaction_type", nullable = false, length = 20)
    private TransactionType transactionType;

    @Column(nullable = false)
    private Integer quantity;

    @Column(name = "previous_quantity")
    private Integer previousQuantity;

    @Column(name = "new_quantity")
    private Integer newQuantity;

    @Column(name = "unit_price", precision = 10, scale = 2)
    private java.math.BigDecimal unitPrice;

    @Column(name = "total_amount", precision = 10, scale = 2)
    private java.math.BigDecimal totalAmount;

    @Column(length = 500)
    private String reason;

    @Column(name = "reference_number", length = 100)
    private String referenceNumber;

    @Column(name = "batch_number", length = 50)
    private String batchNumber;

    @Column(name = "expiry_date")
    private LocalDateTime expiryDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;

    @CreationTimestamp
    @Column(name = "transaction_date", updatable = false)
    private LocalDateTime transactionDate;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    public enum TransactionType {
        STOCK_IN,          // Receiving new stock
        STOCK_OUT,         // Sales or usage
        ADJUSTMENT,        // Inventory adjustment
        RETURN,           // Return to supplier
        WASTAGE,          // Damaged/expired items
        TRANSFER          // Transfer between locations
    }

    @PrePersist
    private void validate() {
        if (quantity == null || quantity == 0) {
            throw new IllegalArgumentException("Transaction quantity cannot be zero");
        }
        
        // Calculate total amount if unit price is provided
        if (unitPrice != null && quantity != null) {
            this.totalAmount = unitPrice.multiply(new java.math.BigDecimal(Math.abs(quantity)));
        }
    }
}
