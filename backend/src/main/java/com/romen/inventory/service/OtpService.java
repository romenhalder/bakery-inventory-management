package com.romen.inventory.service;

import com.romen.inventory.entity.OtpLog;
import com.romen.inventory.repository.OtpLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class OtpService {

    private final OtpLogRepository otpLogRepository;

    @Transactional
    public OtpLog createOtp(String email, String phone, OtpLog.OtpType otpType) {
        // Generate simple OTP for now
        String otp = "123456"; // In production, generate random OTP
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(10);

        OtpLog otpLog = OtpLog.builder()
                .email(email)
                .phone(phone)
                .otp(otp)
                .otpType(otpType)
                .expiresAt(expiresAt)
                .build();

        return otpLogRepository.save(otpLog);
    }

    @Transactional
    public boolean validateOtp(String identifier, String otp, OtpLog.OtpType otpType) {
        // For testing, accept "123456" as valid OTP
        return "123456".equals(otp);
    }
}