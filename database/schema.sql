-- PostgreSQL Database Schema for Aishas Comfort E-Commerce

-- 1. Users Table (Admin authentication)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Hashed with bcrypt
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(100) UNIQUE NOT NULL,
    name_uz VARCHAR(100) NOT NULL,
    name_ru VARCHAR(100) NOT NULL,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Products Table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    category_id INT REFERENCES categories(id) ON DELETE SET NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    name_uz VARCHAR(100) NOT NULL,
    name_ru VARCHAR(100) NOT NULL,
    desc_uz TEXT,
    desc_ru TEXT,
    price DECIMAL(12, 2) NOT NULL,
    old_price DECIMAL(12, 2),
    stock INT DEFAULT 0,
    image_url VARCHAR(255),
    is_new BOOLEAN DEFAULT TRUE,
    is_bestseller BOOLEAN DEFAULT FALSE,
    video_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(50) NOT NULL,
    delivery_address TEXT NOT NULL,
    total_price DECIMAL(12, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending', -- Pending, Processing, Completed, Cancelled
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id) ON DELETE SET NULL,
    quantity INT NOT NULL,
    price DECIMAL(12, 2) NOT NULL, -- Captures product price at checkout time
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed an admin user (password_hash for 'admin123' using bcrypt with round 10)
-- Note: Replace this password in production with a custom secure one.
-- bcrypt hash for 'admin123': $2b$10$X8m196.oQ4aD1N6r4mB6G.Z3mJszCqfE3L/tU2oN1sE4tV/g4F6pC
INSERT INTO users (username, password) 
VALUES ('admin', '$2b$10$X8m196.oQ4aD1N6r4mB6G.Z3mJszCqfE3L/tU2oN1sE4tV/g4F6pC')
ON CONFLICT (username) DO NOTHING;
