-- =====================================================
-- BAKERY INVENTORY MANAGEMENT SYSTEM - PostgreSQL SCHEMA
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- USERS TABLE (Updated with MANAGER role)
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(200) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'EMPLOYEE',
    address TEXT,
    profile_image VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    is_email_verified BOOLEAN DEFAULT false,
    is_phone_verified BOOLEAN DEFAULT false,
    email_otp VARCHAR(10),
    email_otp_expiry TIMESTAMP,
    phone_otp VARCHAR(10),
    phone_otp_expiry TIMESTAMP,
    otp_attempts INTEGER DEFAULT 0,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0
);

-- User indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

-- =====================================================
-- CATEGORIES TABLE (Enhanced with brand/flavor)
-- =====================================================
CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    parent_id BIGINT REFERENCES categories(id),
    brand_name VARCHAR(100),
    cake_flavor VARCHAR(100),
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_brand ON categories(brand_name);

-- =====================================================
-- SUPPLIERS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS suppliers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    contact_person VARCHAR(200),
    email VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);

-- =====================================================
-- PRODUCTS TABLE (Enhanced with SKU, brand, flavor)
-- =====================================================
CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    sku VARCHAR(50) UNIQUE,
    barcode VARCHAR(100),
    hsn_code VARCHAR(20),
    product_code VARCHAR(50) UNIQUE,
    
    category_id BIGINT NOT NULL REFERENCES categories(id),
    supplier_id BIGINT REFERENCES suppliers(id),
    created_by BIGINT REFERENCES users(id),
    
    product_type VARCHAR(20) NOT NULL DEFAULT 'FINISHED_GOOD',
    unit_of_measure VARCHAR(20) DEFAULT 'PIECE',
    
    price DECIMAL(10,2),
    cost_price DECIMAL(10,2),
    tax_rate DECIMAL(5,2) DEFAULT 0,
    
    brand_name VARCHAR(100),
    flavor VARCHAR(100),
    weight DECIMAL(10,3),
    
    min_stock_level INTEGER DEFAULT 10,
    max_stock_level INTEGER DEFAULT 1000,
    reorder_point INTEGER DEFAULT 20,
    expiry_days INTEGER,
    is_perishable BOOLEAN DEFAULT false,
    
    image_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    is_sellable BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_type ON products(product_type);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand_name);
CREATE INDEX IF NOT EXISTS idx_products_flavor ON products(flavor);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(is_active);

-- =====================================================
-- INVENTORY TABLE (With stock tracking)
-- =====================================================
CREATE TABLE IF NOT EXISTS inventory (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT UNIQUE NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    
    current_quantity INTEGER DEFAULT 0,
    reserved_quantity INTEGER DEFAULT 0,
    available_quantity INTEGER DEFAULT 0,
    
    last_stock_in TIMESTAMP,
    last_stock_out TIMESTAMP,
    expiry_date TIMESTAMP,
    batch_number VARCHAR(50),
    
    is_low_stock BOOLEAN DEFAULT false,
    is_out_of_stock BOOLEAN DEFAULT true,
    location VARCHAR(100),
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_inventory_product ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_low_stock ON inventory(is_low_stock);
CREATE INDEX IF NOT EXISTS idx_inventory_expiry ON inventory(expiry_date);

-- =====================================================
-- STOCK TRANSACTIONS TABLE (Complete logging)
-- =====================================================
CREATE TABLE IF NOT EXISTS stock_transactions (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES products(id),
    user_id BIGINT NOT NULL REFERENCES users(id),
    supplier_id BIGINT REFERENCES suppliers(id),
    
    transaction_type VARCHAR(20) NOT NULL,
    quantity INTEGER NOT NULL,
    previous_quantity INTEGER,
    new_quantity INTEGER,
    unit_price DECIMAL(10,2),
    total_amount DECIMAL(10,2),
    
    reason VARCHAR(500),
    reference_number VARCHAR(100),
    batch_number VARCHAR(50),
    expiry_date TIMESTAMP,
    notes TEXT,
    
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_transactions_product ON stock_transactions(product_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON stock_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON stock_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON stock_transactions(user_id);

-- =====================================================
-- SALES ORDERS TABLE (POS System)
-- =====================================================
CREATE TABLE IF NOT EXISTS sales_orders (
    id BIGSERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    
    customer_name VARCHAR(200),
    customer_mobile VARCHAR(20),
    
    subtotal DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) DEFAULT 0,
    
    payment_method VARCHAR(20) DEFAULT 'CASH',
    payment_status VARCHAR(20) DEFAULT 'COMPLETED',
    order_status VARCHAR(20) DEFAULT 'COMPLETED',
    
    sold_by BIGINT NOT NULL REFERENCES users(id),
    
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    version BIGINT DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_sales_order_number ON sales_orders(order_number);
CREATE INDEX IF NOT EXISTS idx_sales_customer_mobile ON sales_orders(customer_mobile);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales_orders(created_at);
CREATE INDEX IF NOT EXISTS idx_sales_sold_by ON sales_orders(sold_by);

-- =====================================================
-- SALES ITEMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS sales_items (
    id BIGSERIAL PRIMARY KEY,
    sales_order_id BIGINT NOT NULL REFERENCES sales_orders(id) ON DELETE CASCADE,
    product_id BIGINT NOT NULL REFERENCES products(id),
    
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_price DECIMAL(10,2) NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sales_items_order ON sales_items(sales_order_id);
CREATE INDEX IF NOT EXISTS idx_sales_items_product ON sales_items(product_id);

-- =====================================================
-- ALERTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS alerts (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT REFERENCES products(id),
    alert_type VARCHAR(30) NOT NULL,
    message TEXT NOT NULL,
    current_quantity INTEGER,
    threshold_quantity INTEGER,
    is_read BOOLEAN DEFAULT false,
    is_resolved BOOLEAN DEFAULT false,
    email_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_alerts_product ON alerts(product_id);
CREATE INDEX IF NOT EXISTS idx_alerts_type ON alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_alerts_resolved ON alerts(is_resolved);

-- =====================================================
-- PASSWORD RESET REQUESTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS password_reset_requests (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reset_token VARCHAR(100),
    new_password VARCHAR(255),
    status VARCHAR(20) DEFAULT 'PENDING',
    processed_by BIGINT REFERENCES users(id),
    processed_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_password_reset_user ON password_reset_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_status ON password_reset_requests(status);

-- =====================================================
-- OTP LOGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS otp_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    otp VARCHAR(10) NOT NULL,
    otp_type VARCHAR(20) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    is_used BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INSERT DEFAULT DATA
-- =====================================================

-- Insert default admin user (password: admin123 - bcrypt hash)
INSERT INTO users (email, phone, password, full_name, role, is_active, is_email_verified, is_phone_verified, created_at, updated_at)
VALUES ('halderromen2002@gmail.com', '1234567890', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iAt6Z5EO', 'Admin User', 'ADMIN', true, true, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (email) DO NOTHING;

-- Insert default categories
INSERT INTO categories (name, description, brand_name, cake_flavor, display_order) VALUES
('Cakes', 'All types of cakes', NULL, NULL, 1),
('Raw Materials', 'Ingredients for baking', NULL, NULL, 2),
('Sweets', 'Indian sweets', NULL, NULL, 3),
('Beverages', 'Drinks and beverages', NULL, NULL, 4),
('Bread', 'Fresh bread items', NULL, NULL, 5);

-- Insert brand-specific categories
INSERT INTO categories (name, description, parent_id, brand_name, display_order) VALUES
('Chocolate Cakes', 'Cakes with chocolate', (SELECT id FROM categories WHERE name = 'Cakes'), 'Generic', 6),
('Vanilla Cakes', 'Cakes with vanilla', (SELECT id FROM categories WHERE name = 'Cakes'), 'Generic', 7),
('KitKat Products', 'KitKat branded items', NULL, 'KitKat', 8),
('Dairy Milk Products', 'Dairy Milk branded items', NULL, 'Dairy Milk', 9),
('Amul Products', 'Amul branded items', NULL, 'Amul', 10);

-- Insert default suppliers
INSERT INTO suppliers (name, contact_person, email, phone, is_active) VALUES
('ABC Flour Mills', 'John Doe', 'john@abclmills.com', '9876543210', true),
('Sweet Ingredients Co', 'Jane Smith', 'jane@sweetco.com', '9876543211', true),
('Dairy Land', 'Mike Johnson', 'mike@dairyland.com', '9876543212', true);

-- =====================================================
-- POSTGRESQL SEQUENCES FOR AUTO-INCREMENT
-- =====================================================
CREATE SEQUENCE IF NOT EXISTS users_id_seq;
CREATE SEQUENCE IF NOT EXISTS categories_id_seq;
CREATE SEQUENCE IF NOT EXISTS suppliers_id_seq;
CREATE SEQUENCE IF NOT EXISTS products_id_seq;
CREATE SEQUENCE IF NOT EXISTS inventory_id_seq;
CREATE SEQUENCE IF NOT EXISTS stock_transactions_id_seq;
CREATE SEQUENCE IF NOT EXISTS sales_orders_id_seq;
CREATE SEQUENCE IF NOT EXISTS sales_items_id_seq;
CREATE SEQUENCE IF NOT EXISTS alerts_id_seq;
CREATE SEQUENCE IF NOT EXISTS password_reset_requests_id_seq;
CREATE SEQUENCE IF NOT EXISTS otp_logs_id_seq;

-- Grant permissions (adjust as needed for your Supabase setup)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
