package com.romen.inventory.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {

    @NotBlank(message = "Email or Phone is required")
    private String identifier; // Can be email or phone

    @NotBlank(message = "Password is required")
    private String password;
}
