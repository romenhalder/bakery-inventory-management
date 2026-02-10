package com.romen.inventory.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class EmailService {

    public void sendOtpEmail(String toEmail, String otp, String purpose) {
        log.info("OTP {} sent to {} for {}", otp, toEmail, purpose);
        // For now, just log the email
        System.out.println("OTP Email: " + otp + " to " + toEmail + " for " + purpose);
    }

    public void sendWelcomeEmail(String toEmail, String fullName) {
        log.info("Welcome email sent to: {}", toEmail);
        System.out.println("Welcome email to: " + toEmail);
    }

    public void sendPasswordResetEmail(String toEmail, String fullName) {
        log.info("Password reset email sent to: {}", toEmail);
        System.out.println("Password reset email to: " + toEmail);
    }
}