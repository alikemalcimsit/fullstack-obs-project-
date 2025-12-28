const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'obs-secret-key-2024';

// Öğrenci Girişi
router.post('/login', async (req, res) => {
  try {
    const { ogrNo, sifre } = req.body;

    if (!ogrNo || !sifre) {
      return res.status(400).json({ error: 'Öğrenci numarası ve şifre zorunludur' });
    }

    const ogrenci = await prisma.ogrenci.findUnique({
      where: { ogrNo: ogrNo },
      include: {
        bolum: {
          include: {
            fakulte: true
          }
        },
        sinif: true
      }
    });

    if (!ogrenci) {
      return res.status(401).json({ error: 'Öğrenci bulunamadı' });
    }

    // Şifre kontrolü
    const isValidPassword = await bcrypt.compare(sifre, ogrenci.sifre);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Şifre hatalı' });
    }

    // JWT token oluştur
    const token = jwt.sign(
      { 
        id: ogrenci.id, 
        ogrNo: ogrenci.ogrNo, 
        tip: 'ogrenci' 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Şifreyi response'dan çıkar
    const { sifre: _, ...ogrenciData } = ogrenci;

    res.json({
      message: 'Giriş başarılı',
      token,
      user: ogrenciData
    });
  } catch (error) {
    console.error('Login hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Öğretmen Girişi
router.post('/login/ogretmen', async (req, res) => {
  try {
    const { email, sifre } = req.body;

    if (!email || !sifre) {
      return res.status(400).json({ error: 'Email ve şifre zorunludur' });
    }

    const ogretmen = await prisma.ogretmen.findUnique({
      where: { email: email },
      include: {
        bolum: {
          include: {
            fakulte: true
          }
        }
      }
    });

    if (!ogretmen) {
      return res.status(401).json({ error: 'Öğretmen bulunamadı' });
    }

    // Şifre kontrolü
    const isValidPassword = await bcrypt.compare(sifre, ogretmen.sifre);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Şifre hatalı' });
    }

    // JWT token oluştur
    const token = jwt.sign(
      { 
        id: ogretmen.id, 
        email: ogretmen.email, 
        tip: 'ogretmen' 
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Şifreyi response'dan çıkar
    const { sifre: _, ...ogretmenData } = ogretmen;

    res.json({
      message: 'Giriş başarılı',
      token,
      user: ogretmenData
    });
  } catch (error) {
    console.error('Login hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Öğrenci Kayıt
router.post('/register', async (req, res) => {
  try {
    const { ogrenciNo, tcNo, isim, soyad, email, sifre } = req.body;

    // Validasyon
    if (!ogrenciNo || !tcNo || !isim || !soyad || !email || !sifre) {
      return res.status(400).json({ error: 'Tüm alanlar zorunludur' });
    }

    // Öğrenci numarası kontrolü
    const existingOgrenci = await prisma.ogrenci.findUnique({
      where: { ogrNo: ogrenciNo }
    });

    if (existingOgrenci) {
      return res.status(400).json({ error: 'Bu öğrenci numarası zaten kayıtlı' });
    }

    // TC kontrolü
    const existingTc = await prisma.ogrenci.findUnique({
      where: { tcNo: tcNo }
    });

    if (existingTc) {
      return res.status(400).json({ error: 'Bu TC kimlik numarası zaten kayıtlı' });
    }

    // Email kontrolü
    const existingEmail = await prisma.ogrenci.findFirst({
      where: { email: email }
    });

    if (existingEmail) {
      return res.status(400).json({ error: 'Bu email adresi zaten kayıtlı' });
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(sifre, 10);

    // Varsayılan değerler
    const defaultBolum = await prisma.bolum.findFirst();
    const defaultSinif = await prisma.sinif.findFirst();
    const defaultDonem = await prisma.donem.findFirst();

    // Yeni öğrenci oluştur
    const yeniOgrenci = await prisma.ogrenci.create({
      data: {
        ogrNo: ogrenciNo,
        tcNo: tcNo,
        ad: isim,
        soyad: soyad,
        email: email,
        sifre: hashedPassword,
        bolumId: defaultBolum?.id || 1,
        sinifId: defaultSinif?.id || 1,
        donemId: defaultDonem?.id || 1,
        kayitTarihi: new Date(),
        durum: 'Aktif'
      },
      include: {
        bolum: true,
        sinif: true
      }
    });

    // Şifreyi response'dan çıkar
    const { sifre: _, ...ogrenciData } = yeniOgrenci;

    res.status(201).json({
      message: 'Kayıt başarılı',
      user: ogrenciData
    });
  } catch (error) {
    console.error('Register hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası: ' + error.message });
  }
});

// Şifre Değiştir
router.post('/change-password', async (req, res) => {
  try {
    const { ogrNo, eskiSifre, yeniSifre } = req.body;

    if (!ogrNo || !eskiSifre || !yeniSifre) {
      return res.status(400).json({ error: 'Tüm alanlar zorunludur' });
    }

    const ogrenci = await prisma.ogrenci.findUnique({
      where: { ogrNo: ogrNo }
    });

    if (!ogrenci) {
      return res.status(404).json({ error: 'Öğrenci bulunamadı' });
    }

    // Eski şifre kontrolü
    const isValidPassword = await bcrypt.compare(eskiSifre, ogrenci.sifre);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Mevcut şifre hatalı' });
    }

    // Yeni şifreyi hashle
    const hashedPassword = await bcrypt.hash(yeniSifre, 10);

    // Şifreyi güncelle
    await prisma.ogrenci.update({
      where: { ogrNo: ogrNo },
      data: { sifre: hashedPassword }
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
      return res.status(400).json({ error: 'Email ve şifre zorunludur' });
    }

    const admin = await prisma.admin.findUnique({
      where: { email: email }
    });

    if (!admin) {
      return res.status(401).json({ error: 'Admin bulunamadı' });
    }

    const isValidPassword = await bcrypt.compare(sifre, admin.sifre);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Şifre hatalı' });
    }

    const token = jwt.sign(
      { id: admin.id, email: admin.email, tip: 'admin', rol: admin.rol },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { sifre: _, ...adminData } = admin;

    res.json({
      message: 'Giriş başarılı',
      token,
      admin: adminData
    });
  } catch (error) {
    console.error('Admin login hatası:', error);
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

    const decoded = jwt.verify(token, JWT_SECRET);
    
    let user = null;
    
    if (decoded.tip === 'ogrenci') {
      user = await prisma.ogrenci.findUnique({
        where: { id: decoded.id },
        include: {
          bolum: { include: { fakulte: true } }
        }
      });
    } else if (decoded.tip === 'ogretmen') {
      user = await prisma.ogretmen.findUnique({
        where: { id: decoded.id },
        include: {
          bolum: { include: { fakulte: true } }
        }
      });
    } else if (decoded.tip === 'admin') {
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
      tip: decoded.tip
    });
  } catch (error) {
    console.error('Me hatası:', error);
    res.status(401).json({ error: 'Geçersiz token' });
  }
});

module.exports = router;
