package com.romen.inventory.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.jdbc.core.JdbcTemplate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseMigrationRunner implements CommandLineRunner {
    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        try {
            jdbcTemplate.execute("ALTER TABLE alerts ALTER COLUMN product_id DROP NOT NULL;");
            log.info("Successfully removed NOT NULL constraint on alerts.product_id to allow global alerts.");
        } catch (Exception e) {
            log.warn("Could not alter table alerts product_id constraint. Error: {}", e.getMessage());
        }

        try {
            jdbcTemplate.execute("ALTER TABLE alerts DROP CONSTRAINT IF EXISTS alerts_alert_type_check;");
            log.info("Successfully dropped check constraint on alerts.alert_type to allow new enums.");
        } catch (Exception e) {
            log.warn("Could not drop alert_type check constraint. Error: {}", e.getMessage());
        }
    }
}
