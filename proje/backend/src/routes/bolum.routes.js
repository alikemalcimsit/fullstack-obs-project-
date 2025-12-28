const express = require('express');
const prisma = require('../config/database');

const router = express.Router();

// Tüm bölümleri getir
router.get('/', async (req, res) => {
  try {
    const bolumler = await prisma.bolum.findMany({
      include: {
        fakulte: true,
        _count: {
          select: {
            ogrenciler: true,
            ogretmenler: true,
            dersler: true,
          },
        },
      },
      orderBy: { bolumAdi: 'asc' },
    });

    res.json({ 
      bolumler: bolumler.map(b => ({
        ...b,
        ogrenciSayisi: b._count.ogrenciler,
        ogretmenSayisi: b._count.ogretmenler,
        dersSayisi: b._count.dersler
      }))
    });
  } catch (error) {
    console.error('Bölüm listesi hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Fakülteleri getir
router.get('/fakulteler', async (req, res) => {
  try {
    const fakulteler = await prisma.fakulte.findMany({
      include: {
        bolumler: {
          select: {
            id: true,
            bolumAdi: true,
            donemSayisi: true,
          },
        },
      },
      orderBy: { fakulteAdi: 'asc' },
    });

    res.json({ fakulteler });
  } catch (error) {
    console.error('Fakülte listesi hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// ID'ye göre bölüm getir
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const bolum = await prisma.bolum.findUnique({
      where: { id: parseInt(id) },
      include: {
        fakulte: true,
        _count: {
          select: {
            ogrenciler: true,
            ogretmenler: true,
            dersler: true,
          },
        },
      },
    });

    if (!bolum) {
      return res.status(404).json({ error: 'Bölüm bulunamadı' });
    }

    res.json({ bolum });
  } catch (error) {
    console.error('Bölüm detay hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Bölüme ait öğrencileri getir
router.get('/:id/ogrenciler', async (req, res) => {
  try {
    const { id } = req.params;

    const ogrenciler = await prisma.ogrenci.findMany({
      where: { bolumId: parseInt(id) },
      select: {
        id: true,
        ogrNo: true,
        isim: true,
        soyad: true,
        email: true,
        statu: true,
        okuduguDonem: true,
        agno: true,
      },
      orderBy: { ogrNo: 'asc' },
    });

    res.json({ ogrenciler });
  } catch (error) {
    console.error('Bölüm öğrencileri hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Bölüme ait öğretmenleri getir
router.get('/:id/ogretmenler', async (req, res) => {
  try {
    const { id } = req.params;

    const ogretmenler = await prisma.ogretmen.findMany({
      where: { bolumId: parseInt(id) },
      select: {
        id: true,
        isim: true,
        soyad: true,
        email: true,
        unvan: true,
        verdigiDersler: {
          include: {
            ders: true,
          },
        },
      },
      orderBy: { soyad: 'asc' },
    });

    res.json({ ogretmenler });
  } catch (error) {
    console.error('Bölüm öğretmenleri hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Bölüme ait dersleri getir
router.get('/:id/dersler', async (req, res) => {
  try {
    const { id } = req.params;
    const { donemId } = req.query;

    const where = { bolumId: parseInt(id) };
    if (donemId) where.donemId = parseInt(donemId);

    const dersler = await prisma.ders.findMany({
      where,
      include: {
        donem: true,
        ogretmenDersleri: {
          include: {
            ogretmen: {
              select: { id: true, isim: true, soyad: true, unvan: true },
            },
          },
        },
      },
      orderBy: [
        { donemId: 'asc' },
        { dersKodu: 'asc' },
      ],
    });

    res.json({ dersler });
  } catch (error) {
    console.error('Bölüm dersleri hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Bölüm istatistikleri
router.get('/:id/istatistikler', async (req, res) => {
  try {
    const { id } = req.params;

    const ogrenciSayisi = await prisma.ogrenci.count({
      where: { bolumId: parseInt(id) },
    });

    const ogretmenSayisi = await prisma.ogretmen.count({
      where: { bolumId: parseInt(id) },
    });

    const dersSayisi = await prisma.ders.count({
      where: { bolumId: parseInt(id) },
    });

    const ortalamaAgno = await prisma.ogrenci.aggregate({
      where: { bolumId: parseInt(id) },
      _avg: { agno: true },
    });

    // Dönem bazlı öğrenci dağılımı
    const donemDagilimi = await prisma.ogrenci.groupBy({
      by: ['okuduguDonem'],
      where: { bolumId: parseInt(id) },
      _count: { id: true },
      orderBy: { okuduguDonem: 'asc' },
    });

    res.json({
      istatistikler: {
        ogrenciSayisi,
        ogretmenSayisi,
        dersSayisi,
        ortalamaAgno: ortalamaAgno._avg.agno?.toFixed(2) || '0.00',
        donemDagilimi: donemDagilimi.map(d => ({
          donem: d.okuduguDonem,
          ogrenciSayisi: d._count.id,
        })),
      },
    });
  } catch (error) {
    console.error('Bölüm istatistikleri hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

module.exports = router;
