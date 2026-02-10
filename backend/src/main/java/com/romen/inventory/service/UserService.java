package com.romen.inventory.service;

import com.romen.inventory.dto.RegisterRequest;
import com.romen.inventory.dto.UserResponse;
import com.romen.inventory.entity.User;
import com.romen.inventory.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public User registerUser(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }

        if (userRepository.existsByPhone(request.getPhone())) {
            throw new IllegalArgumentException("Phone number already registered");
        }

        User user = User.builder()
                .email(request.getEmail())
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(request.getRole())
                .address(request.getAddress())
                .isActive(true)
                .isEmailVerified(true)
                .isPhoneVerified(true)
                .build();

        return userRepository.save(user);
    }

    @Transactional
    public User verifyEmail(String identifier, String otp) {
        User user = userRepository.findByIdentifier(identifier)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // For now, accept any OTP that is "123456"
        if (!"123456".equals(otp)) {
            throw new IllegalArgumentException("Invalid OTP");
        }

        user.setIsEmailVerified(true);
        return userRepository.save(user);
    }

    @Transactional
    public void updateLastLogin(String identifier) {
        User user = userRepository.findByIdentifier(identifier)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);
    }

    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    public UserResponse getUserResponseById(Long id) {
        User user = getUserById(id);
        return mapToUserResponse(user);
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    public List<UserResponse> getActiveEmployees() {
        return userRepository.findAllActiveEmployees().stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public User updateUserStatus(Long id, boolean isActive) {
        User user = getUserById(id);
        user.setIsActive(isActive);
        return userRepository.save(user);
    }

    @Transactional
    public User changePassword(Long userId, String currentPassword, String newPassword) {
        User user = getUserById(userId);

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        return userRepository.save(user);
    }

    @Transactional
    public void resetPassword(String identifier, String otp, String newPassword) {
        User user = userRepository.findByIdentifier(identifier)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // For now, accept any OTP that is "123456"
        if (!"123456".equals(otp)) {
            throw new IllegalArgumentException("Invalid OTP");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
    }

    @Transactional
    public User updateProfile(Long userId, String fullName, String address, String profileImage) {
        User user = getUserById(userId);

        if (fullName != null && !fullName.trim().isEmpty()) {
            user.setFullName(fullName.trim());
        }

        if (address != null) {
            user.setAddress(address);
        }

        if (profileImage != null && !profileImage.trim().isEmpty()) {
            user.setProfileImage(profileImage);
        }

        return userRepository.save(user);
    }

    public List<User> getAllEmployees() {
        return userRepository.findByRole(User.Role.EMPLOYEE);
    }

    @Transactional
    public void toggleUserStatus(Long id) {
        User user = getUserById(id);
        user.setIsActive(!user.getIsActive());
        userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Long id) {
        User user = getUserById(id);
        userRepository.delete(user);
    }

    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .phone(user.getPhone())
                .fullName(user.getFullName())
                .role(user.getRole())
                .isActive(user.getIsActive())
                .isEmailVerified(user.getIsEmailVerified())
                .isPhoneVerified(user.getIsPhoneVerified())
                .profileImage(user.getProfileImage())
                .address(user.getAddress())
                .createdAt(user.getCreatedAt())
                .lastLoginAt(user.getLastLoginAt())
                .build();
    }


}