import React, { useState } from 'react';
import {
  Card,
  CardBody,
  Typography,
  Button,
  Chip,
  Input,
} from '@material-tailwind/react';
import {
  UserGroupIcon,
  MagnifyingGlassIcon,
  EnvelopeIcon,
  PhoneIcon,
  AcademicCapIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

const OgrencilerTab = ({ selectedDers, ogrenciler = [], dersler = [], onSelectDers = () => {} }) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Array'i güvenli hale getir
  const ogrencilerArray = Array.isArray(ogrenciler) ? ogrenciler : [];

  // Filtrelenmiş öğrenciler
  const filteredOgrenciler = ogrencilerArray.filter((ogr) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      ogr.ogrNo?.toLowerCase().includes(q) ||
      ogr.isim?.toLowerCase().includes(q) ||
      ogr.soyad?.toLowerCase().includes(q) ||
      ogr.email?.toLowerCase().includes(q)
    );
  });

  if (!selectedDers) {
    return (
      <Card className="shadow-lg">
        <CardBody className="text-center py-20">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <UserGroupIcon className="h-12 w-12 text-purple-600" />
          </div>
          <Typography variant="h4" className="text-gray-800 mb-3">
            Ders Seçimi Gerekli
          </Typography>
          <Typography className="text-gray-500 max-w-md mx-auto">
            Öğrenci listesini görmek için önce "Derslerim" sekmesinden bir ders seçmelisiniz
          </Typography>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Başlık Kartı */}
      <Card className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 text-white shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
        <CardBody className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <UserGroupIcon className="h-7 w-7" />
                </div>
                <div>
                  <Typography variant="h4" className="font-bold">Öğrenci Listesi</Typography>
                  <Typography className="opacity-80 text-sm">{selectedDers.dersKodu} - {selectedDers.dersAdi}</Typography>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="bg-white/10 rounded-lg px-4 py-2">
                  <Typography variant="small" className="opacity-70">Toplam Öğrenci</Typography>
                  <Typography variant="h5">{ogrenciler.length}</Typography>
                </div>
                <div className="bg-white/10 rounded-lg px-4 py-2">
                  <Typography variant="small" className="opacity-70">Aktif</Typography>
                  <Typography variant="h5">{ogrenciler.filter(o => o.statu === 'Aktif').length}</Typography>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Arama ve Filtre */}
      <Card className="shadow-lg">
        <CardBody>
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <Input
                label="Öğrenci Ara (No, Ad, Soyad, Email)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={<MagnifyingGlassIcon className="h-5 w-5" />}
              />
            </div>
            <Chip value={`${filteredOgrenciler.length} sonuç`} color="blue" />
          </div>
        </CardBody>
      </Card>

      {/* Öğrenci Listesi */}
      {filteredOgrenciler.length === 0 ? (
        <Card className="shadow-lg">
          <CardBody className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserGroupIcon className="h-10 w-10 text-gray-400" />
            </div>
            <Typography variant="h6" className="text-gray-600 mb-2">
              {ogrenciler.length === 0 ? 'Öğrenci Bulunamadı' : 'Arama Sonucu Yok'}
            </Typography>
            <Typography className="text-gray-500">
              {ogrenciler.length === 0 
                ? 'Bu derse kayıtlı öğrenci bulunmuyor' 
                : 'Arama kriterlerinize uygun öğrenci bulunamadı'}
            </Typography>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOgrenciler.map((ogr, idx) => (
            <Card key={ogr.id} className="shadow-lg hover:shadow-xl transition-shadow">
              <CardBody className="p-5">
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div
                    className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white font-bold flex items-center justify-center text-lg"
                    aria-label={`${ogr.isim} ${ogr.soyad}`}
                  >
                    {ogr.isim?.charAt(0)}{ogr.soyad?.charAt(0)}
                  </div>

                  {/* Bilgiler */}
                  <div className="flex-1 min-w-0">
                    <Typography variant="h6" className="text-gray-800 truncate">
                      {ogr.isim} {ogr.soyad}
                    </Typography>
                    <Typography variant="small" className="text-gray-500 font-mono">
                      {ogr.ogrNo}
                    </Typography>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <Chip
                        size="sm"
                        value={ogr.statu || 'Aktif'}
                        color={ogr.statu === 'Aktif' ? 'green' : 'gray'}
                      />
                      {ogr.agno && (
                        <Chip size="sm" value={`GNO: ${ogr.agno.toFixed(2)}`} color="blue" variant="outlined" />
                      )}
                    </div>
                  </div>
                </div>

                {/* İletişim Bilgileri */}
                <div className="mt-4 pt-4 border-t space-y-2">
                  {ogr.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <EnvelopeIcon className="h-4 w-4" />
                      <span className="truncate">{ogr.email}</span>
                    </div>
                  )}
                  {ogr.telNo && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <PhoneIcon className="h-4 w-4" />
                      <span>{ogr.telNo}</span>
                    </div>
                  )}
                  {ogr.bolum && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <AcademicCapIcon className="h-4 w-4" />
                      <span className="truncate">{ogr.bolum?.bolumAdi}</span>
                    </div>
                  )}
                </div>

                {/* AGNO Göstergesi */}
                {ogr.agno && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1">
                      <Typography variant="small" className="text-gray-600">Akademik Ortalama</Typography>
                      <Typography variant="small" className="font-bold text-gray-800">{ogr.agno.toFixed(2)}/4.00</Typography>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          ogr.agno >= 3.0 ? 'bg-green-500' : 
                          ogr.agno >= 2.0 ? 'bg-blue-500' : 
                          ogr.agno >= 1.0 ? 'bg-orange-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${(ogr.agno / 4) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* İstatistikler */}
      <Card className="shadow-lg bg-gradient-to-r from-gray-50 to-purple-50">
        <CardBody>
          <Typography variant="h6" className="mb-4 flex items-center gap-2">
            <ChartBarIcon className="h-5 w-5 text-purple-600" />
            Sınıf İstatistikleri
          </Typography>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 text-center shadow">
              <Typography variant="small" className="text-gray-500">Toplam Öğrenci</Typography>
              <Typography variant="h4" color="purple">{ogrenciler.length}</Typography>
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow">
              <Typography variant="small" className="text-gray-500">Sınıf Ortalaması</Typography>
              <Typography variant="h4" color="blue">
                {ogrenciler.length > 0 
                  ? (ogrenciler.reduce((sum, o) => sum + (o.agno || 0), 0) / ogrenciler.length).toFixed(2)
                  : '-'}
              </Typography>
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow">
              <Typography variant="small" className="text-gray-500">En Yüksek GNO</Typography>
              <Typography variant="h4" color="green">
                {ogrenciler.length > 0 
                  ? Math.max(...ogrenciler.map(o => o.agno || 0)).toFixed(2)
                  : '-'}
              </Typography>
            </div>
            <div className="bg-white rounded-lg p-4 text-center shadow">
              <Typography variant="small" className="text-gray-500">En Düşük GNO</Typography>
              <Typography variant="h4" color="orange">
                {ogrenciler.length > 0 
                  ? Math.min(...ogrenciler.filter(o => o.agno).map(o => o.agno)).toFixed(2)
                  : '-'}
              </Typography>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default OgrencilerTab;
