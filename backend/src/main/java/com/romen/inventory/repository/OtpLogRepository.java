// repository/OtpLogRepository.java
package com.romen.inventory.repository;

import com.romen.inventory.entity.OtpLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface OtpLogRepository extends JpaRepository<OtpLog, Long> {

    Optional<OtpLog> findByEmailAndOtpAndIsUsedFalseAndExpiresAtAfter(
            String email, String otp, LocalDateTime now);

    Optional<OtpLog> findByPhoneAndOtpAndIsUsedFalseAndExpiresAtAfter(
            String phone, String otp, LocalDateTime now);

    @Query("SELECT o FROM OtpLog o WHERE (o.email = :identifier OR o.phone = :identifier) " +
            "AND o.otp = :otp AND o.isUsed = false AND o.expiresAt > :now")
    Optional<OtpLog> findValidOtp(
            @Param("identifier") String identifier,
            @Param("otp") String otp,
            @Param("now") LocalDateTime now);

    @Query("SELECT COUNT(o) FROM OtpLog o WHERE (o.email = :identifier OR o.phone = :identifier) " +
            "AND o.createdAt > :since")
    Long countRecentOtps(@Param("identifier") String identifier,
                         @Param("since") LocalDateTime since);

    @Modifying
    @Query("UPDATE OtpLog o SET o.isUsed = true WHERE o.id = :id")
    void markAsUsed(@Param("id") Long id);

    @Modifying
    @Query("DELETE FROM OtpLog o WHERE o.expiresAt < :expiryTime")
    void deleteExpiredOtps(@Param("expiryTime") LocalDateTime expiryTime);
}