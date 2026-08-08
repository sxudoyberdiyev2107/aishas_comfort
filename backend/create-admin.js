require('dotenv').config();
const bcrypt = require('bcrypt');
const db = require('./config/db');

// DIQQAT: parol bu yerga YOZILMAYDI.
// U ADMIN_PASSWORD nomli muhit o'zgaruvchisidan (Railway -> Variables)
// o'qiladi. Sababi: bu fayl ochiq GitHub repozitoriyasida turadi.
const username = process.env.ADMIN_USERNAME || 'admin';
const plainPassword = process.env.ADMIN_PASSWORD;
const saltRounds = 10;

if (!plainPassword) {
  console.error('\x1b[31m%s\x1b[0m', 'XATO: ADMIN_PASSWORD o\'zgaruvchisi topilmadi.');
  console.error('');
  console.error('Parolni kodga yozmang. Uni quyidagicha qo\'shing:');
  console.error('  Railway -> backend servisi -> Variables -> New Variable');
  console.error('  Nomi:  ADMIN_PASSWORD');
  console.error('  Qiymati: <o\'zingiz tanlagan parol>');
  console.error('');
  console.error('Keyin shu skriptni qayta ishga tushiring.');
  process.exit(1);
}

if (plainPassword.length < 8) {
  console.error('\x1b[31m%s\x1b[0m', 'XATO: parol juda qisqa (kamida 8 belgi bo\'lsin).');
  process.exit(1);
}

async function createAdminUser() {
  try {
    console.log('PostgreSQL bazasiga ulanish va sozlash boshlandi...');

    // 1. Ensure the users table exists
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL
      )
    `);
    console.log('1. "users" jadvali tekshirildi/yaratildi.');

    // 2. Hash the password
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    console.log('2. Parol bcrypt orqali muvaffaqiyatli hash qilindi.');

    // 3. Check if admin user already exists
    const checkUser = await db.query('SELECT * FROM users WHERE username = $1', [username]);

    if (checkUser.rows.length > 0) {
      // Update existing admin
      await db.query('UPDATE users SET password = $1 WHERE username = $2', [hashedPassword, username]);
      console.log(`3. "${username}" nomli admin foydalanuvchisi paroli muvaffaqiyatli yangilandi!`);
    } else {
      // Insert new admin
      await db.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, hashedPassword]);
      console.log(`3. Yangi "${username}" nomli admin foydalanuvchisi yaratildi!`);
    }

    console.log('\n\x1b[32m%s\x1b[0m', 'MUVAFFAQIYAT: Admin hisobi ma\'lumotlar bazasiga saqlandi!');
    process.exit(0);
  } catch (err) {
    console.error('\x1b[31m%s\x1b[0m', 'Xatolik yuz berdi:');
    console.error(err.message);
    process.exit(1);
  }
}

createAdminUser();
