-- ============================================================
-- Migratsiya 003: Buyurtma qatoriga rasm manzili
-- ============================================================
--
-- Fayllarni ishga tushirish tartibi:
--   1) schema.sql                                (asosiy jadvallar)
--   2) migrations/001_colors_and_visibility.sql  (ranglar + yashirish/arxiv)
--   3) migrations/002_color_availability.sql     (rang mavjudligi)
--   4) migrations/003_order_item_image.sql       (shu fayl)
--
-- BU MIGRATSIYA XAVFSIZ:
--   * Hech narsa o'chirilmaydi va o'zgartirilmaydi
--   * Faqat bitta yangi ustun qo'shiladi
--   * Ikki marta ishga tushirilsa ham xato bermaydi
--
-- Nima uchun kerak:
-- Rasm manzili buyurtma berilgan PAYTDAGI holicha nusxa qilinadi —
-- xuddi price (narx) va color_name_uz (rang nomi) kabi. Shunda
-- keyinchalik rangni o'chirsangiz, rasmni almashtirsangiz yoki
-- mahsulotni o'chirsangiz ham, eski buyurtmada mijoz aynan nimani
-- ko'rgani saqlanib qoladi.
--
-- Eski buyurtmalarda bu ustun bo'sh (NULL) qoladi — bu normal.
-- Ular uchun admin panel mahsulotning hozirgi rasmini ko'rsatadi.
-- ============================================================

BEGIN;

ALTER TABLE order_items
    ADD COLUMN IF NOT EXISTS image_url VARCHAR(255);

COMMIT;


-- ============================================================
-- TEKSHIRISH (hech narsani o'zgartirmaydi)
-- ============================================================

-- Oxirgi buyurtma qatorlari va ularning rasmi
-- (eski qatorlarda image_url bo'sh bo'ladi — kutilgan holat)
SELECT id, order_id, product_id, quantity, color_name_uz, image_url
FROM order_items
ORDER BY id DESC
LIMIT 10;
