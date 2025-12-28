const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Token oluştur
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Token doğrula
const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
};

// Auth middleware
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Yetkilendirme token\'ı bulunamadı' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ error: 'Geçersiz veya süresi dolmuş token' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Yetkilendirme hatası' });
  }
};

// Öğrenci auth middleware
const ogrenciAuth = (req, res, next) => {
  if (req.user.role !== 'ogrenci') {
    return res.status(403).json({ error: 'Bu işlem için öğrenci yetkisi gerekli' });
  }
  next();
};

// Öğretmen auth middleware
const ogretmenAuth = (req, res, next) => {
  if (req.user.role !== 'ogretmen') {
    return res.status(403).json({ error: 'Bu işlem için öğretmen yetkisi gerekli' });
  }
  next();
};

module.exports = {
  generateToken,
  verifyToken,
  authMiddleware,
  ogrenciAuth,
  ogretmenAuth,
};
