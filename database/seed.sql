-- ============================================================
-- MINI ERP + CRM OPERATIONS PORTAL - PRODUCTION SEED SCRIPT
-- ============================================================

-- Roles
INSERT INTO roles (id, name, description) VALUES
('r-1', 'ADMIN', 'Full System Access & Governance'),
('r-2', 'SALES', 'Customer CRM, Sales Challan Creation & Follow-ups'),
('r-3', 'WAREHOUSE', 'Inventory Management, Stock Movements & Fulfillment'),
('r-4', 'ACCOUNTS', 'Financial Auditing, Billing Views & Operational Reports');

-- Users (Hashed Passwords)
-- admin123 -> $2a$10$w8T0iW3fB...
INSERT INTO users (id, name, email, password, role_id, status) VALUES
('u-1', 'Rajesh Sharma (Admin)', 'admin@fundsroom.com', '$2a$10$e8wB6VbUjE6u66x7w7WwXe8wB6VbUjE6u66x7w7WwX', 'r-1', 'ACTIVE'),
('u-2', 'Priya Verma (Sales Manager)', 'sales@fundsroom.com', '$2a$10$e8wB6VbUjE6u66x7w7WwXe8wB6VbUjE6u66x7w7WwX', 'r-2', 'ACTIVE'),
('u-3', 'Vikram Singh (Warehouse Head)', 'warehouse@fundsroom.com', '$2a$10$e8wB6VbUjE6u66x7w7WwXe8wB6VbUjE6u66x7w7WwX', 'r-3', 'ACTIVE'),
('u-4', 'Ananya Iyer (Accounts Officer)', 'accounts@fundsroom.com', '$2a$10$e8wB6VbUjE6u66x7w7WwXe8wB6VbUjE6u66x7w7WwX', 'r-4', 'ACTIVE');

-- Warehouses
INSERT INTO warehouses (id, name, code, location) VALUES
('w-1', 'Central Logistics Hub', 'WH-MUM', 'Bhiwandi, Mumbai, MH'),
('w-2', 'Northern Regional Hub', 'WH-DEL', 'Okhla Phase 3, New Delhi, DL'),
('w-3', 'Southern Distribution Park', 'WH-BLR', 'Peenya Industrial Area, Bangalore, KA');

-- Categories
INSERT INTO categories (id, name, description) VALUES
('c-1', 'Electronics & Automation', 'Sensors, Controllers, and Electrical Assemblies'),
('c-2', 'Industrial Hardware', 'Fasteners, Valves, Bearings and Pumps'),
('c-3', 'Packaging & Logistics', 'Corrugated boxes, Crates, Strapping & Pallets');

-- Sample Products
INSERT INTO products (id, name, sku, category_id, unit_price, current_stock, min_stock_quantity, warehouse_id) VALUES
('p-1', 'Industrial PLC Controller FX-500', 'ELEC-PLC-001', 'c-1', 24500.00, 45, 10, 'w-1'),
('p-2', 'Digital Multimeter Pro 1000V', 'ELEC-MM-003', 'c-1', 4200.00, 8, 15, 'w-2'),
('p-3', 'Stainless Steel Ball Valve 2 Inch', 'HDW-VLV-101', 'c-2', 1850.00, 85, 20, 'w-1'),
('p-4', 'High-Precision Tapered Roller Bearing', 'HDW-BRG-102', 'c-2', 2900.00, 6, 15, 'w-2'),
('p-5', 'Heavy Duty Corrugated Box 5-Ply', 'PKG-BOX-201', 'c-3', 145.00, 1200, 300, 'w-1');
