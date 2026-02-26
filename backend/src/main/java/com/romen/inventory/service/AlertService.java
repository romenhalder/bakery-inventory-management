// service/AlertService.java
package com.romen.inventory.service;

import com.romen.inventory.dto.AlertResponse;
import com.romen.inventory.entity.Alert;
import com.romen.inventory.entity.User;
import com.romen.inventory.exception.ResourceNotFoundException;
import com.romen.inventory.repository.AlertRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AlertService {

    private final AlertRepository alertRepository;

    public List<AlertResponse> getAllAlerts() {
        return alertRepository.findAll().stream()
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
