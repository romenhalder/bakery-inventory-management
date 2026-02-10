// controller/AlertController.java
package com.romen.inventory.controller;

import com.romen.inventory.dto.AlertResponse;
import com.romen.inventory.entity.User;
import com.romen.inventory.service.AlertService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/alerts")
@RequiredArgsConstructor
public class AlertController {

    private final AlertService alertService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<List<AlertResponse>> getAllAlerts() {
        List<AlertResponse> alerts = alertService.getAllAlerts();
        return ResponseEntity.ok(alerts);
    }

    @GetMapping("/unread")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<List<AlertResponse>> getUnreadAlerts() {
        List<AlertResponse> alerts = alertService.getUnreadAlerts();
        return ResponseEntity.ok(alerts);
    }

    @GetMapping("/unread/count")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<Map<String, Long>> getUnreadCount() {
        Long count = alertService.getUnreadCount();
        Map<String, Long> response = new HashMap<>();
        response.put("count", count);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/unresolved")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<List<AlertResponse>> getUnresolvedAlerts() {
        List<AlertResponse> alerts = alertService.getUnresolvedAlerts();
        return ResponseEntity.ok(alerts);
    }

    @GetMapping("/product/{productId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<List<AlertResponse>> getAlertsByProduct(@PathVariable Long productId) {
        List<AlertResponse> alerts = alertService.getAlertsByProduct(productId);
        return ResponseEntity.ok(alerts);
    }

    @GetMapping("/recent")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<List<AlertResponse>> getRecentAlerts() {
        List<AlertResponse> alerts = alertService.getRecentAlerts();
        return ResponseEntity.ok(alerts);
    }

    @PatchMapping("/{id}/read")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<AlertResponse> markAsRead(@PathVariable Long id) {
        AlertResponse alert = alertService.markAsRead(id);
        return ResponseEntity.ok(alert);
    }

    @PatchMapping("/read-all")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLOYEE')")
    public ResponseEntity<Map<String, String>> markAllAsRead() {
        alertService.markAllAsRead();
        Map<String, String> response = new HashMap<>();
        response.put("message", "All alerts marked as read");
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/resolve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AlertResponse> resolveAlert(
            @PathVariable Long id,
            Authentication authentication) {
        
        User currentUser = (User) authentication.getPrincipal();
        AlertResponse alert = alertService.resolveAlert(id, currentUser);
        return ResponseEntity.ok(alert);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteAlert(@PathVariable Long id) {
        alertService.deleteAlert(id);
        return ResponseEntity.noContent().build();
    }
}
