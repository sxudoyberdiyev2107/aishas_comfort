-- ============================================================
-- Migratsiya 002: Har bir rang uchun "mavjud / tugagan" holati
-- ============================================================
--
-- Fayllarni ishga tushirish tartibi:
--   1) schema.sql                        (asosiy jadvallar)
--   2) migrations/001_colors_and_visibility.sql  (ranglar + yashirish/arxiv)
--   3) migrations/002_color_availability.sql     (shu fayl)
--
-- BU MIGRATSIYA XAVFSIZ:
--   * Hech narsa o'chirilmaydi va o'zgartirilmaydi
--   * Faqat bitta yangi ustun qo'shiladi
--   * Ikki marta ishga tushirilsa ham xato bermaydi
--
-- DEFAULT TRUE tufayli mavjud ranglarning HAMMASI "mavjud"
-- holatida qoladi — ya'ni sayt xatti-harakati o'zgarmaydi.
-- ============================================================

BEGIN;

ALTER TABLE product_colors
    ADD COLUMN IF NOT EXISTS is_available BOOLEAN NOT NULL DEFAULT TRUE;

COMMIT;


-- ============================================================
-- TEKSHIRISH (hech narsani o'zgartirmaydi)
-- ============================================================

-- Ranglar va ularning yangi holati
-- (hozircha barchasi is_available = true bo'lishi kerak)
SELECT id, product_id, name_uz, hex_code, is_available
FROM product_colors
ORDER BY product_id, sort_order, id;
