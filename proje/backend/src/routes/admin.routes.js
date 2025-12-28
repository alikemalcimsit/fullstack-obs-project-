const express = require('express');
const bcrypt = require('bcryptjs');
const prisma = require('../config/database');
const { authMiddleware, adminMiddleware } = require('../config/auth');

const router = express.Router();

// =====================================================
// KULLANICI YÖNETİMİ
// =====================================================

// Tüm öğrencileri getir
router.get('/ogrenciler', authMiddleware, async (req, res) => {
  try {
    const ogrenciler = await prisma.ogrenci.findMany({
      include: {
        bolum: {
          include: { fakulte: true },
        },
      },
      orderBy: { ogrNo: 'asc' },
    });

    const safeData = ogrenciler.map(({ sifre, ...rest }) => rest);
    res.json({ ogrenciler: safeData });
  } catch (error) {
    console.error('Öğrenci listesi hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Tüm öğretmenleri getir
router.get('/ogretmenler', authMiddleware, async (req, res) => {
  try {
    const ogretmenler = await prisma.ogretmen.findMany({
      include: {
        bolum: {
          include: { fakulte: true },
        },
        verdigiDersler: {
          include: { ders: true },
        },
      },
      orderBy: { isim: 'asc' },
    });

    const safeData = ogretmenler.map(({ sifre, ...rest }) => rest);
    res.json({ ogretmenler: safeData });
  } catch (error) {
    console.error('Öğretmen listesi hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Yeni öğretmen ekle
router.post('/ogretmenler', authMiddleware, async (req, res) => {
  try {
    const { tcNo, isim, soyad, email, sifre, telNo, unvan, bolumId } = req.body;

    if (!tcNo || !isim || !soyad || !email || !sifre || !bolumId) {
      return res.status(400).json({ error: 'Zorunlu alanlar doldurulmalıdır' });
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
        bolumId: parseInt(bolumId),
      },
      include: { bolum: true },
    });

    const { sifre: _, ...ogretmenData } = ogretmen;
    res.status(201).json({ message: 'Öğretmen eklendi', ogretmen: ogretmenData });
  } catch (error) {
    console.error('Öğretmen ekleme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Öğretmeni güncelle
router.put('/ogretmenler/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    
    // Şifre varsa hashle
    if (updateData.sifre) {
      updateData.sifre = await bcrypt.hash(updateData.sifre, 10);
    }

    const ogretmen = await prisma.ogretmen.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: { bolum: true },
    });

    const { sifre, ...ogretmenData } = ogretmen;
    res.json({ message: 'Öğretmen güncellendi', ogretmen: ogretmenData });
  } catch (error) {
    console.error('Öğretmen güncelleme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Öğretmeni sil
router.delete('/ogretmenler/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.ogretmen.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Öğretmen silindi' });
  } catch (error) {
    console.error('Öğretmen silme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// =====================================================
// DERS YÖNETİMİ
// =====================================================

// Tüm dersleri getir
router.get('/dersler', authMiddleware, async (req, res) => {
  try {
    const dersler = await prisma.ders.findMany({
      include: {
        bolum: true,
        donem: true,
        ogretmenDersleri: {
          include: { ogretmen: true },
        },
      },
      orderBy: { dersKodu: 'asc' },
    });

    res.json({ dersler });
  } catch (error) {
    console.error('Ders listesi hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Yeni ders ekle
router.post('/dersler', authMiddleware, async (req, res) => {
  try {
    const { dersKodu, dersAdi, kredi, akts, bolumId, donemId, zorunlu } = req.body;

    if (!dersKodu || !dersAdi || !bolumId || !donemId) {
      return res.status(400).json({ error: 'Zorunlu alanlar doldurulmalıdır' });
    }

    const ders = await prisma.ders.create({
      data: {
        dersKodu,
        dersAdi,
        kredi: kredi || 3,
        akts: akts || 5,
        bolumId: parseInt(bolumId),
        donemId: parseInt(donemId),
        zorunlu: zorunlu !== false,
      },
      include: { bolum: true, donem: true },
    });

    res.status(201).json({ message: 'Ders eklendi', ders });
  } catch (error) {
    console.error('Ders ekleme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Ders güncelle
router.put('/dersler/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.bolumId) updateData.bolumId = parseInt(updateData.bolumId);
    if (updateData.donemId) updateData.donemId = parseInt(updateData.donemId);

    const ders = await prisma.ders.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: { bolum: true, donem: true },
    });

    res.json({ message: 'Ders güncellendi', ders });
  } catch (error) {
    console.error('Ders güncelleme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Ders sil
router.delete('/dersler/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.ders.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Ders silindi' });
  } catch (error) {
    console.error('Ders silme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Derse öğretmen ata
router.post('/dersler/:dersId/ogretmen', authMiddleware, async (req, res) => {
  try {
    const { dersId } = req.params;
    const { ogretmenId } = req.body;

    const ogretmenDers = await prisma.ogretmenDers.create({
      data: {
        dersId: parseInt(dersId),
        ogretmenId: parseInt(ogretmenId),
      },
      include: {
        ders: true,
        ogretmen: true,
      },
    });

    res.status(201).json({ message: 'Öğretmen derse atandı', ogretmenDers });
  } catch (error) {
    console.error('Öğretmen atama hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// =====================================================
// BÖLÜM VE FAKÜLTE YÖNETİMİ
// =====================================================

// Tüm fakülteleri getir
router.get('/fakulteler', async (req, res) => {
  try {
    const fakulteler = await prisma.fakulte.findMany({
      include: {
        bolumler: true,
      },
      orderBy: { fakulteAdi: 'asc' },
    });

    res.json({ fakulteler });
  } catch (error) {
    console.error('Fakülte listesi hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Yeni fakülte ekle
router.post('/fakulteler', authMiddleware, async (req, res) => {
  try {
    const { fakulteAdi } = req.body;

    if (!fakulteAdi) {
      return res.status(400).json({ error: 'Fakülte adı zorunludur' });
    }

    const fakulte = await prisma.fakulte.create({
      data: { fakulteAdi },
    });

    res.status(201).json({ message: 'Fakülte eklendi', fakulte });
  } catch (error) {
    console.error('Fakülte ekleme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Tüm bölümleri getir
router.get('/bolumler', async (req, res) => {
  try {
    const bolumler = await prisma.bolum.findMany({
      include: {
        fakulte: true,
        _count: { select: { ogrenciler: true, ogretmenler: true, dersler: true } }
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

// Yeni bölüm ekle
router.post('/bolumler', authMiddleware, async (req, res) => {
  try {
    const { bolumAdi, fakulteId, donemSayisi } = req.body;

    if (!bolumAdi || !fakulteId) {
      return res.status(400).json({ error: 'Bölüm adı ve fakülte zorunludur' });
    }

    const bolum = await prisma.bolum.create({
      data: {
        bolumAdi,
        fakulteId: parseInt(fakulteId),
        donemSayisi: donemSayisi || 8,
      },
      include: { fakulte: true },
    });

    res.status(201).json({ message: 'Bölüm eklendi', bolum });
  } catch (error) {
    console.error('Bölüm ekleme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// =====================================================
// DÖNEM YÖNETİMİ
// =====================================================

// Tüm dönemleri getir
router.get('/donemler', async (req, res) => {
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

// Aktif dönemi değiştir
router.put('/donemler/:id/aktif', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Önce tüm dönemleri pasif yap
    await prisma.donem.updateMany({
      data: { aktif: false },
    });

    // Seçili dönemi aktif yap
    const donem = await prisma.donem.update({
      where: { id: parseInt(id) },
      data: { aktif: true },
    });

    res.json({ message: 'Aktif dönem değiştirildi', donem });
  } catch (error) {
    console.error('Dönem güncelleme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// =====================================================
// İSTATİSTİKLER
// =====================================================

// Genel istatistikler
router.get('/istatistikler', authMiddleware, async (req, res) => {
  try {
    const [
      ogrenciSayisi,
      ogretmenSayisi,
      dersSayisi,
      fakulteSayisi,
      bolumSayisi,
    ] = await Promise.all([
      prisma.ogrenci.count(),
      prisma.ogretmen.count(),
      prisma.ders.count(),
      prisma.fakulte.count(),
      prisma.bolum.count(),
    ]);

    // Aktif dönem
    const aktifDonem = await prisma.donem.findFirst({
      where: { aktif: true },
    });

    res.json({
      ogrenciSayisi,
      ogretmenSayisi,
      dersSayisi,
      fakulteSayisi,
      bolumSayisi,
      aktifDonem,
    });
  } catch (error) {
    console.error('İstatistik hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Ders kayıt istatistikleri
router.get('/istatistikler/ders-kayit', authMiddleware, async (req, res) => {
  try {
    const dersKayitlari = await prisma.ogrenciDers.groupBy({
      by: ['dersId'],
      _count: { ogrenciId: true },
    });

    const dersler = await prisma.ders.findMany({
      where: {
        id: { in: dersKayitlari.map(dk => dk.dersId) },
      },
    });

    const sonuc = dersKayitlari.map(dk => {
      const ders = dersler.find(d => d.id === dk.dersId);
      return {
        dersId: dk.dersId,
        dersAdi: ders?.dersAdi || 'Bilinmiyor',
        dersKodu: ders?.dersKodu || 'Bilinmiyor',
        ogrenciSayisi: dk._count.ogrenciId,
      };
    });

    res.json({ dersKayitlari: sonuc });
  } catch (error) {
    console.error('Ders kayıt istatistikleri hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

module.exports = router;
