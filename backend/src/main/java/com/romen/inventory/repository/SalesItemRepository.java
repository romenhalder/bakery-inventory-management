package com.romen.inventory.repository;

import com.romen.inventory.entity.SalesItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SalesItemRepository extends JpaRepository<SalesItem, Long> {

    List<SalesItem> findBySalesOrderId(Long salesOrderId);

    List<SalesItem> findByProductId(Long productId);
}
