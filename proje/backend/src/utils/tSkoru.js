/**
 * T-SKORU VE BAĞIL DEĞERLENDİRME SİSTEMİ
 * 
 * Atatürk Üniversitesi Yönetmeliğine göre bağıl değerlendirme sistemi
 * 
 * T-Skoru Formülü: T = 50 + 10 * ((X - μ) / σ)
 * X: Öğrencinin ham puanı
 * μ (mu): Sınıf ortalaması
 * σ (sigma): Standart sapma
 * 
 * Harf Notu Karşılıkları:
 * AA: 4.00 (90-100 veya T >= 70)
 * BA: 3.50 (85-89 veya T >= 65)
 * BB: 3.00 (80-84 veya T >= 60)
 * CB: 2.50 (75-79 veya T >= 55)
 * CC: 2.00 (70-74 veya T >= 50)
 * DC: 1.50 (65-69 veya T >= 45)
 * DD: 1.00 (60-64 veya T >= 40)
 * FF: 0.00 (0-59 veya T < 40)
 */

// Harf notu ağırlık katsayıları
const HARF_NOTU_KATSAYILARI = {
  'AA': 4.00,
  'BA': 3.50,
  'BB': 3.00,
  'CB': 2.50,
  'CC': 2.00,
  'DC': 1.50,
  'DD': 1.00,
  'FF': 0.00,
  'M': null,  // Muaf - AGNO'ya katılmaz
  'G': null,  // Geçer - AGNO'ya katılmaz
  'Z': 0.00   // Devamsız - FF gibi işlem görür
};

// T-Skoru → Harf Notu eşleştirmesi
const T_SKORU_HARF_NOTU = [
  { min: 70, max: 100, harf: 'AA' },
  { min: 65, max: 69.99, harf: 'BA' },
  { min: 60, max: 64.99, harf: 'BB' },
  { min: 55, max: 59.99, harf: 'CB' },
  { min: 50, max: 54.99, harf: 'CC' },
  { min: 45, max: 49.99, harf: 'DC' },
  { min: 40, max: 44.99, harf: 'DD' },
  { min: 0, max: 39.99, harf: 'FF' }
];

/**
 * Ortalama hesapla
 * @param {number[]} notlar - Ham puanlar dizisi
 * @returns {number} Ortalama
 */
function hesaplaOrtalama(notlar) {
  if (!notlar || notlar.length === 0) return 0;
  const toplam = notlar.reduce((acc, not) => acc + not, 0);
  return toplam / notlar.length;
}

/**
 * Standart sapma hesapla
 * @param {number[]} notlar - Ham puanlar dizisi
 * @param {number} ortalama - Sınıf ortalaması
 * @returns {number} Standart sapma
 */
function hesaplaStandartSapma(notlar, ortalama) {
  if (!notlar || notlar.length <= 1) return 0;
  
  const kareleriToplami = notlar.reduce((acc, not) => {
    return acc + Math.pow(not - ortalama, 2);
  }, 0);
  
  return Math.sqrt(kareleriToplami / (notlar.length - 1));
}

/**
 * T-Skoru hesapla
 * @param {number} hamPuan - Öğrencinin ham puanı
 * @param {number} ortalama - Sınıf ortalaması
 * @param {number} standartSapma - Standart sapma
 * @returns {number} T-Skoru
 */
function hesaplaTSkoru(hamPuan, ortalama, standartSapma) {
  // Standart sapma 0 ise (tüm notlar aynı), T-Skoru 50 olarak döndür
  if (standartSapma === 0) {
    return 50;
  }
  
  const tSkoru = 50 + 10 * ((hamPuan - ortalama) / standartSapma);
  
  // T-Skoru 0-100 arasında sınırla
  return Math.max(0, Math.min(100, tSkoru));
}

/**
 * T-Skoru'na göre harf notu belirle
 * @param {number} tSkoru - T-Skoru
 * @returns {string} Harf notu
 */
function tSkorunaGoreHarfNotu(tSkoru) {
  for (const aralik of T_SKORU_HARF_NOTU) {
    if (tSkoru >= aralik.min && tSkoru <= aralik.max) {
      return aralik.harf;
    }
  }
  return 'FF';
}

/**
 * Harf notunun ağırlık katsayısını getir
 * @param {string} harfNotu - Harf notu
 * @returns {number|null} Ağırlık katsayısı
 */
function getHarfNotuKatsayisi(harfNotu) {
  return HARF_NOTU_KATSAYILARI[harfNotu] ?? null;
}

/**
 * Başarılı harf notu mu kontrol et
 * @param {string} harfNotu - Harf notu
 * @param {number} agno - Öğrencinin AGNO'su (mezuniyet kontrolü için)
 * @param {boolean} mezuniyetDurumu - Mezuniyet durumunda mı?
 * @returns {boolean} Başarılı mı?
 */
function basariliMi(harfNotu, agno = 0, mezuniyetDurumu = false) {
  // AA, BA, BB, CB, CC her zaman başarılı
  const kesinBasarili = ['AA', 'BA', 'BB', 'CB', 'CC'];
  if (kesinBasarili.includes(harfNotu)) {
    return true;
  }
  
  // Mezuniyet durumunda ve AGNO >= 2.00 ise DC ve DD de başarılı
  if (mezuniyetDurumu && agno >= 2.00) {
    const sartliBasarili = ['DC', 'DD'];
    if (sartliBasarili.includes(harfNotu)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Sınıf için tüm notları hesapla ve harf notlarını belirle
 * @param {Array<{ogrenciId: number, puan: number}>} notlar - Öğrenci notları
 * @returns {Object} Hesaplanmış sonuçlar
 */
function sinifNotlariniHesapla(notlar) {
  if (!notlar || notlar.length === 0) {
    return {
      ortalama: 0,
      standartSapma: 0,
      sonuclar: []
    };
  }

  // Ham puanları al
  const hamPuanlar = notlar.map(n => n.puan);
  
  // İstatistikleri hesapla
  const ortalama = hesaplaOrtalama(hamPuanlar);
  const standartSapma = hesaplaStandartSapma(hamPuanlar, ortalama);
  
  // Her öğrenci için T-Skoru ve harf notu hesapla
  const sonuclar = notlar.map(not => {
    const tSkoru = hesaplaTSkoru(not.puan, ortalama, standartSapma);
    const harfNotu = tSkorunaGoreHarfNotu(tSkoru);
    const katsayi = getHarfNotuKatsayisi(harfNotu);
    
    return {
      ogrenciId: not.ogrenciId,
      hamPuan: not.puan,
      tSkoru: parseFloat(tSkoru.toFixed(2)),
      harfNotu,
      katsayi,
      basarili: basariliMi(harfNotu)
    };
  });
  
  return {
    ortalama: parseFloat(ortalama.toFixed(2)),
    standartSapma: parseFloat(standartSapma.toFixed(2)),
    ogrenciSayisi: notlar.length,
    sonuclar
  };
}

/**
 * AGNO hesapla
 * @param {Array<{kredi: number, akts: number, harfNotu: string}>} dersler - Tamamlanan dersler
 * @returns {number} AGNO
 */
function hesaplaAGNO(dersler) {
  let toplamAktsXKatsayi = 0;
  let toplamAkts = 0;
  
  for (const ders of dersler) {
    const katsayi = getHarfNotuKatsayisi(ders.harfNotu);
    
    // M ve G notları AGNO hesabına katılmaz
    if (katsayi === null) continue;
    
    toplamAktsXKatsayi += ders.akts * katsayi;
    toplamAkts += ders.akts;
  }
  
  if (toplamAkts === 0) return 0;
  
  const agno = toplamAktsXKatsayi / toplamAkts;
  return parseFloat(agno.toFixed(2));
}

/**
 * Not dağılım istatistikleri
 * @param {string[]} harfNotlari - Harf notları dizisi
 * @returns {Object} Dağılım istatistikleri
 */
function notDagilimIstatistikleri(harfNotlari) {
  const dagilim = {
    'AA': 0, 'BA': 0, 'BB': 0, 'CB': 0, 
    'CC': 0, 'DC': 0, 'DD': 0, 'FF': 0, 'Z': 0
  };
  
  for (const harf of harfNotlari) {
    if (dagilim.hasOwnProperty(harf)) {
      dagilim[harf]++;
    }
  }
  
  const toplam = harfNotlari.length;
  const basarili = dagilim.AA + dagilim.BA + dagilim.BB + dagilim.CB + dagilim.CC;
  const basarisiz = dagilim.DC + dagilim.DD + dagilim.FF + dagilim.Z;
  
  return {
    dagilim,
    toplam,
    basarili,
    basarisiz,
    basariOrani: toplam > 0 ? parseFloat(((basarili / toplam) * 100).toFixed(2)) : 0
  };
}

module.exports = {
  HARF_NOTU_KATSAYILARI,
  T_SKORU_HARF_NOTU,
  hesaplaOrtalama,
  hesaplaStandartSapma,
  hesaplaTSkoru,
  tSkorunaGoreHarfNotu,
  getHarfNotuKatsayisi,
  basariliMi,
  sinifNotlariniHesapla,
  hesaplaAGNO,
  notDagilimIstatistikleri
};
