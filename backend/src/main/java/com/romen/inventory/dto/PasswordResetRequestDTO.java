package com.romen.inventory.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PasswordResetRequestDTO {
    private Long id;
    private UserDTO user;
    private String requestToken;
    private LocalDateTime requestedAt;
    private LocalDateTime expiresAt;
    private Boolean isProcessed;
    private UserDTO processedBy;
    private LocalDateTime processedAt;
    private String newPassword;
    private Boolean notificationSent;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserDTO {
        private Long id;
        private String email;
        private String fullName;
        private String phone;
        private String role;
    }
}