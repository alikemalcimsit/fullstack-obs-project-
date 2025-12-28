const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
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
    req.user = user;
    next();
  });
};

// Öğretmenin derslerini getir
router.get('/dersler', authenticateToken, async (req, res) => {
  try {
    const ogretmenId = req.user.id;

    const ogretmenDersler = await prisma.ogretmenDers.findMany({
      where: { ogretmenId: ogretmenId },
      include: {
        ders: {
          include: {
            bolum: true,
            donem: true,
            ogrenciler: {
              include: {
                ogrenci: true
              }
            },
            _count: {
              select: {
                ogrenciler: true
              }
            }
          }
        }
      }
    });

    const dersler = ogretmenDersler.map(od => ({
      ...od.ders,
      ogrenciSayisi: od.ders._count.ogrenciler
    }));

    res.json(dersler);
  } catch (error) {
    console.error('Dersler getirme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Belirli bir dersin öğrencilerini getir
router.get('/ders/:dersId/ogrenciler', authenticateToken, async (req, res) => {
  try {
    const { dersId } = req.params;

    const ogrenciDersler = await prisma.ogrenciDers.findMany({
      where: { dersId: parseInt(dersId) },
      include: {
        ogrenci: {
          include: {
            bolum: true
          }
        }
      }
    });

    const ogrenciler = ogrenciDersler.map(od => ({
      id: od.ogrenci.id,
      ogrNo: od.ogrenci.ogrNo,
      isim: od.ogrenci.isim,
      soyad: od.ogrenci.soyad,
      email: od.ogrenci.email,
      bolum: od.ogrenci.bolum?.bolumAdi,
      durum: od.durum,
      kayitId: od.id
    }));

    res.json(ogrenciler);
  } catch (error) {
    console.error('Öğrenciler getirme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Öğretmenin ders programını getir
router.get('/ders-programi', authenticateToken, async (req, res) => {
  try {
    const ogretmenId = req.user.id;

    const program = await prisma.dersProgrami.findMany({
      where: { ogretmenId: ogretmenId },
      include: {
        ders: true,
        sinif: true
      },
      orderBy: [
        { gun: 'asc' },
        { baslangic: 'asc' }
      ]
    });

    res.json(program);
  } catch (error) {
    console.error('Ders programı getirme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Öğretmenin istatistiklerini getir
router.get('/istatistikler', authenticateToken, async (req, res) => {
  try {
    const ogretmenId = req.user.id;

    // Ders sayısı
    const dersler = await prisma.ogretmenDers.findMany({
      where: { ogretmenId: ogretmenId },
      include: {
        ders: {
          include: {
            _count: {
              select: { ogrenciler: true }
            }
          }
        }
      }
    });

    const toplamDers = dersler.length;
    const toplamOgrenci = dersler.reduce((sum, d) => sum + d.ders._count.ogrenciler, 0);

    // Bugünün dersleri
    const bugun = new Date().getDay(); // 0: Pazar, 1: Pazartesi...
    const gun = bugun === 0 ? 7 : bugun; // 1-7 formatına çevir

    const bugunDersleri = await prisma.dersProgrami.count({
      where: {
        ogretmenId: ogretmenId,
        gun: gun
      }
    });

    // Okunmamış mesajlar
    const okunmamisMesaj = await prisma.mesaj.count({
      where: {
        aliciOgretmenId: ogretmenId,
        okunduMu: false
      }
    });

    res.json({
      toplamDers,
      toplamOgrenci,
      bugunDersSayisi: bugunDersleri,
      bekleyenMesaj: okunmamisMesaj
    });
  } catch (error) {
    console.error('İstatistikler getirme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Öğretmen bilgilerini getir
router.get('/profil', authenticateToken, async (req, res) => {
  try {
    const ogretmenId = req.user.id;

    const ogretmen = await prisma.ogretmen.findUnique({
      where: { id: ogretmenId },
      include: {
        bolum: {
          include: {
            fakulte: true
          }
        }
      }
    });

    if (!ogretmen) {
      return res.status(404).json({ error: 'Öğretmen bulunamadı' });
    }

    const { sifre, ...ogretmenData } = ogretmen;
    res.json(ogretmenData);
  } catch (error) {
    console.error('Profil getirme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Öğretmenin mesajlarını getir
router.get('/mesajlar', authenticateToken, async (req, res) => {
  try {
    const ogretmenId = req.user.id;

    const gelen = await prisma.mesaj.findMany({
      where: { aliciOgretmenId: ogretmenId },
      include: {
        gonderenOgrenci: {
          select: { id: true, isim: true, soyad: true, ogrNo: true }
        },
        gonderenOgretmen: {
          select: { id: true, isim: true, soyad: true, unvan: true }
        }
      },
  orderBy: { tarih: 'desc' }
    });

    const gonderilen = await prisma.mesaj.findMany({
      where: { gonderenOgretmenId: ogretmenId },
      include: {
        aliciOgrenci: {
          select: { id: true, isim: true, soyad: true, ogrNo: true }
        },
        aliciOgretmen: {
          select: { id: true, isim: true, soyad: true, unvan: true }
        }
      },
  orderBy: { tarih: 'desc' }
    });

    res.json({ gelen, gonderilen });
  } catch (error) {
    console.error('Mesajlar getirme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// =====================================================
// SQL Server SP / Function / View / Log endpoints
// =====================================================

// Stored Procedures
router.get('/sp/bolum/:bolumId/dersler', async (req, res) => {
  try {
    const bolumId = parseInt(req.params.bolumId, 10);
    const dersler = await prisma.$queryRaw`EXEC dbo.sp_BolumDersleri @BolumID=${bolumId}`;
    res.json({ dersler });
  } catch (error) {
    console.error('sp_BolumDersleri hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

router.get('/sp/bolum/:bolumId/ogretmenler', async (req, res) => {
  try {
    const bolumId = parseInt(req.params.bolumId, 10);
    const ogretmenler = await prisma.$queryRaw`EXEC dbo.sp_BolumOgretmenleri @BolumID=${bolumId}`;
    res.json({ ogretmenler });
  } catch (error) {
    console.error('sp_BolumOgretmenleri hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

router.get('/sp/donem/:donemId/dersler', async (req, res) => {
  try {
    const donemId = parseInt(req.params.donemId, 10);
    const dersler = await prisma.$queryRaw`EXEC dbo.sp_DonemDersleri @DonemID=${donemId}`;
    res.json({ dersler });
  } catch (error) {
    console.error('sp_DonemDersleri hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

router.post('/sp/ogrenci', async (req, res) => {
  try {
    const { tcNo, isim, soyad, ogrNo, telNo, email, statu, bolumId, sifre } = req.body;
    await prisma.$queryRaw`EXEC dbo.sp_EkleOgrenci @tcNo=${tcNo}, @isim=${isim}, @soyad=${soyad}, @ogrNo=${ogrNo}, @telNo=${telNo}, @email=${email}, @statu=${statu}, @BolumID=${bolumId}, @sifre=${sifre}`;
    res.json({ message: 'Öğrenci eklendi' });
  } catch (error) {
    console.error('sp_EkleOgrenci hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

router.get('/sp/ogrenci/:ogrenciId/yoklama', async (req, res) => {
  try {
    const ogrenciId = parseInt(req.params.ogrenciId, 10);
    const yoklama = await prisma.$queryRaw`EXEC dbo.sp_OgrenciyeAitYoklama @OgrenciID=${ogrenciId}`;
    res.json({ yoklama });
  } catch (error) {
    console.error('sp_OgrenciyeAitYoklama hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Scalar functions
router.get('/sp/fn/bolum/:bolumId/ogrenci-sayisi', async (req, res) => {
  try {
    const bolumId = parseInt(req.params.bolumId, 10);
    const result = await prisma.$queryRaw`SELECT dbo.BolumdekiOgrenciSayisi(${bolumId}) AS ogrenciSayisi`;
    const ogrenciSayisi = Array.isArray(result) && result[0]?.ogrenciSayisi != null ? result[0].ogrenciSayisi : null;
    res.json({ ogrenciSayisi });
  } catch (error) {
    console.error('BolumdekiOgrenciSayisi hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

router.get('/sp/fn/donem/:donemId/ders-sayisi', async (req, res) => {
  try {
    const donemId = parseInt(req.params.donemId, 10);
    const result = await prisma.$queryRaw`SELECT dbo.DonemdekiDersSayisi(${donemId}) AS dersSayisi`;
    const dersSayisi = Array.isArray(result) && result[0]?.dersSayisi != null ? result[0].dersSayisi : null;
    res.json({ dersSayisi });
  } catch (error) {
    console.error('DonemdekiDersSayisi hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

router.get('/sp/fn/bolum/:bolumId/agno', async (req, res) => {
  try {
    const bolumId = parseInt(req.params.bolumId, 10);
    const result = await prisma.$queryRaw`SELECT dbo.OrtalamaAGNOBolum(${bolumId}) AS ortalamaAgno`;
    const ortalamaAgno = Array.isArray(result) && result[0]?.ortalamaAgno != null ? result[0].ortalamaAgno : null;
    res.json({ ortalamaAgno });
  } catch (error) {
    console.error('OrtalamaAGNOBolum hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// View
router.get('/sp/view/bolum/:bolumId/ogrenciler', async (req, res) => {
  try {
    const bolumId = parseInt(req.params.bolumId, 10);
    const ogrenciler = await prisma.$queryRaw`SELECT * FROM dbo.BolumdekiOgrenciler WHERE BolumID = ${bolumId}`;
    res.json({ ogrenciler });
  } catch (error) {
    console.error('View BolumdekiOgrenciler hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Log tables
router.get('/sp/logs/notlar', async (req, res) => {
  try {
    const logs = await prisma.$queryRaw`SELECT TOP 100 * FROM dbo.NotlarLog ORDER BY LogID DESC`;
    res.json({ logs });
  } catch (error) {
    console.error('NotlarLog hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

router.get('/sp/logs/yoklama', async (req, res) => {
  try {
    const logs = await prisma.$queryRaw`SELECT TOP 100 * FROM dbo.YoklamaLog ORDER BY LogID DESC`;
    res.json({ logs });
  } catch (error) {
    console.error('YoklamaLog hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Mesaj gönder
router.post('/mesaj', authenticateToken, async (req, res) => {
  try {
    const ogretmenId = req.user.id;
    const { aliciOgrenciId, aliciOgretmenId, konu, mesajMetni } = req.body;

    if (!konu || !mesajMetni) {
      return res.status(400).json({ error: 'Konu ve mesaj zorunludur' });
    }

    const mesaj = await prisma.mesaj.create({
      data: {
        gonderenOgretmenId: ogretmenId,
        aliciOgrenciId: aliciOgrenciId ? parseInt(aliciOgrenciId) : null,
        aliciOgretmenId: aliciOgretmenId ? parseInt(aliciOgretmenId) : null,
        konu,
        mesajMetni,
        tarih: new Date()
      }
    });

    res.status(201).json(mesaj);
  } catch (error) {
    console.error('Mesaj gönderme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// =====================================================
// SP / VIEW KULLANIM ENDPOINT'LERİ (SQL Server)
// =====================================================

// Bölüm dersleri (sp_BolumDersleri)
router.get('/sp/bolum/:bolumId/dersler', authenticateToken, async (req, res) => {
  try {
    const { bolumId } = req.params;
    const result = await prisma.$queryRaw`EXEC dbo.sp_BolumDersleri ${parseInt(bolumId)}`;
    res.json({ dersler: result });
  } catch (error) {
    console.error('sp_BolumDersleri hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Bölüm öğretmenleri (sp_BolumOgretmenleri)
router.get('/sp/bolum/:bolumId/ogretmenler', authenticateToken, async (req, res) => {
  try {
    const { bolumId } = req.params;
    const result = await prisma.$queryRaw`EXEC dbo.sp_BolumOgretmenleri ${parseInt(bolumId)}`;
    res.json({ ogretmenler: result });
  } catch (error) {
    console.error('sp_BolumOgretmenleri hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Dönem dersleri (sp_DonemDersleri)
router.get('/sp/donem/:donemId/dersler', authenticateToken, async (req, res) => {
  try {
    const { donemId } = req.params;
    const result = await prisma.$queryRaw`EXEC dbo.sp_DonemDersleri ${parseInt(donemId)}`;
    res.json({ dersler: result });
  } catch (error) {
    console.error('sp_DonemDersleri hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Bölümdeki öğrenci sayısı (function BolumdekiOgrenciSayisi)
router.get('/sp/fn/bolum/:bolumId/ogrenci-sayisi', authenticateToken, async (req, res) => {
  try {
    const { bolumId } = req.params;
    const result = await prisma.$queryRaw`SELECT dbo.BolumdekiOgrenciSayisi(${parseInt(bolumId)}) AS ogrenciSayisi`;
    res.json(result?.[0] || {});
  } catch (error) {
    console.error('BolumdekiOgrenciSayisi hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Dönemdeki ders sayısı (function DonemdekiDersSayisi)
router.get('/sp/fn/donem/:donemId/ders-sayisi', authenticateToken, async (req, res) => {
  try {
    const { donemId } = req.params;
    const result = await prisma.$queryRaw`SELECT dbo.DonemdekiDersSayisi(${parseInt(donemId)}) AS dersSayisi`;
    res.json(result?.[0] || {});
  } catch (error) {
    console.error('DonemdekiDersSayisi hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Bölüm ortalama AGNO (function OrtalamaAGNOBolum)
router.get('/sp/fn/bolum/:bolumId/agno', authenticateToken, async (req, res) => {
  try {
    const { bolumId } = req.params;
    const result = await prisma.$queryRaw`SELECT dbo.OrtalamaAGNOBolum(${parseInt(bolumId)}) AS ortalamaAgno`;
    res.json(result?.[0] || {});
  } catch (error) {
    console.error('OrtalamaAGNOBolum hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Bölüm öğrencileri (view BolumdekiOgrenciler)
router.get('/sp/view/bolum/:bolumId/ogrenciler', authenticateToken, async (req, res) => {
  try {
    const { bolumId } = req.params;
    const result = await prisma.$queryRaw`SELECT * FROM dbo.BolumdekiOgrenciler WHERE BolumID = ${parseInt(bolumId)}`;
    res.json({ ogrenciler: result });
  } catch (error) {
    console.error('View BolumdekiOgrenciler hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Öğrenci ekle (sp_EkleOgrenci)
router.post('/sp/ogrenci', authenticateToken, async (req, res) => {
  try {
    const { tcNo, isim, soyad, ogrNo, telNo, email, statu = 'Aktif', BolumID, sifre } = req.body;
    if (!tcNo || !isim || !soyad || !ogrNo || !email || !BolumID || !sifre) {
      return res.status(400).json({ error: 'tcNo, isim, soyad, ogrNo, email, BolumID ve sifre zorunlu' });
    }
    await prisma.$queryRaw`EXEC dbo.sp_EkleOgrenci ${tcNo}, ${isim}, ${soyad}, ${ogrNo}, ${telNo || ''}, ${email}, ${statu}, ${parseInt(BolumID)}, ${sifre}`;
    res.status(201).json({ message: 'Öğrenci eklendi (SP)' });
  } catch (error) {
    console.error('sp_EkleOgrenci hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Öğrenci yoklama (sp_OgrenciyeAitYoklama)
router.get('/sp/ogrenci/:ogrenciId/yoklama', authenticateToken, async (req, res) => {
  try {
    const { ogrenciId } = req.params;
    const result = await prisma.$queryRaw`EXEC dbo.sp_OgrenciyeAitYoklama ${ogrenciId}`;
    res.json({ yoklama: result });
  } catch (error) {
    console.error('sp_OgrenciyeAitYoklama hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Loglar: NotlarLog (trigger çıktıları)
router.get('/sp/logs/notlar', authenticateToken, async (_req, res) => {
  try {
    const result = await prisma.$queryRaw`SELECT TOP 50 * FROM dbo.NotlarLog ORDER BY Tarih DESC`;
    res.json({ logs: result });
  } catch (error) {
    console.error('NotlarLog hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Loglar: YoklamaLog (trigger çıktıları)
router.get('/sp/logs/yoklama', authenticateToken, async (_req, res) => {
  try {
    const result = await prisma.$queryRaw`SELECT TOP 50 * FROM dbo.YoklamaLog ORDER BY Tarih DESC`;
    res.json({ logs: result });
  } catch (error) {
    console.error('YoklamaLog hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

module.exports = router;
