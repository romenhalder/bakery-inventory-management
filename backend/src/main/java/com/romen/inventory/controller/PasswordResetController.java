package com.romen.inventory.controller;

import com.romen.inventory.dto.PasswordResetRequestDTO;
import com.romen.inventory.entity.User;
import com.romen.inventory.service.PasswordResetService;
import com.romen.inventory.service.ResendEmailService;
import com.romen.inventory.service.UserService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/password-reset")
@RequiredArgsConstructor
@Slf4j
public class PasswordResetController {

    private final PasswordResetService passwordResetService;
    private final UserService userService;
    private final ResendEmailService emailService;

    @PostMapping("/forgot")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        try {
            passwordResetService.initiatePasswordReset(request.getEmail());
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Password reset instructions have been sent to your email");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Password reset request failed for: {}", request.getEmail(), e);
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/validate-token")
    public ResponseEntity<?> validateToken(@RequestParam String token) {
        boolean isValid = passwordResetService.validateResetToken(token);
        Map<String, Object> response = new HashMap<>();
        response.put("valid", isValid);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        try {
            passwordResetService.resetPasswordWithToken(request.getToken(), request.getNewPassword());
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Password reset successful");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Password reset failed", e);
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/requests")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PasswordResetRequestDTO>> getPendingRequests() {
        List<PasswordResetRequestDTO> requests = passwordResetService.getPendingRequests();
        return ResponseEntity.ok(requests);
    }

    @GetMapping("/requests/count")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Long>> getPendingRequestCount() {
        Long count = passwordResetService.getPendingRequestCount();
        Map<String, Long> response = new HashMap<>();
        response.put("count", count);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/requests/{requestId}/set-password")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> setPassword(@PathVariable Long requestId, @RequestBody SetPasswordRequest request, Authentication authentication) {
        try {
            User admin = (User) authentication.getPrincipal();
            passwordResetService.setPasswordForEmployee(requestId, request.getNewPassword(), admin);
            
            Map<String, String> response = new HashMap<>();
            response.put("message", "Password set successfully and sent to employee's email");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to set password for request: {}", requestId, e);
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @Data
    public static class ForgotPasswordRequest {
        private String email;
    }

    @Data
    public static class ResetPasswordRequest {
        private String token;
        private String newPassword;
    }

    @Data
    public static class SetPasswordRequest {
        private String newPassword;
    }
}