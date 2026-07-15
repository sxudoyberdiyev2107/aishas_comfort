const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { TelegramBot } = require('node-telegram-bot-api');
const db = require('../config/db');
const authMiddleware = require('../middleware/auth');

require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'aishas_comfort_secure_secret_key_123';
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

const sanitizeProductForPublic = (product) => {
  const { stock, ...publicProduct } = product;
  return {
    ...publicProduct,
    in_stock: stock > 0
  };
};

// ==========================================
// 1. PUBLIC ROUTES (Products & Categories)
// ==========================================

// GET all products
router.get('/products', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM products ORDER BY id DESC');
    let productsList = result.rows;
    if (!isAdminRequest(req)) {
      productsList = productsList.map(sanitizeProductForPublic);
    }
    res.json(productsList);
  } catch (err) {
    // Graceful fallback to mock data
    console.warn('Database error, falling back to mock products:', err.message);
    let productsList = mockProducts;
    if (!isAdminRequest(req)) {
      productsList = productsList.map(sanitizeProductForPublic);
    }
    res.json(productsList);
  }
});

// GET single product by ID
router.get('/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT * FROM products WHERE id = $1', [id]);
    if (result.rows.length > 0) {
      let product = result.rows[0];
      if (!isAdminRequest(req)) {
        product = sanitizeProductForPublic(product);
      }
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (err) {
    console.warn('Database error, falling back to mock product search:', err.message);
    const prod = mockProducts.find(p => p.id === parseInt(id));
    if (prod) {
      let product = prod;
      if (!isAdminRequest(req)) {
        product = sanitizeProductForPublic(product);
      }
      res.json(product);
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
      // Reduce product stock levels
      await db.query(
        'UPDATE products SET stock = stock - $1 WHERE id = $2 AND stock >= $1',
        [item.quantity, item.product_id]
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

  let user = null;

  try {
    const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length > 0) {
      user = result.rows[0];
    }
  } catch (err) {
    console.warn('Database error on admin lookup, using default config:', err.message);
  }

  // Fallback defaults if DB lookup fails or user table is empty
  // Default username: 'admin', default password: 's3336336'
  // Bcrypt hash of 's3336336': $2b$10$wlxBSJ0HXyIVdCE8oE4OYuDf1Qhs8JD9rGI9QfKZ.HYUqLvehlQFi
  if (!user && username === 'admin') {
    user = {
      username: 'admin',
      password: '$2b$10$wlxBSJ0HXyIVdCE8oE4OYuDf1Qhs8JD9rGI9QfKZ.HYUqLvehlQFi'
    };
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
    secure: isProduction, // HTTPS only in production
    sameSite: 'Strict',
    maxAge: 3600000 // 1 hour
  });

  return res.status(200).json({ success: true, message: 'Logged in successfully' });
});

// POST Admin Logout
router.post('/admin/logout', (req, res) => {
  res.cookie('admin_token', '', {
    httpOnly: true,
    expires: new Date(0),
    sameSite: 'Strict'
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
  const { name_uz, name_ru, desc_uz, desc_ru, price, old_price, stock, category, image_url, video_url } = req.body;
  const slug = (name_uz || 'product').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();

  try {
    // Retrieve category ID
    let categoryId = null;
    const catResult = await db.query('SELECT id FROM categories WHERE slug = $1', [category]);
    if (catResult.rows.length > 0) {
      categoryId = catResult.rows[0].id;
    }

    const result = await db.query(
      'INSERT INTO products (category_id, slug, name_uz, name_ru, desc_uz, desc_ru, price, old_price, stock, image_url, video_url) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
      [categoryId, slug, name_uz, name_ru, desc_uz, desc_ru, price, old_price, stock, image_url, video_url]
    );

    // Sync in-memory fallback list
    mockProducts.unshift(result.rows[0]);
    saveMockProducts(mockProducts);

    res.status(201).json(result.rows[0]);
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
      stock,
      image_url,
      video_url: video_url || '',
      is_new: true,
      is_bestseller: false
    };
    mockProducts.unshift(newProduct);
    saveMockProducts(mockProducts);
    res.status(201).json(newProduct);
  }
});

// PUT update product
router.put('/products/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { name_uz, name_ru, desc_uz, desc_ru, price, old_price, stock, category, image_url, video_url } = req.body;

  try {
    let categoryId = null;
    const catResult = await db.query('SELECT id FROM categories WHERE slug = $1', [category]);
    if (catResult.rows.length > 0) {
      categoryId = catResult.rows[0].id;
    }

    const result = await db.query(
      'UPDATE products SET category_id = $1, name_uz = $2, name_ru = $3, desc_uz = $4, desc_ru = $5, price = $6, old_price = $7, stock = $8, image_url = $9, video_url = $11 WHERE id = $10 RETURNING *',
      [categoryId, name_uz, name_ru, desc_uz, desc_ru, price, old_price, stock, image_url, id, video_url]
    );

    if (result.rows.length > 0) {
      // Sync mock list
      const idx = mockProducts.findIndex(p => p.id === parseInt(id));
      if (idx > -1) {
        mockProducts[idx] = result.rows[0];
        saveMockProducts(mockProducts);
      }
      res.json(result.rows[0]);
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
        stock,
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

module.exports = router;
