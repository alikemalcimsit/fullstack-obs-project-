const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'obs-secret-key-2024';

// Middleware: Token doğrulama
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token gerekli' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Geçersiz token' });
    }
    req.user = user;
    next();
  });
};

// Harf notu karşılıkları
const harfNotuHesapla = (puan) => {
  if (puan >= 90) return { harf: 'AA', katsayi: 4.0 };
  if (puan >= 85) return { harf: 'BA', katsayi: 3.5 };
  if (puan >= 80) return { harf: 'BB', katsayi: 3.0 };
  if (puan >= 75) return { harf: 'CB', katsayi: 2.5 };
  if (puan >= 70) return { harf: 'CC', katsayi: 2.0 };
  if (puan >= 65) return { harf: 'DC', katsayi: 1.5 };
  if (puan >= 60) return { harf: 'DD', katsayi: 1.0 };
  if (puan >= 50) return { harf: 'FD', katsayi: 0.5 };
  return { harf: 'FF', katsayi: 0.0 };
};

// T-Skoru hesapla
const tSkoruHesapla = (puan, ortalama, standartSapma) => {
  if (standartSapma === 0) return 50;
  return Math.round(50 + 10 * ((puan - ortalama) / standartSapma));
};

// Bir dersin sınavlarını getir
router.get('/ders/:dersId/sinavlar', authenticateToken, async (req, res) => {
  try {
    const { dersId } = req.params;

    const sinavlar = await prisma.sinav.findMany({
      where: { dersId: parseInt(dersId) },
      include: {
        _count: {
          select: { notlar: true }
        }
      },
      orderBy: { sinavTarihi: 'asc' }
    });

    res.json(sinavlar);
  } catch (error) {
    console.error('Sınavlar getirme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Yeni sınav oluştur
router.post('/sinav', authenticateToken, async (req, res) => {
  try {
    const { dersId, sinavAdi, sinavTuru, sinavTarihi, sure, agirlik } = req.body;

    if (!dersId || !sinavTuru) {
      return res.status(400).json({ error: 'Ders ID ve sınav türü zorunludur' });
    }

    const sinav = await prisma.sinav.create({
      data: {
        dersId: parseInt(dersId),
        sinavAdi: sinavAdi || `${sinavTuru} Sınavı`,
        sinavTuru,
        sinavTarihi: sinavTarihi ? new Date(sinavTarihi) : new Date(),
        sure: sure || 60,
        agirlik: agirlik || 0.5
      }
    });

    res.status(201).json(sinav);
  } catch (error) {
    console.error('Sınav oluşturma hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Sınav sil
router.delete('/sinav/:sinavId', authenticateToken, async (req, res) => {
  try {
    const { sinavId } = req.params;

    // Önce ilgili notları sil
    await prisma.not.deleteMany({
      where: { sinavId: parseInt(sinavId) }
    });

    // Sonra sınavı sil
    await prisma.sinav.delete({
      where: { id: parseInt(sinavId) }
    });

    res.json({ message: 'Sınav silindi' });
  } catch (error) {
    console.error('Sınav silme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Bir sınavın notlarını getir
router.get('/sinav/:sinavId/notlar', authenticateToken, async (req, res) => {
  try {
    const { sinavId } = req.params;

    const notlar = await prisma.not.findMany({
      where: { sinavId: parseInt(sinavId) },
      include: {
        ogrenci: {
          select: { id: true, ogrNo: true, isim: true, soyad: true }
        }
      }
    });

    res.json(notlar);
  } catch (error) {
    console.error('Notlar getirme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Bir dersin tüm öğrencilerinin tüm notlarını getir
router.get('/ders/:dersId/tumnotlar', authenticateToken, async (req, res) => {
  try {
    const { dersId } = req.params;

    // Dersin sınavlarını al
    const sinavlar = await prisma.sinav.findMany({
      where: { dersId: parseInt(dersId) },
      orderBy: { sinavTarihi: 'asc' }
    });

    // Dersi alan öğrencileri al
    const ogrenciDersler = await prisma.ogrenciDers.findMany({
      where: { dersId: parseInt(dersId) },
      include: {
        ogrenci: {
          select: { id: true, ogrNo: true, isim: true, soyad: true }
        }
      }
    });

    // Her öğrenci için tüm sınavların notlarını al
    const sonuc = await Promise.all(ogrenciDersler.map(async (od) => {
      const notlar = await prisma.not.findMany({
        where: {
          ogrenciId: od.ogrenci.id,
          sinavId: { in: sinavlar.map(s => s.id) }
        }
      });

      // Sınav notlarını map'le
      const notlarMap = {};
      let toplamAgirlikliNot = 0;
      let toplamAgirlik = 0;

      sinavlar.forEach(sinav => {
        const not = notlar.find(n => n.sinavId === sinav.id);
        notlarMap[sinav.id] = not ? not.puan : null;
        if (not && sinav.agirlik) {
          toplamAgirlikliNot += not.puan * sinav.agirlik;
          toplamAgirlik += sinav.agirlik;
        }
      });

      // Dönem sonu ortalaması
      const donemOrtalama = toplamAgirlik > 0 ? toplamAgirlikliNot / toplamAgirlik : null;
      const harfNotu = donemOrtalama !== null ? harfNotuHesapla(donemOrtalama) : null;

      return {
        ogrenciId: od.ogrenci.id,
        ogrNo: od.ogrenci.ogrNo,
        isim: od.ogrenci.isim,
        soyad: od.ogrenci.soyad,
        notlar: notlarMap,
        donemOrtalama: donemOrtalama ? Math.round(donemOrtalama * 100) / 100 : null,
        harfNotu: harfNotu?.harf,
        katsayi: harfNotu?.katsayi
      };
    }));

    res.json({
      sinavlar,
      ogrenciler: sonuc
    });
  } catch (error) {
    console.error('Tüm notlar getirme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Tek not kaydet/güncelle
router.post('/not', authenticateToken, async (req, res) => {
  try {
    const { ogrenciId, sinavId, puan } = req.body;

    if (!ogrenciId || !sinavId || puan === undefined) {
      return res.status(400).json({ error: 'Öğrenci ID, sınav ID ve puan zorunludur' });
    }

    // Mevcut not var mı kontrol et
    const mevcutNot = await prisma.not.findFirst({
      where: {
        ogrenciId: parseInt(ogrenciId),
        sinavId: parseInt(sinavId)
      }
    });

    let not;
    if (mevcutNot) {
      // Güncelle
      not = await prisma.not.update({
        where: { id: mevcutNot.id },
        data: { puan: parseFloat(puan) }
      });
    } else {
      // Yeni oluştur
      not = await prisma.not.create({
        data: {
          ogrenciId: parseInt(ogrenciId),
          sinavId: parseInt(sinavId),
          puan: parseFloat(puan)
        }
      });
    }

    res.json(not);
  } catch (error) {
    console.error('Not kaydetme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Toplu not kaydet
router.post('/toplu', authenticateToken, async (req, res) => {
  try {
    const { notlar } = req.body; // [{ ogrenciId, sinavId, puan }, ...]

    if (!notlar || !Array.isArray(notlar)) {
      return res.status(400).json({ error: 'Notlar dizisi zorunludur' });
    }

    const sonuclar = await Promise.all(notlar.map(async (not) => {
      const mevcutNot = await prisma.not.findFirst({
        where: {
          ogrenciId: parseInt(not.ogrenciId),
          sinavId: parseInt(not.sinavId)
        }
      });

      if (mevcutNot) {
        return await prisma.not.update({
          where: { id: mevcutNot.id },
          data: { puan: parseFloat(not.puan) }
        });
      } else {
        return await prisma.not.create({
          data: {
            ogrenciId: parseInt(not.ogrenciId),
            sinavId: parseInt(not.sinavId),
            puan: parseFloat(not.puan)
          }
        });
      }
    }));

    res.json({ message: 'Notlar kaydedildi', count: sonuclar.length });
  } catch (error) {
    console.error('Toplu not kaydetme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// T-Skoru hesapla ve kaydet
router.post('/sinav/:sinavId/tskor', authenticateToken, async (req, res) => {
  try {
    const { sinavId } = req.params;

    // Sınavın notlarını al
    const notlar = await prisma.not.findMany({
      where: { sinavId: parseInt(sinavId) },
      include: {
        ogrenci: {
          select: { id: true, ogrNo: true, isim: true, soyad: true }
        }
      }
    });

    if (notlar.length === 0) {
      return res.status(400).json({ error: 'Bu sınavda not bulunamadı' });
    }

    // Ortalama hesapla
    const puanlar = notlar.map(n => n.puan);
    const ortalama = puanlar.reduce((a, b) => a + b, 0) / puanlar.length;

    // Standart sapma hesapla
    const varyans = puanlar.reduce((sum, puan) => sum + Math.pow(puan - ortalama, 2), 0) / puanlar.length;
    const standartSapma = Math.sqrt(varyans);

    // T-Skorları hesapla
    const tSkorlar = notlar.map(not => {
      const tSkor = tSkoruHesapla(not.puan, ortalama, standartSapma);
      const harfNotu = harfNotuHesapla(tSkor);
      
      return {
        ogrenciId: not.ogrenci.id,
        ogrNo: not.ogrenci.ogrNo,
        isim: not.ogrenci.isim,
        soyad: not.ogrenci.soyad,
        puan: not.puan,
        tSkor,
        harfNotu: harfNotu.harf,
        katsayi: harfNotu.katsayi
      };
    });

    res.json({
      sinavId: parseInt(sinavId),
      ortalama: Math.round(ortalama * 100) / 100,
      standartSapma: Math.round(standartSapma * 100) / 100,
      ogrenciSayisi: notlar.length,
      tSkorlar: tSkorlar.sort((a, b) => b.tSkor - a.tSkor)
    });
  } catch (error) {
    console.error('T-Skor hesaplama hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Sınav istatistikleri
router.get('/sinav/:sinavId/istatistik', authenticateToken, async (req, res) => {
  try {
    const { sinavId } = req.params;

    const notlar = await prisma.not.findMany({
      where: { sinavId: parseInt(sinavId) }
    });

    if (notlar.length === 0) {
      return res.json({
        ogrenciSayisi: 0,
        ortalama: 0,
        enYuksek: 0,
        enDusuk: 0,
        standartSapma: 0,
        gecenSayisi: 0,
        kalanSayisi: 0
      });
    }

    const puanlar = notlar.map(n => n.puan);
    const ortalama = puanlar.reduce((a, b) => a + b, 0) / puanlar.length;
    const enYuksek = Math.max(...puanlar);
    const enDusuk = Math.min(...puanlar);
    const varyans = puanlar.reduce((sum, puan) => sum + Math.pow(puan - ortalama, 2), 0) / puanlar.length;
    const standartSapma = Math.sqrt(varyans);
    const gecenSayisi = puanlar.filter(p => p >= 50).length;
    const kalanSayisi = puanlar.filter(p => p < 50).length;

    // Harf notu dağılımı
    const harfDagilimi = {};
    puanlar.forEach(puan => {
      const { harf } = harfNotuHesapla(puan);
      harfDagilimi[harf] = (harfDagilimi[harf] || 0) + 1;
    });

    res.json({
      ogrenciSayisi: notlar.length,
      ortalama: Math.round(ortalama * 100) / 100,
      enYuksek,
      enDusuk,
      standartSapma: Math.round(standartSapma * 100) / 100,
      gecenSayisi,
      kalanSayisi,
      harfDagilimi
    });
  } catch (error) {
    console.error('İstatistik hesaplama hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Öğrencinin bir dersteki notlarını getir
router.get('/ogrenci/:ogrenciId/ders/:dersId', authenticateToken, async (req, res) => {
  try {
    const { ogrenciId, dersId } = req.params;

    const sinavlar = await prisma.sinav.findMany({
      where: { dersId: parseInt(dersId) },
      include: {
        notlar: {
          where: { ogrenciId: parseInt(ogrenciId) }
        }
      },
      orderBy: { sinavTarihi: 'asc' }
    });

    const sonuc = sinavlar.map(sinav => ({
      sinavId: sinav.id,
      sinavAdi: sinav.sinavAdi,
      sinavTuru: sinav.sinavTuru,
      sinavTarihi: sinav.sinavTarihi,
      agirlik: sinav.agirlik,
      puan: sinav.notlar[0]?.puan || null
    }));

    res.json(sonuc);
  } catch (error) {
    console.error('Öğrenci notları getirme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

module.exports = router;
