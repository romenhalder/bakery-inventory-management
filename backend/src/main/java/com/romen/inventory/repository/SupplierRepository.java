// repository/SupplierRepository.java
package com.romen.inventory.repository;

import com.romen.inventory.entity.Supplier;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, Long> {

    Optional<Supplier> findByName(String name);

    Optional<Supplier> findByEmail(String email);

    List<Supplier> findByIsActiveTrue();

    @Query("SELECT s FROM Supplier s WHERE LOWER(s.name) LIKE LOWER(CONCAT('%', :keyword, '%')) AND s.isActive = true")
    List<Supplier> searchActiveSuppliers(@Param("keyword") String keyword);

    boolean existsByEmail(String email);

    Long countByIsActiveTrue();
}
