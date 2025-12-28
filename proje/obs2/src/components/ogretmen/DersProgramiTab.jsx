import React, { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  Typography,
  Chip,
  Spinner,
} from '@material-tailwind/react';
import {
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';
import api from '../../services/api';

const DersProgramiTab = ({ dersler }) => {
  const [dersProgrami, setDersProgrami] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const gunler = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma'];
  const saatler = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

  useEffect(() => {
    loadDersProgrami();
  }, []);

  const loadDersProgrami = async () => {
    setLoading(true);
    try {
      const response = await api.get('/ogretmen/ders-programi');
      const programData = response.data?.program || response.data || [];
      setDersProgrami(Array.isArray(programData) ? programData : []);
    } catch (error) {
      console.error('Ders programı yüklenirken hata:', error);
      setDersProgrami([]);
    } finally {
      setLoading(false);
    }
  };

  // Ders programını gün ve saate göre organize et
  const getProgramByGunSaat = (gun, saat) => {
    return (dersProgrami || []).find(p => 
      p.gun === gunler.indexOf(gun) + 1 && 
      p.baslangic?.startsWith(saat)
    );
  };

  // Renk paleti
  const dersRenkleri = [
    'bg-blue-100 border-blue-300 text-blue-800',
    'bg-green-100 border-green-300 text-green-800',
    'bg-purple-100 border-purple-300 text-purple-800',
    'bg-orange-100 border-orange-300 text-orange-800',
    'bg-pink-100 border-pink-300 text-pink-800',
    'bg-cyan-100 border-cyan-300 text-cyan-800',
  ];

  const getDersRengi = (dersId) => {
    return dersRenkleri[dersId % dersRenkleri.length];
  };

  return (
    <div className="space-y-6">
      {/* Başlık Kartı */}
      <Card className="bg-gradient-to-r from-cyan-600 via-teal-600 to-green-600 text-white shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
        <CardBody className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <CalendarDaysIcon className="h-7 w-7" />
            </div>
            <div>
              <Typography variant="h4" className="font-bold">Haftalık Ders Programı</Typography>
              <Typography className="opacity-80 text-sm">2024-2025 Güz Dönemi</Typography>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 mt-4">
            <div className="bg-white/10 rounded-lg px-4 py-2">
              <Typography variant="small" className="opacity-70">Toplam Ders</Typography>
              <Typography variant="h5">{dersProgrami.length}</Typography>
            </div>
            <div className="bg-white/10 rounded-lg px-4 py-2">
              <Typography variant="small" className="opacity-70">Haftalık Saat</Typography>
              <Typography variant="h5">{dersProgrami.length} saat</Typography>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Ders Programı Tablosu */}
      <Card className="shadow-lg overflow-hidden">
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead>
                <tr className="bg-gradient-to-r from-cyan-600 to-teal-600 text-white">
                  <th className="p-4 text-left w-20">
                    <ClockIcon className="h-5 w-5 mx-auto" />
                  </th>
                  {gunler.map(gun => (
                    <th key={gun} className="p-4 text-center font-semibold">
                      {gun}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {saatler.map((saat, idx) => (
                  <tr key={saat} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                    <td className="p-3 text-center border-r">
                      <Typography variant="small" className="font-mono font-semibold text-gray-700">
                        {saat}
                      </Typography>
                    </td>
                    {gunler.map(gun => {
                      const program = getProgramByGunSaat(gun, saat);
                      return (
                        <td key={`${gun}-${saat}`} className="p-2 border-r last:border-r-0">
                          {program ? (
                            <div className={`rounded-lg p-3 border-l-4 ${getDersRengi(program.ders?.id || 0)}`}>
                              <Typography variant="small" className="font-semibold truncate">
                                {program.ders?.dersAdi}
                              </Typography>
                              <Typography variant="small" className="text-xs opacity-75">
                                {program.ders?.dersKodu}
                              </Typography>
                              <div className="flex items-center gap-1 mt-1">
                                <MapPinIcon className="h-3 w-3" />
                                <Typography variant="small" className="text-xs">
                                  {program.sinif?.sinifAdi || 'Belirsiz'}
                                </Typography>
                              </div>
                            </div>
                          ) : (
                            <div className="h-16"></div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardBody>
      </Card>

      {/* Ders Listesi */}
      <Card className="shadow-lg">
        <CardBody>
          <Typography variant="h5" className="mb-4 flex items-center gap-2">
            <BookOpenIcon className="h-6 w-6 text-cyan-600" />
            Ders Detayları
          </Typography>

          {dersProgrami.length === 0 ? (
            <div className="text-center py-8">
              <CalendarDaysIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <Typography className="text-gray-500">Ders programı henüz yüklenmemiş</Typography>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {dersProgrami.map((program, idx) => (
                <Card key={idx} className="bg-gray-50 border">
                  <CardBody className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <Typography variant="h6" className="text-sm">
                          {program.ders?.dersAdi}
                        </Typography>
                        <Typography variant="small" className="text-gray-500 font-mono">
                          {program.ders?.dersKodu}
                        </Typography>
                      </div>
                      <Chip
                        size="sm"
                        value={gunler[program.gun - 1] || 'Belirsiz'}
                        color="blue"
                      />
                    </div>
                    <div className="space-y-1 mt-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <ClockIcon className="h-4 w-4" />
                        <span>{program.baslangic} - {program.bitis}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPinIcon className="h-4 w-4" />
                        <span>{program.sinif?.sinifAdi || 'Belirsiz'}</span>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default DersProgramiTab;
