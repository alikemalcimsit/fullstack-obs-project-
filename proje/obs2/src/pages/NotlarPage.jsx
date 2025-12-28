import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { notService, ogrenciService } from '../services/api';
import { FaBook, FaChartLine } from 'react-icons/fa';

export default function NotlarPage() {
  const { ogrNo } = useParams();
  const [dersNotlar, setDersNotlar] = useState([]);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDers, setSelectedDers] = useState(null);
  const [dersDetay, setDersDetay] = useState(null);

  const groupedNotlar = useMemo(() => {
    const map = new Map();
    dersNotlar.forEach((item) => {
      const donemId = item?.ders?.donem?.id || item?.ders?.donemId || 0;
      const donemAdi = item?.ders?.donem?.donemAdi || `${donemId}. Dönem`;
      const key = `${donemId}-${donemAdi}`;
      if (!map.has(key)) map.set(key, { donemId, donemAdi, items: [] });
      map.get(key).items.push(item);
    });
    return Array.from(map.values()).sort((a, b) => a.donemId - b.donemId);
  }, [dersNotlar]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [notResponse, studentResponse] = await Promise.all([
          notService.getByOgrenci(ogrNo),
          ogrenciService.getByOgrNo(ogrNo),
        ]);
        setDersNotlar(notResponse.dersNotlar || []);
        setStudent(studentResponse.user);
      } catch (error) {
        console.error('Notlar alınamadı:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [ogrNo]);

  const handleDersClick = async (ders) => {
    setSelectedDers(ders);
    try {
      const response = await notService.getByOgrenciAndDers(ogrNo, ders.ders.id);
      setDersDetay(response);
    } catch (error) {
      console.error('Ders detayı alınamadı:', error);
    }
  };

  const getNotColor = (puan) => {
    if (puan >= 80) return 'text-green-600';
    if (puan >= 60) return 'text-yellow-600';
    if (puan >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getHarfNotuColor = (harf) => {
    if (['AA', 'BA', 'BB'].includes(harf)) return 'bg-green-100 text-green-800';
    if (['CB', 'CC'].includes(harf)) return 'bg-yellow-100 text-yellow-800';
    if (['DC', 'DD'].includes(harf)) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#210F61]"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-b from-gray-50 to-white min-h-screen">
      {/* Başlık */}
      <div className="mb-6 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-[#210F61]">
          <FaChartLine className="text-2xl" />
          <h1 className="text-2xl font-bold text-gray-800">Not Bilgileri</h1>
        </div>
        <p className="text-gray-500">
          Tüm derslerinize ait sınav notları, sınav geçmişi ve güncel AGNO kartı
        </p>
      </div>

      {/* AGNO Kartı */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-r from-[#210F61] to-[#4a2c9a] rounded-2xl p-6 text-white shadow-lg">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-white/70 text-sm">Genel Ağırlıklı Not Ortalaması</p>
              <p className="text-4xl font-bold mt-1">{student?.agno?.toFixed(2) || '0.00'}</p>
            </div>
            <div className="text-right">
              <p className="text-white/70 text-sm">Toplam Ders</p>
              <p className="text-2xl font-bold mt-1">{dersNotlar.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Aktif Dönem</p>
            <p className="text-2xl font-semibold text-gray-800">{student?.okuduguDonem || '-'}. Dönem</p>
          </div>
          <div className="text-right">
            <p className="text-gray-500 text-sm">Bölüm</p>
            <p className="text-base font-medium text-gray-800">{student?.bolum?.bolumAdi || '-'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ders Listesi */}
        <div className="lg:col-span-2 space-y-4">
          {groupedNotlar.length > 0 ? (
            groupedNotlar.map((group) => (
              <div key={group.donemId} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gray-50 px-6 py-3 border-b flex items-center justify-between">
                  <h2 className="font-semibold text-lg">{group.donemAdi}</h2>
                  <span className="text-sm text-gray-500">{group.items.length} ders</span>
                </div>
                <div className="divide-y">
                  {group.items.map((item, index) => (
                    <div
                      key={`${group.donemId}-${index}`}
                      className={`p-4 cursor-pointer transition-colors hover:bg-gray-50 ${
                        selectedDers?.ders?.id === item.ders.id ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleDersClick(item)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#210F61]/10 rounded-lg flex items-center justify-center">
                            <FaBook className="text-[#210F61]" />
                          </div>
                          <div>
                            <h3 className="font-medium">{item.ders.dersAdi}</h3>
                            <p className="text-sm text-gray-500">{item.ders.dersKodu}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {item.sinavlar.map((sinav, idx) => (
                            <div key={idx} className="text-center">
                              <p className="text-xs text-gray-500">{sinav.sinavTuru}</p>
                              <p className={`font-semibold ${getNotColor(sinav.puan)}`}>
                                {sinav.puan?.toFixed(0) || '-'}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center text-gray-500">
              Henüz not girişi yapılmamış.
            </div>
          )}
        </div>

        {/* Ders Detayı */}
        <div>
          {selectedDers && dersDetay ? (
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
              <h2 className="font-semibold text-lg mb-4">{selectedDers.ders.dersAdi}</h2>
              
              {/* Özet */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Vize Ortalaması</span>
                  <span className={`font-semibold ${getNotColor(dersDetay.ozet?.vizeOrtalama)}`}>
                    {dersDetay.ozet?.vizeOrtalama?.toFixed(2) || '-'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Final Notu</span>
                  <span className={`font-semibold ${getNotColor(dersDetay.ozet?.finalNotu)}`}>
                    {dersDetay.ozet?.finalNotu?.toFixed(2) || '-'}
                  </span>
                </div>
                {dersDetay.ozet?.butunlemeNotu && (
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Bütünleme Notu</span>
                    <span className={`font-semibold ${getNotColor(dersDetay.ozet?.butunlemeNotu)}`}>
                      {dersDetay.ozet?.butunlemeNotu?.toFixed(2) || '-'}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center p-3 bg-[#210F61]/5 rounded-lg">
                  <span className="text-gray-800 font-medium">Genel Ortalama</span>
                  <span className={`font-bold text-lg ${getNotColor(dersDetay.ozet?.genelOrtalama)}`}>
                    {dersDetay.ozet?.genelOrtalama?.toFixed(2) || '-'}
                  </span>
                </div>
              </div>

              {/* Harf Notu */}
              <div className="text-center">
                <p className="text-gray-500 text-sm mb-2">Harf Notu</p>
                <span className={`inline-block px-6 py-2 rounded-full text-2xl font-bold ${getHarfNotuColor(dersDetay.ozet?.harfNotu)}`}>
                  {dersDetay.ozet?.harfNotu || '-'}
                </span>
              </div>

              {/* Sınav Listesi */}
              <div className="mt-6">
                <h3 className="font-medium text-gray-700 mb-3">Sınav Geçmişi</h3>
                <div className="space-y-2">
                  {dersDetay.notlar?.map((n, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 border-b">
                      <div>
                        <p className="text-sm font-medium">{n.sinavAdi}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(n.sinavTarihi).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                      <span className={`font-semibold ${getNotColor(n.puan)}`}>
                        {n.puan !== null ? n.puan.toFixed(0) : '-'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center text-gray-500">
              <FaChartLine className="text-4xl mx-auto mb-3 text-gray-300" />
              <p>Detay görmek için bir ders seçin</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
