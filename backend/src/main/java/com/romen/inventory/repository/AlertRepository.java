// repository/AlertRepository.java
package com.romen.inventory.repository;

import com.romen.inventory.entity.Alert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {

    List<Alert> findByProductIdOrderByCreatedAtDesc(Long productId);

    List<Alert> findByAlertTypeOrderByCreatedAtDesc(Alert.AlertType type);

    List<Alert> findByIsReadFalseOrderByCreatedAtDesc();

    List<Alert> findByIsResolvedFalseOrderByCreatedAtDesc();

    @Query("SELECT a FROM Alert a WHERE a.createdAt BETWEEN :startDate AND :endDate ORDER BY a.createdAt DESC")
    List<Alert> findByDateRange(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT a FROM Alert a WHERE a.alertType = :type AND a.isResolved = false ORDER BY a.createdAt DESC")
    List<Alert> findUnresolvedByType(@Param("type") Alert.AlertType type);

    @Query("SELECT COUNT(a) FROM Alert a WHERE a.isRead = false")
    Long countUnread();

    @Query("SELECT COUNT(a) FROM Alert a WHERE a.isResolved = false")
    Long countUnresolved();

    @Query("SELECT COUNT(a) FROM Alert a WHERE a.alertType = :type AND a.isResolved = false")
    Long countUnresolvedByType(@Param("type") Alert.AlertType type);

    boolean existsByProductIdAndAlertTypeAndIsResolvedFalse(Long productId, Alert.AlertType type);

    List<Alert> findTop10ByOrderByCreatedAtDesc();
}
