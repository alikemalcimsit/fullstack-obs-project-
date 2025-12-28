const express = require('express');
const prisma = require('../config/database');

const router = express.Router();

// Tüm dersleri getir
router.get('/', async (req, res) => {
  try {
    const { bolumId, donemId } = req.query;

    const where = {};
    if (bolumId) where.bolumId = parseInt(bolumId);
    if (donemId) where.donemId = parseInt(donemId);

    const dersler = await prisma.ders.findMany({
      where,
      include: {
        bolum: true,
        donem: true,
        ogretmenDersleri: {
          include: {
            ogretmen: true,
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
    console.error('Ders listesi hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Bölüme göre dersleri getir
router.get('/bolum/:bolumId', async (req, res) => {
  try {
    const { bolumId } = req.params;

    const dersler = await prisma.ders.findMany({
      where: { bolumId: parseInt(bolumId) },
      include: {
        donem: true,
        ogretmenDersleri: {
          include: {
            ogretmen: true,
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

// Döneme göre dersleri getir
router.get('/donem/:donemId', async (req, res) => {
  try {
    const { donemId } = req.params;

    const dersler = await prisma.ders.findMany({
      where: { donemId: parseInt(donemId) },
      include: {
        bolum: true,
        ogretmenDersleri: {
          include: {
            ogretmen: true,
          },
        },
      },
      orderBy: { dersKodu: 'asc' },
    });

    res.json({ dersler });
  } catch (error) {
    console.error('Dönem dersleri hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Ders detayı getir
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const ders = await prisma.ders.findUnique({
      where: { id: parseInt(id) },
      include: {
        bolum: {
          include: {
            fakulte: true,
          },
        },
        donem: true,
        ogretmenDersleri: {
          include: {
            ogretmen: true,
          },
        },
        dersProgramlari: {
          include: {
            sinif: true,
            ogretmen: true,
          },
        },
      },
    });

    if (!ders) {
      return res.status(404).json({ error: 'Ders bulunamadı' });
    }

    res.json({ ders });
  } catch (error) {
    console.error('Ders detay hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Ders programını getir
router.get('/:id/program', async (req, res) => {
  try {
    const { id } = req.params;

    const program = await prisma.dersProgrami.findMany({
      where: { dersId: parseInt(id) },
      include: {
        ders: true,
        ogretmen: true,
        sinif: true,
      },
    });

    res.json({ program });
  } catch (error) {
    console.error('Ders programı hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Derse kayıtlı öğrencileri getir
router.get('/:id/ogrenciler', async (req, res) => {
  try {
    const { id } = req.params;

    const ogrenciDersler = await prisma.ogrenciDers.findMany({
      where: { dersId: parseInt(id) },
      include: {
        ogrenci: {
          include: {
            bolum: true,
          },
        },
      },
    });

    const ogrenciler = ogrenciDersler.map(od => ({
      id: od.ogrenci.id,
      ogrNo: od.ogrenci.ogrNo,
      isim: od.ogrenci.isim,
      soyad: od.ogrenci.soyad,
      bolum: od.ogrenci.bolum.bolumAdi,
      harfNotu: od.harfNotu,
      devamsizlik: od.devamsizlik,
      durum: od.durum,
    }));

    res.json({ ogrenciler });
  } catch (error) {
    console.error('Ders öğrencileri hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Dönemleri getir
router.get('/meta/donemler', async (req, res) => {
  try {
    const donemler = await prisma.donem.findMany({
      orderBy: { id: 'asc' },
    });

    res.json({ donemler });
  } catch (error) {
    console.error('Dönem listesi hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

module.exports = router;
