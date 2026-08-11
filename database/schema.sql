-- ============================================================
-- MINI ERP + CRM OPERATIONS PORTAL - PRODUCTION POSTGRESQL SCHEMA
-- Target Databases: Supabase / Neon / Render PostgreSQL
-- ============================================================

-- 1. Create Enums
CREATE TYPE role_name AS ENUM ('ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS');
CREATE TYPE customer_type AS ENUM ('RETAIL', 'WHOLESALE', 'DISTRIBUTOR');
CREATE TYPE customer_status AS ENUM ('LEAD', 'ACTIVE', 'INACTIVE');
CREATE TYPE followup_status AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');
CREATE TYPE movement_type AS ENUM ('IN', 'OUT');
CREATE TYPE challan_status AS ENUM ('DRAFT', 'CONFIRMED', 'CANCELLED');

-- 2. Roles Table
CREATE TABLE roles (
    id VARCHAR(36) PRIMARY KEY,
    name role_name UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Users Table
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role_id VARCHAR(36) NOT NULL REFERENCES roles(id),
    status VARCHAR(50) DEFAULT 'ACTIVE' NOT NULL,
    created_by_id VARCHAR(36),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Customers Table
CREATE TABLE customers (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    mobile VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    business_name VARCHAR(255) NOT NULL,
    gst_number VARCHAR(50),
    customer_type customer_type DEFAULT 'WHOLESALE' NOT NULL,
    address TEXT NOT NULL,
    status customer_status DEFAULT 'LEAD' NOT NULL,
    followup_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Customer Followups Table
CREATE TABLE customer_followups (
    id VARCHAR(36) PRIMARY KEY,
    customer_id VARCHAR(36) NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    notes TEXT NOT NULL,
    followup_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status followup_status DEFAULT 'PENDING' NOT NULL,
    created_by_id VARCHAR(36) NOT NULL REFERENCES users(id),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Categories Table
CREATE TABLE categories (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Warehouses Table
CREATE TABLE warehouses (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    location TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Products Table
CREATE TABLE products (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE NOT NULL,
    category_id VARCHAR(36) NOT NULL REFERENCES categories(id),
    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
    current_stock INT DEFAULT 0 NOT NULL CHECK (current_stock >= 0),
    min_stock_quantity INT DEFAULT 10 NOT NULL CHECK (min_stock_quantity >= 0),
    warehouse_id VARCHAR(36) NOT NULL REFERENCES warehouses(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Stock Movements Table
CREATE TABLE stock_movements (
    id VARCHAR(36) PRIMARY KEY,
    product_id VARCHAR(36) NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INT NOT NULL CHECK (quantity > 0),
    movement_type movement_type NOT NULL,
    reason TEXT NOT NULL,
    created_by_id VARCHAR(36) NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Sales Challans Table
CREATE TABLE challans (
    id VARCHAR(36) PRIMARY KEY,
    challan_number VARCHAR(100) UNIQUE NOT NULL,
    customer_id VARCHAR(36) NOT NULL REFERENCES customers(id),
    total_quantity INT DEFAULT 0 NOT NULL,
    total_amount NUMERIC(14, 2) DEFAULT 0 NOT NULL,
    status challan_status DEFAULT 'DRAFT' NOT NULL,
    notes TEXT,
    created_by_id VARCHAR(36) NOT NULL REFERENCES users(id),
    confirmed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Challan Items Table (Preserving Historical Product Snapshot)
CREATE TABLE challan_items (
    id VARCHAR(36) PRIMARY KEY,
    challan_id VARCHAR(36) NOT NULL REFERENCES challans(id) ON DELETE CASCADE,
    product_id VARCHAR(36) REFERENCES products(id) ON DELETE SET NULL,
    product_name VARCHAR(255) NOT NULL,
    product_sku VARCHAR(100) NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    line_total NUMERIC(14, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Audit Logs Table
CREATE TABLE audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    action VARCHAR(255) NOT NULL,
    entity VARCHAR(255) NOT NULL,
    entity_id VARCHAR(255),
    details TEXT,
    user_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Performance Indexes
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_warehouse ON products(warehouse_id);
CREATE INDEX idx_customers_status ON customers(status);
CREATE INDEX idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX idx_challans_number ON challans(challan_number);
CREATE INDEX idx_challans_status ON challans(status);
CREATE INDEX idx_followups_date_status ON customer_followups(followup_date, status);
