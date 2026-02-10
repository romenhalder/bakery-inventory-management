package com.romen.inventory.service;

import com.romen.inventory.dto.AuthResponse;
import com.romen.inventory.dto.LoginRequest;
import com.romen.inventory.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService; // Changed from UserService

    public AuthResponse authenticate(LoginRequest request) {
        // Try to authenticate with identifier (email or phone)
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getIdentifier(),
                        request.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = (User) authentication.getPrincipal();

        // Generate tokens
        String token = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        return AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .email(user.getEmail())
                .phone(user.getPhone())
                .fullName(user.getFullName())
                .role(user.getRole())
                .userId(user.getId())
                .isEmailVerified(user.getIsEmailVerified())
                .isPhoneVerified(user.getIsPhoneVerified())
                .profileImage(user.getProfileImage())
                .message("Login successful")
                .build();
    }

    public AuthResponse refreshToken(String refreshToken) {
        // Validate refresh token
        String username = jwtService.extractUsername(refreshToken);

        if (username == null) {
            throw new IllegalArgumentException("Invalid refresh token");
        }

        // Load user
        User user = (User) userDetailsService.loadUserByUsername(username);

        if (!jwtService.isTokenValid(refreshToken, user)) {
            throw new IllegalArgumentException("Invalid refresh token");
        }

        // Generate new access token
        String newToken = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(newToken)
                .refreshToken(refreshToken) // Same refresh token
                .email(user.getEmail())
                .phone(user.getPhone())
                .fullName(user.getFullName())
                .role(user.getRole())
                .userId(user.getId())
                .isEmailVerified(user.getIsEmailVerified())
                .isPhoneVerified(user.getIsPhoneVerified())
                .profileImage(user.getProfileImage())
                .message("Token refreshed successfully")
                .build();
    }

    public boolean validateToken(String token) {
        try {
            String jwt = token.replace("Bearer ", "");
            String username = jwtService.extractUsername(jwt);

            if (username == null) {
                return false;
            }

            User user = (User) userDetailsService.loadUserByUsername(username);
            return jwtService.isTokenValid(jwt, user);
        } catch (Exception e) {
            return false;
        }
    }

    public Map<String, Object> extractTokenInfo(String token) {
        String jwt = token.replace("Bearer ", "");

        Map<String, Object> tokenInfo = new HashMap<>();
        tokenInfo.put("userId", jwtService.extractUserId(jwt));
        tokenInfo.put("email", jwtService.extractUsername(jwt));
        tokenInfo.put("role", jwtService.extractRole(jwt));

        return tokenInfo;
    }

    public void logout(String token) {
        String username = jwtService.extractUsername(token.replace("Bearer ", ""));
        System.out.println("User logged out: " + username);
    }
}