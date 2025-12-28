import React, { useState } from 'react';
import {
  Card,
  CardBody,
  Typography,
  Button,
  Chip,
  Input,
  Checkbox,
} from '@material-tailwind/react';
import {
  ClipboardDocumentCheckIcon,
  CheckCircleIcon,
  XCircleIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { yoklamaService } from '../../services/api';

const YoklamaTab = ({ selectedDers, ogrenciler = [], yoklamalar = [], loadYoklamalar = () => {}, dersler = [], onSelectDers = () => {} }) => {
  const [yoklamaTarihi, setYoklamaTarihi] = useState(new Date().toISOString().split('T')[0]);
  const [yoklamaDurumlari, setYoklamaDurumlari] = useState({});
  const [saving, setSaving] = useState(false);
  
  // Array'leri güvenli hale getir
  const ogrencilerArray = Array.isArray(ogrenciler) ? ogrenciler : [];
  const yoklamalarArray = Array.isArray(yoklamalar) ? yoklamalar : [];

  // Yoklama durumunu değiştir
  const handleYoklamaDegistir = (ogrenciId, durum) => {
    setYoklamaDurumlari(prev => ({
      ...prev,
      [ogrenciId]: durum
    }));
  };

  // Tümünü var/yok işaretle
  const handleTumunuIsaretle = (durum) => {
    const yeniDurumlar = {};
    ogrencilerArray.forEach(ogr => {
      yeniDurumlar[ogr.id] = durum;
    });
    setYoklamaDurumlari(yeniDurumlar);
  };

  // Yoklama kaydet
  const handleYoklamaKaydet = async () => {
    setSaving(true);
    try {
      const yoklamaVerisi = ogrencilerArray.map(ogr => ({
        ogrenciId: ogr.id,
        dersId: selectedDers.id,
        tarih: yoklamaTarihi,
        durum: yoklamaDurumlari[ogr.id] || 'Var'
      }));
      
      await yoklamaService.save({
        dersId: selectedDers.id,
        tarih: yoklamaTarihi,
        yoklamalar: yoklamaVerisi,
      });
      alert('Yoklama başarıyla kaydedildi!');
      loadYoklamalar(selectedDers.id);
    } catch (error) {
      console.error('Yoklama kaydedilemedi:', error);
      alert('Yoklama kaydedilemedi!');
    } finally {
      setSaving(false);
    }
  };

  // İstatistikler
  const varSayisi = Object.values(yoklamaDurumlari).filter(d => d === 'Var').length;
  const yokSayisi = Object.values(yoklamaDurumlari).filter(d => d === 'Yok').length;
  const devamsizlikOrani = ogrencilerArray.length > 0 ? ((yokSayisi / ogrencilerArray.length) * 100).toFixed(1) : 0;

  if (!selectedDers) {
    return (
      <Card className="shadow-lg">
        <CardBody className="text-center py-20">
          <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ClipboardDocumentCheckIcon className="h-12 w-12 text-green-600" />
          </div>
          <Typography variant="h4" className="text-gray-800 mb-3">
            Ders Seçimi Gerekli
          </Typography>
          <Typography className="text-gray-500 max-w-md mx-auto">
            Yoklama işlemleri için önce "Derslerim" sekmesinden bir ders seçmelisiniz
          </Typography>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Başlık Kartı */}
      <Card className="bg-gradient-to-r from-green-600 via-teal-600 to-cyan-600 text-white shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
        <CardBody className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <ClipboardDocumentCheckIcon className="h-7 w-7" />
                </div>
                <div>
                  <Typography variant="h4" className="font-bold">Yoklama</Typography>
                  <Typography className="opacity-80 text-sm">{selectedDers.dersKodu} - {selectedDers.dersAdi}</Typography>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="bg-white/10 rounded-lg px-4 py-2">
                  <Typography variant="small" className="opacity-70">Toplam Öğrenci</Typography>
                  <Typography variant="h5">{ogrencilerArray.length}</Typography>
                </div>
                <div className="bg-white/10 rounded-lg px-4 py-2">
                  <Typography variant="small" className="opacity-70">Var</Typography>
                  <Typography variant="h5" className="text-green-200">{varSayisi}</Typography>
                </div>
                <div className="bg-white/10 rounded-lg px-4 py-2">
                  <Typography variant="small" className="opacity-70">Yok</Typography>
                  <Typography variant="h5" className="text-red-200">{yokSayisi}</Typography>
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <Input
                type="date"
                label="Yoklama Tarihi"
                value={yoklamaTarihi}
                onChange={(e) => setYoklamaTarihi(e.target.value)}
                className="!text-white"
                labelProps={{ className: "!text-white/80" }}
                containerProps={{ className: "min-w-[200px]" }}
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Hızlı İşlemler */}
      <Card className="shadow-lg">
        <CardBody>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                color="green"
                variant="outlined"
                className="flex items-center gap-2"
                onClick={() => handleTumunuIsaretle('Var')}
              >
                <CheckCircleIcon className="h-5 w-5" />
                Tümünü Var İşaretle
              </Button>
              <Button
                color="red"
                variant="outlined"
                className="flex items-center gap-2"
                onClick={() => handleTumunuIsaretle('Yok')}
              >
                <XCircleIcon className="h-5 w-5" />
                Tümünü Yok İşaretle
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Chip value={`Devamsızlık: %${devamsizlikOrani}`} color={parseFloat(devamsizlikOrani) > 30 ? 'red' : 'green'} />
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Öğrenci Listesi */}
      <Card className="shadow-lg">
        <CardBody>
          <Typography variant="h5" className="mb-6 flex items-center gap-2">
            <UserGroupIcon className="h-6 w-6 text-green-600" />
            Öğrenci Yoklama Listesi
          </Typography>

          {ogrencilerArray.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserGroupIcon className="h-10 w-10 text-gray-400" />
              </div>
              <Typography variant="h6" className="text-gray-600 mb-2">Öğrenci Bulunamadı</Typography>
              <Typography className="text-gray-500">Bu derse kayıtlı öğrenci bulunmuyor</Typography>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="w-full min-w-max table-auto">
                  <thead>
                    <tr className="bg-gradient-to-r from-green-600 to-teal-600 text-white">
                      <th className="p-4 text-left">
                        <Typography variant="small" className="font-bold">#</Typography>
                      </th>
                      <th className="p-4 text-left">
                        <Typography variant="small" className="font-bold">Öğrenci No</Typography>
                      </th>
                      <th className="p-4 text-left">
                        <Typography variant="small" className="font-bold">Ad Soyad</Typography>
                      </th>
                      <th className="p-4 text-center">
                        <Typography variant="small" className="font-bold">Var</Typography>
                      </th>
                      <th className="p-4 text-center">
                        <Typography variant="small" className="font-bold">Yok</Typography>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {ogrencilerArray.map((ogr, idx) => {
                      const durum = yoklamaDurumlari[ogr.id] || 'Var';
                      return (
                        <tr key={ogr.id} className={`${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-green-50 transition-colors`}>
                          <td className="p-4">
                            <Typography variant="small" className="font-medium text-gray-600">{idx + 1}</Typography>
                          </td>
                          <td className="p-4">
                            <Typography variant="small" className="font-mono font-semibold">{ogr.ogrNo}</Typography>
                          </td>
                          <td className="p-4">
                            <Typography variant="small" className="font-medium">{ogr.isim} {ogr.soyad}</Typography>
                          </td>
                          <td className="p-4 text-center">
                            <Checkbox
                              color="green"
                              checked={durum === 'Var'}
                              onChange={() => handleYoklamaDegistir(ogr.id, 'Var')}
                              ripple={false}
                              className="h-6 w-6"
                            />
                          </td>
                          <td className="p-4 text-center">
                            <Checkbox
                              color="red"
                              checked={durum === 'Yok'}
                              onChange={() => handleYoklamaDegistir(ogr.id, 'Yok')}
                              ripple={false}
                              className="h-6 w-6"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Kaydet Butonu */}
              <div className="flex justify-end mt-6 pt-4 border-t">
                <Button
                  color="green"
                  size="lg"
                  className="flex items-center gap-2"
                  onClick={handleYoklamaKaydet}
                  disabled={saving}
                >
                  <CheckCircleIcon className="h-5 w-5" />
                  {saving ? 'Kaydediliyor...' : 'Yoklamayı Kaydet'}
                </Button>
              </div>
            </>
          )}
        </CardBody>
      </Card>

      {/* Yoklama Geçmişi */}
      <Card className="shadow-lg">
        <CardBody>
          <Typography variant="h5" className="mb-6 flex items-center gap-2">
            <CalendarDaysIcon className="h-6 w-6 text-green-600" />
            Yoklama Geçmişi
          </Typography>

          {yoklamalarArray.length === 0 ? (
            <div className="text-center py-8">
              <ChartBarIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <Typography className="text-gray-500">Henüz yoklama kaydı bulunmuyor</Typography>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-max table-auto text-left">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-3">
                      <Typography variant="small" className="font-bold text-gray-700">Tarih</Typography>
                    </th>
                    <th className="p-3">
                      <Typography variant="small" className="font-bold text-gray-700">Öğrenci</Typography>
                    </th>
                    <th className="p-3">
                      <Typography variant="small" className="font-bold text-gray-700">Durum</Typography>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {yoklamalarArray.slice(0, 20).map((yoklama, idx) => (
                    <tr key={yoklama.id} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                      <td className="p-3">
                        <Typography variant="small">
                          {new Date(yoklama.tarih).toLocaleDateString('tr-TR')}
                        </Typography>
                      </td>
                      <td className="p-3">
                        <Typography variant="small">
                          {yoklama.ogrenci?.isim} {yoklama.ogrenci?.soyad}
                        </Typography>
                      </td>
                      <td className="p-3">
                        <Chip
                          size="sm"
                          value={yoklama.durum}
                          color={yoklama.durum === 'Var' ? 'green' : 'red'}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default YoklamaTab;
