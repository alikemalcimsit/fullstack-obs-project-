const express = require('express');
const prisma = require('../config/database');
const { authMiddleware } = require('../config/auth');

const router = express.Router();

// Kullanıcının mesajlarını getir
router.get('/kullanici/:userId', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.params;
    const { tip } = req.query; // 'ogrenci' veya 'ogretmen'

    let mesajlar;

    if (tip === 'ogrenci') {
      mesajlar = await prisma.mesaj.findMany({
        where: {
          OR: [
            { aliciOgrenciId: parseInt(userId) },
            { gonderenOgrenciId: parseInt(userId) },
          ],
        },
        include: {
          gonderenOgrenci: { select: { id: true, isim: true, soyad: true, ogrNo: true } },
          gonderenOgretmen: { select: { id: true, isim: true, soyad: true, unvan: true } },
          aliciOgrenci: { select: { id: true, isim: true, soyad: true, ogrNo: true } },
          aliciOgretmen: { select: { id: true, isim: true, soyad: true, unvan: true } },
        },
        orderBy: { tarih: 'desc' },
      });
    } else if (tip === 'ogretmen') {
      mesajlar = await prisma.mesaj.findMany({
        where: {
          OR: [
            { aliciOgretmenId: parseInt(userId) },
            { gonderenOgretmenId: parseInt(userId) },
          ],
        },
        include: {
          gonderenOgrenci: { select: { id: true, isim: true, soyad: true, ogrNo: true } },
          gonderenOgretmen: { select: { id: true, isim: true, soyad: true, unvan: true } },
          aliciOgrenci: { select: { id: true, isim: true, soyad: true, ogrNo: true } },
          aliciOgretmen: { select: { id: true, isim: true, soyad: true, unvan: true } },
        },
        orderBy: { tarih: 'desc' },
      });
    }

    res.json({ mesajlar });
  } catch (error) {
    console.error('Mesaj listesi hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Öğrencinin mesajlarını getir (TC numarasıyla)
router.get('/ogrenci/:tcNo', async (req, res) => {
  try {
    const { tcNo } = req.params;

    const ogrenci = await prisma.ogrenci.findUnique({
      where: { tcNo },
    });

    if (!ogrenci) {
      return res.status(404).json({ error: 'Öğrenci bulunamadı' });
    }

    const mesajlar = await prisma.mesaj.findMany({
      where: { aliciOgrenciId: ogrenci.id },
      include: {
        gonderenOgrenci: { select: { id: true, isim: true, soyad: true } },
        gonderenOgretmen: { select: { id: true, isim: true, soyad: true, unvan: true } },
      },
      orderBy: { tarih: 'desc' },
    });

    res.json({ mesajlar });
  } catch (error) {
    console.error('Mesaj listesi hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Gelen mesajları getir
router.get('/gelen/:ogrenciId', async (req, res) => {
  try {
    const { ogrenciId } = req.params;

    const mesajlar = await prisma.mesaj.findMany({
      where: { aliciOgrenciId: parseInt(ogrenciId) },
      include: {
        gonderenOgrenci: { select: { id: true, isim: true, soyad: true, ogrNo: true } },
        gonderenOgretmen: { select: { id: true, isim: true, soyad: true, unvan: true } },
      },
      orderBy: { tarih: 'desc' },
    });

    res.json({ mesajlar });
  } catch (error) {
    console.error('Gelen mesaj hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Gönderilen mesajları getir
router.get('/gonderilen/:ogrenciId', async (req, res) => {
  try {
    const { ogrenciId } = req.params;

    const mesajlar = await prisma.mesaj.findMany({
      where: { gonderenOgrenciId: parseInt(ogrenciId) },
      include: {
        aliciOgrenci: { select: { id: true, isim: true, soyad: true, ogrNo: true } },
        aliciOgretmen: { select: { id: true, isim: true, soyad: true, unvan: true } },
      },
      orderBy: { tarih: 'desc' },
    });

    res.json({ mesajlar });
  } catch (error) {
    console.error('Gönderilen mesaj hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Öğretmenin gelen mesajlarını getir
router.get('/gelen/ogretmen/:ogretmenId', async (req, res) => {
  try {
    const { ogretmenId } = req.params;

    const mesajlar = await prisma.mesaj.findMany({
      where: { aliciOgretmenId: parseInt(ogretmenId) },
      include: {
        gonderenOgrenci: { select: { id: true, isim: true, soyad: true, ogrNo: true } },
        gonderenOgretmen: { select: { id: true, isim: true, soyad: true, unvan: true } },
      },
      orderBy: { tarih: 'desc' },
    });

    res.json({ mesajlar });
  } catch (error) {
    console.error('Öğretmen gelen mesaj hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Öğretmenin gönderdiği mesajları getir
router.get('/gonderilen/ogretmen/:ogretmenId', async (req, res) => {
  try {
    const { ogretmenId } = req.params;

    const mesajlar = await prisma.mesaj.findMany({
      where: { gonderenOgretmenId: parseInt(ogretmenId) },
      include: {
        aliciOgrenci: { select: { id: true, isim: true, soyad: true, ogrNo: true } },
        aliciOgretmen: { select: { id: true, isim: true, soyad: true, unvan: true } },
      },
      orderBy: { tarih: 'desc' },
    });

    res.json({ mesajlar });
  } catch (error) {
    console.error('Öğretmen gönderilen mesaj hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Mesaj detayı getir
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const mesaj = await prisma.mesaj.findUnique({
      where: { id: parseInt(id) },
      include: {
        gonderenOgrenci: { select: { id: true, isim: true, soyad: true, ogrNo: true } },
        gonderenOgretmen: { select: { id: true, isim: true, soyad: true, unvan: true } },
        aliciOgrenci: { select: { id: true, isim: true, soyad: true, ogrNo: true } },
        aliciOgretmen: { select: { id: true, isim: true, soyad: true, unvan: true } },
      },
    });

    if (!mesaj) {
      return res.status(404).json({ error: 'Mesaj bulunamadı' });
    }

    res.json({ mesaj });
  } catch (error) {
    console.error('Mesaj detay hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Mesaj gönder
router.post('/', async (req, res) => {
  try {
    const {
      gonderenOgrenciId,
      gonderenOgretmenId,
      aliciOgrenciId,
      aliciOgretmenId,
      konu,
      mesajMetni,
    } = req.body;

    if (!mesajMetni) {
      return res.status(400).json({ error: 'Mesaj metni gereklidir' });
    }

    if (!gonderenOgrenciId && !gonderenOgretmenId) {
      return res.status(400).json({ error: 'Gönderen bilgisi gereklidir' });
    }

    if (!aliciOgrenciId && !aliciOgretmenId) {
      return res.status(400).json({ error: 'Alıcı bilgisi gereklidir' });
    }

    const mesaj = await prisma.mesaj.create({
      data: {
        gonderenOgrenciId: gonderenOgrenciId ? parseInt(gonderenOgrenciId) : null,
        gonderenOgretmenId: gonderenOgretmenId ? parseInt(gonderenOgretmenId) : null,
        aliciOgrenciId: aliciOgrenciId ? parseInt(aliciOgrenciId) : null,
        aliciOgretmenId: aliciOgretmenId ? parseInt(aliciOgretmenId) : null,
        konu,
        mesajMetni,
      },
      include: {
        gonderenOgrenci: { select: { id: true, isim: true, soyad: true } },
        gonderenOgretmen: { select: { id: true, isim: true, soyad: true } },
        aliciOgrenci: { select: { id: true, isim: true, soyad: true } },
        aliciOgretmen: { select: { id: true, isim: true, soyad: true } },
      },
    });

    res.status(201).json({ message: 'Mesaj gönderildi', mesaj });
  } catch (error) {
    console.error('Mesaj gönderme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Mesajı okundu olarak işaretle
router.patch('/:id/okundu', async (req, res) => {
  try {
    const { id } = req.params;

    const mesaj = await prisma.mesaj.update({
      where: { id: parseInt(id) },
      data: { okundu: true },
    });

    res.json({ message: 'Mesaj okundu olarak işaretlendi', mesaj });
  } catch (error) {
    console.error('Mesaj güncelleme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Mesaj sil
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.mesaj.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Mesaj silindi' });
  } catch (error) {
    console.error('Mesaj silme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Okunmamış mesaj sayısını getir
router.get('/okunmamis/:ogrenciId', async (req, res) => {
  try {
    const { ogrenciId } = req.params;

    const count = await prisma.mesaj.count({
      where: {
        aliciOgrenciId: parseInt(ogrenciId),
        okundu: false,
      },
    });

    res.json({ okunmamisSayisi: count });
  } catch (error) {
    console.error('Okunmamış mesaj sayısı hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

module.exports = router;
