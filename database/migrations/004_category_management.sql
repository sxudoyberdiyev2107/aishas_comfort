-- ============================================================
-- Migratsiya 004: Kategoriyalarni boshqarish (arxivlash)
-- ============================================================
--
-- Fayllarni ishga tushirish tartibi:
--   1) schema.sql                                (asosiy jadvallar)
--   2) migrations/001_colors_and_visibility.sql  (ranglar + yashirish/arxiv)
--   3) migrations/002_color_availability.sql     (rang mavjudligi)
--   4) migrations/003_order_item_image.sql       (buyurtma qatoridagi rasm)
--   5) migrations/004_category_management.sql     (shu fayl)
--
-- BU MIGRATSIYA XAVFSIZ:
--   * Hech qanday ustun yoki jadval O'CHIRILMAYDI
--   * Mavjud ma'lumotlar O'ZGARTIRILMAYDI
--   * Faqat yangi ustunlar qo'shiladi (ikkalasi ham bo'sh/NULL yoki FALSE)
--   * Ikki marta ishga tushirilsa ham xato bermaydi (IF NOT EXISTS)
--
-- Qanday ishga tushirish (Railway):
--   Railway paneli -> PostgreSQL servisi -> "Data" (yoki "Query") bo'limi
--   -> quyidagi kodni to'liq nusxalab qo'yib, ishga tushiring.
--
-- BEGIN ... COMMIT o'rtasidagi hamma narsa "birgalikda" bajariladi:
-- agar biror qatorda xato chiqsa, HECH NARSA saqlanmaydi va baza
-- avvalgi holicha qoladi.
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- 1. CATEGORIES jadvaliga arxiv ustuni
-- ------------------------------------------------------------
-- is_archived = kategoriya arxivlangan (saytda ko'rinmaydi: bosh
--               sahifa katalogida, mobil menyuda va yangi mahsulot
--               formasidagi tanlash ro'yxatida chiqmaydi).
--
-- DIQQAT: bu products.is_archived DAN BOSHQA narsa. Bu yerda gap
-- KATEGORIYA arxivi haqida. Mahsulotning o'z arxivi 001-migratsiyada.
--
-- Arxivlangan kategoriyadagi mavjud mahsulotlar BUZILMAYDI: ular
-- bazada o'sha kategoriyaga bog'langan holicha qoladi.
--
-- DEFAULT FALSE tufayli mavjud kategoriyalarning HAMMASI avtomatik
-- "arxivlanmagan" (ko'rinadigan) holatda qoladi, ya'ni sayt o'zgarmaydi.

ALTER TABLE categories
    ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT FALSE;


-- ------------------------------------------------------------
-- 2. CATEGORIES jadvaliga ota-kategoriya ustuni (KELAJAK UCHUN POYDEVOR)
-- ------------------------------------------------------------
-- parent_id = ushbu kategoriyaning ota-kategoriyasi (agar bu bir
--             pod-kategoriya bo'lsa). Masalan: "Stollar" -> ichida
--             "Oshxona stoli", "Yozuv stoli" kabi pod-kategoriyalar.
--
-- HOZIRCHA BU USTUN ISHLATILMAYDI. Backend, admin panel va sayt uni
-- hali o'qimaydi ham, yozmaydi ham. U faqat KELAJAKDA pod-kategoriya
-- (Wildberries uslubidagi chap katalog) qo'shishni osonlashtirish
-- uchun oldindan tayyorlab qo'yildi — o'shanda qayta migratsiya
-- yozish shart bo'lmaydi, faqat kod qo'shiladi.
--
-- NULL = "asosiy kategoriya" (ota yo'q). Barcha mavjud kategoriyalar
-- avtomatik NULL bo'ladi, ya'ni hozircha hammasi asosiy — sayt
-- xatti-harakati umuman o'zgarmaydi.
--
-- REFERENCES categories(id) — parent_id boshqa bir kategoriyaning
-- id'siga ishora qiladi (jadval o'ziga o'zi bog'lanadi).
-- ON DELETE SET NULL — agar ota-kategoriya o'chirilsa, bola-kategoriya
-- yo'qolmaydi, shunchaki yana "asosiy"ga (parent_id = NULL) aylanadi.

ALTER TABLE categories
    ADD COLUMN IF NOT EXISTS parent_id INT REFERENCES categories(id) ON DELETE SET NULL;

COMMIT;


-- ============================================================
-- TEKSHIRISH (ixtiyoriy — hech narsani o'zgartirmaydi)
-- ============================================================
-- Quyidagi so'rovlar faqat ko'rsatadi. Ularni alohida ishga tushirib,
-- hammasi joyidaligiga ishonch hosil qiling.

-- 1. Kategoriyalar soni va arxiv holati
--    (barcha kategoriyalar is_archived = false bo'lishi kerak)
SELECT
    COUNT(*)                              AS jami_kategoriya,
    COUNT(*) FILTER (WHERE is_archived)   AS arxivlangan
FROM categories;

-- 2. Kategoriyalar ro'yxati (yangi ustunlar bilan)
--    parent_id barchada bo'sh (NULL) bo'ladi — kutilgan holat.
SELECT id, slug, name_uz, is_archived, parent_id
FROM categories
ORDER BY id;
