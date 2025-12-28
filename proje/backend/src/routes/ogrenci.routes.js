const express = require('express');
const prisma = require('../config/database');
const { authMiddleware } = require('../config/auth');

const router = express.Router();
const MAX_KREDI = 40;

const buildCountMap = (items) => {
  const map = {};
  items.forEach((item) => {
    map[item.dersId] = item._count?._all || item._count || 0;
  });
  return map;
};

// Tüm öğrencileri getir
router.get('/', async (req, res) => {
  try {
    const ogrenciler = await prisma.ogrenci.findMany({
      include: {
        bolum: {
          include: {
            fakulte: true,
          },
        },
      },
      orderBy: { ogrNo: 'asc' },
    });

    const sanitized = ogrenciler.map(({ sifre, ...rest }) => rest);
    res.json({ ogrenciler: sanitized });
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
      where: { ogrNo },
      include: {
        bolum: {
          include: {
            fakulte: true,
          },
        },
        dersKayitlari: {
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

    if (!ogrenci) {
      return res.status(404).json({ error: 'Öğrenci bulunamadı' });
    }

    const { sifre, ...ogrenciData } = ogrenci;
    res.json({ user: ogrenciData });
  } catch (error) {
    console.error('Öğrenci getirme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Öğrenci için kural bazlı uygun dersleri getir
router.get('/:ogrNo/uygun-dersler', async (req, res) => {
  try {
    const { ogrNo } = req.params;

    const ogrenci = await prisma.ogrenci.findUnique({
      where: { ogrNo },
    });

    if (!ogrenci) {
      return res.status(404).json({ error: 'Öğrenci bulunamadı' });
    }

    const currentTerm = ogrenci.okuduguDonem || 1;

    const dersKayitlari = await prisma.ogrenciDers.findMany({
      where: { ogrenciId: ogrenci.id },
      include: {
        ders: {
          include: { donem: true },
        },
      },
    });

    const dersler = await prisma.ders.findMany({
      where: { bolumId: ogrenci.bolumId },
      include: {
        donem: true,
        ogretmenDersleri: { include: { ogretmen: true } },
      },
      orderBy: [
        { donemId: 'asc' },
        { dersKodu: 'asc' },
      ],
    });

    const kontenjanCounts = await prisma.ogrenciDers.groupBy({
      by: ['dersId'],
      _count: { _all: true },
    });

    const pendingCounts = await prisma.dersSecim.groupBy({
      by: ['dersId'],
      _count: { _all: true },
      where: {
        onayDurumu: { in: ['Beklemede', 'Onaylandı'] },
      },
    });

    const kontenjanMap = buildCountMap(kontenjanCounts);
    const pendingMap = buildCountMap(pendingCounts);

    const passedIds = new Set(
      dersKayitlari
        .filter((dk) => dk.harfNotu && dk.harfNotu.toUpperCase() !== 'FF')
        .map((dk) => dk.dersId)
    );

    const activeIds = new Set(
      dersKayitlari
        .filter((dk) => (dk.durum || '').toLowerCase() === 'devam ediyor')
        .map((dk) => dk.dersId)
    );

    const failedRecords = dersKayitlari.filter(
      (dk) => (dk.harfNotu || '').toUpperCase() === 'FF' || (dk.durum || '').toLowerCase() === 'kaldı'
    );

    const failedLower = failedRecords.filter((dk) => dk.ders.donemId <= currentTerm);
    const hasLowerFF = failedLower.length > 0;
    const allowUpper = ogrenci.agno >= 2.5 && !hasLowerFF;

    const parityMatch = (donemId) => donemId % 2 === currentTerm % 2;

    const available = dersler
      .filter((d) => {
        const isFailedRetake = failedRecords.some((f) => f.dersId === d.id);
        const sameParityCurrentOrBelow = parityMatch(d.donemId) && d.donemId <= currentTerm;
        const upperTermAllowed = allowUpper && d.donemId === currentTerm + 2 && parityMatch(d.donemId);
        return (sameParityCurrentOrBelow || upperTermAllowed || isFailedRetake);
      })
      .filter((d) => !passedIds.has(d.id) && !activeIds.has(d.id))
      .map((d) => {
        const mevcut = kontenjanMap[d.id] || 0;
        const bekleyen = pendingMap[d.id] || 0;
        const kontenjanKalan = d.kontenjan - (mevcut + bekleyen);
        const tekrar = failedRecords.some((f) => f.dersId === d.id);

        return {
          ...d,
          kontenjanKalan,
          tekrar,
          secilebilir: kontenjanKalan > 0,
        };
      })
      .filter((d) => d.kontenjanKalan > 0);

    const aktifKredi = dersKayitlari
      .filter((dk) => (dk.durum || '').toLowerCase() === 'devam ediyor')
      .reduce((sum, dk) => sum + (dk.ders?.kredi || 0), 0);

    res.json({
      dersler: available,
      kurallar: {
        currentTerm,
        allowUpper,
        hasLowerFF,
        failedLowerIds: failedLower.map((f) => f.dersId),
        aktifKredi,
        maxKredi: MAX_KREDI,
      },
    });
  } catch (error) {
    console.error('Uygun ders listesi hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// ID'ye göre öğrenci getir
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const ogrenci = await prisma.ogrenci.findUnique({
      where: { id: parseInt(id) },
      include: {
        bolum: {
          include: {
            fakulte: true,
          },
        },
      },
    });

    if (!ogrenci) {
      return res.status(404).json({ error: 'Öğrenci bulunamadı' });
    }

    const { sifre, ...ogrenciData } = ogrenci;
    res.json({ user: ogrenciData });
  } catch (error) {
    console.error('Öğrenci getirme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Öğrenci bilgilerini güncelle
router.put('/:ogrNo', authMiddleware, async (req, res) => {
  try {
    const { ogrNo } = req.params;
    const { telNo, adres, email } = req.body;

    const ogrenci = await prisma.ogrenci.update({
      where: { ogrNo },
      data: {
        ...(telNo && { telNo }),
        ...(adres && { adres }),
        ...(email && { email }),
      },
      include: {
        bolum: true,
      },
    });

    const { sifre, ...ogrenciData } = ogrenci;
    res.json({ message: 'Bilgiler güncellendi', user: ogrenciData });
  } catch (error) {
    console.error('Güncelleme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Öğrencinin aldığı dersleri getir
router.get('/:ogrNo/dersler', async (req, res) => {
  try {
    const { ogrNo } = req.params;

    const ogrenci = await prisma.ogrenci.findUnique({
      where: { ogrNo },
    });

    if (!ogrenci) {
      return res.status(404).json({ error: 'Öğrenci bulunamadı' });
    }

    const dersKayitlari = await prisma.ogrenciDers.findMany({
      where: { ogrenciId: ogrenci.id },
      include: {
        ders: {
          include: {
            donem: true,
            ogretmenDersleri: {
              include: {
                ogretmen: true,
              },
            },
          },
        },
      },
    });

    res.json({ dersler: dersKayitlari });
  } catch (error) {
    console.error('Ders listesi hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Ders seçimi gönder
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

    // Kural kontrolleri
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

    // Doğrudan derse kaydet (danışman onayı gerektirme)
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

    res.json({
      message: 'Dersleriniz kaydedildi',
      toplamKredi: aktifKredi + yeniKredi,
    });
  } catch (error) {
    console.error('Ders seçimi hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Öğrencinin not bilgilerini getir
router.get('/:ogrNo/notlar', async (req, res) => {
  try {
    const { ogrNo } = req.params;

    const ogrenci = await prisma.ogrenci.findUnique({
      where: { ogrNo },
    });

    if (!ogrenci) {
      return res.status(404).json({ error: 'Öğrenci bulunamadı' });
    }

    const notlar = await prisma.not.findMany({
      where: { ogrenciId: ogrenci.id },
      include: {
        sinav: {
          include: {
            ders: true,
          },
        },
      },
      orderBy: {
        sinav: {
          sinavTarihi: 'desc',
        },
      },
    });

    res.json({ notlar });
  } catch (error) {
    console.error('Not listesi hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Öğrencinin yoklama bilgilerini getir
router.get('/:ogrNo/yoklama', async (req, res) => {
  try {
    const { ogrNo } = req.params;

    const ogrenci = await prisma.ogrenci.findUnique({
      where: { ogrNo },
    });

    if (!ogrenci) {
      return res.status(404).json({ error: 'Öğrenci bulunamadı' });
    }

    const yoklamalar = await prisma.yoklama.findMany({
      where: { ogrenciId: ogrenci.id },
      include: {
        ders: true,
      },
      orderBy: { tarih: 'desc' },
    });

    res.json({ yoklamalar });
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
      where: { ogrNo },
      include: {
        dersKayitlari: {
          include: {
            ders: true,
          },
        },
      },
    });

    if (!ogrenci) {
      return res.status(404).json({ error: 'Öğrenci bulunamadı' });
    }

    const dersIds = ogrenci.dersKayitlari.map(dk => dk.dersId);

    const program = await prisma.dersProgrami.findMany({
      where: {
        dersId: { in: dersIds },
      },
      include: {
        ders: true,
        ogretmen: true,
        sinif: true,
      },
      orderBy: [
        { gun: 'asc' },
        { baslangic: 'asc' },
      ],
    });

    res.json({ program });
  } catch (error) {
    console.error('Program getirme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Öğrencinin transkriptini getir
router.get('/:ogrNo/transkript', async (req, res) => {
  try {
    const { ogrNo } = req.params;

    const ogrenci = await prisma.ogrenci.findUnique({
      where: { ogrNo },
      include: {
        bolum: {
          include: {
            fakulte: true,
          },
        },
        dersKayitlari: {
          include: {
            ders: {
              include: {
                donem: true,
              },
            },
          },
          orderBy: {
            ders: {
              donemId: 'asc',
            },
          },
        },
      },
    });

    if (!ogrenci) {
      return res.status(404).json({ error: 'Öğrenci bulunamadı' });
    }

    // Dönemlere göre grupla
    const donemler = {};
    ogrenci.dersKayitlari.forEach(dk => {
      const donemAdi = dk.ders.donem.donemAdi;
      if (!donemler[donemAdi]) {
        donemler[donemAdi] = [];
      }
      donemler[donemAdi].push({
        dersKodu: dk.ders.dersKodu,
        dersAdi: dk.ders.dersAdi,
        kredi: dk.ders.kredi,
        akts: dk.ders.akts,
        harfNotu: dk.harfNotu || '-',
        durum: dk.durum,
      });
    });

    const { sifre, dersKayitlari, ...ogrenciData } = ogrenci;

    res.json({
      ogrenci: ogrenciData,
      transkript: donemler,
      agno: ogrenci.agno,
    });
  } catch (error) {
    console.error('Transkript hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

module.exports = router;
