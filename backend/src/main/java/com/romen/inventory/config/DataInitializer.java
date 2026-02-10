package com.romen.inventory.config;

import com.romen.inventory.entity.User;
import com.romen.inventory.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        // Create or update Admin user
        User admin = userRepository.findByEmail("admin@bakery.com")
                .orElse(User.builder()
                        .email("admin@bakery.com")
                        .fullName("Admin User")
                        .phone("9999999999")
                        .role(User.Role.ADMIN)
                        .build());
        
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setIsActive(true);
        admin.setIsEmailVerified(true);
        userRepository.save(admin);
        log.info("Admin user ready: admin@bakery.com / admin123");

        // Create or update Employee user
        User employee = userRepository.findByEmail("employee@bakery.com")
                .orElse(User.builder()
                        .email("employee@bakery.com")
                        .fullName("Employee User")
                        .phone("8888888888")
                        .role(User.Role.EMPLOYEE)
                        .build());
        
        employee.setPassword(passwordEncoder.encode("employee123"));
        employee.setIsActive(true);
        employee.setIsEmailVerified(true);
        userRepository.save(employee);
        log.info("Employee user ready: employee@bakery.com / employee123");
    }
}
