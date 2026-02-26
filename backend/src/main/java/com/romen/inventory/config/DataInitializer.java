package com.romen.inventory.config;

import com.romen.inventory.entity.Category;
import com.romen.inventory.entity.Supplier;
import com.romen.inventory.entity.User;
import com.romen.inventory.repository.CategoryRepository;
import com.romen.inventory.repository.SupplierRepository;
import com.romen.inventory.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;
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

        // Create default categories if not exist
        List<String> defaultCategories = Arrays.asList(
                "Cakes", "Raw Materials", "Sweets", "Bread", "Beverages"
        );

        for (String catName : defaultCategories) {
            if (categoryRepository.findByName(catName).isEmpty()) {
                Category category = Category.builder()
                        .name(catName)
                        .description(catName + " - Bakery products")
                        .isActive(true)
                        .build();
                categoryRepository.save(category);
                log.info("Created category: {}", catName);
            }
        }

        // Create default supplier if not exist
        if (supplierRepository.findByName("Default Supplier").isEmpty()) {
            Supplier defaultSupplier = Supplier.builder()
                    .name("Default Supplier")
                    .contactPerson("Admin")
                    .phone("1234567890")
                    .isActive(true)
                    .build();
            supplierRepository.save(defaultSupplier);
            log.info("Created default supplier");
        }

        // Create MANAGER user if not exist
        if (userRepository.findByEmail("manager@bakery.com").isEmpty()) {
            User manager = User.builder()
                    .email("manager@bakery.com")
                    .fullName("Manager User")
                    .phone("7777777777")
                    .role(User.Role.MANAGER)
                    .password(passwordEncoder.encode("manager123"))
                    .isActive(true)
                    .isEmailVerified(true)
                    .build();
            userRepository.save(manager);
            log.info("Manager user ready: manager@bakery.com / manager123");
        }
    }
}
