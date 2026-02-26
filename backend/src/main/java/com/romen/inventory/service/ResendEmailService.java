package com.romen.inventory.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class ResendEmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:romenromen2002@gmail.com}")
    private String fromEmail;

    private void sendEmail(String toEmail, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            log.info("Email sent successfully to: {}", toEmail);
        } catch (MessagingException e) {
            log.error("Failed to send email to: {}. Error: {}", toEmail, e.getMessage());
            throw new RuntimeException("Failed to send email: " + e.getMessage(), e);
        }
    }

    public void sendOtpEmail(String toEmail, String otp, String purpose) {
        String subject = "Your OTP for " + purpose;
        String htmlContent = buildOtpEmailTemplate(otp, purpose);
        
        sendEmail(toEmail, subject, htmlContent);
        log.info("OTP email sent to: {} for purpose: {}", toEmail, purpose);
    }

    public void sendWelcomeEmail(String toEmail, String fullName) {
        String subject = "Welcome to Bakery Inventory Management System";
        String htmlContent = buildWelcomeEmailTemplate(fullName);
        
        sendEmail(toEmail, subject, htmlContent);
        log.info("Welcome email sent to: {}", toEmail);
    }

    public void sendPasswordResetEmail(String toEmail, String fullName) {
        String subject = "Password Reset Request";
        String htmlContent = buildPasswordResetNotificationTemplate(fullName);
        
        sendEmail(toEmail, subject, htmlContent);
        log.info("Password reset notification email sent to: {}", toEmail);
    }

    public void sendAdminPasswordResetLink(String toEmail, String fullName, String resetLink) {
        String subject = "Password Reset Request - Bakery Inventory System";
        String htmlContent = buildAdminPasswordResetTemplate(fullName, resetLink);
        
        sendEmail(toEmail, subject, htmlContent);
        log.info("Password reset link sent to admin: {}", toEmail);
    }

    public void sendGeneratedPasswordEmail(String toEmail, String fullName, String newPassword) {
        String subject = "Your New Password - Bakery Inventory System";
        String htmlContent = buildGeneratedPasswordTemplate(fullName, newPassword);
        
        sendEmail(toEmail, subject, htmlContent);
        log.info("Generated password email sent to: {}", toEmail);
    }

    public void sendPasswordResetRequestNotificationToAdmins(String adminEmail, String employeeName, String employeeEmail) {
        String subject = "New Password Reset Request - Action Required";
        String htmlContent = buildAdminNotificationTemplate(employeeName, employeeEmail);
        
        sendEmail(adminEmail, subject, htmlContent);
        log.info("Admin notification sent to: {} for employee: {}", adminEmail, employeeEmail);
    }

    private String buildOtpEmailTemplate(String otp, String purpose) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head><style>" +
                "body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }" +
                ".container { background-color: #ffffff; padding: 30px; border-radius: 10px; max-width: 500px; margin: 0 auto; }" +
                ".otp { font-size: 32px; font-weight: bold; color: #8B4513; text-align: center; padding: 20px; background-color: #FFF8DC; border-radius: 5px; margin: 20px 0; }" +
                ".footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }" +
                "</style></head>" +
                "<body>" +
                "<div class='container'>" +
                "<h2 style='color: #8B4513;'>Verification Code</h2>" +
                "<p>Hello,</p>" +
                "<p>Your verification code for <strong>" + purpose + "</strong> is:</p>" +
                "<div class='otp'>" + otp + "</div>" +
                "<p>This code will expire in 10 minutes. Please do not share this code with anyone.</p>" +
                "<div class='footer'>" +
                "<p>🍞 Bakery Inventory Management System</p>" +
                "<p>This is an automated email. Please do not reply.</p>" +
                "</div>" +
                "</div>" +
                "</body></html>";
    }

    private String buildWelcomeEmailTemplate(String fullName) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head><style>" +
                "body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }" +
                ".container { background-color: #ffffff; padding: 30px; border-radius: 10px; max-width: 500px; margin: 0 auto; }" +
                ".header { background-color: #8B4513; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; margin: -30px -30px 20px -30px; }" +
                ".footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }" +
                "</style></head>" +
                "<body>" +
                "<div class='container'>" +
                "<div class='header'>" +
                "<h1>🍞 Welcome to Bakery Inventory!</h1>" +
                "</div>" +
                "<p>Hello <strong>" + fullName + "</strong>,</p>" +
                "<p>Welcome to the Bakery Inventory Management System! Your account has been successfully created.</p>" +
                "<p>You can now log in and start managing bakery inventory efficiently.</p>" +
                "<div class='footer'>" +
                "<p>🥐 Bakery Inventory Management System</p>" +
                "<p>This is an automated email. Please do not reply.</p>" +
                "</div>" +
                "</div>" +
                "</body></html>";
    }

    private String buildPasswordResetNotificationTemplate(String fullName) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head><style>" +
                "body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }" +
                ".container { background-color: #ffffff; padding: 30px; border-radius: 10px; max-width: 500px; margin: 0 auto; }" +
                ".footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }" +
                "</style></head>" +
                "<body>" +
                "<div class='container'>" +
                "<h2 style='color: #8B4513;'>Password Reset Request</h2>" +
                "<p>Hello <strong>" + fullName + "</strong>,</p>" +
                "<p>We received a request to reset your password. Please check your email for further instructions.</p>" +
                "<p>If you did not request this, please ignore this email or contact your administrator.</p>" +
                "<div class='footer'>" +
                "<p>🍞 Bakery Inventory Management System</p>" +
                "<p>This is an automated email. Please do not reply.</p>" +
                "</div>" +
                "</div>" +
                "</body></html>";
    }

    private String buildAdminPasswordResetTemplate(String fullName, String resetLink) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head><style>" +
                "body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }" +
                ".container { background-color: #ffffff; padding: 30px; border-radius: 10px; max-width: 500px; margin: 0 auto; }" +
                ".button { display: inline-block; background-color: #8B4513; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }" +
                ".link { word-break: break-all; color: #8B4513; background-color: #f4f4f4; padding: 10px; border-radius: 5px; margin: 10px 0; }" +
                ".footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }" +
                "</style></head>" +
                "<body>" +
                "<div class='container'>" +
                "<h2 style='color: #8B4513;'>Password Reset Request</h2>" +
                "<p>Hello <strong>" + fullName + "</strong>,</p>" +
                "<p>We received a request to reset your password. Click the button below to reset it:</p>" +
                "<div style='text-align: center;'><a href='" + resetLink + "' class='button'>Reset Password</a></div>" +
                "<p>Or copy and paste this link into your browser:</p>" +
                "<div class='link'>" + resetLink + "</div>" +
                "<p><strong>This link will expire in 24 hours.</strong></p>" +
                "<p>If you did not request this, please ignore this email.</p>" +
                "<div class='footer'>" +
                "<p>🍞 Bakery Inventory Management System</p>" +
                "<p>This is an automated email. Please do not reply.</p>" +
                "</div>" +
                "</div>" +
                "</body></html>";
    }

    private String buildGeneratedPasswordTemplate(String fullName, String newPassword) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head><style>" +
                "body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }" +
                ".container { background-color: #ffffff; padding: 30px; border-radius: 10px; max-width: 500px; margin: 0 auto; }" +
                ".password { font-size: 24px; font-weight: bold; color: #8B4513; text-align: center; padding: 20px; background-color: #FFF8DC; border-radius: 5px; margin: 20px 0; word-break: break-all; }" +
                ".warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }" +
                ".footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }" +
                "</style></head>" +
                "<body>" +
                "<div class='container'>" +
                "<h2 style='color: #8B4513;'>Your New Password</h2>" +
                "<p>Hello <strong>" + fullName + "</strong>,</p>" +
                "<p>Your password has been reset by the administrator. Your new password is:</p>" +
                "<div class='password'>" + newPassword + "</div>" +
                "<div class='warning'>" +
                "<strong>⚠️ Important:</strong> Please log in with this password and change it immediately for security reasons." +
                "</div>" +
                "<div class='footer'>" +
                "<p>🍞 Bakery Inventory Management System</p>" +
                "<p>This is an automated email. Please do not reply.</p>" +
                "</div>" +
                "</div>" +
                "</body></html>";
    }

    private String buildAdminNotificationTemplate(String employeeName, String employeeEmail) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head><style>" +
                "body { font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; }" +
                ".container { background-color: #ffffff; padding: 30px; border-radius: 10px; max-width: 500px; margin: 0 auto; }" +
                ".alert { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }" +
                ".button { display: inline-block; background-color: #8B4513; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }" +
                ".footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }" +
                "</style></head>" +
                "<body>" +
                "<div class='container'>" +
                "<h2 style='color: #8B4513;'>New Password Reset Request</h2>" +
                "<div class='alert'>" +
                "<strong>⚠️ Action Required</strong><br>" +
                "A password reset request needs your approval." +
                "</div>" +
                "<p><strong>Employee Name:</strong> " + employeeName + "</p>" +
                "<p><strong>Employee Email:</strong> " + employeeEmail + "</p>" +
                "<p>Please log in to the admin dashboard to generate a new password for this employee.</p>" +
                "<div class='footer'>" +
                "<p>🍞 Bakery Inventory Management System</p>" +
                "<p>This is an automated email. Please do not reply.</p>" +
                "</div>" +
                "</div>" +
                "</body></html>";
    }
}
