const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Tüm mesajları getir (ogrenci için)
router.get('/ogrenci/:ogrenciId', async (req, res) => {
  try {
    const { ogrenciId } = req.params;
    
    const mesajlar = await prisma.mesaj.findMany({
      where: {
        OR: [
          { gonderenOgrenciId: parseInt(ogrenciId) },
          { aliciOgrenciId: parseInt(ogrenciId) }
        ]
      },
      include: {
        gonderenOgrenci: {
          select: { ad: true, soyad: true, ogrNo: true }
        },
        aliciOgrenci: {
          select: { ad: true, soyad: true, ogrNo: true }
        },
        gonderenOgretmen: {
          select: { ad: true, soyad: true, email: true }
        },
        aliciOgretmen: {
          select: { ad: true, soyad: true, email: true }
        }
      },
      orderBy: {
        tarih: 'desc'
      }
    });
    res.json(mesajlar);
  } catch (error) {
    console.error('Mesaj listesi hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Mesaj gönder
router.post('/', async (req, res) => {
  try {
    const { gonderenOgrenciId, gonderenOgretmenId, aliciOgrenciId, aliciOgretmenId, konu, icerik } = req.body;
    
    const mesaj = await prisma.mesaj.create({
      data: {
        gonderenOgrenciId: gonderenOgrenciId ? parseInt(gonderenOgrenciId) : null,
        gonderenOgretmenId: gonderenOgretmenId ? parseInt(gonderenOgretmenId) : null,
        aliciOgrenciId: aliciOgrenciId ? parseInt(aliciOgrenciId) : null,
        aliciOgretmenId: aliciOgretmenId ? parseInt(aliciOgretmenId) : null,
        konu,
        icerik,
        tarih: new Date(),
        okundu: false
      }
    });
    
    res.status(201).json(mesaj);
  } catch (error) {
    console.error('Mesaj gönderme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Mesajı okundu olarak işaretle
router.put('/:id/okundu', async (req, res) => {
  try {
    const { id } = req.params;
    
    const mesaj = await prisma.mesaj.update({
      where: { id: parseInt(id) },
      data: { okundu: true }
    });
    
    res.json(mesaj);
  } catch (error) {
    console.error('Mesaj güncelleme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

module.exports = router;
