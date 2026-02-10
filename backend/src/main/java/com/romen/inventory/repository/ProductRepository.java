// repository/ProductRepository.java
package com.romen.inventory.repository;

import com.romen.inventory.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {

    Optional<Product> findByProductCode(String productCode);

    List<Product> findByCategoryId(Long categoryId);

    List<Product> findByProductType(Product.ProductType productType);

    List<Product> findByIsActiveTrue();

    List<Product> findByCategoryIdAndIsActiveTrue(Long categoryId);

    @Query("SELECT p FROM Product p WHERE p.isActive = true AND p.productType = :type")
    List<Product> findActiveByProductType(@Param("type") Product.ProductType type);

    @Query("SELECT p FROM Product p WHERE LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) AND p.isActive = true")
    List<Product> searchActiveProducts(@Param("keyword") String keyword);

    @Query("SELECT p FROM Product p WHERE p.isActive = true AND (p.minStockLevel IS NULL OR p.id NOT IN (SELECT i.product.id FROM Inventory i WHERE i.currentQuantity > p.minStockLevel))")
    List<Product> findLowStockProducts();

    boolean existsByProductCode(String productCode);

    boolean existsByNameAndCategoryId(String name, Long categoryId);

    @Query("SELECT COUNT(p) FROM Product p WHERE p.isActive = true")
    Long countActiveProducts();

    @Query("SELECT COUNT(p) FROM Product p WHERE p.productType = :type AND p.isActive = true")
    Long countByProductType(@Param("type") Product.ProductType type);
}
