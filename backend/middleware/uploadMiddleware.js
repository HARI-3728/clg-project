const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Ensure reports upload directory exists
const uploadDir = path.join(__dirname, '..', 'uploads', 'reports');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Allowed file types for medical reports
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp'
];

const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'];

// Storage configuration with sanitized cryptographically random names
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;
    cb(null, `rep_${uniqueSuffix}${ext}`);
  }
});

// File filter to validate type
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_MIME_TYPES.includes(file.mimetype) && ALLOWED_EXTENSIONS.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file format: "${ext}". Only PDF, JPEG, PNG, and WebP medical report documents are accepted.`
      ),
      false
    );
  }
};

// 10 MB maximum file size
const uploadReport = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter
});

module.exports = {
  uploadReport,
  uploadDir,
  ALLOWED_MIME_TYPES,
  ALLOWED_EXTENSIONS
};

