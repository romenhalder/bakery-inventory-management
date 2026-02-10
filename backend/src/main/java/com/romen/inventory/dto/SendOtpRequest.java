package com.romen.inventory.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SendOtpRequest {

    @NotBlank(message = "Email or Phone is required")
    private String identifier; // Can be email or phone

    private String otpType; // LOGIN, REGISTER, RESET_PASSWORD
}