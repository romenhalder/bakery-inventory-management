package com.romen.inventory.repository;

import com.romen.inventory.entity.CakeCatalog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CakeCatalogRepository extends JpaRepository<CakeCatalog, Long> {

    List<CakeCatalog> findByIsActiveTrueOrderByNameAsc();

    List<CakeCatalog> findByCategoryAndIsActiveTrue(CakeCatalog.CakeCategory category);

    long countByIsActiveTrue();
}
