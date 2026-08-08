-- ============================================================
-- Migratsiya 001: Rangli variantlar + Yashirish/Arxivlash
-- ============================================================
--
-- BU MIGRATSIYA XAVFSIZ:
--   * Hech qanday ustun yoki jadval O'CHIRILMAYDI
--   * Mavjud ma'lumotlar O'ZGARTIRILMAYDI
--   * Faqat yangi ustun va yangi jadvallar qo'shiladi
--   * Ikki marta ishga tushirilsa ham xato bermaydi (IF NOT EXISTS)
--
-- Qanday ishga tushirish (Railway):
--   Railway paneli -> PostgreSQL servisi -> "Data" yoki "Query" bo'limi
--   -> quyidagi kodni to'liq nusxalab qo'yib, ishga tushiring.
--
-- BEGIN ... COMMIT o'rtasidagi hamma narsa "birgalikda" bajariladi:
-- agar biror qatorda xato chiqsa, HECH NARSA saqlanmaydi va baza
-- avvalgi holicha qoladi.
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- 1. PRODUCTS jadvaliga ko'rinuvchanlik ustunlari
-- ------------------------------------------------------------
-- is_hidden   = mahsulot vaqtincha yashirilgan (saytda yo'q, adminda bor)
-- is_archived = mahsulot arxivlangan (saytda yo'q, adminning "Arxiv" bo'limida)
--
-- DEFAULT FALSE tufayli mavjud mahsulotlarning HAMMASI avtomatik
-- "ko'rinadigan" holatda qoladi, ya'ni sayt o'zgarmaydi.

ALTER TABLE products
    ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE products
    ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT FALSE;

-- Saytda mahsulotlarni tez filtrlash uchun indeks
CREATE INDEX IF NOT EXISTS idx_products_visibility
    ON products (is_hidden, is_archived);


-- ------------------------------------------------------------
-- 2. PRODUCT_COLORS — mahsulotning rang variantlari
-- ------------------------------------------------------------
-- Bitta mahsulotda bir nechta rang bo'lishi mumkin.
-- Ranglar IXTIYORIY: rangi yo'q mahsulot avvalgidek ishlayveradi.
--
-- ON DELETE CASCADE = mahsulot o'chirilsa, uning ranglari ham
-- avtomatik o'chadi (baza ichida "yetim" yozuvlar qolmaydi).

CREATE TABLE IF NOT EXISTS product_colors (
    id SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name_uz VARCHAR(100) NOT NULL,          -- masalan: "Ko'k"
    name_ru VARCHAR(100) NOT NULL,          -- masalan: "Синий"
    hex_code VARCHAR(7) NOT NULL,           -- doiracha rangi, masalan: "#1E5AA8"
    sort_order INT NOT NULL DEFAULT 0,      -- ko'rsatilish tartibi
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_product_colors_product
    ON product_colors (product_id);


-- ------------------------------------------------------------
-- 3. PRODUCT_COLOR_IMAGES — har bir rangning rasmlari
-- ------------------------------------------------------------
-- Bitta rangda bir nechta rasm bo'lishi mumkin.
-- image_url — /api/upload qaytaradigan manzil, masalan "/uploads/123.jpg"
--
-- ON DELETE CASCADE = rang o'chirilsa, uning rasmlari ham o'chadi.

CREATE TABLE IF NOT EXISTS product_color_images (
    id SERIAL PRIMARY KEY,
    color_id INT NOT NULL REFERENCES product_colors(id) ON DELETE CASCADE,
    image_url VARCHAR(255) NOT NULL,
    sort_order INT NOT NULL DEFAULT 0,      -- rasmlar tartibi
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_product_color_images_color
    ON product_color_images (color_id);


-- ------------------------------------------------------------
-- 4. ORDER_ITEMS jadvaliga tanlangan rang
-- ------------------------------------------------------------
-- Rang RAQAMI emas, rang NOMI nusxa qilib saqlanadi.
-- Sababi: keyinchalik rangni o'chirsangiz ham, eski buyurtmada
-- mijoz qaysi rangni tanlagani ko'rinib turadi.
--
-- NULL bo'lishi mumkin = rangsiz mahsulot buyurtmalari uchun.

ALTER TABLE order_items
    ADD COLUMN IF NOT EXISTS color_name_uz VARCHAR(100);

ALTER TABLE order_items
    ADD COLUMN IF NOT EXISTS color_name_ru VARCHAR(100);

COMMIT;


-- ============================================================
-- TEKSHIRISH (ixtiyoriy)
-- ============================================================
-- Quyidagi so'rovlar hech narsani o'zgartirmaydi, faqat ko'rsatadi.
-- Ularni alohida ishga tushirib, hammasi joyidaligiga ishonch hosil qiling.

-- 4.1. Mahsulotlar soni va ko'rinuvchanlik holati
--      (barcha mahsulotlar hidden=false, archived=false bo'lishi kerak)
SELECT
    COUNT(*) AS jami_mahsulot,
    COUNT(*) FILTER (WHERE is_hidden)   AS yashirilgan,
    COUNT(*) FILTER (WHERE is_archived) AS arxivlangan
FROM products;

-- 4.2. Mahsulotlar ro'yxati (nomi va yangi ustunlar bilan)
SELECT id, name_uz, price, is_hidden, is_archived
FROM products
ORDER BY id;

-- 4.3. Yangi jadvallar yaratilganini tasdiqlash (ikkalasi ham 0 qator qaytaradi)
SELECT COUNT(*) AS ranglar_soni FROM product_colors;
SELECT COUNT(*) AS rang_rasmlari_soni FROM product_color_images;
