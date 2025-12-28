const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Tüm duyuruları getir
router.get('/', async (req, res) => {
  try {
    const duyurular = await prisma.duyuru.findMany({
      include: {
        ogretmen: {
          select: { ad: true, soyad: true }
        }
      },
      orderBy: {
        tarih: 'desc'
      }
    });
    res.json(duyurular);
  } catch (error) {
    console.error('Duyuru listesi hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Duyuru oluştur
router.post('/', async (req, res) => {
  try {
    const { baslik, icerik, ogretmenId } = req.body;
    
    const duyuru = await prisma.duyuru.create({
      data: {
        baslik,
        icerik,
        ogretmenId: parseInt(ogretmenId),
        tarih: new Date()
      }
    });
    
    res.status(201).json(duyuru);
  } catch (error) {
    console.error('Duyuru oluşturma hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

module.exports = router;
