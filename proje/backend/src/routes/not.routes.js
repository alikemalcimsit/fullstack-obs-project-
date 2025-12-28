const express = require('express');
const prisma = require('../config/database');
const { authMiddleware } = require('../config/auth');
const tSkoru = require('../utils/tSkoru');

const router = express.Router();

// Öğrencinin notlarını getir
router.get('/ogrenci/:ogrNo', async (req, res) => {
  try {
    const { ogrNo } = req.params;

    const ogrenci = await prisma.ogrenci.findUnique({
      where: { ogrNo },
    });

    if (!ogrenci) {
      return res.status(404).json({ error: 'Öğrenci bulunamadı' });
    }

    const notlar = await prisma.not.findMany({
      where: { ogrenciId: ogrenci.id },
      include: {
        sinav: {
          include: {
            ders: {
              include: {
                donem: true,
              },
            },
          },
        },
      },
      orderBy: {
        sinav: {
          sinavTarihi: 'desc',
        },
      },
    });

    // Derslere göre grupla
    const dersNotlar = {};
    notlar.forEach(n => {
      const dersId = n.sinav.dersId;
      if (!dersNotlar[dersId]) {
        dersNotlar[dersId] = {
          ders: n.sinav.ders,
          sinavlar: [],
        };
      }
      dersNotlar[dersId].sinavlar.push({
        sinavId: n.sinavId,
        sinavAdi: n.sinav.sinavAdi,
        sinavTuru: n.sinav.sinavTuru,
        sinavTarihi: n.sinav.sinavTarihi,
        puan: n.puan,
      });
    });

    res.json({ 
      notlar, 
      dersNotlar: Object.values(dersNotlar),
    });
  } catch (error) {
    console.error('Not listesi hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Belirli bir derse ait notları getir
router.get('/ogrenci/:ogrNo/ders/:dersId', async (req, res) => {
  try {
    const { ogrNo, dersId } = req.params;

    const ogrenci = await prisma.ogrenci.findUnique({
      where: { ogrNo },
    });

    if (!ogrenci) {
      return res.status(404).json({ error: 'Öğrenci bulunamadı' });
    }

    const sinavlar = await prisma.sinav.findMany({
      where: { dersId: parseInt(dersId) },
      include: {
        notlar: {
          where: { ogrenciId: ogrenci.id },
        },
        ders: true,
      },
      orderBy: { sinavTarihi: 'asc' },
    });

    const notlar = sinavlar.map(s => ({
      sinavId: s.id,
      sinavAdi: s.sinavAdi,
      sinavTuru: s.sinavTuru,
      sinavTarihi: s.sinavTarihi,
      puan: s.notlar.length > 0 ? s.notlar[0].puan : null,
    }));

    // Ortalama hesapla
    const vizeler = notlar.filter(n => n.sinavTuru === 'Vize' && n.puan !== null);
    const finaller = notlar.filter(n => n.sinavTuru === 'Final' && n.puan !== null);
    const butunlemeler = notlar.filter(n => n.sinavTuru === 'Bütünleme' && n.puan !== null);

    const vizeOrtalama = vizeler.length > 0 
      ? vizeler.reduce((sum, v) => sum + v.puan, 0) / vizeler.length 
      : null;
    
    const finalNotu = finaller.length > 0 ? finaller[0].puan : null;
    const butunlemeNotu = butunlemeler.length > 0 ? butunlemeler[0].puan : null;

    // Geçme notu hesaplama (vize %40, final %60)
    let genelOrtalama = null;
    let kullanılanFinal = finalNotu;
    
    if (butunlemeNotu !== null && (finalNotu === null || butunlemeNotu > finalNotu)) {
      kullanılanFinal = butunlemeNotu;
    }
    
    if (vizeOrtalama !== null && kullanılanFinal !== null) {
      genelOrtalama = (vizeOrtalama * 0.4) + (kullanılanFinal * 0.6);
    }

    res.json({ 
      notlar,
      ozet: {
        vizeOrtalama,
        finalNotu,
        butunlemeNotu,
        genelOrtalama,
        harfNotu: calculateHarfNotu(genelOrtalama),
      },
    });
  } catch (error) {
    console.error('Ders not hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Harf notu hesapla
function calculateHarfNotu(ortalama) {
  if (ortalama === null) return '-';
  if (ortalama >= 90) return 'AA';
  if (ortalama >= 85) return 'BA';
  if (ortalama >= 80) return 'BB';
  if (ortalama >= 75) return 'CB';
  if (ortalama >= 70) return 'CC';
  if (ortalama >= 65) return 'DC';
  if (ortalama >= 60) return 'DD';
  if (ortalama >= 50) return 'FD';
  return 'FF';
}

// Bir dersin sınavlarını getir
router.get('/ders/:dersId/sinavlar', async (req, res) => {
  try {
    const { dersId } = req.params;

    const sinavlar = await prisma.sinav.findMany({
      where: { dersId: parseInt(dersId) },
      include: {
        ders: true,
      },
      orderBy: { sinavTarihi: 'asc' },
    });

    res.json({ sinavlar });
  } catch (error) {
    console.error('Sınav listesi hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Bir sınavın tüm notlarını getir (öğretmen için)
router.get('/sinav/:sinavId', async (req, res) => {
  try {
    const { sinavId } = req.params;

    const notlar = await prisma.not.findMany({
      where: { sinavId: parseInt(sinavId) },
      include: {
        ogrenci: {
          select: { id: true, ogrNo: true, isim: true, soyad: true },
        },
        sinav: {
          include: { ders: true },
        },
      },
      orderBy: { ogrenci: { ogrNo: 'asc' } },
    });

    // İstatistikler
    const puanlar = notlar.map(n => n.puan);
    const stats = {
      ortalama: puanlar.length > 0 ? puanlar.reduce((a, b) => a + b, 0) / puanlar.length : 0,
      enYuksek: puanlar.length > 0 ? Math.max(...puanlar) : 0,
      enDusuk: puanlar.length > 0 ? Math.min(...puanlar) : 0,
      ogrenciSayisi: puanlar.length,
    };

    res.json({ notlar, istatistikler: stats });
  } catch (error) {
    console.error('Sınav notları hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Not girişi (öğretmen için)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { sinavId, notlar } = req.body;

    if (!sinavId || !notlar || !Array.isArray(notlar)) {
      return res.status(400).json({ error: 'Geçersiz veri formatı' });
    }

    const results = [];
    for (const n of notlar) {
      const existingNot = await prisma.not.findFirst({
        where: {
          ogrenciId: n.ogrenciId,
          sinavId: parseInt(sinavId),
        },
      });

      if (existingNot) {
        const updated = await prisma.not.update({
          where: { id: existingNot.id },
          data: { puan: n.puan },
        });
        results.push(updated);
      } else {
        const created = await prisma.not.create({
          data: {
            ogrenciId: n.ogrenciId,
            sinavId: parseInt(sinavId),
            puan: n.puan,
          },
        });
        results.push(created);
      }
    }

    res.status(201).json({ message: 'Notlar kaydedildi', notlar: results });
  } catch (error) {
    console.error('Not kaydetme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Bir sınavın tüm notlarını getir (öğretmen için)
router.get('/sinav/:sinavId/notlar', authMiddleware, async (req, res) => {
  try {
    const { sinavId } = req.params;
    const notlar = await prisma.not.findMany({
      where: { sinavId: parseInt(sinavId) },
      include: {
        ogrenci: {
          select: { id: true, ogrNo: true, isim: true, soyad: true },
        },
      },
      orderBy: { ogrenci: { ogrNo: 'asc' } },
    });

    res.json({ notlar });
  } catch (error) {
    console.error('Sınav notları getirme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Tek not güncelle
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { puan } = req.body;

    if (puan === undefined || puan < 0 || puan > 100) {
      return res.status(400).json({ error: 'Geçersiz puan (0-100 arası olmalı)' });
    }

    const not = await prisma.not.update({
      where: { id: parseInt(id) },
      data: { puan },
    });

    res.json({ message: 'Not güncellendi', not });
  } catch (error) {
    console.error('Not güncelleme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Sınav oluştur (öğretmen için)
router.post('/sinav', authMiddleware, async (req, res) => {
  try {
    const { sinavAdi, dersId, sinavTarihi, sinavTuru, sure, agirlik } = req.body;

    if (!sinavAdi || !dersId || !sinavTarihi || !sinavTuru) {
      return res.status(400).json({ error: 'Tüm alanlar zorunludur' });
    }

    // Varsayılan / zorunlu ağırlıklar
    let defaultAgirlik = 0.4;
    if (sinavTuru === 'Final' || sinavTuru === 'Bütünleme') {
      // İş kuralı: Final ve Bütünleme %60
      defaultAgirlik = 0.6;
    }

    const sinav = await prisma.sinav.create({
      data: {
        sinavAdi,
        dersId: parseInt(dersId),
        sinavTarihi: new Date(sinavTarihi),
        sinavTuru,
        sure: sure ? parseInt(sure) : null,
        // Final/Bütünleme için gelen agirlik ne olursa olsun 0.6 uygulanır
        agirlik: (sinavTuru === 'Final' || sinavTuru === 'Bütünleme') ? 0.6 : (agirlik || defaultAgirlik),
        notlarAcikMi: false,
        harfNotuAcikMi: false,
      },
    });

    res.status(201).json({ message: 'Sınav oluşturuldu', sinav });
  } catch (error) {
    console.error('Sınav oluşturma hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// =====================================================
// T-SKORU VE BAĞIL DEĞERLENDİRME İŞLEMLERİ
// =====================================================

// T-Skoru hesapla ve harf notlarını belirle (öğretmen için)
router.post('/sinav/:sinavId/t-skoru-hesapla', authMiddleware, async (req, res) => {
  try {
    const { sinavId } = req.params;

    // Sınav notlarını getir
    const notlar = await prisma.not.findMany({
      where: { sinavId: parseInt(sinavId) },
      include: {
        ogrenci: {
          select: { id: true, ogrNo: true, isim: true, soyad: true },
        },
      },
    });

    if (notlar.length === 0) {
      return res.status(400).json({ error: 'Bu sınav için henüz not girilmemiş' });
    }

    // T-Skoru hesapla
    const notVerileri = notlar.map(n => ({
      ogrenciId: n.ogrenciId,
      puan: n.puan,
    }));

    const hesaplama = tSkoru.sinifNotlariniHesapla(notVerileri);

    // Sınav istatistiklerini güncelle
    await prisma.sinav.update({
      where: { id: parseInt(sinavId) },
      data: {
        ortalama: hesaplama.ortalama,
        standartSapma: hesaplama.standartSapma,
      },
    });

    // Her öğrencinin notunu güncelle
    for (const sonuc of hesaplama.sonuclar) {
      await prisma.not.updateMany({
        where: {
          sinavId: parseInt(sinavId),
          ogrenciId: sonuc.ogrenciId,
        },
        data: {
          tSkoru: sonuc.tSkoru,
          harfNotu: sonuc.harfNotu,
        },
      });
    }

    // Güncel notları getir
    const guncelNotlar = await prisma.not.findMany({
      where: { sinavId: parseInt(sinavId) },
      include: {
        ogrenci: {
          select: { id: true, ogrNo: true, isim: true, soyad: true },
        },
      },
      orderBy: { tSkoru: 'desc' },
    });

    // Dağılım istatistikleri
    const harfNotlari = guncelNotlar.map(n => n.harfNotu).filter(h => h);
    const dagilim = tSkoru.notDagilimIstatistikleri(harfNotlari);

    res.json({
      message: 'T-Skoru hesaplandı ve harf notları belirlendi',
      istatistikler: {
        ortalama: hesaplama.ortalama,
        standartSapma: hesaplama.standartSapma,
        ogrenciSayisi: hesaplama.ogrenciSayisi,
      },
      dagilim,
      notlar: guncelNotlar,
    });
  } catch (error) {
    console.error('T-Skoru hesaplama hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Notları öğrencilere aç/kapat (öğretmen için)
router.put('/sinav/:sinavId/notlari-ac', authMiddleware, async (req, res) => {
  try {
    const { sinavId } = req.params;
    const { acikMi } = req.body;

    const sinav = await prisma.sinav.update({
      where: { id: parseInt(sinavId) },
      data: { notlarAcikMi: acikMi === true },
    });

    res.json({ 
      message: acikMi ? 'Notlar öğrencilere açıldı' : 'Notlar kapatıldı',
      sinav,
    });
  } catch (error) {
    console.error('Not açma/kapama hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Harf notunu açıkla (öğretmen için)
router.put('/sinav/:sinavId/harf-notu-acikla', authMiddleware, async (req, res) => {
  try {
    const { sinavId } = req.params;

    // Önce T-Skoru hesaplanmış mı kontrol et
    const sinav = await prisma.sinav.findUnique({
      where: { id: parseInt(sinavId) },
    });

    if (!sinav) {
      return res.status(404).json({ error: 'Sınav bulunamadı' });
    }

    if (sinav.ortalama === null || sinav.standartSapma === null) {
      return res.status(400).json({ 
        error: 'Önce T-Skoru hesaplaması yapılmalıdır' 
      });
    }

    const updatedSinav = await prisma.sinav.update({
      where: { id: parseInt(sinavId) },
      data: { harfNotuAcikMi: true },
    });

    res.json({ 
      message: 'Harf notları öğrencilere açıklandı',
      sinav: updatedSinav,
    });
  } catch (error) {
    console.error('Harf notu açıklama hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Notu geri çek (öğretmen için)
router.put('/geri-cek/:notId', authMiddleware, async (req, res) => {
  try {
    const { notId } = req.params;
    const { aciklama } = req.body;

    const not = await prisma.not.update({
      where: { id: parseInt(notId) },
      data: { 
        geriCekildiMi: true,
        geriCekmeTarihi: new Date(),
        aciklama: aciklama || 'Not öğretmen tarafından geri çekildi',
      },
    });

    res.json({ 
      message: 'Not geri çekildi',
      not,
    });
  } catch (error) {
    console.error('Not geri çekme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Geri çekilen notu tekrar yayınla
router.put('/tekrar-yayinla/:notId', authMiddleware, async (req, res) => {
  try {
    const { notId } = req.params;

    const not = await prisma.not.update({
      where: { id: parseInt(notId) },
      data: { 
        geriCekildiMi: false,
        geriCekmeTarihi: null,
        aciklama: null,
      },
    });

    res.json({ 
      message: 'Not tekrar yayınlandı',
      not,
    });
  } catch (error) {
    console.error('Not yayınlama hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Öğretmenin verdiği dersleri getir
router.get('/ogretmen/:ogretmenId/dersler', async (req, res) => {
  try {
    const { ogretmenId } = req.params;

    const ogretmenDersler = await prisma.ogretmenDers.findMany({
      where: { ogretmenId: parseInt(ogretmenId) },
      include: {
        ders: {
          include: {
            bolum: true,
            donem: true,
            sinavlar: {
              orderBy: { sinavTarihi: 'desc' },
            },
          },
        },
      },
    });

    res.json({ dersler: ogretmenDersler.map(od => od.ders) });
  } catch (error) {
    console.error('Öğretmen dersleri hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Dersin öğrenci listesini getir (not girişi için)
router.get('/ders/:dersId/ogrenciler', async (req, res) => {
  try {
    const { dersId } = req.params;

    const ogrenciDersler = await prisma.ogrenciDers.findMany({
      where: { dersId: parseInt(dersId) },
      include: {
        ogrenci: {
          select: { 
            id: true, 
            ogrNo: true, 
            isim: true, 
            soyad: true,
            email: true,
          },
        },
      },
      orderBy: { ogrenci: { ogrNo: 'asc' } },
    });

    res.json({ 
      ogrenciler: ogrenciDersler.map(od => od.ogrenci),
      toplamOgrenci: ogrenciDersler.length,
    });
  } catch (error) {
    console.error('Ders öğrencileri hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Ders dönem sonu değerlendirmesi (tüm sınavların ağırlıklı ortalaması)
router.get('/ders/:dersId/donem-degerlendirme', async (req, res) => {
  try {
    const { dersId } = req.params;

    // Dersin tüm sınavlarını getir
    const sinavlar = await prisma.sinav.findMany({
      where: { dersId: parseInt(dersId) },
      include: {
        notlar: {
          include: {
            ogrenci: {
              select: { id: true, ogrNo: true, isim: true, soyad: true },
            },
          },
        },
      },
    });

    // Dersin öğrencilerini getir
    const ogrenciDersler = await prisma.ogrenciDers.findMany({
      where: { dersId: parseInt(dersId) },
      include: {
        ogrenci: {
          select: { id: true, ogrNo: true, isim: true, soyad: true },
        },
      },
    });

    // Her öğrenci için ağırlıklı ortalama hesapla
    const degerlendirmeler = ogrenciDersler.map(od => {
      const ogrenci = od.ogrenci;
      let agirlikliToplam = 0;
      let toplamAgirlik = 0;

      sinavlar.forEach(sinav => {
        const not = sinav.notlar.find(n => n.ogrenciId === ogrenci.id);
        if (not && !not.geriCekildiMi) {
          agirlikliToplam += not.puan * sinav.agirlik;
          toplamAgirlik += sinav.agirlik;
        }
      });

      const donemNotu = toplamAgirlik > 0 ? agirlikliToplam / toplamAgirlik : null;
      
      return {
        ogrenci,
        donemNotu: donemNotu !== null ? parseFloat(donemNotu.toFixed(2)) : null,
        sinavlar: sinavlar.map(s => {
          const not = s.notlar.find(n => n.ogrenciId === ogrenci.id);
          return {
            sinavId: s.id,
            sinavAdi: s.sinavAdi,
            sinavTuru: s.sinavTuru,
            agirlik: s.agirlik,
            puan: not ? not.puan : null,
            tSkoru: not ? not.tSkoru : null,
            harfNotu: not ? not.harfNotu : null,
          };
        }),
      };
    });

    res.json({ degerlendirmeler });
  } catch (error) {
    console.error('Dönem değerlendirmesi hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

module.exports = router;
