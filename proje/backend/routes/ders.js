const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

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
        ogretmenDers: {
          include: {
            ogretmen: true
          }
        }
      }
    });
    res.json(dersler);
  } catch (error) {
    console.error('Ders listesi hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// ID'ye göre ders getir
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const ders = await prisma.ders.findUnique({
      where: { id: parseInt(id) },
      include: {
        bolum: true,
        donem: true,
        ogretmenDers: {
          include: {
            ogretmen: true
          }
        }
      }
    });

    if (!ders) {
      return res.status(404).json({ error: 'Ders bulunamadı' });
    }

    res.json(ders);
  } catch (error) {
    console.error('Ders getirme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

module.exports = router;
