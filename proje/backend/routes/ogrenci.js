const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const MAX_KREDI = 40;

const buildCountMap = (items) => {
  const map = {};
  items.forEach((item) => {
    map[item.dersId] = item._count?._all || item._count?.dersId || 0;
  });
  return map;
};

// Tüm öğrencileri getir
router.get('/', async (req, res) => {
  try {
    const ogrenciler = await prisma.ogrenci.findMany({
      include: {
        bolum: true,
        sinif: true,
        donem: true
      }
    });
    
    // Şifreleri çıkar
    const safeData = ogrenciler.map(({ sifre, ...rest }) => rest);
    res.json(safeData);
  } catch (error) {
    console.error('Öğrenci listesi hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Öğrenci numarasına göre getir
router.get('/ogrno/:ogrNo', async (req, res) => {
  try {
    const { ogrNo } = req.params;
    
    const ogrenci = await prisma.ogrenci.findUnique({
      where: { ogrNo: ogrNo },
      include: {
        bolum: {
          include: {
            fakulte: true
          }
        },
        sinif: true,
        donem: true
      }
    });

    if (!ogrenci) {
      return res.status(404).json({ error: 'Öğrenci bulunamadı' });
    }

    const { sifre, ...ogrenciData } = ogrenci;
    res.json(ogrenciData);
  } catch (error) {
    console.error('Öğrenci getirme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// ID'ye göre getir
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const ogrenci = await prisma.ogrenci.findUnique({
      where: { id: parseInt(id) },
      include: {
        bolum: {
          include: {
            fakulte: true
          }
        },
        sinif: true,
        donem: true
      }
    });

    if (!ogrenci) {
      return res.status(404).json({ error: 'Öğrenci bulunamadı' });
    }

    const { sifre, ...ogrenciData } = ogrenci;
    res.json(ogrenciData);
  } catch (error) {
    console.error('Öğrenci getirme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Öğrenci güncelle
router.put('/:ogrNo', async (req, res) => {
  try {
    const { ogrNo } = req.params;
    const updateData = req.body;

    // Şifre güncellenmemeli bu endpoint'ten
    delete updateData.sifre;

    const ogrenci = await prisma.ogrenci.update({
      where: { ogrNo: ogrNo },
      data: updateData,
      include: {
        bolum: true,
        sinif: true
      }
    });

    const { sifre, ...ogrenciData } = ogrenci;
    res.json(ogrenciData);
  } catch (error) {
    console.error('Öğrenci güncelleme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Öğrencinin derslerini getir
router.get('/:ogrNo/dersler', async (req, res) => {
  try {
    const { ogrNo } = req.params;

    const ogrenci = await prisma.ogrenci.findUnique({
      where: { ogrNo: ogrNo }
    });

    if (!ogrenci) {
      return res.status(404).json({ error: 'Öğrenci bulunamadı' });
    }

    const dersler = await prisma.ogrenciDers.findMany({
      where: { ogrenciId: ogrenci.id },
      include: {
        ders: {
          include: {
            donem: true,
            ogretmenDers: {
              include: {
                ogretmen: true
              }
            }
          }
        }
      }
    });

    res.json({ dersler });
  } catch (error) {
    console.error('Ders listesi hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Ders seçimi gönder (danışman onayı olmadan doğrudan kayıt)
router.post('/:ogrNo/ders-secim', async (req, res) => {
  try {
    const { ogrNo } = req.params;
    const { dersIds = [] } = req.body;

    if (!Array.isArray(dersIds) || dersIds.length === 0) {
      return res.status(400).json({ error: 'Seçili ders bulunamadı' });
    }

    const ogrenci = await prisma.ogrenci.findUnique({ where: { ogrNo } });
    if (!ogrenci) {
      return res.status(404).json({ error: 'Öğrenci bulunamadı' });
    }

    const currentTerm = ogrenci.okuduguDonem || 1;

    const dersKayitlari = await prisma.ogrenciDers.findMany({
      where: { ogrenciId: ogrenci.id },
      include: { ders: true },
    });

    const failedRecords = dersKayitlari.filter(
      (dk) => (dk.harfNotu || '').toUpperCase() === 'FF' || (dk.durum || '').toLowerCase() === 'kaldı'
    );
    const failedLower = failedRecords.filter((dk) => dk.ders.donemId <= currentTerm);
    const hasLowerFF = failedLower.length > 0;
    const allowUpper = ogrenci.agno >= 2.5 && !hasLowerFF;

    const dersList = await prisma.ders.findMany({
      where: { id: { in: dersIds.map((id) => parseInt(id, 10)) } },
      include: { donem: true },
    });

    if (dersList.length !== dersIds.length) {
      return res.status(400).json({ error: 'Bazı dersler bulunamadı' });
    }

    const upperTermRequested = dersList.some((d) => d.donemId > currentTerm);
    if (upperTermRequested && !allowUpper) {
      return res.status(400).json({ error: 'Üstten ders alabilmek için AGNO en az 2.5 olmalı ve alttan FF ders bulunmamalı' });
    }

    const missingFailed = failedLower
      .filter((f) => !dersIds.includes(f.dersId) && (f.durum || '').toLowerCase() !== 'devam ediyor')
      .map((f) => f.dersId);

    if (missingFailed.length > 0) {
      return res.status(400).json({ error: 'Alttan FF dersler öncelikli alınmalıdır', detay: { eksikDersler: missingFailed } });
    }

    const kontenjanCounts = await prisma.ogrenciDers.groupBy({
      by: ['dersId'],
      _count: { _all: true },
      where: { dersId: { in: dersIds } },
    });

    const kontenjanMap = buildCountMap(kontenjanCounts);

    for (const ders of dersList) {
      const kontenjanKalan = ders.kontenjan - (kontenjanMap[ders.id] || 0);
      if (kontenjanKalan <= 0) {
        return res.status(400).json({ error: `${ders.dersAdi} dersi için kontenjan dolu` });
      }

      if (ders.donemId > currentTerm + 1) {
        return res.status(400).json({ error: 'Geçersiz dönem için ders seçimi yapılamaz' });
      }
    }

    const aktifKredi = dersKayitlari
      .filter((dk) => (dk.durum || '').toLowerCase() === 'devam ediyor' && dk.ders.donemId === currentTerm)
      .reduce((sum, dk) => sum + (dk.ders?.kredi || 0), 0);

    const yeniKredi = dersList.reduce((sum, d) => sum + (d.kredi || 0), 0);
    if (aktifKredi + yeniKredi > MAX_KREDI) {
      return res.status(400).json({ error: `Maksimum ${MAX_KREDI} kredi sınırı aşılamaz`, detay: { mevcut: aktifKredi, eklenecek: yeniKredi } });
    }

    const alreadyEnrolledIds = new Set(dersKayitlari.map((dk) => dk.dersId));
    const insertables = dersList.filter((d) => !alreadyEnrolledIds.has(d.id));

    await prisma.ogrenciDers.createMany({
      data: insertables.map((ders) => ({
        ogrenciId: ogrenci.id,
        dersId: ders.id,
        durum: 'Devam Ediyor',
        kayitTarihi: new Date(),
      })),
    });

    const toplamKredi = aktifKredi + yeniKredi;

    res.json({
      message: 'Dersleriniz kaydedildi',
      toplamKredi,
    });
  } catch (error) {
    console.error('Ders seçimi hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Öğrencinin notlarını getir
router.get('/:ogrNo/notlar', async (req, res) => {
  try {
    const { ogrNo } = req.params;

    const ogrenci = await prisma.ogrenci.findUnique({
      where: { ogrNo: ogrNo }
    });

    if (!ogrenci) {
      return res.status(404).json({ error: 'Öğrenci bulunamadı' });
    }

    const notlar = await prisma.not.findMany({
      where: { ogrenciId: ogrenci.id },
      include: {
        ders: true,
        sinav: true
      }
    });

    res.json(notlar);
  } catch (error) {
    console.error('Not listesi hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Öğrencinin yoklamasını getir
router.get('/:ogrNo/yoklama', async (req, res) => {
  try {
    const { ogrNo } = req.params;

    const ogrenci = await prisma.ogrenci.findUnique({
      where: { ogrNo: ogrNo }
    });

    if (!ogrenci) {
      return res.status(404).json({ error: 'Öğrenci bulunamadı' });
    }

    const yoklamalar = await prisma.yoklama.findMany({
      where: { ogrenciId: ogrenci.id },
      include: {
        ders: true
      },
      orderBy: {
        tarih: 'desc'
      }
    });

    res.json(yoklamalar);
  } catch (error) {
    console.error('Yoklama listesi hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Öğrencinin ders programını getir
router.get('/:ogrNo/program', async (req, res) => {
  try {
    const { ogrNo } = req.params;

    const ogrenci = await prisma.ogrenci.findUnique({
      where: { ogrNo: ogrNo },
      include: {
        sinif: true
      }
    });

    if (!ogrenci) {
      return res.status(404).json({ error: 'Öğrenci bulunamadı' });
    }

    const program = await prisma.dersProgrami.findMany({
      where: { sinifId: ogrenci.sinifId },
      include: {
        ders: {
          include: {
            ogretmenDers: {
              include: {
                ogretmen: true
              }
            }
          }
        }
      },
      orderBy: [
        { gun: 'asc' },
        { baslangicSaat: 'asc' }
      ]
    });

    res.json(program);
  } catch (error) {
    console.error('Ders programı hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Öğrencinin transkriptini getir
router.get('/:ogrNo/transkript', async (req, res) => {
  try {
    const { ogrNo } = req.params;

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
      return res.status(404).json({ error: 'Öğrenci bulunamadı' });
    }

    // Tüm dersleri ve notları getir
    const ogrenciDersler = await prisma.ogrenciDers.findMany({
      where: { ogrenciId: ogrenci.id },
      include: {
        ders: true
      }
    });

    const notlar = await prisma.not.findMany({
      where: { ogrenciId: ogrenci.id },
      include: {
        ders: true,
        sinav: true
      }
    });

    // GNO hesapla
    let toplamKredi = 0;
    let toplamPuan = 0;

    ogrenciDersler.forEach(od => {
      const dersNotlari = notlar.filter(n => n.dersId === od.dersId);
      if (dersNotlari.length > 0 && od.durum === 'Tamamlandı') {
        const ortalama = dersNotlari.reduce((acc, n) => acc + n.puan, 0) / dersNotlari.length;
        toplamKredi += od.ders.kredi;
        toplamPuan += ortalama * od.ders.kredi;
      }
    });

    const gno = toplamKredi > 0 ? (toplamPuan / toplamKredi / 25).toFixed(2) : 0;

    res.json({
      ogrenci: {
        ogrNo: ogrenci.ogrNo,
        ad: ogrenci.ad,
        soyad: ogrenci.soyad,
        bolum: ogrenci.bolum?.ad,
        fakulte: ogrenci.bolum?.fakulte?.ad,
        sinif: ogrenci.sinif?.ad
      },
      dersler: ogrenciDersler,
      notlar: notlar,
      gno: parseFloat(gno)
    });
  } catch (error) {
    console.error('Transkript hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

module.exports = router;
