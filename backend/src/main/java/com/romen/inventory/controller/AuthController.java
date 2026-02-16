package com.romen.inventory.controller;

import com.romen.inventory.dto.*;
import com.romen.inventory.entity.OtpLog;
import com.romen.inventory.entity.User;
import com.romen.inventory.service.AuthService;
import com.romen.inventory.service.EmailService;
import com.romen.inventory.service.OtpService;
import com.romen.inventory.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final AuthService authService;
    private final UserService userService;
    private final OtpService otpService;
    private final EmailService emailService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        log.info("Login attempt for identifier: {}", request.getIdentifier());
        try {
            AuthResponse response = authService.authenticate(request);
            log.info("Login successful for: {}", request.getIdentifier());
            return ResponseEntity.ok(response);
        } catch (BadCredentialsException e) {
            log.error("Login failed - Bad credentials for: {}", request.getIdentifier());
            Map<String, String> error = new HashMap<>();
            error.put("message", "Invalid email/phone or password");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        } catch (Exception e) {
            log.error("Login failed - Exception: {}", e.getMessage(), e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Login failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping("/register")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        User user = userService.registerUser(request);

        AuthResponse response = AuthResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .phone(user.getPhone())
                .fullName(user.getFullName())
                .role(user.getRole())
                .isEmailVerified(user.getIsEmailVerified())
                .isPhoneVerified(user.getIsPhoneVerified())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt() != null ? user.getCreatedAt().toString() : null)
                .message("Employee registered successfully by Admin.")
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/employees")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<List<User>> getAllEmployees() {
        List<User> employees = userService.getAllEmployees();
        return ResponseEntity.ok(employees);
    }

    @PutMapping("/employees/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> toggleEmployeeStatus(@PathVariable Long id) {
        userService.toggleUserStatus(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Employee status updated successfully");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/employees/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteEmployee(@PathVariable Long id) {
        userService.deleteUser(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Employee deleted successfully");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/send-otp")
    public ResponseEntity<Map<String, String>> sendOtp(@RequestBody SendOtpRequest request) {
        String identifier = request.getIdentifier();
        boolean isEmail = identifier.contains("@");

        OtpLog.OtpType otpType = OtpLog.OtpType.valueOf(request.getOtpType().toUpperCase());

        OtpLog otpLog;
        if (isEmail) {
            otpLog = otpService.createOtp(identifier, null, otpType);
            emailService.sendOtpEmail(identifier, otpLog.getOtp(), otpType.name());
        } else {
            otpLog = otpService.createOtp(null, identifier, otpType);
        }

        Map<String, String> response = new HashMap<>();
        response.put("message", "OTP sent successfully");
        response.put("identifier", identifier);
        response.put("otpType", otpType.name());
        response.put("otp", "123456"); // For testing

        return ResponseEntity.ok(response);
    }

    @PostMapping("/verify-email")
    public ResponseEntity<Map<String, String>> verifyEmail(@RequestBody VerifyRequest request) {
        User user = userService.verifyEmail(request.getIdentifier(), request.getOtp());

        Map<String, String> response = new HashMap<>();
        response.put("message", "Email verified successfully");
        response.put("email", user.getEmail());
        response.put("userId", user.getId().toString());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<Map<String, String>> resetPassword(@RequestBody ResetPasswordRequest request) {
        userService.resetPassword(request.getIdentifier(), request.getOtp(), request.getNewPassword());

        Map<String, String> response = new HashMap<>();
        response.put("message", "Password reset successful");
        response.put("identifier", request.getIdentifier());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<AuthResponse> refreshToken(@RequestBody RefreshTokenRequest request) {
        AuthResponse response = authService.refreshToken(request.getRefreshToken());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/test")
    public ResponseEntity<Map<String, String>> test() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Auth API is working!");
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/test-login")
    public ResponseEntity<?> testLogin(@RequestBody Map<String, String> request) {
        String identifier = request.get("identifier");
        String password = request.get("password");
        
        log.info("Test login for: {} with password length: {}", identifier, password != null ? password.length() : 0);
        
        Map<String, Object> response = new HashMap<>();
        response.put("identifier", identifier);
        response.put("passwordReceived", password != null);
        response.put("passwordLength", password != null ? password.length() : 0);
        
        return ResponseEntity.ok(response);
    }
}
