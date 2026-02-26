// controller/InventoryController.java
package com.romen.inventory.controller;

import com.romen.inventory.dto.InventoryResponse;
import com.romen.inventory.dto.StockTransactionResponse;
import com.romen.inventory.dto.StockUpdateRequest;
import com.romen.inventory.entity.User;
import com.romen.inventory.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/inventory")
@RequiredArgsConstructor
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<List<InventoryResponse>> getAllInventory() {
        List<InventoryResponse> inventory = inventoryService.getAllInventory();
        return ResponseEntity.ok(inventory);
    }

    @GetMapping("/product/{productId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<InventoryResponse> getInventoryByProduct(@PathVariable Long productId) {
        InventoryResponse inventory = inventoryService.getInventoryByProduct(productId);
        return ResponseEntity.ok(inventory);
    }

    @GetMapping("/low-stock")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<List<InventoryResponse>> getLowStockItems() {
        List<InventoryResponse> items = inventoryService.getLowStockItems();
        return ResponseEntity.ok(items);
    }

    @GetMapping("/out-of-stock")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<List<InventoryResponse>> getOutOfStockItems() {
        List<InventoryResponse> items = inventoryService.getOutOfStockItems();
        return ResponseEntity.ok(items);
    }

    @PostMapping("/update")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<InventoryResponse> updateStock(
            @Valid @RequestBody StockUpdateRequest request,
            Authentication authentication) {

        User currentUser = (User) authentication.getPrincipal();
        InventoryResponse response = inventoryService.updateStock(request, currentUser);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/transactions")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<List<StockTransactionResponse>> getAllTransactions() {
        List<StockTransactionResponse> transactions = inventoryService.getAllTransactions();
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/transactions/product/{productId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<List<StockTransactionResponse>> getTransactionsByProduct(@PathVariable Long productId) {
        List<StockTransactionResponse> transactions = inventoryService.getTransactionsByProduct(productId);
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/transactions/recent")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<List<StockTransactionResponse>> getRecentTransactions() {
        List<StockTransactionResponse> transactions = inventoryService.getRecentTransactions();
        return ResponseEntity.ok(transactions);
    }
}
