const express = require('express');
const prisma = require('../config/database');
const { authMiddleware } = require('../config/auth');

const router = express.Router();

// Tüm duyuruları getir
router.get('/', async (req, res) => {
  try {
    const { limit, aktif } = req.query;

    const where = {};
    if (aktif !== undefined) {
      where.aktif = aktif === 'true';
    }

    const duyurular = await prisma.duyuru.findMany({
      where,
      orderBy: { yayinTarihi: 'desc' },
      take: limit ? parseInt(limit) : undefined,
    });

    res.json({ duyurular });
  } catch (error) {
    console.error('Duyuru listesi hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Önemli duyuruları getir
router.get('/onemli', async (req, res) => {
  try {
    const duyurular = await prisma.duyuru.findMany({
      where: { 
        onemliMi: true,
        aktif: true,
      },
      orderBy: { yayinTarihi: 'desc' },
      take: 5,
    });

    res.json({ duyurular });
  } catch (error) {
    console.error('Önemli duyuru listesi hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Duyuru detayı getir
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const duyuru = await prisma.duyuru.findUnique({
      where: { id: parseInt(id) },
    });

    if (!duyuru) {
      return res.status(404).json({ error: 'Duyuru bulunamadı' });
    }

    res.json({ duyuru });
  } catch (error) {
    console.error('Duyuru detay hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Yeni duyuru ekle (sadece yetkililer)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { baslik, icerik, onemliMi } = req.body;

    if (!baslik || !icerik) {
      return res.status(400).json({ error: 'Başlık ve içerik zorunludur' });
    }

    const duyuru = await prisma.duyuru.create({
      data: {
        baslik,
        icerik,
        onemliMi: onemliMi || false,
      },
    });

    res.status(201).json({ message: 'Duyuru oluşturuldu', duyuru });
  } catch (error) {
    console.error('Duyuru ekleme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Duyuru güncelle
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { baslik, icerik, onemliMi, aktif } = req.body;

    const duyuru = await prisma.duyuru.update({
      where: { id: parseInt(id) },
      data: {
        ...(baslik && { baslik }),
        ...(icerik && { icerik }),
        ...(onemliMi !== undefined && { onemliMi }),
        ...(aktif !== undefined && { aktif }),
      },
    });

    res.json({ message: 'Duyuru güncellendi', duyuru });
  } catch (error) {
    console.error('Duyuru güncelleme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Duyuru sil
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.duyuru.delete({
      where: { id: parseInt(id) },
    });

    res.json({ message: 'Duyuru silindi' });
  } catch (error) {
    console.error('Duyuru silme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

module.exports = router;
