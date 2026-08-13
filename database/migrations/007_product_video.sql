-- 007_product_video.sql
-- Add self-hosted mp4 video URL field to products table
-- Used for Wildberries-style vertical (9:16) product videos
-- Video shown as the first slide in the product image gallery
-- Autoplays MUTED; user can tap unmute button to enable sound

ALTER TABLE products
ADD COLUMN IF NOT EXISTS video_url VARCHAR(500) DEFAULT NULL;

COMMENT ON COLUMN products.video_url IS 'Path to self-hosted mp4 video, e.g. /uploads/videos/product_123.mp4. NULL if no video.';
