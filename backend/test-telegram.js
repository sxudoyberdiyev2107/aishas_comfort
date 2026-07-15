const { TelegramBot } = require('node-telegram-bot-api');
require('dotenv').config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

if (!token || !chatId) {
  console.error('\x1b[31m%s\x1b[0m', 'XATOLIK: .env faylida TELEGRAM_BOT_TOKEN va TELEGRAM_CHAT_ID qiymatlari bo\'sh!');
  console.log('Iltimos, backend/.env faylini ochib, quyidagilarni to\'ldiring:');
  console.log('TELEGRAM_BOT_TOKEN=SizningBotTokeningiz');
  console.log('TELEGRAM_CHAT_ID=SizningKanalIDingiz (masalan, -100...)');
  process.exit(1);
}

console.log('Telegram Bot mijozini ishga tushirmoqdamiz...');
const bot = new TelegramBot(token, { polling: false });

const testMessage = `
🔔 *AISHA'S COMFORT — TEST XABARI*
  
Tizim muvaffaqiyatli tekshirildi!
Kanalga yangi buyurtmalar kelib tushishi to'liq tayyor holatda.
`;

bot.sendMessage(chatId, testMessage, { parse_mode: 'Markdown' })
  .then(() => {
    console.log('\x1b[32m%s\x1b[0m', 'MUVAFFAQIYAT: Test xabari Telegram kanalga muvaffaqiyatli yuborildi!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\x1b[31m%s\x1b[0m', 'Telegramga xabar yuborishda xatolik yuz berdi:');
    console.error(err.message);
    process.exit(1);
  });
