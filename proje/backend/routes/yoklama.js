const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Yoklama kayıtlarını getir
router.get('/', async (req, res) => {
  try {
    const { dersId, ogrenciId } = req.query;
    
    const where = {};
    if (dersId) where.dersId = parseInt(dersId);
    if (ogrenciId) where.ogrenciId = parseInt(ogrenciId);

    const yoklamalar = await prisma.yoklama.findMany({
      where,
      include: {
        ders: true,
        ogrenci: {
          select: { ad: true, soyad: true, ogrNo: true }
        }
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

// Öğrenci yoklama özeti
router.get('/ogrenci/:ogrenciId/ozet', async (req, res) => {
  try {
    const { ogrenciId } = req.params;

    const yoklamalar = await prisma.yoklama.findMany({
      where: { ogrenciId: parseInt(ogrenciId) },
      include: {
        ders: true
      }
    });

    // Derslere göre grupla
    const ozet = {};
    yoklamalar.forEach(y => {
      if (!ozet[y.dersId]) {
        ozet[y.dersId] = {
          ders: y.ders,
          toplam: 0,
          katilim: 0,
          devamsizlik: 0
        };
      }
      ozet[y.dersId].toplam++;
      if (y.durum === 'Var') {
        ozet[y.dersId].katilim++;
      } else {
        ozet[y.dersId].devamsizlik++;
      }
    });

    res.json(Object.values(ozet));
  } catch (error) {
    console.error('Yoklama özeti hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Yoklama kaydet (tek kayıt veya toplu)
router.post('/', async (req, res) => {
  try {
    const { dersId, ogrenciId, tarih, durum, yoklamalar } = req.body;

    // Toplu kayıt
    if (Array.isArray(yoklamalar)) {
      if (!dersId || !tarih) {
        return res.status(400).json({ error: 'dersId ve tarih zorunlu' });
      }

      const results = [];
      for (const y of yoklamalar) {
        if (!y.ogrenciId) continue;

        const existing = await prisma.yoklama.findFirst({
          where: {
            dersId: parseInt(dersId),
            ogrenciId: parseInt(y.ogrenciId),
            tarih: new Date(tarih),
          },
        });

        if (existing) {
          const updated = await prisma.yoklama.update({
            where: { id: existing.id },
            data: { durum: y.durum || 'Var' },
          });
          results.push(updated);
        } else {
          const created = await prisma.yoklama.create({
            data: {
              dersId: parseInt(dersId),
              ogrenciId: parseInt(y.ogrenciId),
              tarih: new Date(tarih),
              durum: y.durum || 'Var',
            },
          });
          results.push(created);
        }

        // Devamsızlık sayısını güncelle
        const devamsizlikSayisi = await prisma.yoklama.count({
          where: {
            ogrenciId: parseInt(y.ogrenciId),
            dersId: parseInt(dersId),
            durum: 'Yok',
          },
        });

        await prisma.ogrenciDers.updateMany({
          where: {
            ogrenciId: parseInt(y.ogrenciId),
            dersId: parseInt(dersId),
          },
          data: { devamsizlik: devamsizlikSayisi },
        });
      }

      return res.status(201).json({ message: 'Yoklama kaydedildi', yoklamalar: results });
    }

    // Tek kayıt (eski kullanım)
    if (!dersId || !ogrenciId || !tarih || !durum) {
      return res.status(400).json({ error: 'dersId, ogrenciId, tarih ve durum zorunlu' });
    }

    const yoklama = await prisma.yoklama.create({
      data: {
        dersId: parseInt(dersId),
        ogrenciId: parseInt(ogrenciId),
        tarih: new Date(tarih),
        durum,
      },
    });

    res.status(201).json(yoklama);
  } catch (error) {
    console.error('Yoklama kaydetme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

module.exports = router;
