const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'obs-secret-key-2024';

// Middleware: Token doğrulama
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token gerekli' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Geçersiz token' });
    }
    if (user.tip !== 'admin') {
      return res.status(403).json({ error: 'Admin yetkisi gerekli' });
    }
    req.user = user;
    next();
  });
};

// Admin Girişi
router.post('/login', async (req, res) => {
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
      user: adminData
    });
  } catch (error) {
    console.error('Admin login hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// =====================================================
// DASHBOARD İSTATİSTİKLERİ
// =====================================================

router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const [
      ogrenciSayisi,
      ogretmenSayisi,
      dersSayisi,
      bolumSayisi,
      fakulteSayisi,
      aktifDonem
    ] = await Promise.all([
      prisma.ogrenci.count(),
      prisma.ogretmen.count(),
      prisma.ders.count(),
      prisma.bolum.count(),
      prisma.fakulte.count(),
      prisma.donem.findFirst({ where: { aktif: true } })
    ]);

    // Son kayıt olan öğrenciler
    const sonOgrenciler = await prisma.ogrenci.findMany({
      take: 5,
      orderBy: { id: 'desc' },
      include: { bolum: true }
    });

    // Bölüm bazlı öğrenci dağılımı
    const bolumDagilimi = await prisma.bolum.findMany({
      include: {
        _count: {
          select: { ogrenciler: true }
        }
      }
    });

    res.json({
      istatistikler: {
        ogrenciSayisi,
        ogretmenSayisi,
        dersSayisi,
        bolumSayisi,
        fakulteSayisi,
        aktifDonem: aktifDonem?.donemAdi || 'Belirtilmemiş'
      },
      sonOgrenciler: sonOgrenciler.map(o => ({
        id: o.id,
        ogrNo: o.ogrNo,
        isim: o.isim,
        soyad: o.soyad,
        bolum: o.bolum?.bolumAdi
      })),
      bolumDagilimi: bolumDagilimi.map(b => ({
        bolum: b.bolumAdi,
        ogrenciSayisi: b._count.ogrenciler
      }))
    });
  } catch (error) {
    console.error('Dashboard hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// =====================================================
// ÖĞRENCİ YÖNETİMİ
// =====================================================

// Tüm öğrencileri getir
router.get('/ogrenciler', authenticateToken, async (req, res) => {
  try {
    const { bolumId, statu, arama, sayfa = 1, limit = 50 } = req.query;
    
    const where = {};
    if (bolumId) where.bolumId = parseInt(bolumId);
    if (statu) where.statu = statu;
    if (arama) {
      where.OR = [
        { isim: { contains: arama } },
        { soyad: { contains: arama } },
        { ogrNo: { contains: arama } },
        { email: { contains: arama } }
      ];
    }

    const [ogrenciler, toplam] = await Promise.all([
      prisma.ogrenci.findMany({
        where,
        include: { bolum: true },
        skip: (parseInt(sayfa) - 1) * parseInt(limit),
        take: parseInt(limit),
        orderBy: { id: 'desc' }
      }),
      prisma.ogrenci.count({ where })
    ]);

    res.json({
      ogrenciler: ogrenciler.map(o => {
        const { sifre, ...data } = o;
        return data;
      }),
      toplam,
      sayfa: parseInt(sayfa),
      toplamSayfa: Math.ceil(toplam / parseInt(limit))
    });
  } catch (error) {
    console.error('Öğrenciler getirme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Öğrenci ekle
router.post('/ogrenci', authenticateToken, async (req, res) => {
  try {
    const { ogrNo, tcNo, isim, soyad, email, sifre, telNo, bolumId, statu } = req.body;

    if (!ogrNo || !tcNo || !isim || !soyad || !email || !sifre) {
      return res.status(400).json({ error: 'Zorunlu alanlar eksik' });
    }

    const hashedPassword = await bcrypt.hash(sifre, 10);

    const ogrenci = await prisma.ogrenci.create({
      data: {
        ogrNo,
        tcNo,
        isim,
        soyad,
        email,
        sifre: hashedPassword,
        telNo,
        bolumId: bolumId ? parseInt(bolumId) : null,
        statu: statu || 'Aktif'
      },
      include: { bolum: true }
    });

    const { sifre: _, ...ogrenciData } = ogrenci;
    res.status(201).json(ogrenciData);
  } catch (error) {
    console.error('Öğrenci ekleme hatası:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Bu öğrenci numarası veya TC zaten kayıtlı' });
    }
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Öğrenci güncelle
router.put('/ogrenci/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { isim, soyad, email, telNo, bolumId, statu, adres } = req.body;

    const ogrenci = await prisma.ogrenci.update({
      where: { id: parseInt(id) },
      data: {
        isim,
        soyad,
        email,
        telNo,
        bolumId: bolumId ? parseInt(bolumId) : undefined,
        statu,
        adres
      },
      include: { bolum: true }
    });

    const { sifre: _, ...ogrenciData } = ogrenci;
    res.json(ogrenciData);
  } catch (error) {
    console.error('Öğrenci güncelleme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Öğrenci sil
router.delete('/ogrenci/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // İlişkili kayıtları sil
    await prisma.ogrenciDers.deleteMany({ where: { ogrenciId: parseInt(id) } });
    await prisma.yoklama.deleteMany({ where: { ogrenciId: parseInt(id) } });
    await prisma.not.deleteMany({ where: { ogrenciId: parseInt(id) } });
    await prisma.mesaj.deleteMany({
      where: {
        OR: [
          { gonderenOgrenciId: parseInt(id) },
          { aliciOgrenciId: parseInt(id) }
        ]
      }
    });

    await prisma.ogrenci.delete({ where: { id: parseInt(id) } });

    res.json({ message: 'Öğrenci silindi' });
  } catch (error) {
    console.error('Öğrenci silme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// =====================================================
// ÖĞRETMEN YÖNETİMİ
// =====================================================

router.get('/ogretmenler', authenticateToken, async (req, res) => {
  try {
    const ogretmenler = await prisma.ogretmen.findMany({
      include: {
        bolum: {
          include: { fakulte: true }
        },
        dersler: {
          include: {
            ders: true
          }
        },
        _count: {
          select: { dersler: true }
        }
      },
      orderBy: { id: 'desc' }
    });

    res.json(ogretmenler.map(o => {
      const { sifre, ...data } = o;
      return { 
        ...data, 
        dersSayisi: data._count.dersler,
        verdigiDersler: data.dersler
      };
    }));
  } catch (error) {
    console.error('Öğretmenler getirme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

router.post('/ogretmen', authenticateToken, async (req, res) => {
  try {
    const { tcNo, isim, soyad, email, sifre, telNo, unvan, bolumId } = req.body;

    if (!tcNo || !isim || !soyad || !email || !sifre) {
      return res.status(400).json({ error: 'Zorunlu alanlar eksik' });
    }

    const hashedPassword = await bcrypt.hash(sifre, 10);

    const ogretmen = await prisma.ogretmen.create({
      data: {
        tcNo,
        isim,
        soyad,
        email,
        sifre: hashedPassword,
        telNo,
        unvan,
        bolumId: bolumId ? parseInt(bolumId) : null
      },
      include: { bolum: true }
    });

    const { sifre: _, ...ogretmenData } = ogretmen;
    res.status(201).json(ogretmenData);
  } catch (error) {
    console.error('Öğretmen ekleme hatası:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Bu email veya TC zaten kayıtlı' });
    }
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

router.put('/ogretmen/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { isim, soyad, email, telNo, unvan, bolumId } = req.body;

    const ogretmen = await prisma.ogretmen.update({
      where: { id: parseInt(id) },
      data: { isim, soyad, email, telNo, unvan, bolumId: bolumId ? parseInt(bolumId) : undefined },
      include: { bolum: true }
    });

    const { sifre: _, ...ogretmenData } = ogretmen;
    res.json(ogretmenData);
  } catch (error) {
    console.error('Öğretmen güncelleme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

router.delete('/ogretmen/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.ogretmenDers.deleteMany({ where: { ogretmenId: parseInt(id) } });
    await prisma.dersProgrami.deleteMany({ where: { ogretmenId: parseInt(id) } });
    await prisma.ogretmen.delete({ where: { id: parseInt(id) } });

    res.json({ message: 'Öğretmen silindi' });
  } catch (error) {
    console.error('Öğretmen silme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// =====================================================
// DERS YÖNETİMİ
// =====================================================

router.get('/dersler', authenticateToken, async (req, res) => {
  try {
    const dersler = await prisma.ders.findMany({
      include: {
        bolum: true,
        donem: true,
        ogretmenler: {
          include: {
            ogretmen: {
              select: { id: true, isim: true, soyad: true, unvan: true }
            }
          }
        },
        _count: {
          select: { ogrenciler: true }
        }
      },
      orderBy: { dersKodu: 'asc' }
    });

    res.json(dersler.map(d => ({
      ...d,
      ogrenciSayisi: d._count.ogrenciler,
      ogretmen: d.ogretmenler[0]?.ogretmen
    })));
  } catch (error) {
    console.error('Dersler getirme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

router.post('/ders', authenticateToken, async (req, res) => {
  try {
    const { dersKodu, dersAdi, kredi, akts, bolumId, donemId, zorunlu, ogretmenId } = req.body;

    if (!dersKodu || !dersAdi) {
      return res.status(400).json({ error: 'Ders kodu ve adı zorunludur' });
    }

    const ders = await prisma.ders.create({
      data: {
        dersKodu,
        dersAdi,
        kredi: kredi ? parseInt(kredi) : null,
        akts: akts ? parseInt(akts) : null,
        bolumId: bolumId ? parseInt(bolumId) : null,
        donemId: donemId ? parseInt(donemId) : null,
        zorunlu: zorunlu !== undefined ? zorunlu : true
      },
      include: { bolum: true, donem: true }
    });

    // Öğretmen ataması
    if (ogretmenId) {
      await prisma.ogretmenDers.create({
        data: {
          ogretmenId: parseInt(ogretmenId),
          dersId: ders.id
        }
      });
    }

    res.status(201).json(ders);
  } catch (error) {
    console.error('Ders ekleme hatası:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Bu ders kodu zaten mevcut' });
    }
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

router.put('/ders/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { dersKodu, dersAdi, kredi, akts, bolumId, donemId, zorunlu } = req.body;

    const ders = await prisma.ders.update({
      where: { id: parseInt(id) },
      data: {
        dersKodu,
        dersAdi,
        kredi: kredi ? parseInt(kredi) : undefined,
        akts: akts ? parseInt(akts) : undefined,
        bolumId: bolumId ? parseInt(bolumId) : undefined,
        donemId: donemId ? parseInt(donemId) : undefined,
        zorunlu
      },
      include: { bolum: true, donem: true }
    });

    res.json(ders);
  } catch (error) {
    console.error('Ders güncelleme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

router.delete('/ders/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.ogrenciDers.deleteMany({ where: { dersId: parseInt(id) } });
    await prisma.ogretmenDers.deleteMany({ where: { dersId: parseInt(id) } });
    await prisma.dersProgrami.deleteMany({ where: { dersId: parseInt(id) } });
    await prisma.yoklama.deleteMany({ where: { dersId: parseInt(id) } });
    await prisma.sinav.deleteMany({ where: { dersId: parseInt(id) } });
    await prisma.ders.delete({ where: { id: parseInt(id) } });

    res.json({ message: 'Ders silindi' });
  } catch (error) {
    console.error('Ders silme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// =====================================================
// DUYURU YÖNETİMİ
// =====================================================

router.get('/duyurular', authenticateToken, async (req, res) => {
  try {
    const duyurular = await prisma.duyuru.findMany({
      orderBy: { olusturmaTarihi: 'desc' }
    });
    res.json(duyurular);
  } catch (error) {
    console.error('Duyurular getirme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

router.post('/duyuru', authenticateToken, async (req, res) => {
  try {
    const { baslik, icerik, onemliMi } = req.body;

    if (!baslik || !icerik) {
      return res.status(400).json({ error: 'Başlık ve içerik zorunludur' });
    }

    const duyuru = await prisma.duyuru.create({
      data: { baslik, icerik, onemliMi: onemliMi || false }
    });

    res.status(201).json(duyuru);
  } catch (error) {
    console.error('Duyuru ekleme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

router.delete('/duyuru/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.duyuru.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Duyuru silindi' });
  } catch (error) {
    console.error('Duyuru silme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// =====================================================
// FAKÜLTE & BÖLÜM YÖNETİMİ
// =====================================================

router.get('/fakulteler', authenticateToken, async (req, res) => {
  try {
    const fakulteler = await prisma.fakulte.findMany({
      include: {
        bolumler: {
          include: {
            _count: { select: { ogrenciler: true, ogretmenler: true } }
          }
        }
      }
    });
    res.json(fakulteler);
  } catch (error) {
    console.error('Fakülteler getirme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

router.get('/bolumler', authenticateToken, async (req, res) => {
  try {
    const bolumler = await prisma.bolum.findMany({
      include: {
        fakulte: true,
        _count: { select: { ogrenciler: true, ogretmenler: true, dersler: true } }
      },
      orderBy: { bolumAdi: 'asc' }
    });
    
    res.json(bolumler.map(b => ({
      ...b,
      ogrenciSayisi: b._count.ogrenciler,
      ogretmenSayisi: b._count.ogretmenler,
      dersSayisi: b._count.dersler
    })));
  } catch (error) {
    console.error('Bölümler getirme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// =====================================================
// DÖNEM YÖNETİMİ
// =====================================================

router.get('/donemler', authenticateToken, async (req, res) => {
  try {
    const donemler = await prisma.donem.findMany({
      orderBy: { id: 'asc' }
    });
    res.json(donemler);
  } catch (error) {
    console.error('Dönemler getirme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

router.put('/donem/:id/aktif', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Önce tüm dönemleri pasif yap
    await prisma.donem.updateMany({
      data: { aktif: false }
    });

    // Seçilen dönemi aktif yap
    const donem = await prisma.donem.update({
      where: { id: parseInt(id) },
      data: { aktif: true }
    });

    res.json(donem);
  } catch (error) {
    console.error('Dönem güncelleme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

module.exports = router;
