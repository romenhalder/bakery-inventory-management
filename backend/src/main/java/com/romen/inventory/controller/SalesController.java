package com.romen.inventory.controller;

import com.romen.inventory.dto.SalesRequest;
import com.romen.inventory.dto.SalesResponse;
import com.romen.inventory.entity.User;
import com.romen.inventory.service.SalesService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/sales")
@RequiredArgsConstructor
public class SalesController {

    private final SalesService salesService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<SalesResponse> createSale(
            @Valid @RequestBody SalesRequest request,
            Authentication authentication) {
        User currentUser = (User) authentication.getPrincipal();
        SalesResponse response = salesService.createSale(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<SalesResponse> getSaleById(@PathVariable Long id) {
        SalesResponse response = salesService.getSaleById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/order/{orderNumber}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<SalesResponse> getSaleByOrderNumber(@PathVariable String orderNumber) {
        SalesResponse response = salesService.getSaleByOrderNumber(orderNumber);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<List<SalesResponse>> getAllSales() {
        List<SalesResponse> sales = salesService.getAllSales();
        return ResponseEntity.ok(sales);
    }

    @GetMapping("/recent")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<List<SalesResponse>> getRecentSales(
            @RequestParam(defaultValue = "10") int limit,
            Authentication authentication) {

        User currentUser = (User) authentication.getPrincipal();
        List<SalesResponse> sales;

        if ("EMPLOYEE".equals(currentUser.getRole().name())) {
            // Employees only see their own sales
            sales = salesService.getRecentSalesByUser(currentUser.getId(), limit);
        } else {
            // Admin/Managers see all recent sales
            sales = salesService.getRecentSales(limit);
        }

        return ResponseEntity.ok(sales);
    }

    @GetMapping("/customer/{mobile}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<List<SalesResponse>> getSalesByCustomer(@PathVariable String mobile) {
        List<SalesResponse> sales = salesService.getSalesByCustomerMobile(mobile);
        return ResponseEntity.ok(sales);
    }

    @GetMapping("/date-range")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<SalesResponse>> getSalesByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        List<SalesResponse> sales = salesService.getSalesByDateRange(startDate, endDate);
        return ResponseEntity.ok(sales);
    }

    @GetMapping("/summary/today")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Map<String, Object>> getTodaySummary() {
        BigDecimal todaySales = salesService.getTodaySales();
        Long todayCount = salesService.getTodaySalesCount();
        return ResponseEntity.ok(Map.of(
                "totalSales", todaySales,
                "transactionCount", todayCount));
    }

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Map<String, BigDecimal>> getSummary(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        BigDecimal total = salesService.getSalesSummary(startDate, endDate);
        return ResponseEntity.ok(Map.of("totalSales", total));
    }
}
