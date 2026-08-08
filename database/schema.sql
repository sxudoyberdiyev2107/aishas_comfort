-- ============================================================
-- Aishas Comfort — PostgreSQL BAZA SXEMASI (asosiy holat)
-- ============================================================
--
-- Bu fayl bazani NOLDAN qurish uchun. Bir marta ishga tushiriladi.
-- Keyingi o'zgarishlar database/migrations/ papkasidagi fayllar
-- orqali, tartib bilan qo'shiladi.
--
-- Hammasi "IF NOT EXISTS" bilan yozilgan: ikki marta ishga
-- tushirilsa ham xato bermaydi va mavjud ma'lumotni buzmaydi.
-- ============================================================

BEGIN;

-- ------------------------------------------------------------
-- 1. USERS — admin foydalanuvchilar
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- bcrypt bilan hash qilingan
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- DIQQAT: bu yerda admin foydalanuvchi YARATILMAYDI.
-- Admin hisobini yaratish/parolini yangilash uchun backend papkasida:
--     node create-admin.js
-- Sababi: sxema faylida ochiq parol saqlash xavfli.


-- ------------------------------------------------------------
-- 2. CATEGORIES — mahsulot kategoriyalari
-- ------------------------------------------------------------
-- slug — saytdagi manzilda ishlatiladigan nom, masalan:
--        /kategoriya/parta-stullar
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(100) UNIQUE NOT NULL,
    name_uz VARCHAR(150) NOT NULL,
    name_ru VARCHAR(150) NOT NULL,
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ------------------------------------------------------------
-- 3. PRODUCTS — mahsulotlar
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    category_id INT REFERENCES categories(id) ON DELETE SET NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    name_uz VARCHAR(200) NOT NULL,
    name_ru VARCHAR(200) NOT NULL,
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

CREATE INDEX IF NOT EXISTS idx_products_category
    ON products (category_id);


-- ------------------------------------------------------------
-- 4. ORDERS — buyurtmalar
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(50) NOT NULL,
    delivery_address TEXT NOT NULL,
    total_price DECIMAL(12, 2) NOT NULL,
    status VARCHAR(50) DEFAULT 'Pending', -- Pending, Processing, Completed, Cancelled
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ------------------------------------------------------------
-- 5. ORDER_ITEMS — buyurtma tarkibidagi mahsulotlar
-- ------------------------------------------------------------
-- price — buyurtma berilgan paytdagi narx (keyin narx o'zgarsa ham
--         eski buyurtmada o'sha paytdagi narx qolishi uchun)
CREATE TABLE IF NOT EXISTS order_items (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id) ON DELETE SET NULL,
    quantity INT NOT NULL,
    price DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_order_items_order
    ON order_items (order_id);


-- ------------------------------------------------------------
-- 6. KATEGORIYALARNI TO'LDIRISH
-- ------------------------------------------------------------
-- MUHIM: bu ro'yxat saytdagi (Header.jsx, CategorySection.jsx va
-- admin paneldagi ro'yxat) slug'lar bilan AYNAN bir xil bo'lishi shart.
-- Aks holda mahsulot kategoriyasiz qoladi va kategoriya sahifasida
-- ko'rinmaydi.
--
-- ON CONFLICT DO NOTHING — qayta ishga tushirilsa nusxa yaratmaydi.

INSERT INTO categories (slug, name_uz, name_ru) VALUES
    ('parta-stullar',          'Parta va stullar',                    'Парты и стулья'),
    ('bolalar-o-yingohlari',   'Bolalar o''yingohlari',               'Детские игровые комплексы'),
    ('kompyuter-ish-stollari', 'Kompyuter va ish stollari',           'Компьютерные и рабочие столы'),
    ('ofis-kreslolari',        'Ofis kreslolari',                     'Офисные кресла'),
    ('game-kreslolari',        'Game kreslolari (Geymer kreslolari)', 'Геймерские кресла (Игровые кресла)'),
    ('bar-stullari',           'Bar stullari',                        'Барные стулья'),
    ('boshqa-stul-kreslolar',  'Boshqa stul va kreslolar',            'Прочие стулья и кресла'),
    ('yugurish-yo-laklari',    'Yugurish yo''laklari',                'Беговые дорожки'),
    ('velo-trenajyorlar',      'Velo trenajyorlar',                   'Велотренажеры'),
    ('tebratma-kursilar',      'Tebratma kursilar',                   'Кресла-качалки'),
    ('kitob-javonlari',        'Kitob javonlari',                     'Книжные полки и шкафы'),
    ('kemping-uchun',          'Kemping uchun',                       'Для кемпинга (Мебель для кемпинга)'),
    ('stollar',                'Stollar',                             'Столы')
ON CONFLICT (slug) DO NOTHING;

COMMIT;


-- ============================================================
-- TEKSHIRISH (hech narsani o'zgartirmaydi)
-- ============================================================

-- 1. Qaysi jadvallar yaratilgan?
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. Kategoriyalar to'ldirilganmi? (13 ta bo'lishi kerak)
SELECT COUNT(*) AS kategoriyalar_soni FROM categories;

-- 3. Kategoriyalar ro'yxati
SELECT id, slug, name_uz FROM categories ORDER BY id;

-- 4. Admin foydalanuvchi bormi? (parol ko'rsatilmaydi)
SELECT id, username FROM users ORDER BY id;
