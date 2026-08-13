-- 008_product_sizes_and_images.sql
-- Multi-image galleries for color-less products + size variants with
-- per-size price. Model 1: COLOR drives images, SIZE drives price
-- (independent axes, no color x size matrix).

-- 1) General product images (color-less products' gallery source)
CREATE TABLE IF NOT EXISTS product_images (
    id          SERIAL PRIMARY KEY,
    product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    image_url   VARCHAR(255) NOT NULL,
    sort_order  INTEGER DEFAULT 0,
    is_primary  BOOLEAN DEFAULT FALSE,
    created_at  TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_product_images_product
    ON product_images(product_id);

-- 2) Size variants: each size its own price (+ optional old_price)
--    and availability. Size changes the displayed price.
CREATE TABLE IF NOT EXISTS product_sizes (
    id           SERIAL PRIMARY KEY,
    product_id   INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name_uz      VARCHAR(100) NOT NULL,
    name_ru      VARCHAR(100),
    price        DECIMAL(12,2) NOT NULL,
    old_price    DECIMAL(12,2),
    is_available BOOLEAN DEFAULT TRUE,
    sort_order   INTEGER DEFAULT 0,
    created_at   TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_product_sizes_product
    ON product_sizes(product_id);

-- 3) Per-color primary image flag (sort_order already exists)
ALTER TABLE product_color_images
    ADD COLUMN IF NOT EXISTS is_primary BOOLEAN DEFAULT FALSE;

-- 4) Order history: copy chosen size name (like color_name_uz/ru)
ALTER TABLE order_items
    ADD COLUMN IF NOT EXISTS size_name_uz VARCHAR(100);
ALTER TABLE order_items
    ADD COLUMN IF NOT EXISTS size_name_ru VARCHAR(100);
