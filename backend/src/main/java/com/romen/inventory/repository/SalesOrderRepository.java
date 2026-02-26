package com.romen.inventory.repository;

import com.romen.inventory.entity.SalesOrder;
import com.romen.inventory.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SalesOrderRepository extends JpaRepository<SalesOrder, Long> {

    Optional<SalesOrder> findByOrderNumber(String orderNumber);

    List<SalesOrder> findBySoldBy(User soldBy);

    List<SalesOrder> findByCustomerMobile(String customerMobile);

    List<SalesOrder> findByOrderStatus(SalesOrder.OrderStatus status);

    @Query("SELECT s FROM SalesOrder s WHERE s.createdAt BETWEEN :startDate AND :endDate ORDER BY s.createdAt DESC")
    List<SalesOrder> findByDateRange(@Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    @Query("SELECT s FROM SalesOrder s WHERE s.createdAt >= :date ORDER BY s.createdAt DESC")
    List<SalesOrder> findRecentSales(@Param("date") LocalDateTime date);

    @Query("SELECT s FROM SalesOrder s WHERE s.soldBy.id = :userId AND s.createdAt >= :date ORDER BY s.createdAt DESC")
    List<SalesOrder> findRecentSalesByUser(@Param("userId") Long userId, @Param("date") LocalDateTime date);

    @Query("SELECT SUM(s.totalAmount) FROM SalesOrder s WHERE s.createdAt BETWEEN :startDate AND :endDate")
    java.math.BigDecimal calculateTotalSales(@Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(s) FROM SalesOrder s WHERE s.createdAt >= :date")
    Long countSalesToday(@Param("date") LocalDateTime date);

    List<SalesOrder> findTop10ByOrderByCreatedAtDesc();
}
