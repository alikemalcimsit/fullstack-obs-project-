const express = require('express');
const bcrypt = require('bcryptjs');
const prisma = require('../config/database');
const { generateToken } = require('../config/auth');

const router = express.Router();

// Öğrenci Girişi
router.post('/login', async (req, res) => {
  try {
    const { ogrNo, sifre } = req.body;

    if (!ogrNo || !sifre) {
      return res.status(400).json({ error: 'Öğrenci numarası ve şifre gereklidir' });
    }

    // Öğrenciyi bul
    const ogrenci = await prisma.ogrenci.findUnique({
      where: { ogrNo },
      include: {
        bolum: {
          include: {
            fakulte: true,
          },
        },
      },
    });

    if (!ogrenci) {
      return res.status(401).json({ error: 'Öğrenci numarası veya şifre hatalı' });
    }

    // Şifre kontrolü
    const isValidPassword = await bcrypt.compare(sifre, ogrenci.sifre);
    
    // Eski şifre kontrolü (hash'lenmemiş şifreler için)
    if (!isValidPassword && sifre !== ogrenci.sifre) {
      return res.status(401).json({ error: 'Öğrenci numarası veya şifre hatalı' });
    }

    // Token oluştur
    const token = generateToken({
      id: ogrenci.id,
      ogrNo: ogrenci.ogrNo,
      role: 'ogrenci',
    });

    // Hassas bilgileri çıkar
    const { sifre: _, ...ogrenciData } = ogrenci;

    res.json({
      message: 'Giriş başarılı',
      token,
      user: ogrenciData,
    });
  } catch (error) {
    console.error('Giriş hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Öğretmen Girişi
router.post('/login/ogretmen', async (req, res) => {
  try {
    const { email, sifre } = req.body;

    if (!email || !sifre) {
      return res.status(400).json({ error: 'Email ve şifre gereklidir' });
    }

    const ogretmen = await prisma.ogretmen.findUnique({
      where: { email },
      include: {
        bolum: {
          include: {
            fakulte: true,
          },
        },
      },
    });

    if (!ogretmen) {
      return res.status(401).json({ error: 'Email veya şifre hatalı' });
    }

    const isValidPassword = await bcrypt.compare(sifre, ogretmen.sifre);
    
    if (!isValidPassword && sifre !== ogretmen.sifre) {
      return res.status(401).json({ error: 'Email veya şifre hatalı' });
    }

    const token = generateToken({
      id: ogretmen.id,
      email: ogretmen.email,
      role: 'ogretmen',
    });

    const { sifre: _, ...ogretmenData } = ogretmen;

    res.json({
      message: 'Giriş başarılı',
      token,
      ogretmen: ogretmenData,
    });
  } catch (error) {
    console.error('Öğretmen giriş hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Kayıt Ol (Öğrenci)
router.post('/register', async (req, res) => {
  try {
    const {
      tcNo,
      ogrNo,
      isim,
      soyad,
      email,
      sifre,
      telNo,
      bolumId,
    } = req.body;

    // Validasyon
    if (!tcNo || !ogrNo || !isim || !soyad || !email || !sifre || !bolumId) {
      return res.status(400).json({ error: 'Tüm zorunlu alanlar doldurulmalıdır' });
    }

    // TC ve öğrenci numarası kontrolü
    const existingOgrenci = await prisma.ogrenci.findFirst({
      where: {
        OR: [
          { tcNo },
          { ogrNo },
          { email },
        ],
      },
    });

    if (existingOgrenci) {
      return res.status(400).json({ error: 'Bu TC, öğrenci numarası veya email zaten kayıtlı' });
    }

    // Şifre hash'le
    const hashedPassword = await bcrypt.hash(sifre, 10);

    // Öğrenci oluştur
    const ogrenci = await prisma.ogrenci.create({
      data: {
        tcNo,
        ogrNo,
        isim,
        soyad,
        email,
        sifre: hashedPassword,
        telNo,
        bolumId: parseInt(bolumId),
      },
      include: {
        bolum: true,
      },
    });

    const { sifre: _, ...ogrenciData } = ogrenci;

    res.status(201).json({
      message: 'Kayıt başarılı',
      user: ogrenciData,
    });
  } catch (error) {
    console.error('Kayıt hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Şifre Değiştir
router.post('/change-password', async (req, res) => {
  try {
    const { ogrNo, eskiSifre, yeniSifre } = req.body;

    if (!ogrNo || !eskiSifre || !yeniSifre) {
      return res.status(400).json({ error: 'Tüm alanlar doldurulmalıdır' });
    }

    const ogrenci = await prisma.ogrenci.findUnique({
      where: { ogrNo },
    });

    if (!ogrenci) {
      return res.status(404).json({ error: 'Öğrenci bulunamadı' });
    }

    const isValidPassword = await bcrypt.compare(eskiSifre, ogrenci.sifre);
    
    if (!isValidPassword && eskiSifre !== ogrenci.sifre) {
      return res.status(401).json({ error: 'Mevcut şifre hatalı' });
    }

    const hashedPassword = await bcrypt.hash(yeniSifre, 10);

    await prisma.ogrenci.update({
      where: { ogrNo },
      data: { sifre: hashedPassword },
    });

    res.json({ message: 'Şifre başarıyla değiştirildi' });
  } catch (error) {
    console.error('Şifre değiştirme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Admin Girişi
router.post('/login/admin', async (req, res) => {
  try {
    const { email, sifre } = req.body;

    if (!email || !sifre) {
      return res.status(400).json({ error: 'Email ve şifre gereklidir' });
    }

    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      return res.status(401).json({ error: 'Email veya şifre hatalı' });
    }

    const isValidPassword = await bcrypt.compare(sifre, admin.sifre);
    
    if (!isValidPassword && sifre !== admin.sifre) {
      return res.status(401).json({ error: 'Email veya şifre hatalı' });
    }

    const token = generateToken({
      id: admin.id,
      email: admin.email,
      role: 'admin',
      adminRole: admin.rol,
    });

    const { sifre: _, ...adminData } = admin;

    res.json({
      message: 'Admin girişi başarılı',
      token,
      admin: { ...adminData, role: 'admin' },
    });
  } catch (error) {
    console.error('Admin giriş hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Kullanıcı tipine göre giriş (Genel)
router.post('/login/unified', async (req, res) => {
  try {
    const { email, sifre, userType } = req.body;

    if (!email || !sifre || !userType) {
      return res.status(400).json({ error: 'Tüm alanlar gereklidir' });
    }

    let user = null;
    let role = userType;

    if (userType === 'ogrenci') {
      // Öğrenci için ogrNo veya email ile giriş
      user = await prisma.ogrenci.findFirst({
        where: {
          OR: [
            { ogrNo: email },
            { email: email },
          ],
        },
        include: {
          bolum: {
            include: { fakulte: true },
          },
        },
      });
    } else if (userType === 'ogretmen') {
      user = await prisma.ogretmen.findUnique({
        where: { email },
        include: {
          bolum: {
            include: { fakulte: true },
          },
        },
      });
    } else if (userType === 'admin') {
      user = await prisma.admin.findUnique({
        where: { email },
      });
    }

    if (!user) {
      return res.status(401).json({ error: 'Kullanıcı bulunamadı' });
    }

    const isValidPassword = await bcrypt.compare(sifre, user.sifre);
    
    if (!isValidPassword && sifre !== user.sifre) {
      return res.status(401).json({ error: 'Şifre hatalı' });
    }

    const tokenPayload = {
      id: user.id,
      role: role,
    };

    if (role === 'ogrenci') {
      tokenPayload.ogrNo = user.ogrNo;
    } else {
      tokenPayload.email = user.email;
    }

    if (role === 'admin') {
      tokenPayload.adminRole = user.rol;
    }

    const token = generateToken(tokenPayload);
    const { sifre: _, ...userData } = user;

    res.json({
      message: 'Giriş başarılı',
      token,
      user: { ...userData, role },
    });
  } catch (error) {
    console.error('Giriş hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Token ile kullanıcı bilgisi getir
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Token gerekli' });
    }

    const jwt = require('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'obs-secret-key-2024';
    
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'Geçersiz token' });
    }
    
    let user = null;
    const role = decoded.role || decoded.tip;
    
    if (role === 'ogrenci') {
      user = await prisma.ogrenci.findUnique({
        where: { id: decoded.id },
        include: {
          bolum: { include: { fakulte: true } }
        }
      });
    } else if (role === 'ogretmen') {
      user = await prisma.ogretmen.findUnique({
        where: { id: decoded.id },
        include: {
          bolum: { include: { fakulte: true } },
          verdigiDersler: {
            include: {
              ders: true
            }
          }
        }
      });
    } else if (role === 'admin') {
      user = await prisma.admin.findUnique({
        where: { id: decoded.id }
      });
    }

    if (!user) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    const { sifre, ...userData } = user;

    res.json({
      user: userData,
      tip: role,
      role: role
    });
  } catch (error) {
    console.error('Me hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

module.exports = router;
