// repository/InventoryRepository.java
package com.romen.inventory.repository;

import com.romen.inventory.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    Optional<Inventory> findByProductId(Long productId);

    List<Inventory> findByIsLowStockTrue();

    List<Inventory> findByIsOutOfStockTrue();

    @Query("SELECT i FROM Inventory i WHERE i.expiryDate IS NOT NULL AND i.expiryDate <= CURRENT_DATE + 7")
    List<Inventory> findExpiringSoon();

    @Query("SELECT i FROM Inventory i WHERE i.expiryDate IS NOT NULL AND i.expiryDate < CURRENT_DATE")
    List<Inventory> findExpired();

    @Query("SELECT i FROM Inventory i WHERE i.product.category.id = :categoryId")
    List<Inventory> findByCategoryId(@Param("categoryId") Long categoryId);

    @Query("SELECT i FROM Inventory i WHERE i.currentQuantity <= i.product.minStockLevel")
    List<Inventory> findAllLowStock();

    @Query("SELECT COUNT(i) FROM Inventory i WHERE i.isLowStock = true")
    Long countLowStock();

    @Query("SELECT COUNT(i) FROM Inventory i WHERE i.isOutOfStock = true")
    Long countOutOfStock();

    @Query("SELECT COALESCE(SUM(i.currentQuantity), 0) FROM Inventory i")
    Integer getTotalStockQuantity();

    boolean existsByProductId(Long productId);
}
