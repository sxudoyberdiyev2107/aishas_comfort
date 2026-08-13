const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { TelegramBot } = require('node-telegram-bot-api');
const db = require('../config/db');
const authMiddleware = require('../middleware/auth');

require('dotenv').config();

const { JWT_SECRET } = require('../config/jwt');
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// Initialize Telegram Bot Client (if configured)
let bot = null;
if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
  try {
    bot = new TelegramBot(TELEGRAM_BOT_TOKEN, { polling: false });
    console.log('Telegram Bot Client successfully initialized.');
  } catch (err) {
    console.error('Error initializing Telegram bot:', err.message);
  }
}

const fs = require('fs');
const path = require('path');
const mockProductsPath = path.join(__dirname, '../mock_products.json');
const mockOrdersPath = path.join(__dirname, '../mock_orders.json');

const defaultProducts = [
  {
    id: 1,
    category: 'parta-stullar',
    name_uz: "Ergonomik o'quv partasi va stul to'plami",
    name_ru: "Эргономичный комплект учебной парты и стула",
    desc_uz: "Balandligi sozlanadigan, bolalar va o'smirlar uchun mo'ljallangan qulay o'quv partasi va ergonomik stul to'plami.",
    desc_ru: "Регулируемый по высоте эргономичный комплект учебной парты и стула для детей и подростков.",
    price: 1450000,
    old_price: 1720000,
    stock: 12,
    image_url: "/prod_bedding.jpg",
    is_new: true,
    is_bestseller: true
  },
  {
    id: 2,
    category: 'parta-stullar',
    name_uz: "Bolalar uchun yig'iladigan kichik parta",
    name_ru: "Детская складная мини-парта",
    desc_uz: "Kichik joylar uchun qulay, oson yig'iluvchi ekologik toza yog'ochdan yasalgan bolalar partasi.",
    desc_ru: "Удобная, легко складывающаяся детская парта из экологически чистого дерева для небольших помещений.",
    price: 320000,
    old_price: null,
    stock: 35,
    image_url: "/prod_pillows.jpg",
    is_new: true,
    is_bestseller: false
  },
  {
    id: 3,
    category: 'game-kreslolari',
    name_uz: "Premium O'yin Kreslosi (Gaming Chair)",
    name_ru: "Премиум игровое кресло (Gaming Chair)",
    desc_uz: "Ergonomik dizayn, 4D tirsaklagichlar va qulay bel yostiqchalariga ega professional o'yin va ish kreslosi.",
    desc_ru: "Профессиональное игровое и рабочее кресло с эргономичным дизайном, 4D подлокотниками и удобной поясничной подушкой.",
    price: 1850000,
    old_price: 2200000,
    stock: 5,
    image_url: "/prod_blanket.jpg",
    video_url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    is_new: false,
    is_bestseller: true
  },
  {
    id: 4,
    category: 'kitob-javonlari',
    name_uz: "Minimalist Eman Kitob Javoni (Bookshelf)",
    name_ru: "Минималистичный дубовый книжный шкаф",
    desc_uz: "Zamonaviy Skandinaviya uslubidagi, ochiq javonli sifatli emandan yasalgan ixcham kitob javoni.",
    desc_ru: "Компактный книжный шкаф из качественного дуба в современном скандинавском стиле с открытыми полками.",
    price: 980000,
    old_price: null,
    stock: 22,
    image_url: "/prod_towels.jpg",
    is_new: false,
    is_bestseller: false
  }
];

function loadMockProducts() {
  try {
    if (fs.existsSync(mockProductsPath)) {
      const data = fs.readFileSync(mockProductsPath, 'utf8');
      return JSON.parse(data);
    } else {
      fs.writeFileSync(mockProductsPath, JSON.stringify(defaultProducts, null, 2), 'utf8');
      return defaultProducts;
    }
  } catch (err) {
    console.error('Error loading mock products:', err.message);
  }
  return defaultProducts;
}

function saveMockProducts(products) {
  try {
    fs.writeFileSync(mockProductsPath, JSON.stringify(products, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving mock products:', err.message);
  }
}

function loadMockOrders() {
  try {
    if (fs.existsSync(mockOrdersPath)) {
      const data = fs.readFileSync(mockOrdersPath, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error loading mock orders:', err.message);
  }
  return [];
}

function saveMockOrders(orders) {
  try {
    fs.writeFileSync(mockOrdersPath, JSON.stringify(orders, null, 2), 'utf8');
  } catch (err) {
    console.error('Error saving mock orders:', err.message);
  }
}

let mockProducts = loadMockProducts();
let mockOrders = loadMockOrders();

const isAdminRequest = (req) => {
  try {
    const token = req.cookies.admin_token;
    if (token) {
      jwt.verify(token, JWT_SECRET);
      return true;
    }
  } catch (err) {
    // Ignore
  }
  return false;
};

// Saytga chiqadigan mahsulotdan ichki maydonlarni olib tashlaymiz.
// stock (zaxira) hisobi yuritilmaydi, shuning uchun u tashqariga
// umuman chiqmaydi.
const sanitizeProductForPublic = (product) => {
  const { stock, ...publicProduct } = product;
  return publicProduct;
};

// Saytda mahsulot ko'rinadimi? Yashirilgan va arxivlanganlar chiqmaydi.
// (zaxira ro'yxatdagi eski yozuvlarda bu maydonlar yo'q — ular ko'rinadi)
const isPubliclyVisible = (product) => !product.is_hidden && !product.is_archived;

// Bitta mahsulotning ranglarini rasmlari bilan birga o'qiydi.
// Natija: [{ id, name_uz, name_ru, hex_code, images: [...] }, ...]
// Rangi yo'q mahsulot uchun bo'sh ro'yxat qaytadi.
async function loadProductColors(productId) {
  const colorsResult = await db.query(
    'SELECT * FROM product_colors WHERE product_id = $1 ORDER BY sort_order, id',
    [productId]
  );

  if (colorsResult.rows.length === 0) {
    return [];
  }

  // Barcha rasmlarni bitta so'rovda olamiz (har rang uchun alohida
  // so'rov yubormaslik uchun)
  const colorIds = colorsResult.rows.map(c => c.id);
  const imagesResult = await db.query(
    'SELECT * FROM product_color_images WHERE color_id = ANY($1::int[]) ORDER BY sort_order, id',
    [colorIds]
  );

  return colorsResult.rows.map(color => ({
    ...color,
    images: imagesResult.rows.filter(img => img.color_id === color.id)
  }));
}

// Mahsulotlarning UMUMIY rasmlarini o'qiydi (rangga bog'liq emas).
// Rangi yo'q mahsulotning galereyasi shu jadvaldan chiqadi.
//
// Natija: { [product_id]: [rasm qatorlari] }. Rasmi yo'q mahsulot
// kalitda umuman bo'lmaydi — chaqiruvchi tomonda `|| []` ishlatiladi.
//
// Tartib: avval ASOSIY rasm (is_primary), keyin sort_order, keyin id.
async function loadProductImages(productIds) {
  if (!productIds || productIds.length === 0) return {};

  const result = await db.query(
    'SELECT * FROM product_images WHERE product_id = ANY($1::int[]) ORDER BY is_primary DESC, sort_order, id',
    [productIds]
  );

  return result.rows.reduce((acc, row) => {
    (acc[row.product_id] = acc[row.product_id] || []).push(row);
    return acc;
  }, {});
}

// Mahsulotlarning o'lcham variantlarini o'qiydi.
// Har o'lchamning O'Z NARXI bor — tanlangan o'lcham saytda
// ko'rsatiladigan narxni almashtiradi.
//
// Natija: { [product_id]: [o'lcham qatorlari] } — loadProductImages kabi.
async function loadProductSizes(productIds) {
  if (!productIds || productIds.length === 0) return {};

  const result = await db.query(
    'SELECT * FROM product_sizes WHERE product_id = ANY($1::int[]) ORDER BY sort_order, id',
    [productIds]
  );

  return result.rows.reduce((acc, row) => {
    (acc[row.product_id] = acc[row.product_id] || []).push(row);
    return acc;
  }, {});
}

// Rang kodi "#1E5AA8" ko'rinishida bo'lishi shart
const isValidHexCode = (value) => typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value);

// O'lcham narxi: musbat son bo'lishi shart. Bo'sh/matn/manfiy qabul
// qilinmaydi. Qaytaradi: to'g'ri bo'lsa son, aks holda null.
const parsePriceValue = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const num = Number(value);
  if (!Number.isFinite(num) || num < 0) return null;
  return num;
};

// Mahsulotlarni bazadan o'qish uchun umumiy SELECT.
// Bazada faqat category_id (raqam) saqlanadi, sayt esa category
// (matn slug, masalan "parta-stullar") maydonini kutadi — shuning
// uchun categories jadvaliga JOIN qilib slug'ni ham qaytaramiz.
// LEFT JOIN: kategoriyasi yo'q mahsulot ham ro'yxatdan tushib qolmaydi.
// has_colors — mahsulotda rang variantlari bormi?
// Mahsulot kartochkasida "Savatga" tugmasi shu maydonga qarab ishlaydi:
// rangli mahsulotda avval rang tanlash kerak, shuning uchun kartochkadan
// to'g'ridan-to'g'ri savatga qo'shilmaydi.
// has_sizes — mahsulotda o'lcham variantlari bormi? O'lcham narxni
// o'zgartirgani uchun bunday mahsulotda ham avval o'lcham tanlanadi.
//
// Rasmlar ro'yxatga QO'SHILMAYDI (faqat bayroqlar) — ro'yxat yengil
// qolishi uchun. To'liq rasmlar bitta mahsulot sahifasida yuklanadi.
const PRODUCT_SELECT = `
  SELECT p.*, c.slug AS category,
         EXISTS (SELECT 1 FROM product_colors pc WHERE pc.product_id = p.id) AS has_colors,
         EXISTS (SELECT 1 FROM product_sizes ps WHERE ps.product_id = p.id) AS has_sizes
  FROM products p
  LEFT JOIN categories c ON c.id = p.category_id
`;

// Kategoriya slug'i bo'yicha uning bazadagi raqamini topadi.
// Topilmasa null qaytaradi va ogohlantirish yozadi (aks holda
// mahsulot jimgina kategoriyasiz saqlanib ketadi).
async function resolveCategoryId(categorySlug) {
  if (!categorySlug) return null;
  const catResult = await db.query('SELECT id FROM categories WHERE slug = $1', [categorySlug]);
  if (catResult.rows.length > 0) {
    return catResult.rows[0].id;
  }
  console.warn(`Kategoriya topilmadi: "${categorySlug}". Mahsulot kategoriyasiz saqlanadi.`);
  return null;
}

// ==========================================
// 1. PUBLIC ROUTES (Products & Categories)
// ==========================================

// GET all products
router.get('/products', async (req, res) => {
  const isAdmin = isAdminRequest(req);

  try {
    // Admin hamma mahsulotni ko'radi — yashirilgan va arxivlanganlarni ham,
    // chunki ularni admin panelda boshqarishi kerak.
    // Saytga esa faqat ochiq mahsulotlar chiqadi.
    const sql = isAdmin
      ? `${PRODUCT_SELECT} ORDER BY p.id DESC`
      : `${PRODUCT_SELECT} WHERE p.is_hidden = FALSE AND p.is_archived = FALSE ORDER BY p.id DESC`;

    const result = await db.query(sql);
    let productsList = result.rows;
    if (!isAdmin) {
      productsList = productsList.map(sanitizeProductForPublic);
    }
    res.json(productsList);
  } catch (err) {
    // Graceful fallback to mock data
    console.warn('Database error, falling back to mock products:', err.message);
    let productsList = mockProducts;
    if (!isAdmin) {
      productsList = productsList.filter(isPubliclyVisible).map(sanitizeProductForPublic);
    }
    res.json(productsList);
  }
});

// GET single product by ID
router.get('/products/:id', async (req, res) => {
  const { id } = req.params;
  const isAdmin = isAdminRequest(req);

  try {
    // Yashirilgan/arxivlangan mahsulot sahifasi saytda ochilmasin —
    // to'g'ridan-to'g'ri havola bilan kirilsa ham "topilmadi" chiqadi.
    const sql = isAdmin
      ? `${PRODUCT_SELECT} WHERE p.id = $1`
      : `${PRODUCT_SELECT} WHERE p.id = $1 AND p.is_hidden = FALSE AND p.is_archived = FALSE`;

    const result = await db.query(sql, [id]);
    if (result.rows.length > 0) {
      let product = result.rows[0];
      if (!isAdmin) {
        product = sanitizeProductForPublic(product);
      }
      // Rang variantlarini rasmlari bilan qo'shamiz (bo'lmasa — bo'sh ro'yxat)
      product.colors = await loadProductColors(product.id);
      // Umumiy rasmlar (rangsiz mahsulot galereyasi) va o'lchamlar.
      // Ikkalasi ham ixtiyoriy: bo'lmasa bo'sh ro'yxat qaytadi.
      const [imagesByProduct, sizesByProduct] = await Promise.all([
        loadProductImages([product.id]),
        loadProductSizes([product.id])
      ]);
      product.images = imagesByProduct[product.id] || [];
      product.sizes = sizesByProduct[product.id] || [];
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (err) {
    console.warn('Database error, falling back to mock product search:', err.message);
    const prod = mockProducts.find(p => p.id === parseInt(id));
    if (prod && (isAdmin || isPubliclyVisible(prod))) {
      const product = isAdmin ? prod : sanitizeProductForPublic(prod);
      // Zaxira ro'yxatda ranglar, rasmlar va o'lchamlar saqlanmaydi
      res.json({ ...product, colors: [], images: [], sizes: [] });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  }
});

// GET categories
// Saytga faqat arxivlanmagan kategoriyalar chiqadi. Admin esa
// hammasini ko'radi (arxivlanganlarni ham — ularni panelda
// boshqarishi kerak). Xuddi mahsulotlardagi kabi: admin cookie'si
// bo'lsa isAdminRequest(req) true qaytaradi.
router.get('/categories', async (req, res) => {
  const isAdmin = isAdminRequest(req);

  try {
    const sql = isAdmin
      ? 'SELECT * FROM categories ORDER BY sort_order ASC NULLS LAST, id ASC'
      : 'SELECT * FROM categories WHERE is_archived = FALSE ORDER BY sort_order ASC NULLS LAST, id ASC';

    const result = await db.query(sql);
    res.json(result.rows);
  } catch (err) {
    console.warn('Database error, falling back to mock categories:', err.message);
    res.json([
      { id: 1, slug: 'yotoqxona', name_uz: 'Yotoqxona tekstili', name_ru: 'Текстиль для спальни' },
      { id: 2, slug: 'mehmonxona', name_uz: 'Mehmonxona uchun', name_ru: 'Для гостиной' },
      { id: 3, slug: 'hammom', name_uz: 'Hammom tekstili', name_ru: 'Текстиль для ванной' },
      { id: 4, slug: 'aksessuarlar', name_uz: 'Uy bezaklari', name_ru: 'Декор для дома' }
    ]);
  }
});

// GET categories tree — asosiy kategoriyalar va har birining
// pod-kategoriyalari daraxti. Public: faqat arxivlanmaganlar.
// Har element (asosiy va pod) parent_id maydonini saqlab qoladi.
// Tartib id bo'yicha barqaror — admin panelda va katalogda bir xil chiqadi.
router.get('/categories/tree', async (req, res) => {
  try {
    // sort_order bo'yicha saralab olamiz — shu tufayli quyidagi filter'lar
    // ham (asosiylar ham, har otaning children'lari ham) o'z ichida
    // sort_order tartibida chiqadi.
    const result = await db.query(
      'SELECT * FROM categories WHERE is_archived = FALSE ORDER BY sort_order ASC NULLS LAST, id ASC'
    );
    const all = result.rows;

    const tree = all
      .filter(c => c.parent_id === null)
      .map(parent => ({
        ...parent,
        children: all.filter(c => c.parent_id === parent.id)
      }));

    res.json(tree);
  } catch (err) {
    console.error('Kategoriya daraxtini o\'qishda xato:', err.message);
    res.status(500).json({ message: 'Kategoriyalarni o\'qib bo\'lmadi' });
  }
});

// ==========================================
// 2. CHECKOUT & ORDERS ROUTE
// ==========================================

// Rasmlar ikki xil joyda turadi:
//   /uploads/...  -> backend serveri (admin yuklagan rasmlar)
//   boshqa yo'llar -> frontend/public (eski katalog rasmlari)
const PUBLIC_BACKEND_URL = (process.env.PUBLIC_BACKEND_URL || 'https://aishascomfort-production.up.railway.app').replace(/\/+$/, '');
const PUBLIC_FRONTEND_URL = (process.env.PUBLIC_FRONTEND_URL || 'https://www.aishas-comfort.uz').replace(/\/+$/, '');

const TELEGRAM_CAPTION_LIMIT = 1024;

// HTML rejimida maxsus belgilarni himoyalash.
// Markdown emas, HTML ishlatilishining sababi: mahsulot nomidagi
// _ yoki * belgisi Markdown'da butun xabarni buzib yuboradi va
// hech qanday xabar kelmay qoladi. HTML'da kvadrat qavs ham oddiy belgi.
const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');

const formatMoney = (value) => Number(value || 0).toLocaleString('en-US');

const truncate = (text, limit) => (text.length <= limit ? text : `${text.slice(0, limit - 1)}…`);

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mijoz savatchasidan kelgan rasm yo'lini tekshirish.
//
// XAVFSIZLIK: bu qiymat mijoz brauzeridan keladi, shuning uchun faqat
// ICHKI yo'llar (bitta "/" bilan boshlanadigan) qabul qilinadi.
// Aks holda kimdir buyurtma so'roviga tashqi manzil yozib, sizning
// Telegramingizga istalgan rasmni yuborishi yoki bazaga begona
// manzil yozib qo'yishi mumkin bo'lardi.
//
// Ham Telegramga yuborishda, ham bazaga saqlashda shu bitta
// tekshiruv ishlatiladi.
function sanitizeInternalImagePath(imagePath) {
  if (typeof imagePath !== 'string') return null;

  const trimmed = imagePath.trim();
  if (!trimmed.startsWith('/')) return null;   // http://, data:, nisbiy yo'l
  if (trimmed.startsWith('//')) return null;   // //boshqa-sayt.com
  if (trimmed.includes('\\')) return null;
  if (trimmed.length > 255) return null;       // bazadagi ustun chegarasi

  return trimmed;
}

// Telefon raqamini bitta ko'rinishga keltirish: +998XXXXXXXXX
//
// Brauzerdagi tekshiruvni chetlab o'tish mumkin (to'g'ridan-to'g'ri
// so'rov yuborish orqali), shuning uchun server ham tekshiradi.
// Mos kelmasa null qaytadi va buyurtma rad etiladi.
//
// Operator kodlari ro'yxati ataylab tekshirilmaydi: yangi kodlar
// chiqib turadi va eskirgan ro'yxat haqiqiy mijozni rad qilib qo'yardi.
function normalizePhoneNumber(raw) {
  if (typeof raw !== 'string' && typeof raw !== 'number') return null;

  let digits = String(raw).replace(/\D/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);   // 00998... -> 998...
  if (digits.length === 9) digits = `998${digits}`;        // 901234567 -> 998901234567

  if (!/^998\d{9}$/.test(digits)) return null;
  return `+${digits}`;
}

// +998901234567 -> "+998 90 123 45 67"
// Telegramda raqamni o'qish va bosib qo'ng'iroq qilish oson bo'lishi uchun
function formatPhoneForDisplay(phone) {
  const match = /^\+998(\d{2})(\d{3})(\d{2})(\d{2})$/.exec(String(phone || ''));
  if (!match) return String(phone || '');
  return `+998 ${match[1]} ${match[2]} ${match[3]} ${match[4]}`;
}

// Ichki yo'lni to'liq ochiq URL ga aylantirish (Telegram uchun)
function buildPublicImageUrl(imagePath) {
  const safePath = sanitizeInternalImagePath(imagePath);
  if (!safePath) return null;

  const base = safePath.startsWith('/uploads/') ? PUBLIC_BACKEND_URL : PUBLIC_FRONTEND_URL;
  // encodeURI bo'sh joy kabi belgilarni to'g'rilaydi, "/" ga tegmaydi
  return `${base}${encodeURI(safePath)}`;
}

// Buyurtmaning umumiy xabari (birinchi bo'lib yuboriladi)
function buildOrderSummaryMessage(order) {
  const totalUnits = order.items.reduce((sum, it) => sum + Number(it.quantity || 0), 0);

  return [
    `🔔 <b>YANGI BUYURTMA! / НОВЫЙ ЗАКАЗ!</b> (ID: #${escapeHtml(order.orderId)})`,
    '',
    `👤 <b>Mijoz / Клиент:</b> ${escapeHtml(order.customer_name)}`,
    `📞 <b>Telefon / Телефон:</b> ${escapeHtml(formatPhoneForDisplay(order.phone_number))}`,
    `📍 <b>Manzil / Адрес:</b> ${escapeHtml(order.delivery_address)}`,
    '',
    `📦 <b>Mahsulot / Товары:</b> ${order.items.length} xil, ${totalUnits} dona`,
    `💰 <b>Jami / Итого:</b> <b>${formatMoney(order.total_price)} so'm/сум</b>`,
    '',
    '⬇️ Har bir mahsulot alohida xabarda / Каждый товар отдельным сообщением'
  ].join('\n');
}

// Bitta mahsulotning xabari (rasm izohi sifatida ham ishlatiladi)
function buildOrderItemMessage(item, index, totalCount) {
  const colorUz = item.color_name_uz ? ` (${item.color_name_uz})` : '';
  const colorRu = item.color_name_ru ? ` (${item.color_name_ru})` : '';
  const lineTotal = Number(item.price || 0) * Number(item.quantity || 0);

  return [
    `<b>${index + 1}/${totalCount}</b>`,
    `<b>${escapeHtml(item.name_uz)}${escapeHtml(colorUz)}</b> [ID: ${escapeHtml(item.product_id)}]`,
    `${escapeHtml(item.name_ru)}${escapeHtml(colorRu)}`,
    `${escapeHtml(item.quantity)} dona × ${formatMoney(item.price)} = <b>${formatMoney(lineTotal)} so'm</b>`
  ].join('\n');
}

// Buyurtma haqida Telegramga xabar berish.
//
// Bu funksiya buyurtma javobini KUTMAYDI — mijoz darhol javob oladi,
// xabarlar orqa fonda ketadi. Shuning uchun bu yerdagi hech qanday
// xato buyurtmaning saqlanishiga ta'sir qilmaydi.
async function sendOrderNotification(order) {
  const summary = buildOrderSummaryMessage(order);

  if (!bot || !TELEGRAM_CHAT_ID) {
    console.log('Telegram bot not configured. Logging notification locally:\n', summary);
    return;
  }

  try {
    await bot.sendMessage(TELEGRAM_CHAT_ID, summary, { parse_mode: 'HTML' });
  } catch (err) {
    console.error('Telegram: umumiy xabar yuborilmadi:', err.message);
  }

  for (let i = 0; i < order.items.length; i++) {
    const item = order.items[i];
    const caption = truncate(buildOrderItemMessage(item, i, order.items.length), TELEGRAM_CAPTION_LIMIT);
    const photoUrl = buildPublicImageUrl(item.image_url);

    try {
      if (photoUrl) {
        await bot.sendPhoto(TELEGRAM_CHAT_ID, photoUrl, { caption, parse_mode: 'HTML' });
      } else {
        // Rasmi yo'q mahsulot — faqat matn
        await bot.sendMessage(TELEGRAM_CHAT_ID, caption, { parse_mode: 'HTML' });
      }
    } catch (err) {
      // Telegram rasmni yuklab ololmadi (fayl o'chgan, hajmi katta va h.k.)
      // Ma'lumot yo'qolmasligi uchun o'sha matnni oddiy xabar qilib yuboramiz.
      console.error(`Telegram: "${item.name_uz}" rasmi yuborilmadi:`, err.message);
      try {
        await bot.sendMessage(TELEGRAM_CHAT_ID, caption, { parse_mode: 'HTML' });
      } catch (fallbackErr) {
        console.error('Telegram: zaxira matnli xabar ham yuborilmadi:', fallbackErr.message);
      }
    }

    // Telegram bir chatga tez ketma-ket yuborishni cheklaydi
    if (i < order.items.length - 1) {
      await sleep(400);
    }
  }
}

// POST place order
router.post('/orders', async (req, res) => {
  const { customer_name, phone_number, delivery_address, total_price, items } = req.body;

  if (!customer_name || !phone_number || !delivery_address || !items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Missing required order details' });
  }

  // Telefon raqami serverda ham tekshiriladi — brauzerdagi tekshiruvni
  // chetlab o'tish mumkin, shuning uchun bunga tayanib bo'lmaydi
  const normalizedPhone = normalizePhoneNumber(phone_number);
  if (!normalizedPhone) {
    return res.status(400).json({
      success: false,
      message: 'Telefon raqami noto\'g\'ri. Format: +998 va 9 ta raqam (masalan: +998901234567)'
    });
  }

  let dbSuccess = false;
  let orderId = Date.now(); // fallback ID

  // A. Save to PostgreSQL (if connected)
  try {
    const orderResult = await db.query(
      'INSERT INTO orders (customer_name, phone_number, delivery_address, total_price) VALUES ($1, $2, $3, $4) RETURNING id',
      [customer_name, normalizedPhone, delivery_address, total_price]
    );
    orderId = orderResult.rows[0].id;

    for (const item of items) {
      // Rang NOMI va RASM manzili nusxa qilib saqlanadi (raqami emas):
      // keyin rang o'chirilsa yoki rasm almashtirilsa ham, buyurtmada
      // mijoz aynan nimani ko'rgani saqlanib qoladi — xuddi narx kabi
      await db.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price, color_name_uz, color_name_ru, image_url) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [
          orderId,
          item.product_id,
          item.quantity,
          item.price,
          item.color_name_uz || null,
          item.color_name_ru || null,
          sanitizeInternalImagePath(item.image_url)
        ]
      );
    }
    dbSuccess = true;
  } catch (err) {
    console.warn('Database error while saving order, falling back to mock session:', err.message);
  }

  // B. Save to Mock session (for prototype preview)
  const newOrder = {
    id: orderId,
    customer_name,
    phone_number: normalizedPhone,
    delivery_address,
    total_price,
    items,
    created_at: new Date()
  };
  mockOrders.push(newOrder);
  saveMockOrders(mockOrders);

  // C. Send Automatic Telegram Notification
  // Ataylab kutilmaydi (await yo'q): mijoz javobni darhol olishi kerak,
  // xabarlar orqa fonda ketaveradi
  sendOrderNotification({
    orderId,
    customer_name,
    phone_number: normalizedPhone,
    delivery_address,
    total_price,
    items
  }).catch(err => console.error('Telegram xabarnomasida kutilmagan xato:', err.message));

  return res.status(201).json({
    success: true,
    message: 'Order created successfully',
    orderId,
    dbSaved: dbSuccess
  });
});

// ==========================================
// 3. ADMIN AUTHENTICATION
// ==========================================

// GET verify auth status
router.get('/admin/verify', authMiddleware, (req, res) => {
  res.status(200).json({ success: true, message: 'Authenticated', user: req.user });
});

// POST Admin Login
router.post('/admin/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username and password required' });
  }

  // Admin hisobi FAQAT bazadan o'qiladi.
  // Kodda zaxira parol saqlanmaydi — bu repozitoriya ochiq.
  // Yangi admin yaratish / parolni almashtirish: node create-admin.js
  let user = null;

  try {
    const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length > 0) {
      user = result.rows[0];
    }
  } catch (err) {
    // Baza ishlamasa, "parol xato" deb aldash noto'g'ri bo'lardi —
    // ochiq-oydin "aloqa yo'q" javobini qaytaramiz.
    console.error('Bazaga ulanishda xato (admin login):', err.message);
    return res.status(503).json({
      success: false,
      message: 'Baza bilan aloqa yo\'q. Keyinroq urinib ko\'ring.'
    });
  }

  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  // Compare passwords via Bcrypt
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  // Generate JWT token
  const token = jwt.sign(
    { id: user.id || 0, username: user.username },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  // Set HTTP-only secure cookie
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('admin_token', token, {
    httpOnly: true,
    secure: true, // sameSite 'none' uchun HTTPS majburiy
    sameSite: 'none', // frontend va backend turli domenlarda
    maxAge: 3600000 // 1 hour
  });

  return res.status(200).json({ success: true, message: 'Logged in successfully' });
});

// POST Admin Logout
router.post('/admin/logout', (req, res) => {
 res.cookie('admin_token', '', {
    httpOnly: true,
    secure: true,
    expires: new Date(0),
    sameSite: 'none'
  });
  res.json({ success: true, message: 'Logged out successfully' });
});

// ==========================================
// 4. PROTECTED ADMIN ROUTING (CRUD)
// ==========================================

// GET all orders (admin protected)
router.get('/orders', authMiddleware, async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM orders ORDER BY id DESC');
    // For each order, fetch items
    const ordersList = [];
    for (const order of result.rows) {
      const itemsResult = await db.query(
        // product_image_url — mahsulotning HOZIRGI rasmi. U faqat eski
        // buyurtmalar uchun kerak: ularda oi.image_url saqlanmagan.
        'SELECT oi.*, p.name_uz, p.name_ru, p.image_url AS product_image_url FROM order_items oi LEFT JOIN products p ON oi.product_id = p.id WHERE oi.order_id = $1',
        [order.id]
      );
      ordersList.push({
        ...order,
        items: itemsResult.rows
      });
    }
    res.json(ordersList);
  } catch (err) {
    console.warn('Database error, returning mock orders array:', err.message);
    res.json(mockOrders);
  }
});

// POST create product
router.post('/products', authMiddleware, async (req, res) => {
  const { name_uz, name_ru, desc_uz, desc_ru, price, old_price, category, image_url, video_url } = req.body;
  const slug = (name_uz || 'product').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();

  try {
    // Retrieve category ID
    const categoryId = await resolveCategoryId(category);

    const result = await db.query(
      'INSERT INTO products (category_id, slug, name_uz, name_ru, desc_uz, desc_ru, price, old_price, image_url, video_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *',
      [categoryId, slug, name_uz, name_ru, desc_uz, desc_ru, price, old_price, image_url, video_url]
    );

    // Javobga kategoriya slug'ini ham qo'shamiz (bazadan faqat
    // category_id qaytadi, sayt esa category matnini kutadi)
    const savedProduct = { ...result.rows[0], category: categoryId ? category : null };

    // Sync in-memory fallback list
    mockProducts.unshift(savedProduct);
    saveMockProducts(mockProducts);

    res.status(201).json(savedProduct);
  } catch (err) {
    console.warn('Database error, saving product to mock array:', err.message);
    const newProduct = {
      id: mockProducts.length + 1,
      category,
      slug,
      name_uz,
      name_ru,
      desc_uz,
      desc_ru,
      price,
      old_price,
      image_url,
      video_url: video_url || '',
      is_new: true,
      is_bestseller: false,
      is_hidden: false,
      is_archived: false
    };
    mockProducts.unshift(newProduct);
    saveMockProducts(mockProducts);
    res.status(201).json(newProduct);
  }
});

// PUT update product
router.put('/products/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { name_uz, name_ru, desc_uz, desc_ru, price, old_price, category, image_url, video_url } = req.body;

  try {
    const categoryId = await resolveCategoryId(category);

    const result = await db.query(
      'UPDATE products SET category_id = $1, name_uz = $2, name_ru = $3, desc_uz = $4, desc_ru = $5, price = $6, old_price = $7, image_url = $8, video_url = $9 WHERE id = $10 RETURNING *',
      [categoryId, name_uz, name_ru, desc_uz, desc_ru, price, old_price, image_url, video_url, id]
    );

    if (result.rows.length > 0) {
      const savedProduct = { ...result.rows[0], category: categoryId ? category : null };

      // Sync mock list
      const idx = mockProducts.findIndex(p => p.id === parseInt(id));
      if (idx > -1) {
        mockProducts[idx] = savedProduct;
        saveMockProducts(mockProducts);
      }
      res.json(savedProduct);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (err) {
    console.warn('Database error, updating product in mock array:', err.message);
    const idx = mockProducts.findIndex(p => p.id === parseInt(id));
    if (idx > -1) {
      mockProducts[idx] = {
        ...mockProducts[idx],
        category,
        name_uz,
        name_ru,
        desc_uz,
        desc_ru,
        price,
        old_price,
        image_url,
        video_url: video_url || ''
      };
      saveMockProducts(mockProducts);
      res.json(mockProducts[idx]);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  }
});

// PATCH mahsulot holati — yashirish / ko'rsatish / arxivlash / qaytarish
//
// So'rov tanasida is_hidden va/yoki is_archived yuboriladi (true/false).
// Faqat yuborilgan maydon o'zgaradi, qolganiga tegilmaydi.
router.patch('/products/:id/status', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { is_hidden, is_archived } = req.body;

  // Nima o'zgartirishni SQL'ga dinamik yig'amiz
  const updates = [];
  const values = [];

  if (typeof is_hidden === 'boolean') {
    values.push(is_hidden);
    updates.push(`is_hidden = $${values.length}`);
  }
  if (typeof is_archived === 'boolean') {
    values.push(is_archived);
    updates.push(`is_archived = $${values.length}`);
  }

  if (updates.length === 0) {
    return res.status(400).json({
      message: 'is_hidden yoki is_archived maydonlaridan kamida bittasi kerak (true/false)'
    });
  }

  values.push(id);

  try {
    const result = await db.query(
      `UPDATE products SET ${updates.join(', ')} WHERE id = $${values.length} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Zaxira ro'yxatni ham bir xil holatda ushlab turamiz
    const idx = mockProducts.findIndex(p => p.id === parseInt(id));
    if (idx > -1) {
      mockProducts[idx] = { ...mockProducts[idx], ...result.rows[0] };
      saveMockProducts(mockProducts);
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Mahsulot holatini o\'zgartirishda xato:', err.message);
    res.status(500).json({ message: 'Mahsulot holatini o\'zgartirib bo\'lmadi' });
  }
});

// DELETE product
router.delete('/products/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length > 0) {
      mockProducts = mockProducts.filter(p => p.id !== parseInt(id));
      saveMockProducts(mockProducts);
      res.json({ success: true, message: 'Product deleted successfully' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (err) {
    console.warn('Database error, deleting product from mock array:', err.message);
    const exists = mockProducts.some(p => p.id === parseInt(id));
    if (exists) {
      mockProducts = mockProducts.filter(p => p.id !== parseInt(id));
      saveMockProducts(mockProducts);
      res.json({ success: true, message: 'Product deleted successfully' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  }
});

// ==========================================
// 5. RANG VARIANTLARI (admin uchun)
// ==========================================
//
// Ranglar ixtiyoriy: rangi yo'q mahsulot avvalgidek ishlayveradi.
// Rasmlar mavjud /api/upload orqali yuklanadi, bu yerga faqat
// yuklangan rasmning manzili (/uploads/...) yoziladi.
//
// Bu bo'limda zaxira (mock) mantiq yo'q: baza ishlamasa ochiq xato
// qaytadi, aks holda admin "saqlandi" deb o'ylab qolardi.

// GET mahsulotning ranglari
router.get('/products/:id/colors', async (req, res) => {
  try {
    const colors = await loadProductColors(req.params.id);
    res.json(colors);
  } catch (err) {
    console.error('Ranglarni o\'qishda xato:', err.message);
    res.status(500).json({ message: 'Ranglarni o\'qib bo\'lmadi' });
  }
});

// POST yangi rang qo'shish
router.post('/products/:id/colors', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { name_uz, name_ru, hex_code } = req.body;

  if (!name_uz || !name_ru) {
    return res.status(400).json({ message: 'Rang nomi o\'zbekcha va ruscha to\'ldirilishi shart' });
  }
  if (!isValidHexCode(hex_code)) {
    return res.status(400).json({ message: 'Rang kodi noto\'g\'ri (masalan: #1E5AA8)' });
  }

  try {
    // Mahsulot bormi?
    const productCheck = await db.query('SELECT id FROM products WHERE id = $1', [id]);
    if (productCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Mahsulot topilmadi' });
    }

    // Yangi rang ro'yxat oxiriga qo'shiladi
    const orderResult = await db.query(
      'SELECT COALESCE(MAX(sort_order), -1) + 1 AS next_order FROM product_colors WHERE product_id = $1',
      [id]
    );

    const result = await db.query(
      'INSERT INTO product_colors (product_id, name_uz, name_ru, hex_code, sort_order) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [id, name_uz, name_ru, hex_code, orderResult.rows[0].next_order]
    );

    res.status(201).json({ ...result.rows[0], images: [] });
  } catch (err) {
    console.error('Rang qo\'shishda xato:', err.message);
    res.status(500).json({ message: 'Rangni saqlab bo\'lmadi' });
  }
});

// PUT rangni tahrirlash (nomi va kodi)
router.put('/colors/:colorId', authMiddleware, async (req, res) => {
  const { colorId } = req.params;
  const { name_uz, name_ru, hex_code } = req.body;

  if (!name_uz || !name_ru) {
    return res.status(400).json({ message: 'Rang nomi o\'zbekcha va ruscha to\'ldirilishi shart' });
  }
  if (!isValidHexCode(hex_code)) {
    return res.status(400).json({ message: 'Rang kodi noto\'g\'ri (masalan: #1E5AA8)' });
  }

  try {
    const result = await db.query(
      'UPDATE product_colors SET name_uz = $1, name_ru = $2, hex_code = $3 WHERE id = $4 RETURNING *',
      [name_uz, name_ru, hex_code, colorId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Rang topilmadi' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Rangni tahrirlashda xato:', err.message);
    res.status(500).json({ message: 'Rangni yangilab bo\'lmadi' });
  }
});

// PATCH rangning "mavjud / tugagan" holati
//
// Tugagan rang saytdan o'chmaydi — u xira, ustidan chiziq o'tgan
// doiracha bo'lib turadi va tanlab bo'lmaydi. Ya'ni "bu rang bor edi,
// hozir tugagan" degan belgi.
router.patch('/colors/:colorId/availability', authMiddleware, async (req, res) => {
  const { is_available } = req.body;

  if (typeof is_available !== 'boolean') {
    return res.status(400).json({ message: 'is_available maydoni true yoki false bo\'lishi kerak' });
  }

  try {
    const result = await db.query(
      'UPDATE product_colors SET is_available = $1 WHERE id = $2 RETURNING *',
      [is_available, req.params.colorId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Rang topilmadi' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Rang holatini o\'zgartirishda xato:', err.message);
    res.status(500).json({ message: 'Rang holatini o\'zgartirib bo\'lmadi' });
  }
});

// DELETE rangni o'chirish (rasmlari ham baza tomonidan o'chadi)
router.delete('/colors/:colorId', authMiddleware, async (req, res) => {
  try {
    const result = await db.query('DELETE FROM product_colors WHERE id = $1 RETURNING id', [req.params.colorId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Rang topilmadi' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Rangni o\'chirishda xato:', err.message);
    res.status(500).json({ message: 'Rangni o\'chirib bo\'lmadi' });
  }
});

// POST rangga rasm qo'shish
router.post('/colors/:colorId/images', authMiddleware, async (req, res) => {
  const { colorId } = req.params;
  const { image_url } = req.body;

  if (!image_url) {
    return res.status(400).json({ message: 'Rasm manzili yuborilmadi' });
  }

  try {
    const colorCheck = await db.query('SELECT id FROM product_colors WHERE id = $1', [colorId]);
    if (colorCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Rang topilmadi' });
    }

    const orderResult = await db.query(
      'SELECT COALESCE(MAX(sort_order), -1) + 1 AS next_order FROM product_color_images WHERE color_id = $1',
      [colorId]
    );

    const result = await db.query(
      'INSERT INTO product_color_images (color_id, image_url, sort_order) VALUES ($1, $2, $3) RETURNING *',
      [colorId, image_url, orderResult.rows[0].next_order]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Rang rasmini saqlashda xato:', err.message);
    res.status(500).json({ message: 'Rasmni saqlab bo\'lmadi' });
  }
});

// DELETE rang rasmini o'chirish
router.delete('/colors/images/:imageId', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM product_color_images WHERE id = $1 RETURNING id',
      [req.params.imageId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Rasm topilmadi' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Rang rasmini o\'chirishda xato:', err.message);
    res.status(500).json({ message: 'Rasmni o\'chirib bo\'lmadi' });
  }
});

// ==========================================
// 5B. UMUMIY RASMLAR (admin uchun)
// ==========================================
//
// Bu rasmlar RANGGA bog'liq emas — rangi yo'q mahsulotning galereyasi
// shu yerdan chiqadi. Ranglardagi kabi: rasm avval /api/upload orqali
// yuklanadi, bu yerga faqat uning manzili (/uploads/...) yoziladi.
//
// ASOSIY RASM (is_primary):
// Mahsulotning bitta rasmi "asosiy" bo'ladi va u products.image_url
// bilan DOIM sinxron turadi. Sababi: katalog kartochkasi, savatcha va
// buyurtmalar hammasi products.image_url ga tayanadi — u eskirmasligi
// kerak.
//
// Bu bo'limda zaxira (mock) mantiq yo'q — ranglar bo'limidagi kabi.

// GET mahsulotning umumiy rasmlari
router.get('/products/:id/images', async (req, res) => {
  try {
    const imagesByProduct = await loadProductImages([req.params.id]);
    res.json(imagesByProduct[req.params.id] || []);
  } catch (err) {
    console.error('Mahsulot rasmlarini o\'qishda xato:', err.message);
    res.status(500).json({ message: 'Rasmlarni o\'qib bo\'lmadi' });
  }
});

// POST mahsulotga rasm qo'shish
//
// Birinchi rasm avtomatik ASOSIY bo'ladi va products.image_url ga
// yoziladi — shunda admin alohida "asosiy qilish" bosishi shart emas.
router.post('/products/:id/images', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { image_url } = req.body;

  if (!image_url) {
    return res.status(400).json({ message: 'Rasm manzili yuborilmadi' });
  }

  try {
    const productCheck = await db.query('SELECT id FROM products WHERE id = $1', [id]);
    if (productCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Mahsulot topilmadi' });
    }

    // Yangi rasm ro'yxat oxiriga qo'shiladi. image_count = 0 bo'lsa —
    // bu birinchi rasm, demak asosiy bo'ladi.
    const statsResult = await db.query(
      'SELECT COALESCE(MAX(sort_order), -1) + 1 AS next_order, COUNT(*)::int AS image_count FROM product_images WHERE product_id = $1',
      [id]
    );
    const { next_order, image_count } = statsResult.rows[0];
    const isFirstImage = image_count === 0;

    const result = await db.query(
      'INSERT INTO product_images (product_id, image_url, sort_order, is_primary) VALUES ($1, $2, $3, $4) RETURNING *',
      [id, image_url, next_order, isFirstImage]
    );

    // Asosiy rasm products.image_url bilan sinxron turishi kerak
    if (isFirstImage) {
      await db.query('UPDATE products SET image_url = $1 WHERE id = $2', [image_url, id]);
    }

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Mahsulot rasmini saqlashda xato:', err.message);
    res.status(500).json({ message: 'Rasmni saqlab bo\'lmadi' });
  }
});

// DELETE mahsulot rasmini o'chirish
//
// Asosiy rasm o'chirilsa, mahsulot rasmsiz qolib ketmasligi uchun
// qolganlaridan birinchisi yangi asosiy bo'ladi. Umuman rasm qolmasa —
// products.image_url bo'shatiladi.
router.delete('/products/images/:imageId', authMiddleware, async (req, res) => {
  try {
    const deleted = await db.query(
      'DELETE FROM product_images WHERE id = $1 RETURNING *',
      [req.params.imageId]
    );

    if (deleted.rows.length === 0) {
      return res.status(404).json({ message: 'Rasm topilmadi' });
    }

    const removedImage = deleted.rows[0];

    // Oddiy rasm o'chirildi — asosiy rasm o'zgarmaydi
    if (!removedImage.is_primary) {
      return res.json({ success: true });
    }

    // Asosiy rasm o'chirildi: keyingisini asosiy qilamiz
    const nextResult = await db.query(
      'SELECT * FROM product_images WHERE product_id = $1 ORDER BY sort_order, id LIMIT 1',
      [removedImage.product_id]
    );

    if (nextResult.rows.length > 0) {
      const nextImage = nextResult.rows[0];
      await db.query('UPDATE product_images SET is_primary = TRUE WHERE id = $1', [nextImage.id]);
      await db.query('UPDATE products SET image_url = $1 WHERE id = $2', [nextImage.image_url, removedImage.product_id]);
      return res.json({ success: true, new_primary_id: nextImage.id });
    }

    // Rasm qolmadi
    await db.query('UPDATE products SET image_url = NULL WHERE id = $1', [removedImage.product_id]);
    res.json({ success: true, new_primary_id: null });
  } catch (err) {
    console.error('Mahsulot rasmini o\'chirishda xato:', err.message);
    res.status(500).json({ message: 'Rasmni o\'chirib bo\'lmadi' });
  }
});

// PATCH rasmni ASOSIY qilish
//
// Bitta so'rovda: shu mahsulotning boshqa rasmlarida is_primary = FALSE,
// tanlanganida TRUE. Keyin products.image_url ham yangilanadi.
router.patch('/products/images/:imageId/primary', authMiddleware, async (req, res) => {
  const { imageId } = req.params;

  try {
    const imageResult = await db.query('SELECT * FROM product_images WHERE id = $1', [imageId]);
    if (imageResult.rows.length === 0) {
      return res.status(404).json({ message: 'Rasm topilmadi' });
    }

    const image = imageResult.rows[0];

    // (id = $1) shartli ifoda: tanlangan qatorga TRUE, qolganiga FALSE
    await db.query(
      'UPDATE product_images SET is_primary = (id = $1) WHERE product_id = $2',
      [imageId, image.product_id]
    );

    await db.query(
      'UPDATE products SET image_url = $1 WHERE id = $2',
      [image.image_url, image.product_id]
    );

    res.json({ ...image, is_primary: true });
  } catch (err) {
    console.error('Asosiy rasmni belgilashda xato:', err.message);
    res.status(500).json({ message: 'Asosiy rasmni belgilab bo\'lmadi' });
  }
});

// ==========================================
// 5C. O'LCHAM VARIANTLARI (admin uchun)
// ==========================================
//
// Har o'lchamning O'Z NARXI bor. Saytda o'lcham tanlanganda
// ko'rsatiladigan narx o'sha o'lchamniki bo'ladi.
//
// O'lcham RANGDAN MUSTAQIL: rang rasmni, o'lcham narxni boshqaradi
// (rang x o'lcham matritsasi yo'q).
//
// Ranglardagi kabi: o'lchamlar ixtiyoriy, o'lchamsiz mahsulot
// avvalgidek ishlayveradi. Zaxira (mock) mantiq bu yerda ham yo'q.

// GET mahsulotning o'lchamlari
router.get('/products/:id/sizes', async (req, res) => {
  try {
    const sizesByProduct = await loadProductSizes([req.params.id]);
    res.json(sizesByProduct[req.params.id] || []);
  } catch (err) {
    console.error('O\'lchamlarni o\'qishda xato:', err.message);
    res.status(500).json({ message: 'O\'lchamlarni o\'qib bo\'lmadi' });
  }
});

// POST yangi o'lcham qo'shish
router.post('/products/:id/sizes', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { name_uz, name_ru, price, old_price } = req.body;

  if (!name_uz || !String(name_uz).trim()) {
    return res.status(400).json({ message: 'O\'lcham nomi (o\'zbekcha) to\'ldirilishi shart' });
  }

  const priceValue = parsePriceValue(price);
  if (priceValue === null) {
    return res.status(400).json({ message: 'O\'lcham narxi to\'g\'ri son bo\'lishi kerak' });
  }

  // old_price ixtiyoriy: bo'sh bo'lsa NULL, yozilgan bo'lsa to'g'ri son bo'lishi shart
  const hasOldPrice = old_price !== undefined && old_price !== null && old_price !== '';
  const oldPriceValue = hasOldPrice ? parsePriceValue(old_price) : null;
  if (hasOldPrice && oldPriceValue === null) {
    return res.status(400).json({ message: 'Eski narx to\'g\'ri son bo\'lishi kerak' });
  }

  try {
    const productCheck = await db.query('SELECT id FROM products WHERE id = $1', [id]);
    if (productCheck.rows.length === 0) {
      return res.status(404).json({ message: 'Mahsulot topilmadi' });
    }

    // Yangi o'lcham ro'yxat oxiriga qo'shiladi
    const orderResult = await db.query(
      'SELECT COALESCE(MAX(sort_order), -1) + 1 AS next_order FROM product_sizes WHERE product_id = $1',
      [id]
    );

    const result = await db.query(
      'INSERT INTO product_sizes (product_id, name_uz, name_ru, price, old_price, sort_order) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [id, name_uz, name_ru || null, priceValue, oldPriceValue, orderResult.rows[0].next_order]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('O\'lcham qo\'shishda xato:', err.message);
    res.status(500).json({ message: 'O\'lchamni saqlab bo\'lmadi' });
  }
});

// PUT o'lchamni tahrirlash (nomi va narxi)
router.put('/sizes/:sizeId', authMiddleware, async (req, res) => {
  const { sizeId } = req.params;
  const { name_uz, name_ru, price, old_price } = req.body;

  if (!name_uz || !String(name_uz).trim()) {
    return res.status(400).json({ message: 'O\'lcham nomi (o\'zbekcha) to\'ldirilishi shart' });
  }

  const priceValue = parsePriceValue(price);
  if (priceValue === null) {
    return res.status(400).json({ message: 'O\'lcham narxi to\'g\'ri son bo\'lishi kerak' });
  }

  const hasOldPrice = old_price !== undefined && old_price !== null && old_price !== '';
  const oldPriceValue = hasOldPrice ? parsePriceValue(old_price) : null;
  if (hasOldPrice && oldPriceValue === null) {
    return res.status(400).json({ message: 'Eski narx to\'g\'ri son bo\'lishi kerak' });
  }

  try {
    const result = await db.query(
      'UPDATE product_sizes SET name_uz = $1, name_ru = $2, price = $3, old_price = $4 WHERE id = $5 RETURNING *',
      [name_uz, name_ru || null, priceValue, oldPriceValue, sizeId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'O\'lcham topilmadi' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('O\'lchamni tahrirlashda xato:', err.message);
    res.status(500).json({ message: 'O\'lchamni yangilab bo\'lmadi' });
  }
});

// PATCH o'lchamning "mavjud / tugagan" holati
//
// Rangdagi kabi: tugagan o'lcham saytdan o'chmaydi — xira bo'lib
// turadi va tanlab bo'lmaydi.
router.patch('/sizes/:sizeId/availability', authMiddleware, async (req, res) => {
  const { is_available } = req.body;

  if (typeof is_available !== 'boolean') {
    return res.status(400).json({ message: 'is_available maydoni true yoki false bo\'lishi kerak' });
  }

  try {
    const result = await db.query(
      'UPDATE product_sizes SET is_available = $1 WHERE id = $2 RETURNING *',
      [is_available, req.params.sizeId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'O\'lcham topilmadi' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('O\'lcham holatini o\'zgartirishda xato:', err.message);
    res.status(500).json({ message: 'O\'lcham holatini o\'zgartirib bo\'lmadi' });
  }
});

// DELETE o'lchamni o'chirish
router.delete('/sizes/:sizeId', authMiddleware, async (req, res) => {
  try {
    const result = await db.query('DELETE FROM product_sizes WHERE id = $1 RETURNING id', [req.params.sizeId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'O\'lcham topilmadi' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('O\'lchamni o\'chirishda xato:', err.message);
    res.status(500).json({ message: 'O\'lchamni o\'chirib bo\'lmadi' });
  }
});

// ==========================================
// 6. KATEGORIYALAR (admin uchun)
// ==========================================
//
// Bu bo'limda zaxira (mock) mantiq yo'q: baza ishlamasa ochiq xato
// qaytadi, aks holda admin "saqlandi" deb o'ylab qolardi.
//
// Eslatma: kategoriyalar bazada category_id orqali mahsulotlarga
// bog'langan. Slug bir marta yasaladi va TAHRIRLASHDA O'ZGARMAYDI —
// shunda saytdagi /kategoriya/<slug> havolalari barqaror qoladi.

// Kategoriya nomidan sayt manzili uchun slug yasaydi.
//   "Bolalar o'yingohlari" -> "bolalar-o-yingohlari"
// Faqat name_uz (lotin) dan yasaladi: name_ru kirill bo'lsa slug
// buzuq chiqardi. Lotin harf/raqamdan boshqa hamma narsa (bo'sh joy,
// apostrof, tinish belgilari) "-" ga aylanadi.
function slugifyCategoryName(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')  // lotin harf/raqamdan boshqasi -> "-"
    .replace(/^-+|-+$/g, '');      // boshi va oxiridagi "-" larni olib tashlash
}

// Takrorlanmaydigan slug qaytaradi: "stol" band bo'lsa "stol-2",
// u ham band bo'lsa "stol-3" ... Shunday qilib ikki kategoriya
// hech qachon bitta URL ga tushmaydi.
// Nom lotin harf bermasa (masalan faqat kirill yozilgan bo'lsa)
// "kategoriya" so'zidan boshlaymiz, aks holda slug bo'sh chiqib
// UNIQUE cheklovini buzardi.
async function makeUniqueCategorySlug(name) {
  const base = slugifyCategoryName(name) || 'kategoriya';

  let candidate = base;
  let counter = 2;
  // Kategoriyalar kam, shuning uchun ketma-ket tekshirish yetarli
  while (true) {
    const existing = await db.query('SELECT 1 FROM categories WHERE slug = $1', [candidate]);
    if (existing.rows.length === 0) {
      return candidate;
    }
    candidate = `${base}-${counter}`;
    counter++;
  }
}

// Ikkala tildagi nom to'ldirilganini tekshiradi. To'g'ri bo'lsa
// tozalangan (trim qilingan) nomlarni, aks holda null qaytaradi.
function validateCategoryNames(body) {
  const name_uz = typeof body.name_uz === 'string' ? body.name_uz.trim() : '';
  const name_ru = typeof body.name_ru === 'string' ? body.name_ru.trim() : '';
  if (!name_uz || !name_ru) return null;
  return { name_uz, name_ru };
}

// parent_id kelishi mumkin bo'lgan turli ko'rinishlarni (raqam, "", null,
// undefined) DB uchun to'g'ri qiymatga aylantiradi.
// Qaytadi: { ok: true, value: <int|null> } yoki { ok: false }
function parseParentId(body) {
  const raw = body && body.parent_id;
  // Yuborilmagan yoki bo'sh → asosiy kategoriya (ota yo'q)
  if (raw === undefined || raw === null || raw === '') {
    return { ok: true, value: null };
  }
  const n = parseInt(raw, 10);
  if (Number.isNaN(n) || n <= 0) return { ok: false };
  return { ok: true, value: n };
}

// icon (ikonka "key"i, masalan 'sofa') ni normalize qiladi:
// bo'sh yoki yuborilmagan -> NULL (ikonka yo'q); aks holda tozalangan
// string (VARCHAR(50) ga sig'ishi uchun 50 belgigacha kesiladi).
// Bazada icon har qanday kategoriyada bo'lishi mumkin — "faqat asosiy
// kategoriyalar" cheklovi UI (admin panel) darajasida.
function parseIcon(body) {
  const raw = body && body.icon;
  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, 50);
}

// parent_id ni tekshiradi:
//   1) ota mavjud bo'lsin
//   2) kategoriya o'ziga o'zi ota bo'lmasin
//   3) ota-kategoriyaning o'zi asosiy bo'lsin (parent_id = NULL) —
//      shundan keyin daraxt faqat 2 darajali bo'lib qoladi.
// editingId — PUT paytida shu kategoriyaning o'z id'si (self-check uchun);
// POST paytida null.
async function validateParentId(parent_id, editingId) {
  if (parent_id === null) return { ok: true };

  if (editingId !== null && parent_id === editingId) {
    return { ok: false, message: 'Kategoriya o\'zini o\'ziga ota qila olmaydi.' };
  }

  const parentRow = await db.query(
    'SELECT id, parent_id FROM categories WHERE id = $1',
    [parent_id]
  );
  if (parentRow.rows.length === 0) {
    return { ok: false, message: 'Tanlangan ota-kategoriya topilmadi.' };
  }
  if (parentRow.rows[0].parent_id !== null) {
    return {
      ok: false,
      message: 'Faqat asosiy kategoriyani ota qilib tanlash mumkin (2 darajali tuzilma).'
    };
  }
  return { ok: true };
}

// Kategoriyaning o'z pod-kategoriyalari bormi. PUT paytida ishlatiladi:
// agar shu kategoriya boshqalarga ota bo'lsa, uni endi boshqasining ostiga
// (pod qilib) biriktirib bo'lmaydi — aks holda uch darajali daraxt hosil
// bo'lardi.
async function categoryHasChildren(categoryId) {
  const result = await db.query(
    'SELECT 1 FROM categories WHERE parent_id = $1 LIMIT 1',
    [categoryId]
  );
  return result.rows.length > 0;
}

// POST yangi kategoriya qo'shish
// parent_id ixtiyoriy: yuborilmasa yoki bo'sh bo'lsa — asosiy kategoriya
// (parent_id = NULL). Yuborilsa, tanlangan ota mavjud va o'zi asosiy
// bo'lishi kerak (2 darajali daraxt qoidasi).
router.post('/admin/categories', authMiddleware, async (req, res) => {
  const names = validateCategoryNames(req.body);
  if (!names) {
    return res.status(400).json({ message: 'Kategoriya nomi o\'zbekcha va ruscha to\'ldirilishi shart' });
  }

  const parsed = parseParentId(req.body);
  if (!parsed.ok) {
    return res.status(400).json({ message: 'Ota-kategoriya identifikatori noto\'g\'ri.' });
  }
  const parent_id = parsed.value;

  try {
    const parentCheck = await validateParentId(parent_id, null);
    if (!parentCheck.ok) {
      return res.status(400).json({ message: parentCheck.message });
    }

    const slug = await makeUniqueCategorySlug(names.name_uz);

    // Yangi kategoriya o'z darajasining OXIRIGA tushadi: shu daraja
    // (bir xil parent_id) ichidagi eng katta sort_order + 1.
    // parent_id NULL bo'lishi mumkin — IS NOT DISTINCT FROM NULL-xavfsiz.
    const orderResult = await db.query(
      'SELECT COALESCE(MAX(sort_order), 0) + 1 AS next_order FROM categories WHERE parent_id IS NOT DISTINCT FROM $1',
      [parent_id]
    );
    const nextOrder = orderResult.rows[0].next_order;
    const icon = parseIcon(req.body);

    const result = await db.query(
      'INSERT INTO categories (slug, name_uz, name_ru, parent_id, sort_order, icon) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [slug, names.name_uz, names.name_ru, parent_id, nextOrder, icon]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Kategoriya qo\'shishda xato:', err.message);
    res.status(500).json({ message: 'Kategoriyani saqlab bo\'lmadi' });
  }
});

// PUT kategoriya nomini va parent_id sini tahrirlash (slug o'zgarmaydi).
// Ikki qo'shimcha himoya:
//   1) self-check: o'ziga o'zi ota bo'lolmaydi (validateParentId ichida)
//   2) ota bo'lgan kategoriyani boshqasining ostiga qo'yib bo'lmaydi
//      (aks holda 3-daraja hosil bo'lardi).
router.put('/admin/categories/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const editingId = parseInt(id, 10);

  const names = validateCategoryNames(req.body);
  if (!names) {
    return res.status(400).json({ message: 'Kategoriya nomi o\'zbekcha va ruscha to\'ldirilishi shart' });
  }

  const parsed = parseParentId(req.body);
  if (!parsed.ok) {
    return res.status(400).json({ message: 'Ota-kategoriya identifikatori noto\'g\'ri.' });
  }
  const parent_id = parsed.value;

  try {
    const parentCheck = await validateParentId(parent_id, editingId);
    if (!parentCheck.ok) {
      return res.status(400).json({ message: parentCheck.message });
    }

    // Agar shu kategoriyaning o'zi ota bo'lsa (children'i bor bo'lsa),
    // uni boshqasining pod'i qilib bo'lmaydi
    if (parent_id !== null) {
      const hasKids = await categoryHasChildren(editingId);
      if (hasKids) {
        return res.status(400).json({
          message: 'Bu kategoriyaning pod-kategoriyalari bor — uni pod qilib bo\'lmaydi.'
        });
      }
    }

    const icon = parseIcon(req.body);

    const result = await db.query(
      'UPDATE categories SET name_uz = $1, name_ru = $2, parent_id = $3, icon = $4 WHERE id = $5 RETURNING *',
      [names.name_uz, names.name_ru, parent_id, icon, editingId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Kategoriya topilmadi' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Kategoriyani tahrirlashda xato:', err.message);
    res.status(500).json({ message: 'Kategoriyani yangilab bo\'lmadi' });
  }
});

// PATCH arxivlash / arxivdan chiqarish (toggle)
// Hozirgi holatni teskarisiga o'zgartiradi: arxivlangan bo'lsa
// chiqaradi, chiqarilgan bo'lsa arxivlaydi.
router.patch('/admin/categories/:id/archive', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await db.query(
      'UPDATE categories SET is_archived = NOT is_archived WHERE id = $1 RETURNING *',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Kategoriya topilmadi' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Kategoriya arxiv holatini o\'zgartirishda xato:', err.message);
    res.status(500).json({ message: 'Kategoriya holatini o\'zgartirib bo\'lmadi' });
  }
});

// PATCH kategoriya tartibini o'zgartirish (bir pog'ona yuqori/past).
// Body: { direction: "up" | "down" }.
// Faqat O'Z DARAJASI ichida (bir xil parent_id) ishlaydi: qo'shni
// kategoriya bilan sort_order almashtiriladi. Pod boshqa otaga o'tmaydi.
// Eng chetda bo'lsa hech narsa qilinmaydi (moved: false) — bu xato emas.
router.patch('/admin/categories/:id/move', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const direction = req.body && req.body.direction;

  if (direction !== 'up' && direction !== 'down') {
    return res.status(400).json({ message: 'direction "up" yoki "down" bo\'lishi kerak.' });
  }

  try {
    const currentResult = await db.query(
      'SELECT id, parent_id, sort_order FROM categories WHERE id = $1',
      [id]
    );
    if (currentResult.rows.length === 0) {
      return res.status(404).json({ message: 'Kategoriya topilmadi' });
    }
    const current = currentResult.rows[0];

    // O'z darajasidagi (bir xil parent_id) qo'shnini topamiz.
    //   up   -> shu elementdan yuqoridagi eng yaqin (kattaroq sort_order emas)
    //   down -> shu elementdan pastdagi eng yaqin
    // parent_id NULL bo'lishi mumkin -> IS NOT DISTINCT FROM NULL-xavfsiz.
    // (sort_order, id) juftligi bilan solishtirish tenglik holatini ham
    // aniq (barqaror) hal qiladi.
    const neighborSql = direction === 'up'
      ? `SELECT id, sort_order FROM categories
           WHERE parent_id IS NOT DISTINCT FROM $1
             AND (sort_order, id) < ($2, $3)
           ORDER BY sort_order DESC, id DESC
           LIMIT 1`
      : `SELECT id, sort_order FROM categories
           WHERE parent_id IS NOT DISTINCT FROM $1
             AND (sort_order, id) > ($2, $3)
           ORDER BY sort_order ASC, id ASC
           LIMIT 1`;

    const neighborResult = await db.query(neighborSql, [
      current.parent_id, current.sort_order, current.id
    ]);

    // Eng yuqorida/pastda — ko'chiradigan qo'shni yo'q
    if (neighborResult.rows.length === 0) {
      return res.json({ moved: false });
    }
    const neighbor = neighborResult.rows[0];

    // Ikkovining sort_order qiymatini almashtiramiz
    await db.query('UPDATE categories SET sort_order = $1 WHERE id = $2', [neighbor.sort_order, current.id]);
    await db.query('UPDATE categories SET sort_order = $1 WHERE id = $2', [current.sort_order, neighbor.id]);

    res.json({ moved: true });
  } catch (err) {
    console.error('Kategoriya tartibini o\'zgartirishda xato:', err.message);
    res.status(500).json({ message: 'Tartibni o\'zgartirib bo\'lmadi' });
  }
});

// DELETE kategoriyani o'chirish — FAQAT bo'sh bo'lsa (mahsulot ham,
// pod-kategoriya ham yo'q bo'lsa). Bu ikki qoida bir uslubda ishlaydi:
//   - mahsulot bo'lsa, ularni avval boshqa kategoriyaga ko'chirish kerak
//   - pod-kategoriya bo'lsa, ularni avval o'chirish yoki ko'chirish kerak
// Aks holda pod-lar avtomatik "asosiy"ga ko'tarilib, saytda chalkash paydo
// bo'lardi.
router.delete('/admin/categories/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    // Bog'liq mahsulotlar soni. Arxivlangan mahsulotlar ham hisobga
    // olinadi — ular ham bazada shu kategoriyaga bog'langan.
    const productCheck = await db.query(
      'SELECT COUNT(*) AS count FROM products WHERE category_id = $1',
      [id]
    );
    const productCount = parseInt(productCheck.rows[0].count, 10);

    if (productCount > 0) {
      return res.status(409).json({
        message: `Bu kategoriyada mahsulotlar bor (${productCount} ta). Avval ularni boshqa kategoriyaga ko'chiring yoki arxivlang.`
      });
    }

    // Bog'liq pod-kategoriyalar soni (arxivlanganlar ham hisobda).
    const childCheck = await db.query(
      'SELECT COUNT(*) AS count FROM categories WHERE parent_id = $1',
      [id]
    );
    const childCount = parseInt(childCheck.rows[0].count, 10);

    if (childCount > 0) {
      return res.status(409).json({
        message: `Bu kategoriyaning pod-kategoriyalari bor (${childCount} ta). Avval ularni o'chiring yoki boshqa ota ostiga / asosiyga ko'chiring.`
      });
    }

    const result = await db.query('DELETE FROM categories WHERE id = $1 RETURNING id', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Kategoriya topilmadi' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Kategoriyani o\'chirishda xato:', err.message);
    res.status(500).json({ message: 'Kategoriyani o\'chirib bo\'lmadi' });
  }
});

module.exports = router;
