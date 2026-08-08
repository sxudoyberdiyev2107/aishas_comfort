require('dotenv').config();

// Admin sessiyalarini imzolash uchun maxfiy kalit.
//
// Kalit FAQAT shu faylda o'qiladi — boshqa fayllar shu yerdan oladi,
// shunda kalit bir necha joyda takrorlanmaydi.
//
// Kodda zaxira qiymat SAQLANMAYDI: bu repozitoriya ochiq, va koddagi
// kalitni bilgan odam o'zini admin qilib ko'rsatuvchi token yasay oladi.
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  console.error('\x1b[31m%s\x1b[0m', 'XATO: JWT_SECRET o\'zgaruvchisi topilmadi.');
  console.error('');
  console.error('Server ishga tushmaydi, chunki maxfiy kalitsiz admin');
  console.error('sessiyalarini xavfsiz imzolab bo\'lmaydi.');
  console.error('');
  console.error('Qo\'shish:');
  console.error('  Railway -> backend servisi -> Variables -> New Variable');
  console.error('  Nomi:    JWT_SECRET');
  console.error('  Qiymati: uzun tasodifiy matn (kamida 32 belgi)');
  process.exit(1);
}

if (JWT_SECRET.length < 32) {
  console.warn('\x1b[33m%s\x1b[0m', 'OGOHLANTIRISH: JWT_SECRET juda qisqa (32 belgidan kam).');
  console.warn('Uni uzunroq tasodifiy qiymatga almashtiring.');
}

module.exports = { JWT_SECRET };
