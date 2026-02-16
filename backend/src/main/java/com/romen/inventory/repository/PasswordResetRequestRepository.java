package com.romen.inventory.repository;

import com.romen.inventory.entity.PasswordResetRequest;
import com.romen.inventory.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PasswordResetRequestRepository extends JpaRepository<PasswordResetRequest, Long> {

    Optional<PasswordResetRequest> findByRequestToken(String requestToken);

    List<PasswordResetRequest> findByIsProcessedFalseOrderByRequestedAtDesc();

    List<PasswordResetRequest> findByUserAndIsProcessedFalse(User user);

    @Query("SELECT COUNT(pr) FROM PasswordResetRequest pr WHERE pr.isProcessed = false")
    Long countByIsProcessedFalse();

    boolean existsByUserAndIsProcessedFalse(User user);
}