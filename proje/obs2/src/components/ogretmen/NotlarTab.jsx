import React, { useState } from 'react';
import {
  Card,
  CardBody,
  Typography,
  Button,
  Chip,
  Input,
  Tooltip,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Select,
  Option,
} from '@material-tailwind/react';
import {
  PencilSquareIcon,
  PlusIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CalculatorIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
  CheckBadgeIcon,
  AcademicCapIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { notYonetimService } from '../../services/api';

// Harf notu sabitleri
const harfNotlari = ['AA', 'BA', 'BB', 'CB', 'CC', 'DC', 'DD', 'FD', 'FF'];
const harfNotKarsiliklari = {
  'AA': { min: 90, max: 100, katsayi: 4.0 },
  'BA': { min: 85, max: 89, katsayi: 3.5 },
  'BB': { min: 80, max: 84, katsayi: 3.0 },
  'CB': { min: 75, max: 79, katsayi: 2.5 },
  'CC': { min: 70, max: 74, katsayi: 2.0 },
  'DC': { min: 65, max: 69, katsayi: 1.5 },
  'DD': { min: 60, max: 64, katsayi: 1.0 },
  'FD': { min: 50, max: 59, katsayi: 0.5 },
  'FF': { min: 0, max: 49, katsayi: 0.0 },
};

// Yardımcı fonksiyonlar
const getSinavTuruColor = (tur) => {
  switch (tur?.toLowerCase()) {
    case 'vize': return 'blue';
    case 'final': return 'green';
    case 'bütünleme': return 'orange';
    case 'quiz': return 'purple';
    case 'ödev': return 'cyan';
    default: return 'gray';
  }
};

const getSinavTuruIcon = (tur) => {
  const iconClass = "h-6 w-6";
  switch (tur?.toLowerCase()) {
    case 'vize': return <DocumentTextIcon className={`${iconClass} text-blue-500`} />;
    case 'final': return <AcademicCapIcon className={`${iconClass} text-green-500`} />;
    case 'bütünleme': return <DocumentTextIcon className={`${iconClass} text-orange-500`} />;
    default: return <DocumentTextIcon className={`${iconClass} text-gray-500`} />;
  }
};

const getHarfNotuColor = (harf) => {
  if (['AA', 'BA'].includes(harf)) return 'green';
  if (['BB', 'CB'].includes(harf)) return 'blue';
  if (['CC', 'DC'].includes(harf)) return 'amber';
  if (['DD', 'FD'].includes(harf)) return 'orange';
  return 'red';
};

const calculateHarfNotu = (puan) => {
  if (puan >= 90) return 'AA';
  if (puan >= 85) return 'BA';
  if (puan >= 80) return 'BB';
  if (puan >= 75) return 'CB';
  if (puan >= 70) return 'CC';
  if (puan >= 65) return 'DC';
  if (puan >= 60) return 'DD';
  if (puan >= 50) return 'FD';
  return 'FF';
};

const NotlarTab = ({ 
  selectedDers, 
  ogrenciler = [], 
  sinavlar = [], 
  notlar = [], 
  setNotlar = () => {},
  loadSinavlar = () => {},
  onOpenSinavDialog = () => {}
}) => {
  const [ogrenciAra, setOgrenciAra] = useState('');
  
  // Sinavlar'ı array olarak garantile
  const sinavlarArray = Array.isArray(sinavlar) ? sinavlar : [];
  const ogrencilerArray = Array.isArray(ogrenciler) ? ogrenciler : [];

  // Filtrelenmiş öğrenciler
  const filteredOgrenciler = ogrencilerArray.filter((o) => {
    const q = ogrenciAra.trim().toLowerCase();
    if (!q) return true;
    return (
      o.ogrNo?.toLowerCase().includes(q) ||
      o.isim?.toLowerCase().includes(q) ||
      o.soyad?.toLowerCase().includes(q)
    );
  });

  // T-Skoru hesapla
  const handleTSkoruHesapla = async (sinav) => {
    try {
      await notYonetimService.hesaplaTSkoru(sinav.id);
      // T-Skoru tamamlandıktan sonra harf notlarını da hemen açıklayalım
      await notYonetimService.harfNotuAcikla(sinav.id);
      alert('T-Skoru hesaplandı ve harf notları açıklandı!');
      loadSinavlar(selectedDers.id);
    } catch (error) {
      console.error('T-Skoru hesaplanamadı:', error);
      alert('T-Skoru hesaplanamadı!');
    }
  };

  // Ağırlık hesaplama (Final/Bütünleme = 0.6, diğerlerinde mevcut değer veya 0.4)
  const getAgirlik = (sinav) => {
    if (!sinav) return 0.4;
    if (sinav.sinavTuru === 'Final' || sinav.sinavTuru === 'Bütünleme') return 0.6;
    return sinav.agirlik ?? 0.4;
  };

  // Notları aç/kapat
  const handleNotlariAc = async (sinav, acikMi) => {
    try {
      await notYonetimService.notlariAcKapat(sinav.id, acikMi);
      alert(acikMi ? 'Notlar öğrencilere açıldı!' : 'Notlar kapatıldı!');
      loadSinavlar(selectedDers.id);
    } catch (error) {
      console.error('İşlem başarısız:', error);
      alert('İşlem başarısız!');
    }
  };

  // Harf notu açıkla
  const handleHarfNotuAcikla = async (sinav) => {
    try {
      await notYonetimService.harfNotuAcikla(sinav.id);
      alert('Harf notları açıklandı!');
      loadSinavlar(selectedDers.id);
    } catch (error) {
      console.error('Harf notu açıklanamadı:', error);
      alert('Harf notu açıklanamadı!');
    }
  };

  // Notları kaydet
  const handleNotlariKaydet = async () => {
    try {
      for (const sinav of sinavlarArray) {
        const sinavNotlari = [];
        for (const ogr of ogrencilerArray) {
          const puanRaw = notlar[`${ogr.id}-${sinav.id}`];
          if (puanRaw === '' || puanRaw === undefined || puanRaw === null) continue;

          const puan = parseFloat(puanRaw);
          if (Number.isNaN(puan)) continue;

          sinavNotlari.push({ ogrenciId: ogr.id, puan });
        }

        if (sinavNotlari.length > 0) {
          await notYonetimService.saveNotlar(sinav.id, sinavNotlari);
        }
      }

      alert('Tüm notlar başarıyla kaydedildi!');
      loadSinavlar(selectedDers.id);
    } catch (error) {
      console.error('Notlar kaydedilirken hata:', error);
      alert('Notlar kaydedilemedi!');
    }
  };

  if (!selectedDers) {
    return (
      <Card className="shadow-lg">
        <CardBody className="text-center py-20">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <PencilSquareIcon className="h-12 w-12 text-[#210F61]" />
          </div>
          <Typography variant="h4" className="text-gray-800 mb-3">
            Ders Seçimi Gerekli
          </Typography>
          <Typography className="text-gray-500 max-w-md mx-auto">
            Not girişi ve yönetimi için önce "Derslerim" sekmesinden bir ders seçmelisiniz
          </Typography>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Başlık Kartı */}
      <Card className="bg-gradient-to-r from-[#210F61] via-[#2d1578] to-[#3a1f8f] text-white shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
        <CardBody className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <PencilSquareIcon className="h-7 w-7" />
                </div>
                <div>
                  <Typography variant="h4" className="font-bold">Not Yönetimi</Typography>
                  <Typography className="opacity-80 text-sm">{selectedDers.dersKodu} - {selectedDers.dersAdi}</Typography>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="bg-white/10 rounded-lg px-4 py-2">
                  <Typography variant="small" className="opacity-70">Öğrenci</Typography>
                  <Typography variant="h5">{ogrencilerArray.length}</Typography>
                </div>
                <div className="bg-white/10 rounded-lg px-4 py-2">
                  <Typography variant="small" className="opacity-70">Sınav</Typography>
                  <Typography variant="h5">{sinavlarArray.length}</Typography>
                </div>
                <div className="bg-white/10 rounded-lg px-4 py-2">
                  <Typography variant="small" className="opacity-70">Notlar Açık</Typography>
                  <Typography variant="h5">{sinavlarArray.filter(s => s.notlarAcikMi).length}</Typography>
                </div>
              </div>
            </div>
            <Button
              size="lg"
              color="white"
              className="flex items-center gap-2 text-[#210F61] font-semibold shadow-lg"
              onClick={onOpenSinavDialog}
            >
              <PlusIcon className="h-5 w-5" />
              Yeni Sınav
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Öğrenci Not Tablosu */}
      <Card className="shadow-lg">
        <CardBody>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <Typography variant="h5" className="flex items-center gap-2">
              <UserGroupIcon className="h-6 w-6 text-[#210F61]" />
              Öğrenci Not Tablosu
            </Typography>
            <Input
              label="Öğrenci Ara..."
              value={ogrenciAra}
              onChange={(e) => setOgrenciAra(e.target.value)}
              className="w-64"
              icon={<MagnifyingGlassIcon className="h-5 w-5" />}
            />
          </div>

          {ogrencilerArray.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserGroupIcon className="h-10 w-10 text-gray-400" />
              </div>
              <Typography variant="h6" className="text-gray-600 mb-2">Öğrenci Bulunamadı</Typography>
              <Typography className="text-gray-500">Bu derse kayıtlı öğrenci bulunmuyor</Typography>
            </div>
          ) : sinavlarArray.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <DocumentTextIcon className="h-10 w-10 text-orange-400" />
              </div>
              <Typography variant="h6" className="text-gray-600 mb-2">Sınav Oluşturun</Typography>
              <Typography className="text-gray-500 mb-4">Not girişi için önce sınav oluşturmalısınız</Typography>
              <Button color="blue" onClick={onOpenSinavDialog} className="flex items-center gap-2 mx-auto">
                <PlusIcon className="h-5 w-5" />
                İlk Sınavı Oluştur
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full min-w-max table-auto">
                  <thead>
                    <tr className="bg-gradient-to-r from-[#210F61] to-[#3a1f8f] text-white">
                      <th className="p-4 text-left sticky left-0 bg-[#210F61] z-20 min-w-[100px]">
                        <Typography variant="small" className="font-bold">Öğrenci No</Typography>
                      </th>
                      <th className="p-4 text-left sticky left-[100px] bg-[#210F61] z-20 min-w-[180px]">
                        <Typography variant="small" className="font-bold">Ad Soyad</Typography>
                      </th>
                      {sinavlarArray.map(sinav => (
                        <th key={sinav.id} className="p-3 text-center min-w-[130px]">
                          <div className="flex flex-col items-center gap-1">
                            <Chip size="sm" value={sinav.sinavTuru} color={getSinavTuruColor(sinav.sinavTuru)} className="text-xs" />
                            <Typography variant="small" className="text-xs opacity-80">
                              %{Math.round(getAgirlik(sinav) * 100)}
                            </Typography>
                          </div>
                        </th>
                      ))}
                      <th className="p-4 text-center bg-blue-900 min-w-[100px]">
                        <Typography variant="small" className="font-bold">Ortalama</Typography>
                      </th>
                      <th className="p-4 text-center bg-green-900 min-w-[80px]">
                        <Typography variant="small" className="font-bold">Harf</Typography>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOgrenciler.map((ogr, idx) => {
                      let toplamAgirlik = 0;
                      let agirlikliToplam = 0;
                      
                      return (
                        <tr key={ogr.id} className={`${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-blue-50 transition-colors`}>
                          <td className="p-4 sticky left-0 bg-inherit z-10 border-r">
                            <Typography variant="small" className="font-mono font-semibold text-gray-800">{ogr.ogrNo}</Typography>
                          </td>
                          <td className="p-4 sticky left-[100px] bg-inherit z-10 border-r">
                            <Typography variant="small" className="font-medium">{ogr.isim} {ogr.soyad}</Typography>
                          </td>
                          {sinavlarArray.map(sinav => {
                            const ogrenciNotu = notlar[`${ogr.id}-${sinav.id}`];
                            const puan = ogrenciNotu !== undefined ? ogrenciNotu : '';
                            
                            if (puan !== '' && puan !== null && !isNaN(parseFloat(puan))) {
                              const w = getAgirlik(sinav);
                              toplamAgirlik += w;
                              agirlikliToplam += parseFloat(puan) * w;
                            }
                            
                            return (
                              <td key={sinav.id} className="p-2 text-center">
                                <Input
                                  type="number"
                                  min={0}
                                  max={100}
                                  value={puan}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    if (val === '' || (parseFloat(val) >= 0 && parseFloat(val) <= 100)) {
                                      setNotlar(prev => ({
                                        ...prev,
                                        [`${ogr.id}-${sinav.id}`]: val
                                      }));
                                    }
                                  }}
                                  className="!w-20 text-center"
                                  containerProps={{ className: "min-w-0" }}
                                />
                              </td>
                            );
                          })}
                          <td className="p-4 text-center bg-blue-50 border-l">
                            <Typography variant="h6" color="blue">
                              {toplamAgirlik > 0 ? (agirlikliToplam / toplamAgirlik).toFixed(1) : '-'}
                            </Typography>
                          </td>
                          <td className="p-4 text-center bg-green-50">
                            <Chip
                              size="sm"
                              value={toplamAgirlik > 0 ? calculateHarfNotu(agirlikliToplam / toplamAgirlik) : '-'}
                              color={getHarfNotuColor(toplamAgirlik > 0 ? calculateHarfNotu(agirlikliToplam / toplamAgirlik) : '-')}
                              className="mx-auto"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Kaydet Butonu */}
              <div className="flex justify-between items-center mt-6 pt-4 border-t">
                <Typography variant="small" className="text-gray-500">
                  {filteredOgrenciler.length} öğrenci listeleniyor
                </Typography>
                <div className="flex gap-3">
                  <Button color="gray" variant="outlined" onClick={() => setNotlar({})}>
                    Temizle
                  </Button>
                  <Button
                    color="green"
                    size="lg"
                    className="flex items-center gap-2"
                    onClick={handleNotlariKaydet}
                  >
                    <CheckCircleIcon className="h-5 w-5" />
                    Tüm Notları Kaydet
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardBody>
      </Card>

      {/* Sınav Yönetimi */}
      <Card className="shadow-lg">
        <CardBody>
          <div className="flex items-center justify-between mb-6">
            <Typography variant="h5" className="flex items-center gap-2">
              <DocumentTextIcon className="h-6 w-6 text-[#210F61]" />
              Sınav Yönetimi
            </Typography>
            <Button size="sm" color="blue" className="flex items-center gap-2" onClick={onOpenSinavDialog}>
              <PlusIcon className="h-4 w-4" />
              Yeni Sınav
            </Button>
          </div>

          {sinavlarArray.length === 0 ? (
            <div className="text-center py-8">
              <Typography className="text-gray-500">Henüz sınav oluşturulmamış</Typography>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sinavlarArray.map(sinav => (
                <Card key={sinav.id} className="bg-gray-50 border border-gray-200 hover:shadow-md transition-shadow">
                  <CardBody className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getSinavTuruIcon(sinav.sinavTuru)}
                        <div>
                          <Typography variant="h6" className="text-sm">{sinav.sinavAdi || sinav.sinavTuru}</Typography>
                          <Typography variant="small" className="text-gray-500">
                            {new Date(sinav.sinavTarihi).toLocaleDateString('tr-TR')}
                          </Typography>
                        </div>
                      </div>
                      <Chip size="sm" value={`%${Math.round((sinav.agirlik || 0.4) * 100)}`} color="blue" />
                    </div>
                    
                    {sinav.ortalama !== null && sinav.ortalama !== undefined && (
                      <div className="bg-white rounded-lg p-2 mb-3 text-center">
                        <Typography variant="small" className="text-gray-500">Ortalama</Typography>
                        <Typography variant="h5" color="blue">{sinav.ortalama.toFixed(1)}</Typography>
                      </div>
                    )}
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      <Chip size="sm" value={sinav.notlarAcikMi ? '✓ Notlar Açık' : '✗ Kapalı'} color={sinav.notlarAcikMi ? 'green' : 'gray'} className="text-xs" />
                      {sinav.harfNotuAcikMi && <Chip size="sm" value="Harf Açık" color="blue" className="text-xs" />}
                    </div>
                    
                    <div className="flex gap-1 flex-wrap">
                      <Tooltip content="T-Skoru Hesapla">
                        <Button size="sm" variant="text" color="purple" className="p-2" onClick={() => handleTSkoruHesapla(sinav)}>
                          <CalculatorIcon className="h-4 w-4" />
                        </Button>
                      </Tooltip>
                      <Tooltip content={sinav.notlarAcikMi ? 'Notları Kapat' : 'Notları Aç'}>
                        <Button size="sm" variant="text" color={sinav.notlarAcikMi ? 'red' : 'green'} className="p-2" onClick={() => handleNotlariAc(sinav, !sinav.notlarAcikMi)}>
                          {sinav.notlarAcikMi ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                        </Button>
                      </Tooltip>
                      {!sinav.harfNotuAcikMi && sinav.ortalama && (
                        <Tooltip content="Harf Notlarını Açıkla">
                          <Button size="sm" variant="text" color="orange" className="p-2" onClick={() => handleHarfNotuAcikla(sinav)}>
                            <CheckBadgeIcon className="h-4 w-4" />
                          </Button>
                        </Tooltip>
                      )}
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Harf Notu Referans */}
      <Card className="shadow-lg bg-gradient-to-r from-gray-50 to-blue-50">
        <CardBody>
          <Typography variant="h6" className="mb-4 flex items-center gap-2">
            <AcademicCapIcon className="h-5 w-5 text-[#210F61]" />
            Harf Notu Karşılıkları
          </Typography>
          <div className="overflow-x-auto">
            <table className="w-full text-center">
              <thead>
                <tr>
                  {harfNotlari.map(harf => (
                    <th key={harf} className="p-2">
                      <Chip size="sm" value={harf} color={getHarfNotuColor(harf)} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr>
                  {harfNotlari.map(harf => (
                    <td key={harf} className="p-2">
                      <Typography variant="small" className="font-medium">{harfNotKarsiliklari[harf].min}-{harfNotKarsiliklari[harf].max}</Typography>
                    </td>
                  ))}
                </tr>
                <tr className="bg-white/50">
                  {harfNotlari.map(harf => (
                    <td key={harf} className="p-2">
                      <Typography variant="small" className="text-gray-600">{harfNotKarsiliklari[harf].katsayi.toFixed(1)}</Typography>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default NotlarTab;
