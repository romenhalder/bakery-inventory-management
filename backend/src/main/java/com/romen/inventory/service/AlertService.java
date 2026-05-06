// service/AlertService.java
package com.romen.inventory.service;

import com.romen.inventory.dto.AlertResponse;
import com.romen.inventory.entity.Alert;
import com.romen.inventory.entity.Inventory;
import com.romen.inventory.entity.Product;
import com.romen.inventory.entity.User;
import com.romen.inventory.exception.ResourceNotFoundException;
import com.romen.inventory.repository.AlertRepository;
import com.romen.inventory.repository.InventoryRepository;
import com.romen.inventory.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AlertService {

    private final AlertRepository alertRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;

    // ====================== ALERT GENERATION ======================

    /**
     * Check a product's stock level and create alerts if needed.
     * Called after sales, stock updates, or product creation.
     */

    @Transactional
    public void checkAndCreateStockAlerts(Product product, int currentStock) {
        if (product == null)
            return;

        int minLevel = product.getMinStockLevel() != null ? product.getMinStockLevel() : 10;
        int reorderPoint = product.getReorderPoint() != null ? product.getReorderPoint() : 20;

        // OUT_OF_STOCK
        if (currentStock <= 0) {
            createAlertIfNotExists(product, Alert.AlertType.OUT_OF_STOCK, currentStock, minLevel,
                    product.getName() + " is out of stock!",
                    "Current stock: 0. Immediate restocking required.");
        }
        // LOW_STOCK (below min level, but not zero)
        else if (currentStock > 0 && currentStock <= minLevel) {
            createAlertIfNotExists(product, Alert.AlertType.LOW_STOCK, currentStock, minLevel,
                    product.getName() + " is running low on stock",
                    "Current stock: " + currentStock + " (Min level: " + minLevel + "). Please restock soon.");
            // Auto-resolve OUT_OF_STOCK if it was previously 0
            autoResolveAlerts(product.getId(), Alert.AlertType.OUT_OF_STOCK);
        }
        // REORDER_POINT
        else if (currentStock <= reorderPoint) {
            createAlertIfNotExists(product, Alert.AlertType.REORDER_POINT, currentStock, reorderPoint,
                    product.getName() + " reached reorder point",
                    "Current stock: " + currentStock + " (Reorder point: " + reorderPoint
                            + "). Consider placing an order.");
            autoResolveAlerts(product.getId(), Alert.AlertType.OUT_OF_STOCK);
            autoResolveAlerts(product.getId(), Alert.AlertType.LOW_STOCK);
        }
        // Stock is healthy — auto-resolve all stock alerts for this product
        else {
            autoResolveAlerts(product.getId(), Alert.AlertType.OUT_OF_STOCK);
            autoResolveAlerts(product.getId(), Alert.AlertType.LOW_STOCK);
            autoResolveAlerts(product.getId(), Alert.AlertType.REORDER_POINT);
        }
    }

    private void createAlertIfNotExists(Product product, Alert.AlertType type, int currentQty, int threshold,
            String message, String description) {
        // Don't create duplicate unresolved alerts
        if (alertRepository.existsByProductIdAndAlertTypeAndIsResolvedFalse(product.getId(), type)) {
            return;
        }
        Alert alert = Alert.builder()
                .product(product)
                .alertType(type)
                .message(message)
                .description(description)
                .currentQuantity(currentQty)
                .thresholdQuantity(threshold)
                .build();
        alertRepository.save(alert);
        log.info("Created {} alert for product: {} (stock: {})", type, product.getName(), currentQty);
    }

    private void autoResolveAlerts(Long productId, Alert.AlertType type) {
        List<Alert> unresolvedAlerts = alertRepository.findUnresolvedByType(type).stream()
                .filter(a -> a.getProduct() != null && a.getProduct().getId().equals(productId))
                .collect(Collectors.toList());
        for (Alert alert : unresolvedAlerts) {
            alert.setIsResolved(true);
            alert.setResolvedAt(java.time.LocalDateTime.now());
            alertRepository.save(alert);
        }
    }

    /**
     * Scheduled task: scan ALL products every 30 minutes and generate alerts.
     */
    @Scheduled(fixedRate = 1800000) // 30 minutes
    @Transactional
    public void checkAllProductAlerts() {
        log.info("Running scheduled alert check for all products...");
        List<Product> activeProducts = productRepository.findByIsActiveTrue();
        for (Product product : activeProducts) {
            Inventory inventory = inventoryRepository.findByProductId(product.getId()).orElse(null);
            int currentStock = (inventory != null) ? inventory.getCurrentQuantity() : 0;
            checkAndCreateStockAlerts(product, currentStock);
        }
        log.info("Scheduled alert check completed. Checked {} products.", activeProducts.size());
    }

    // ====================== CRUD OPERATIONS ======================

    public List<AlertResponse> getAllAlerts() {
        return alertRepository.findAll().stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(this::mapToAlertResponse)
                .collect(Collectors.toList());
    }

    public List<AlertResponse> getUnreadAlerts() {
        return alertRepository.findByIsReadFalseOrderByCreatedAtDesc().stream()
                .map(this::mapToAlertResponse)
                .collect(Collectors.toList());
    }

    public List<AlertResponse> getUnresolvedAlerts() {
        return alertRepository.findByIsResolvedFalseOrderByCreatedAtDesc().stream()
                .map(this::mapToAlertResponse)
                .collect(Collectors.toList());
    }

    public Long getUnreadCount() {
        return alertRepository.countUnread();
    }

    @Transactional
    public AlertResponse markAsRead(Long alertId) {
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new ResourceNotFoundException("Alert not found"));
        alert.markAsRead();
        alert = alertRepository.save(alert);
        return mapToAlertResponse(alert);
    }

    @Transactional
    public void markAllAsRead() {
        List<Alert> unreadAlerts = alertRepository.findByIsReadFalseOrderByCreatedAtDesc();
        unreadAlerts.forEach(Alert::markAsRead);
        alertRepository.saveAll(unreadAlerts);
        log.info("Marked {} alerts as read", unreadAlerts.size());
    }

    @Transactional
    public AlertResponse resolveAlert(Long alertId, User resolvedBy) {
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new ResourceNotFoundException("Alert not found"));
        alert.markAsResolved(resolvedBy);
        alert = alertRepository.save(alert);
        return mapToAlertResponse(alert);
    }

    @Transactional
    public void deleteAlert(Long alertId) {
        Alert alert = alertRepository.findById(alertId)
                .orElseThrow(() -> new ResourceNotFoundException("Alert not found"));
        alertRepository.delete(alert);
    }

    public List<AlertResponse> getAlertsByProduct(Long productId) {
        return alertRepository.findByProductIdOrderByCreatedAtDesc(productId).stream()
                .map(this::mapToAlertResponse)
                .collect(Collectors.toList());
    }

    public List<AlertResponse> getRecentAlerts() {
        return alertRepository.findTop10ByOrderByCreatedAtDesc().stream()
                .map(this::mapToAlertResponse)
                .collect(Collectors.toList());
    }

    private AlertResponse mapToAlertResponse(Alert alert) {
        return AlertResponse.builder()
                .id(alert.getId())
                .productId(alert.getProduct() != null ? alert.getProduct().getId() : null)
                .productName(alert.getProduct() != null ? alert.getProduct().getName() : null)
                .productCode(alert.getProduct() != null ? alert.getProduct().getProductCode() : null)
                .alertType(alert.getAlertType())
                .message(alert.getMessage())
                .description(alert.getDescription())
                .currentQuantity(alert.getCurrentQuantity())
                .thresholdQuantity(alert.getThresholdQuantity())
                .isRead(alert.getIsRead())
                .isResolved(alert.getIsResolved())
                .resolvedById(alert.getResolvedBy() != null ? alert.getResolvedBy().getId() : null)
                .resolvedByName(alert.getResolvedBy() != null ? alert.getResolvedBy().getFullName() : null)
                .resolvedAt(alert.getResolvedAt())
                .createdAt(alert.getCreatedAt())
                .updatedAt(alert.getUpdatedAt())
                .build();
    }
}
