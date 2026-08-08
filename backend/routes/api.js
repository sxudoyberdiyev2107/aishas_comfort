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

// Rang kodi "#1E5AA8" ko'rinishida bo'lishi shart
const isValidHexCode = (value) => typeof value === 'string' && /^#[0-9a-fA-F]{6}$/.test(value);

// Mahsulotlarni bazadan o'qish uchun umumiy SELECT.
// Bazada faqat category_id (raqam) saqlanadi, sayt esa category
// (matn slug, masalan "parta-stullar") maydonini kutadi — shuning
// uchun categories jadvaliga JOIN qilib slug'ni ham qaytaramiz.
// LEFT JOIN: kategoriyasi yo'q mahsulot ham ro'yxatdan tushib qolmaydi.
// has_colors — mahsulotda rang variantlari bormi?
// Mahsulot kartochkasida "Savatga" tugmasi shu maydonga qarab ishlaydi:
// rangli mahsulotda avval rang tanlash kerak, shuning uchun kartochkadan
// to'g'ridan-to'g'ri savatga qo'shilmaydi.
const PRODUCT_SELECT = `
  SELECT p.*, c.slug AS category,
         EXISTS (SELECT 1 FROM product_colors pc WHERE pc.product_id = p.id) AS has_colors
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
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (err) {
    console.warn('Database error, falling back to mock product search:', err.message);
    const prod = mockProducts.find(p => p.id === parseInt(id));
    if (prod && (isAdmin || isPubliclyVisible(prod))) {
      const product = isAdmin ? prod : sanitizeProductForPublic(prod);
      // Zaxira ro'yxatda ranglar saqlanmaydi
      res.json({ ...product, colors: [] });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  }
});

// GET categories
router.get('/categories', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM categories ORDER BY id ASC');
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

// ==========================================
// 2. CHECKOUT & ORDERS ROUTE
// ==========================================

// POST place order
router.post('/orders', async (req, res) => {
  const { customer_name, phone_number, delivery_address, total_price, items } = req.body;

  if (!customer_name || !phone_number || !delivery_address || !items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Missing required order details' });
  }

  let dbSuccess = false;
  let orderId = Date.now(); // fallback ID

  // A. Save to PostgreSQL (if connected)
  try {
    const orderResult = await db.query(
      'INSERT INTO orders (customer_name, phone_number, delivery_address, total_price) VALUES ($1, $2, $3, $4) RETURNING id',
      [customer_name, phone_number, delivery_address, total_price]
    );
    orderId = orderResult.rows[0].id;

    for (const item of items) {
      await db.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
        [orderId, item.product_id, item.quantity, item.price]
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
    phone_number,
    delivery_address,
    total_price,
    items,
    created_at: new Date()
  };
  mockOrders.push(newOrder);
  saveMockOrders(mockOrders);

  // C. Send Automatic Telegram Notification
  const formattedItemsUz = items.map(it => `- *${it.name_uz}* (${it.quantity} dona) - ${(it.price * it.quantity).toLocaleString()} so'm`).join('\n');
  const formattedItemsRu = items.map(it => `- *${it.name_ru}* (${it.quantity} шт) - ${(it.price * it.quantity).toLocaleString()} сум`).join('\n');

  const mdMessage = `
🔔 *YANGI BUYURTMA! / НОВЫЙ ЗАКАЗ!* (ID: #${orderId})
  
👤 *Mijoz / Клиент:* ${customer_name}
📞 *Telefon / Телефон:* ${phone_number}
📍 *Manzil / Адрес:* ${delivery_address}

📦 *Mahsulotlar (UZ):*
${formattedItemsUz}

📦 *Товары (RU):*
${formattedItemsRu}

💰 *Jami Summa / Итого:* *${parseFloat(total_price).toLocaleString()} so'm/сум*
`;

  if (bot && TELEGRAM_CHAT_ID) {
    bot.sendMessage(TELEGRAM_CHAT_ID, mdMessage, { parse_mode: 'Markdown' })
      .then(() => console.log('Telegram order notification dispatched successfully.'))
      .catch((err) => console.error('Telegram notification failed:', err.message));
  } else {
    console.log('Telegram bot not configured. Logging notification locally:\n', mdMessage);
  }

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
        'SELECT oi.*, p.name_uz, p.name_ru FROM order_items oi LEFT JOIN products p ON oi.product_id = p.id WHERE oi.order_id = $1',
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

module.exports = router;
