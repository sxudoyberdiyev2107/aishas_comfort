const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const authMiddleware = require('../middleware/auth');

// Uploads papkasi mavjudligiga ishonch hosil qilamiz
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Fayl qayerga va qanday nom bilan saqlanishini belgilaymiz
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

// Faqat rasm fayllarini qabul qilamiz
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mime = allowedTypes.test(file.mimetype);
  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error('Faqat JPG, PNG yoki WEBP formatidagi rasmlar ruxsat etiladi'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB chegarasi
});

// ============================================================
// VIDEO YUKLASH (mp4) — rasm yuklashdan alohida, mustaqil sozlama
// ============================================================

// Videolar uchun alohida papka. Mavjud uploadDir ('/app/uploads' Railway'da)
// asosida quriladi, shu sabab Railway volume'ida saqlanadi va lokal dev
// ham ishlaydi.
const videoUploadDir = path.join(uploadDir, 'videos');
if (!fs.existsSync(videoUploadDir)) {
  fs.mkdirSync(videoUploadDir, { recursive: true });
}

// Video fayl qayerga va qanday nom bilan saqlanishini belgilaymiz
// (rasm endpoint'idagi bir xil noyob nom uslubi, kengaytmasi doim .mp4)
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, videoUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + '.mp4';
    cb(null, uniqueName);
  }
});

// Faqat mp4 videolarni qabul qilamiz
const videoFileFilter = (req, file, cb) => {
  if (file.mimetype === 'video/mp4') {
    cb(null, true);
  } else {
    cb(new Error('Faqat mp4 formatdagi video yuklash mumkin'));
  }
};

const videoUpload = multer({
  storage: videoStorage,
  fileFilter: videoFileFilter,
  limits: { fileSize: 25 * 1024 * 1024 } // 25MB chegarasi
});

// POST /api/upload — bitta rasm yuklash
router.post('/', authMiddleware, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Rasm fayli topilmadi' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  res.status(200).json({ url: fileUrl });
});

// POST /api/upload/video — bitta mp4 video yuklash
// Auth rasm endpoint'i bilan bir xil (authMiddleware). Multer'ni qo'lda
// chaqiramiz, shunda xatolarni shu yerda ushlab, toza JSON qaytaramiz —
// server qulab tushmaydi.
router.post('/video', authMiddleware, (req, res) => {
  videoUpload.single('video')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'Video hajmi 25 MB dan oshmasligi kerak' });
      }
      // fileFilter xatosi (mp4 emas) yoki boshqa multer xatosi
      return res.status(400).json({ error: err.message });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'Video fayli topilmadi' });
    }
    const fileUrl = `/uploads/videos/${req.file.filename}`;
    res.status(200).json({ url: fileUrl });
  });
});

module.exports = router;
