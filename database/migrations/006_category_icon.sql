-- ============================================================
-- Migratsiya 006: Kategoriya ikonkasi (icon)
-- ============================================================
--
-- Fayllarni ishga tushirish tartibi:
--   1) schema.sql
--   2) migrations/001_colors_and_visibility.sql
--   3) migrations/002_color_availability.sql
--   4) migrations/003_order_item_image.sql
--   5) migrations/004_category_management.sql
--   6) migrations/005_category_sort_order.sql
--   7) migrations/006_category_icon.sql            (shu fayl)
--
-- BU MIGRATSIYA XAVFSIZ:
--   * Hech qanday ustun yoki jadval O'CHIRILMAYDI
--   * Faqat bitta yangi ustun qo'shiladi (icon)
--   * Mavjud kategoriyalarga HECH NARSA yozilmaydi (NULL qoladi) —
--     ikonkani keyin admin panelidan o'zingiz tanlaysiz
--   * Ikki marta ishga tushirilsa ham xato bermaydi (IF NOT EXISTS)
--
-- Qanday ishga tushirish (Railway):
--   Railway paneli -> PostgreSQL servisi -> "Data" (yoki "Query") bo'limi
--   -> quyidagi BEGIN ... COMMIT orasidagi kodni to'liq nusxalab qo'yib,
--   ishga tushiring.
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- CATEGORIES jadvaliga ikonka ustuni
-- ------------------------------------------------------------
-- icon = CategoryIcon.jsx dagi ikonka "key"i (masalan 'sofa', 'bed',
--        'office_chair'). Bo'sh (NULL) bo'lsa — ikonka yo'q.
--
-- Bazada icon HAR QANDAY kategoriyada bo'lishi mumkin (cheklov yo'q).
-- Ikonka faqat asosiy (ota) kategoriyalarda ko'rsatilishini admin
-- panelining O'ZI hal qiladi — bu baza qoidasi emas.
--
-- VARCHAR(50) — key'lar qisqa (eng uzuni ~18 belgi), 50 yetib ortadi.

ALTER TABLE categories
    ADD COLUMN IF NOT EXISTS icon VARCHAR(50);

COMMIT;


-- ============================================================
-- TEKSHIRISH (ixtiyoriy — hech narsani o'zgartirmaydi)
-- ============================================================

-- 1. Ikonka ustuni qo'shilgani va hozircha barchasi bo'shligini tekshirish
--    (icon_bilan = 0 bo'lishi kerak — hali hech kimga tanlanmagan)
SELECT
    COUNT(*)                              AS jami_kategoriya,
    COUNT(icon)                           AS icon_bilan
FROM categories;

-- 2. Kategoriyalar yangi ustun bilan
SELECT id, slug, name_uz, parent_id, sort_order, icon
FROM categories
ORDER BY sort_order ASC NULLS LAST, id ASC;
