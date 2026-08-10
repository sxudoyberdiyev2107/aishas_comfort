-- ============================================================
-- Migratsiya 005: Kategoriyalar tartibi (sort_order)
-- ============================================================
--
-- Fayllarni ishga tushirish tartibi:
--   1) schema.sql                                (asosiy jadvallar)
--   2) migrations/001_colors_and_visibility.sql
--   3) migrations/002_color_availability.sql
--   4) migrations/003_order_item_image.sql
--   5) migrations/004_category_management.sql
--   6) migrations/005_category_sort_order.sql     (shu fayl)
--
-- BU MIGRATSIYA XAVFSIZ:
--   * Hech qanday ustun yoki jadval O'CHIRILMAYDI
--   * Faqat bitta yangi ustun qo'shiladi (sort_order)
--   * Mavjud kategoriyalarga hozirgi id tartibi beriladi
--   * Ikki marta ishga tushirilsa ham xato bermaydi (IF NOT EXISTS)
--
-- Qanday ishga tushirish (Railway):
--   Railway paneli -> PostgreSQL servisi -> "Data" (yoki "Query") bo'limi
--   -> quyidagi BEGIN ... COMMIT orasidagi kodni to'liq nusxalab qo'yib,
--   ishga tushiring.
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- CATEGORIES jadvaliga tartib ustuni
-- ------------------------------------------------------------
-- sort_order = kategoriyaning o'z darajasidagi tartibi (kichik son =
--              yuqorida). Admin panelda ↑/↓ tugmalari shu qiymatni
--              qo'shni kategoriya bilan almashtiradi.
--
-- Sayt (bosh sahifa, mobil menyu, forma) va admin ro'yxati endi shu
-- ustun bo'yicha tartiblanadi.

ALTER TABLE categories
    ADD COLUMN IF NOT EXISTS sort_order INT;

-- Mavjud kategoriyalarga boshlang'ich tartib: hozirgi id tartibi.
-- Faqat sort_order hali bo'sh (NULL) bo'lganlarga tegadi — shuning uchun
-- migratsiyani qayta ishga tushirsangiz ham avvalgi tartibingiz buzilmaydi.
UPDATE categories
   SET sort_order = id
 WHERE sort_order IS NULL;

COMMIT;


-- ============================================================
-- TEKSHIRISH (ixtiyoriy — hech narsani o'zgartirmaydi)
-- ============================================================

-- 1. Barcha kategoriyalarda sort_order to'ldirilganini tekshirish
--    (bo'sh_qolgan = 0 bo'lishi kerak)
SELECT
    COUNT(*)                                AS jami_kategoriya,
    COUNT(*) FILTER (WHERE sort_order IS NULL) AS bosh_qolgan
FROM categories;

-- 2. Kategoriyalar yangi tartib ustuni bilan
SELECT id, slug, name_uz, parent_id, sort_order
FROM categories
ORDER BY sort_order ASC NULLS LAST, id ASC;
