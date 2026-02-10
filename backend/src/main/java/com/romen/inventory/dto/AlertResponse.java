// dto/AlertResponse.java
package com.romen.inventory.dto;

import com.romen.inventory.entity.Alert;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertResponse {

    private Long id;
    private Long productId;
    private String productName;
    private String productCode;
    private Alert.AlertType alertType;
    private String message;
    private String description;
    private Integer currentQuantity;
    private Integer thresholdQuantity;
    private Boolean isRead;
    private Boolean isResolved;
    private Long resolvedById;
    private String resolvedByName;
    private LocalDateTime resolvedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
