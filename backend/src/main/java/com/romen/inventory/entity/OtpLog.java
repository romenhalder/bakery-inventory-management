// entity/OtpLog.java
package com.romen.inventory.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.time.LocalDateTime;

@Entity
@Table(name = "otp_logs",
        indexes = {
                @Index(name = "idx_otp_logs_email", columnList = "email"),
                @Index(name = "idx_otp_logs_phone", columnList = "phone"),
                @Index(name = "idx_otp_logs_expiry", columnList = "expires_at")
        })
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OtpLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(length = 100)
    private String email;

    @Column(length = 15)
    private String phone;

    @Column(nullable = false, length = 10)
    private String otp;

    @Column(name = "otp_type", nullable = false, length = 20)
    @Enumerated(EnumType.STRING)
    private OtpType otpType;

    @Column(name = "is_used")
    private Boolean isUsed = false;

    @Column
    private Integer attempts = 0;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum OtpType {
        LOGIN,
        REGISTER,
        RESET_PASSWORD,
        VERIFY_EMAIL,
        VERIFY_PHONE
    }

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }

    public void incrementAttempts() {
        this.attempts++;
    }
}