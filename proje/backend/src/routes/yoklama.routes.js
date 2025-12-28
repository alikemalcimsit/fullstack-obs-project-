const express = require('express');
const prisma = require('../config/database');
const { authMiddleware } = require('../config/auth');

const router = express.Router();

// Öğrencinin yoklama bilgilerini getir
router.get('/ogrenci/:ogrNo', async (req, res) => {
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

    // Ders bazlı özet
    const dersOzet = {};
    yoklamalar.forEach(y => {
      const dersId = y.dersId;
      if (!dersOzet[dersId]) {
        dersOzet[dersId] = {
          ders: y.ders,
          toplam: 0,
          var: 0,
          yok: 0,
          izinli: 0,
        };
      }
      dersOzet[dersId].toplam++;
      if (y.durum === 'Var') dersOzet[dersId].var++;
      else if (y.durum === 'Yok') dersOzet[dersId].yok++;
      else if (y.durum === 'İzinli') dersOzet[dersId].izinli++;
    });

    res.json({ 
      yoklamalar,
      ozet: Object.values(dersOzet),
    });
  } catch (error) {
    console.error('Yoklama listesi hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Belirli bir derse ait yoklama bilgilerini getir
router.get('/ogrenci/:ogrNo/ders/:dersId', async (req, res) => {
  try {
    const { ogrNo, dersId } = req.params;

    const ogrenci = await prisma.ogrenci.findUnique({
      where: { ogrNo },
    });

    if (!ogrenci) {
      return res.status(404).json({ error: 'Öğrenci bulunamadı' });
    }

    const yoklamalar = await prisma.yoklama.findMany({
      where: {
        ogrenciId: ogrenci.id,
        dersId: parseInt(dersId),
      },
      include: {
        ders: true,
      },
      orderBy: { tarih: 'desc' },
    });

    // Özet hesapla
    const ozet = {
      toplam: yoklamalar.length,
      var: yoklamalar.filter(y => y.durum === 'Var').length,
      yok: yoklamalar.filter(y => y.durum === 'Yok').length,
      izinli: yoklamalar.filter(y => y.durum === 'İzinli').length,
    };
    ozet.devamOrani = ozet.toplam > 0 ? ((ozet.var + ozet.izinli) / ozet.toplam * 100).toFixed(2) : 100;

    res.json({ yoklamalar, ozet });
  } catch (error) {
    console.error('Yoklama detay hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Bir dersin yoklama kaydını getir (öğretmen için)
router.get('/ders/:dersId', async (req, res) => {
  try {
    const { dersId } = req.params;
    const { tarih } = req.query;

    const where = { dersId: parseInt(dersId) };
    if (tarih) {
      where.tarih = new Date(tarih);
    }

    const yoklamalar = await prisma.yoklama.findMany({
      where,
      include: {
        ogrenci: {
          select: { id: true, ogrNo: true, isim: true, soyad: true },
        },
        ders: true,
      },
      orderBy: [
        { tarih: 'desc' },
        { ogrenci: { ogrNo: 'asc' } },
      ],
    });

    res.json({ yoklamalar });
  } catch (error) {
    console.error('Ders yoklama hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Yoklama kaydet (öğretmen için)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { dersId, tarih, yoklamalar } = req.body;

    if (!dersId || !tarih || !yoklamalar || !Array.isArray(yoklamalar)) {
      return res.status(400).json({ error: 'Geçersiz veri formatı' });
    }

    // Mevcut yoklamaları kontrol et ve güncelle/ekle
    const results = [];
    for (const y of yoklamalar) {
      const existingYoklama = await prisma.yoklama.findFirst({
        where: {
          ogrenciId: y.ogrenciId,
          dersId: parseInt(dersId),
          tarih: new Date(tarih),
        },
      });

      if (existingYoklama) {
        // Güncelle
        const updated = await prisma.yoklama.update({
          where: { id: existingYoklama.id },
          data: { durum: y.durum },
        });
        results.push(updated);
      } else {
        // Yeni ekle
        const created = await prisma.yoklama.create({
          data: {
            ogrenciId: y.ogrenciId,
            dersId: parseInt(dersId),
            tarih: new Date(tarih),
            durum: y.durum,
          },
        });
        results.push(created);
      }
    }

    // Devamsızlık sayısını güncelle
    for (const y of yoklamalar) {
      const devamsizlikSayisi = await prisma.yoklama.count({
        where: {
          ogrenciId: y.ogrenciId,
          dersId: parseInt(dersId),
          durum: 'Yok',
        },
      });

      await prisma.ogrenciDers.updateMany({
        where: {
          ogrenciId: y.ogrenciId,
          dersId: parseInt(dersId),
        },
        data: { devamsizlik: devamsizlikSayisi },
      });
    }

    res.status(201).json({ message: 'Yoklama kaydedildi', yoklamalar: results });
  } catch (error) {
    console.error('Yoklama kaydetme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Tek yoklama kaydı güncelle
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { durum } = req.body;

    if (!durum || !['Var', 'Yok', 'İzinli'].includes(durum)) {
      return res.status(400).json({ error: 'Geçersiz durum' });
    }

    const yoklama = await prisma.yoklama.update({
      where: { id: parseInt(id) },
      data: { durum },
    });

    res.json({ message: 'Yoklama güncellendi', yoklama });
  } catch (error) {
    console.error('Yoklama güncelleme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Yoklama tarihleri getir (bir ders için)
router.get('/ders/:dersId/tarihler', async (req, res) => {
  try {
    const { dersId } = req.params;

    const yoklamalar = await prisma.yoklama.findMany({
      where: { dersId: parseInt(dersId) },
      distinct: ['tarih'],
      select: { tarih: true },
      orderBy: { tarih: 'desc' },
    });

    const tarihler = yoklamalar.map(y => y.tarih);
    res.json({ tarihler });
  } catch (error) {
    console.error('Yoklama tarihleri hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

module.exports = router;
