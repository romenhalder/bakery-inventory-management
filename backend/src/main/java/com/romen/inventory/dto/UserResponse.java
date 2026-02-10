// dto/UserResponse.java
package com.romen.inventory.dto;

import com.romen.inventory.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String email;
    private String phone;
    private String fullName;
    private User.Role role;
    private Boolean isActive;
    private Boolean isEmailVerified;
    private Boolean isPhoneVerified;
    private String profileImage;
    private String address;
    private LocalDateTime createdAt;
    private LocalDateTime lastLoginAt;
}