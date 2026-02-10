// dto/VerifyRequest.java
package com.romen.inventory.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VerifyRequest {

    @NotBlank(message = "Email or Phone is required")
    private String identifier;

    @NotBlank(message = "OTP is required")
    private String otp;
}