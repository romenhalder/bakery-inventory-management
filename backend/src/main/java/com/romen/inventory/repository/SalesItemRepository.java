package com.romen.inventory.repository;

import com.romen.inventory.entity.SalesItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SalesItemRepository extends JpaRepository<SalesItem, Long> {

    List<SalesItem> findBySalesOrderId(Long salesOrderId);

    List<SalesItem> findByProductId(Long productId);

    @Query("SELECT si.product.name, SUM(si.quantity) as totalQty, SUM(si.totalPrice) as totalRevenue " +
            "FROM SalesItem si WHERE si.salesOrder.createdAt BETWEEN :startDate AND :endDate " +
            "GROUP BY si.product.id, si.product.name ORDER BY totalQty DESC")
    List<Object[]> findTopSellingProducts(@Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    @Query("SELECT si.product.category.name, SUM(si.quantity) as totalQty, SUM(si.totalPrice) as totalRevenue " +
            "FROM SalesItem si WHERE si.salesOrder.createdAt BETWEEN :startDate AND :endDate " +
            "GROUP BY si.product.category.id, si.product.category.name ORDER BY totalRevenue DESC")
    List<Object[]> findSalesByCategory(@Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
}
