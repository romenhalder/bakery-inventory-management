// repository/CategoryRepository.java
package com.romen.inventory.repository;

import com.romen.inventory.entity.Category;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    Optional<Category> findByNameAndParentId(String name, Long parentId);

    List<Category> findByParentId(Long parentId);

    List<Category> findByParentIsNull();

    List<Category> findByIsActiveTrue();

    List<Category> findByParentIdAndIsActiveTrue(Long parentId);

    @Query("SELECT c FROM Category c WHERE c.isActive = true ORDER BY c.displayOrder")
    List<Category> findAllActiveOrdered();

    @Query("SELECT c FROM Category c WHERE c.parent IS NULL AND c.isActive = true ORDER BY c.displayOrder")
    List<Category> findActiveMainCategories();

    @Query("SELECT c FROM Category c WHERE LOWER(c.name) LIKE LOWER(CONCAT('%', :keyword, '%')) AND c.isActive = true")
    List<Category> searchActiveCategories(@Param("keyword") String keyword);

    boolean existsByNameAndParentIdAndIdNot(String name, Long parentId, Long id);

    boolean existsByNameAndParentId(@NotBlank(message = "Category name is required") String name, Long parentId);
}