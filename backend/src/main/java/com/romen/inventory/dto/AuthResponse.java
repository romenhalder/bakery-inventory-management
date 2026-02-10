package com.romen.inventory.dto;

import com.romen.inventory.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private String refreshToken;
    private String email;
    private String phone;
    private String fullName;
    private User.Role role;
    private Long userId;
    private Boolean isEmailVerified;
    private Boolean isPhoneVerified;
    private String profileImage;
    private String message;
}