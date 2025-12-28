const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Tüm bölümleri getir
router.get('/', async (req, res) => {
  try {
    const bolumler = await prisma.bolum.findMany({
      include: {
        fakulte: true,
        _count: { select: { ogrenciler: true, ogretmenler: true, dersler: true } }
      },
      orderBy: { bolumAdi: 'asc' }
    });
    
    res.json(bolumler.map(b => ({
      ...b,
      ogrenciSayisi: b._count.ogrenciler,
      ogretmenSayisi: b._count.ogretmenler,
      dersSayisi: b._count.dersler
    })));
  } catch (error) {
    console.error('Bölüm listesi hatası:', error);
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
        fakulte: true
      }
    });

    if (!bolum) {
      return res.status(404).json({ error: 'Bölüm bulunamadı' });
    }

    res.json(bolum);
  } catch (error) {
    console.error('Bölüm getirme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

module.exports = router;
