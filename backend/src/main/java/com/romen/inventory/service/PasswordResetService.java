package com.romen.inventory.service;

import com.romen.inventory.dto.PasswordResetRequestDTO;
import com.romen.inventory.entity.Alert;
import com.romen.inventory.entity.PasswordResetRequest;
import com.romen.inventory.entity.User;
import com.romen.inventory.repository.AlertRepository;
import com.romen.inventory.repository.PasswordResetRequestRepository;
import com.romen.inventory.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.Random;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordResetService {

    private final PasswordResetRequestRepository resetRequestRepository;
    private final UserRepository userRepository;
    private final ResendEmailService emailService;
    private final PasswordEncoder passwordEncoder;
    private final AlertRepository alertRepository;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Value("${admin.email:halderromen2002@gmail.com}")
    private String adminEmail;

    @Transactional
    public void initiatePasswordReset(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        // Check if there's already a pending request
        if (resetRequestRepository.existsByUserAndIsProcessedFalse(user)) {
            throw new RuntimeException("A password reset request is already pending for this user");
        }

        LocalDateTime now = LocalDateTime.now();

        if (user.getRole() == User.Role.ADMIN) {
            // For Admin: Generate token and send reset link
            String token = UUID.randomUUID().toString();

            PasswordResetRequest request = PasswordResetRequest.builder()
                    .user(user)
                    .requestToken(token)
                    .requestedAt(now)
                    .expiresAt(now.plusHours(24))
                    .isProcessed(false)
                    .build();

            resetRequestRepository.save(request);

            // Send email with reset link
            String resetLink = frontendUrl + "/reset-password?token=" + token;
            emailService.sendAdminPasswordResetLink(user.getEmail(), user.getFullName(), resetLink);

            log.info("Password reset link sent to admin: {}", email);
        } else {
            // For Employee/Manager: Create request for admin approval
            PasswordResetRequest request = PasswordResetRequest.builder()
                    .user(user)
                    .requestedAt(now)
                    .expiresAt(now.plusHours(72)) // 3 days for admin to process
                    .isProcessed(false)
                    .build();

            resetRequestRepository.save(request);

            // Send notification to admin
            emailService.sendPasswordResetRequestNotificationToAdmins(
                    adminEmail,
                    user.getFullName(),
                    user.getEmail());

            // Create notification alert for Admin dashboard
            Alert resetAlert = Alert.builder()
                    .alertType(Alert.AlertType.USER_PASSWORD_RESET)
                    .message("Password Reset Requested")
                    .description(
                            "User " + user.getFullName() + " (" + user.getEmail() + ") requested a password reset.")
                    .build();
            alertRepository.save(resetAlert);

            log.info("Password reset request created for {}: {}. Admin notified.", user.getRole(), email);
        }
    }

    @Transactional(readOnly = true)
    public List<PasswordResetRequestDTO> getPendingRequests() {
        List<PasswordResetRequest> requests = resetRequestRepository.findByIsProcessedFalseOrderByRequestedAtDesc();
        return requests.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private PasswordResetRequestDTO convertToDTO(PasswordResetRequest request) {
        PasswordResetRequestDTO.UserDTO userDTO = null;
        PasswordResetRequestDTO.UserDTO processedByDTO = null;

        if (request.getUser() != null) {
            User user = request.getUser();
            userDTO = PasswordResetRequestDTO.UserDTO.builder()
                    .id(user.getId())
                    .email(user.getEmail())
                    .fullName(user.getFullName())
                    .phone(user.getPhone())
                    .role(user.getRole() != null ? user.getRole().name() : null)
                    .build();
        }

        if (request.getProcessedBy() != null) {
            User processedBy = request.getProcessedBy();
            processedByDTO = PasswordResetRequestDTO.UserDTO.builder()
                    .id(processedBy.getId())
                    .email(processedBy.getEmail())
                    .fullName(processedBy.getFullName())
                    .phone(processedBy.getPhone())
                    .role(processedBy.getRole() != null ? processedBy.getRole().name() : null)
                    .build();
        }

        return PasswordResetRequestDTO.builder()
                .id(request.getId())
                .user(userDTO)
                .requestToken(request.getRequestToken())
                .requestedAt(request.getRequestedAt())
                .expiresAt(request.getExpiresAt())
                .isProcessed(request.getIsProcessed())
                .processedBy(processedByDTO)
                .processedAt(request.getProcessedAt())
                .newPassword(request.getNewPassword())
                .notificationSent(request.getNotificationSent())
                .createdAt(request.getCreatedAt())
                .updatedAt(request.getUpdatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public Long getPendingRequestCount() {
        return resetRequestRepository.countByIsProcessedFalse();
    }

    @Transactional
    public void setPasswordForEmployee(Long requestId, String newPassword, User admin) {
        PasswordResetRequest request = resetRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Password reset request not found"));

        if (request.getIsProcessed()) {
            throw new RuntimeException("This request has already been processed");
        }

        if (request.isExpired()) {
            throw new RuntimeException("This request has expired");
        }

        // Validate password
        if (newPassword == null || newPassword.length() < 6) {
            throw new RuntimeException("Password must be at least 6 characters long");
        }

        User user = request.getUser();

        // Update user password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Mark request as processed
        request.setIsProcessed(true);
        request.setProcessedBy(admin);
        request.setProcessedAt(LocalDateTime.now());
        request.setNewPassword(newPassword);
        resetRequestRepository.save(request);

        // Send email with new password
        emailService.sendGeneratedPasswordEmail(user.getEmail(), user.getFullName(), newPassword);

        // Resolve active alerts for password resets
        alertRepository.findByAlertTypeOrderByCreatedAtDesc(Alert.AlertType.USER_PASSWORD_RESET).stream()
                .filter(a -> a.getDescription().contains(user.getEmail()) && !a.getIsResolved())
                .forEach(a -> {
                    a.markAsResolved(admin);
                    alertRepository.save(a);
                });

        log.info("Password set for {} by admin: {}", user.getEmail(), admin.getEmail());
    }

    @Transactional
    public void resetPasswordWithToken(String token, String newPassword) {
        PasswordResetRequest request = resetRequestRepository.findByRequestToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid or expired token"));

        if (request.getIsProcessed()) {
            throw new RuntimeException("This token has already been used");
        }

        if (request.isExpired()) {
            throw new RuntimeException("This token has expired");
        }

        User user = request.getUser();

        // Validate new password
        if (newPassword == null || newPassword.length() < 6) {
            throw new RuntimeException("Password must be at least 6 characters long");
        }

        // Update user password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Mark request as processed
        request.setIsProcessed(true);
        request.setProcessedAt(LocalDateTime.now());
        resetRequestRepository.save(request);

        log.info("Password reset successful for admin: {}", user.getEmail());
    }

    @Transactional(readOnly = true)
    public boolean validateResetToken(String token) {
        Optional<PasswordResetRequest> request = resetRequestRepository.findByRequestToken(token);
        return request.isPresent() && request.get().isValid();
    }

    private String generateRandomPassword() {
        String upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        String lower = "abcdefghijklmnopqrstuvwxyz";
        String digits = "0123456789";
        String special = "!@#$%^&*";
        String allChars = upper + lower + digits + special;

        Random random = new Random();
        StringBuilder password = new StringBuilder();

        // Ensure at least one of each type
        password.append(upper.charAt(random.nextInt(upper.length())));
        password.append(lower.charAt(random.nextInt(lower.length())));
        password.append(digits.charAt(random.nextInt(digits.length())));
        password.append(special.charAt(random.nextInt(special.length())));

        // Fill remaining with random characters
        for (int i = 4; i < 12; i++) {
            password.append(allChars.charAt(random.nextInt(allChars.length())));
        }

        // Shuffle the password
        char[] passwordArray = password.toString().toCharArray();
        for (int i = passwordArray.length - 1; i > 0; i--) {
            int j = random.nextInt(i + 1);
            char temp = passwordArray[i];
            passwordArray[i] = passwordArray[j];
            passwordArray[j] = temp;
        }

        return new String(passwordArray);
    }
}