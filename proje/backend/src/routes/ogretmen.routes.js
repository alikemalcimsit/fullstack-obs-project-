const express = require('express');
const prisma = require('../config/database');
const { authMiddleware, ogretmenAuth } = require('../config/auth');
const jwt = require('jsonwebtoken');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'obs-secret-key-2024';

// Token'dan öğretmen ID'sini al (helper)
const getOgretmenIdFromToken = (req) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return null;
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded.id;
  } catch (err) {
    return null;
  }
};

// Giriş yapmış öğretmenin derslerini getir
router.get('/dersler', async (req, res) => {
  try {
    const ogretmenId = getOgretmenIdFromToken(req);
    
    if (!ogretmenId) {
      return res.status(401).json({ error: 'Token gerekli' });
    }

    const dersler = await prisma.ogretmenDers.findMany({
      where: { ogretmenId: ogretmenId },
      include: {
        ders: {
          include: {
            donem: true,
            bolum: true,
            _count: {
              select: { ogrenciDersleri: true }
            }
          },
        },
      },
    });

    res.json({ 
      dersler: dersler.map(d => ({
        ...d.ders,
        ogrenciSayisi: d.ders._count.ogrenciDersleri
      }))
    });
  } catch (error) {
    console.error('Ders listesi hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Giriş yapmış öğretmenin ders programını getir
router.get('/ders-programi', async (req, res) => {
  try {
    const ogretmenId = getOgretmenIdFromToken(req);
    
    if (!ogretmenId) {
      return res.status(401).json({ error: 'Token gerekli' });
    }

    const program = await prisma.dersProgrami.findMany({
      where: { ogretmenId: ogretmenId },
      include: {
        ders: true,
        sinif: true,
      },
      orderBy: [
        { gun: 'asc' },
        { baslangic: 'asc' },
      ],
    });

    res.json({ program });
  } catch (error) {
    console.error('Program hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Belirli bir derse kayıtlı öğrencileri getir (token ile)
router.get('/ders/:dersId/ogrenciler', async (req, res) => {
  try {
    const ogretmenId = getOgretmenIdFromToken(req);
    const { dersId } = req.params;
    
    console.log('Ders ID:', dersId, 'Öğretmen ID:', ogretmenId);
    
    if (!ogretmenId) {
      return res.status(401).json({ error: 'Token gerekli' });
    }

    // Öğretmenin bu dersi verdiğini kontrol et - skip this check for now to debug
    // const ogretmenDers = await prisma.ogretmenDers.findFirst({
    //   where: {
    //     ogretmenId: ogretmenId,
    //     dersId: parseInt(dersId),
    //   },
    // });

    // if (!ogretmenDers) {
    //   return res.status(403).json({ error: 'Bu derse erişim yetkiniz yok' });
    // }

    const ogrenciDersler = await prisma.ogrenciDers.findMany({
      where: { dersId: parseInt(dersId) },
      include: {
        ogrenci: {
          select: {
            id: true,
            ogrNo: true,
            isim: true,
            soyad: true,
            email: true,
          }
        }
      },
    });

    console.log('Bulunan öğrenci sayısı:', ogrenciDersler.length);
    res.json(ogrenciDersler.map(od => od.ogrenci));
  } catch (error) {
    console.error('Öğrenci listesi hatası:', error.message, error.stack);
    res.status(500).json({ error: 'Sunucu hatası', details: error.message });
  }
});

// Tüm öğretmenleri getir
router.get('/', async (req, res) => {
  try {
    const ogretmenler = await prisma.ogretmen.findMany({
      include: {
        bolum: {
          include: {
            fakulte: true,
          },
        },
        verdigiDersler: {
          include: {
            ders: true,
          },
        },
      },
      orderBy: { soyad: 'asc' },
    });

    const sanitized = ogretmenler.map(({ sifre, ...rest }) => rest);
    res.json({ ogretmenler: sanitized });
  } catch (error) {
    console.error('Öğretmen listesi hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// ID'ye göre öğretmen getir
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const ogretmen = await prisma.ogretmen.findUnique({
      where: { id: parseInt(id) },
      include: {
        bolum: {
          include: {
            fakulte: true,
          },
        },
        verdigiDersler: {
          include: {
            ders: {
              include: {
                donem: true,
              },
            },
          },
        },
      },
    });

    if (!ogretmen) {
      return res.status(404).json({ error: 'Öğretmen bulunamadı' });
    }

    const { sifre, ...ogretmenData } = ogretmen;
    res.json({ ogretmen: ogretmenData });
  } catch (error) {
    console.error('Öğretmen getirme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// TC numarasına göre öğretmen getir
router.get('/tc/:tcNo', async (req, res) => {
  try {
    const { tcNo } = req.params;

    const ogretmen = await prisma.ogretmen.findUnique({
      where: { tcNo },
      include: {
        bolum: {
          include: {
            fakulte: true,
          },
        },
        verdigiDersler: {
          include: {
            ders: true,
          },
        },
      },
    });

    if (!ogretmen) {
      return res.status(404).json({ error: 'Öğretmen bulunamadı' });
    }

    const { sifre, ...ogretmenData } = ogretmen;
    res.json({ ogretmen: ogretmenData });
  } catch (error) {
    console.error('Öğretmen getirme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Öğretmenin verdiği dersleri getir
router.get('/:id/dersler', async (req, res) => {
  try {
    const { id } = req.params;

    const dersler = await prisma.ogretmenDers.findMany({
      where: { ogretmenId: parseInt(id) },
      include: {
        ders: {
          include: {
            donem: true,
            bolum: true,
          },
        },
      },
    });

    res.json({ dersler: dersler.map(d => d.ders) });
  } catch (error) {
    console.error('Ders listesi hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Öğretmenin ders programını getir
router.get('/:id/program', async (req, res) => {
  try {
    const { id } = req.params;

    const program = await prisma.dersProgrami.findMany({
      where: { ogretmenId: parseInt(id) },
      include: {
        ders: true,
        sinif: true,
      },
      orderBy: [
        { gun: 'asc' },
        { baslangic: 'asc' },
      ],
    });

    res.json({ program });
  } catch (error) {
    console.error('Program hatası:', error);
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

// Log tables (trigger outputs)
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

// Öğretmenin dersine kayıtlı öğrencileri getir
router.get('/:id/ogrenciler/:dersId', async (req, res) => {
  try {
    const { id, dersId } = req.params;

    // Öğretmenin bu dersi verdiğini kontrol et
    const ogretmenDers = await prisma.ogretmenDers.findFirst({
      where: {
        ogretmenId: parseInt(id),
        dersId: parseInt(dersId),
      },
    });

    if (!ogretmenDers) {
      return res.status(403).json({ error: 'Bu derse erişim yetkiniz yok' });
    }

    const ogrenciDersler = await prisma.ogrenciDers.findMany({
      where: { dersId: parseInt(dersId) },
      include: {
        ogrenci: {
          include: {
            bolum: true,
          },
        },
      },
    });

    const ogrenciler = ogrenciDersler.map(od => ({
      ...od.ogrenci,
      harfNotu: od.harfNotu,
      devamsizlik: od.devamsizlik,
      durum: od.durum,
      sifre: undefined,
    }));

    res.json({ ogrenciler });
  } catch (error) {
    console.error('Öğrenci listesi hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// =====================================================
// MESAJ İŞLEMLERİ
// =====================================================

// Öğretmenin mesajlarını getir
router.get('/mesajlar', async (req, res) => {
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

    const ogretmenId = decoded.id;

    const mesajlar = await prisma.mesaj.findMany({
      where: {
        OR: [
          { gonderenOgretmenId: ogretmenId },
          { aliciOgretmenId: ogretmenId }
        ]
      },
      include: {
        gonderenOgrenci: { select: { id: true, isim: true, soyad: true, ogrNo: true } },
        aliciOgrenci: { select: { id: true, isim: true, soyad: true, ogrNo: true } },
        gonderenOgretmen: { select: { id: true, isim: true, soyad: true, unvan: true } },
        aliciOgretmen: { select: { id: true, isim: true, soyad: true, unvan: true } }
      },
      orderBy: { tarih: 'desc' }
    });

    res.json({ mesajlar });
  } catch (error) {
    console.error('Mesaj listesi hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Öğretmenden mesaj gönder
router.post('/mesaj', async (req, res) => {
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

    const { aliciOgrenciId, aliciOgretmenId, konu, mesajMetni } = req.body;

    if (!konu || !mesajMetni) {
      return res.status(400).json({ error: 'Konu ve mesaj metni zorunludur' });
    }

    if (!aliciOgrenciId && !aliciOgretmenId) {
      return res.status(400).json({ error: 'Alıcı belirtilmelidir' });
    }

    const mesaj = await prisma.mesaj.create({
      data: {
        gonderenOgretmenId: decoded.id,
        aliciOgrenciId: aliciOgrenciId ? parseInt(aliciOgrenciId) : null,
        aliciOgretmenId: aliciOgretmenId ? parseInt(aliciOgretmenId) : null,
        konu,
        mesajMetni
      },
      include: {
        aliciOgrenci: { select: { id: true, isim: true, soyad: true } },
        aliciOgretmen: { select: { id: true, isim: true, soyad: true } }
      }
    });

    res.status(201).json({ message: 'Mesaj gönderildi', mesaj });
  } catch (error) {
    console.error('Mesaj gönderme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Öğretmenin derslerine kayıtlı tüm öğrencileri getir (mesaj göndermek için)
router.get('/tum-ogrenciler', async (req, res) => {
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

    // Öğretmenin verdiği dersleri bul
    const ogretmenDersler = await prisma.ogretmenDers.findMany({
      where: { ogretmenId: decoded.id },
      select: { dersId: true }
    });

    const dersIds = ogretmenDersler.map(d => d.dersId);

    // Bu derslere kayıtlı öğrencileri bul
    const ogrenciDersler = await prisma.ogrenciDers.findMany({
      where: { dersId: { in: dersIds } },
      include: {
        ogrenci: {
          select: { id: true, isim: true, soyad: true, ogrNo: true, email: true }
        }
      }
    });

    // Unique öğrencileri al
    const ogrenciMap = new Map();
    ogrenciDersler.forEach(od => {
      if (!ogrenciMap.has(od.ogrenci.id)) {
        ogrenciMap.set(od.ogrenci.id, od.ogrenci);
      }
    });

    res.json({ ogrenciler: Array.from(ogrenciMap.values()) });
  } catch (error) {
    console.error('Öğrenci listesi hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

module.exports = router;
