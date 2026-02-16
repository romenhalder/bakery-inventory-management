-- SQL Script to Create First Admin User
-- Run this in MySQL after dropping all tables

-- First, make sure the database exists and is selected
USE bakerydb;

-- Insert first admin user
-- Password is 'admin123' (encoded with BCrypt)
INSERT INTO users (
    email, 
    phone, 
    password, 
    full_name, 
    role, 
    is_active, 
    is_email_verified, 
    is_phone_verified,
    created_at,
    updated_at
) VALUES (
    'halderromen2002@gmail.com',
    '1234567890',
    '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EO',  -- admin123
    'Admin User',
    'ADMIN',
    true,
    true,
    true,
    NOW(),
    NOW()
);

-- Verify the user was created
SELECT * FROM users WHERE email = 'halderromen2002@gmail.com';