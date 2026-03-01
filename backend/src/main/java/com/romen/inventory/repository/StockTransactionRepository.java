// repository/StockTransactionRepository.java
package com.romen.inventory.repository;

import com.romen.inventory.entity.StockTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface StockTransactionRepository extends JpaRepository<StockTransaction, Long> {

    List<StockTransaction> findByProductIdOrderByTransactionDateDesc(Long productId);

    List<StockTransaction> findByTransactionTypeOrderByTransactionDateDesc(StockTransaction.TransactionType type);

    List<StockTransaction> findByUserIdOrderByTransactionDateDesc(Long userId);

    @Query("SELECT st FROM StockTransaction st WHERE st.transactionDate BETWEEN :startDate AND :endDate ORDER BY st.transactionDate DESC")
    List<StockTransaction> findByDateRange(@Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    @Query("SELECT st FROM StockTransaction st WHERE st.product.id = :productId AND st.transactionDate BETWEEN :startDate AND :endDate ORDER BY st.transactionDate DESC")
    List<StockTransaction> findByProductAndDateRange(@Param("productId") Long productId,
            @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT st FROM StockTransaction st WHERE st.transactionType = :type AND st.transactionDate BETWEEN :startDate AND :endDate ORDER BY st.transactionDate DESC")
    List<StockTransaction> findByTypeAndDateRange(@Param("type") StockTransaction.TransactionType type,
            @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT SUM(st.quantity) FROM StockTransaction st WHERE st.transactionType = 'STOCK_IN' AND st.transactionDate BETWEEN :startDate AND :endDate")
    Integer getTotalStockIn(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT SUM(ABS(st.quantity)) FROM StockTransaction st WHERE st.transactionType = 'STOCK_OUT' AND st.transactionDate BETWEEN :startDate AND :endDate")
    Integer getTotalStockOut(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    @Query("SELECT SUM(st.totalAmount) FROM StockTransaction st WHERE st.transactionType = 'STOCK_OUT' AND st.transactionDate BETWEEN :startDate AND :endDate")
    java.math.BigDecimal getTotalSalesAmount(@Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);

    @Query("SELECT COUNT(st) FROM StockTransaction st WHERE st.transactionDate BETWEEN :startDate AND :endDate")
    Long countTransactions(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    List<StockTransaction> findTop10ByOrderByTransactionDateDesc();

    @Query("SELECT COALESCE(SUM(ABS(st.quantity)), 0) FROM StockTransaction st WHERE st.transactionType = 'WASTAGE' AND st.transactionDate BETWEEN :startDate AND :endDate")
    Integer getTotalWastage(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}
