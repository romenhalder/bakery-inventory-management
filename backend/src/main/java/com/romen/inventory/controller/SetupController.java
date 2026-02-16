package com.romen.inventory.controller;

import com.romen.inventory.entity.User;
import com.romen.inventory.repository.UserRepository;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/setup")
@RequiredArgsConstructor
@Slf4j
public class SetupController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/check")
    public ResponseEntity<Map<String, Object>> checkSetup() {
        long userCount = userRepository.count();
        Map<String, Object> response = new HashMap<>();
        response.put("setupRequired", userCount == 0);
        response.put("userCount", userCount);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/init")
    public ResponseEntity<?> initializeAdmin(@RequestBody AdminSetupRequest request) {
        // Check if any users exist
        if (userRepository.count() > 0) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Setup already completed. Admin user already exists.");
            return ResponseEntity.badRequest().body(error);
        }

        // Validate input
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Email is required");
            return ResponseEntity.badRequest().body(error);
        }

        if (request.getPassword() == null || request.getPassword().length() < 6) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Password must be at least 6 characters");
            return ResponseEntity.badRequest().body(error);
        }

        if (request.getFullName() == null || request.getFullName().trim().isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Full name is required");
            return ResponseEntity.badRequest().body(error);
        }

        if (request.getPhone() == null || request.getPhone().trim().isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Phone is required");
            return ResponseEntity.badRequest().body(error);
        }

        try {
            // Create admin user
            User admin = User.builder()
                    .email(request.getEmail().trim())
                    .password(passwordEncoder.encode(request.getPassword()))
                    .fullName(request.getFullName().trim())
                    .phone(request.getPhone().trim())
                    .role(User.Role.ADMIN)
                    .isActive(true)
                    .isEmailVerified(true)
                    .isPhoneVerified(true)
                    .build();

            userRepository.save(admin);
            log.info("Admin user created successfully: {}", request.getEmail());

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Admin user created successfully");
            response.put("email", request.getEmail());
            response.put("role", "ADMIN");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to create admin user", e);
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to create admin: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }

    @Data
    public static class AdminSetupRequest {
        private String email;
        private String password;
        private String fullName;
        private String phone;
    }
}