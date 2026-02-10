// entity/Alert.java
package com.romen.inventory.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "alerts",
        indexes = {
                @Index(name = "idx_alerts_product", columnList = "product_id"),
                @Index(name = "idx_alerts_type", columnList = "alert_type"),
                @Index(name = "idx_alerts_status", columnList = "is_read"),
                @Index(name = "idx_alerts_created", columnList = "created_at")
        })
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Alert {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Enumerated(EnumType.STRING)
    @Column(name = "alert_type", nullable = false, length = 20)
    private AlertType alertType;

    @Column(nullable = false, length = 500)
    private String message;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "current_quantity")
    private Integer currentQuantity;

    @Column(name = "threshold_quantity")
    private Integer thresholdQuantity;

    @Column(name = "is_read")
    private Boolean isRead = false;

    @Column(name = "is_resolved")
    private Boolean isResolved = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resolved_by")
    private User resolvedBy;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum AlertType {
        LOW_STOCK,         // Stock below minimum level
        OUT_OF_STOCK,      // No stock available
        EXPIRING_SOON,     // Product expiring soon
        EXPIRED,          // Product expired
        REORDER_POINT,     // Stock reached reorder point
        OVERSTOCK         // Stock above maximum level
    }

    public void markAsRead() {
        this.isRead = true;
    }

    public void markAsResolved(User user) {
        this.isResolved = true;
        this.resolvedBy = user;
        this.resolvedAt = LocalDateTime.now();
    }
}
