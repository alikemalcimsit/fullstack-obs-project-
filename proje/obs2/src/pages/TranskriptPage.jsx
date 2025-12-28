import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ogrenciService } from '../services/api';
import { FaGraduationCap, FaPrint, FaDownload } from 'react-icons/fa';

export default function TranskriptPage() {
  const { ogrNo } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await ogrenciService.getTranskript(ogrNo);
        setData(response);
      } catch (error) {
        console.error('Transkript alınamadı:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [ogrNo]);

  const getHarfNotuColor = (harf) => {
    if (harf === '-') return 'text-gray-400';
    if (['AA', 'BA', 'BB'].includes(harf)) return 'text-green-600';
    if (['CB', 'CC'].includes(harf)) return 'text-yellow-600';
    if (['DC', 'DD'].includes(harf)) return 'text-orange-600';
    return 'text-red-600';
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#210F61]"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 text-center text-gray-500">
        Transkript bilgisi bulunamadı.
      </div>
    );
  }

  const { ogrenci, transkript, agno } = data;

  return (
    <div className="p-6">
      {/* Başlık ve Butonlar */}
      <div className="flex justify-between items-center mb-6 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaGraduationCap className="text-[#210F61]" />
            Transkript
          </h1>
          <p className="text-gray-500 mt-1">Akademik kayıtlarınızın özeti</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <FaPrint />
            Yazdır
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#210F61] text-white hover:bg-[#2d1a7a] rounded-lg transition-colors">
            <FaDownload />
            PDF İndir
          </button>
        </div>
      </div>

      {/* Transkript Kartı */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden print:shadow-none">
        {/* Üst Bilgi */}
        <div className="bg-gradient-to-r from-[#210F61] to-[#4a2c9a] text-white p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">{ogrenci.isim} {ogrenci.soyad}</h2>
              <p className="text-white/80 mt-1">{ogrenci.bolum?.bolumAdi}</p>
              <p className="text-white/60 text-sm">{ogrenci.bolum?.fakulte?.fakulteAdi}</p>
            </div>
            <div className="text-right">
              <p className="text-white/70 text-sm">Öğrenci No</p>
              <p className="text-xl font-semibold">{ogrenci.ogrNo}</p>
              <p className="text-white/70 text-sm mt-2">AGNO</p>
              <p className="text-3xl font-bold">{agno?.toFixed(2)}</p>
            </div>
          </div>
        </div>

        {/* Öğrenci Bilgileri */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 bg-gray-50 border-b">
          <div>
            <p className="text-gray-500 text-sm">Kayıt Tarihi</p>
            <p className="font-medium">
              {new Date(ogrenci.kayitTarihi).toLocaleDateString('tr-TR')}
            </p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Akademik Yıl</p>
            <p className="font-medium">{ogrenci.akademikYil}</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Dönem</p>
            <p className="font-medium">{ogrenci.okuduguDonem}. Dönem</p>
          </div>
          <div>
            <p className="text-gray-500 text-sm">Durum</p>
            <p className="font-medium">{ogrenci.statu}</p>
          </div>
        </div>

        {/* Dönemlere Göre Dersler */}
        <div className="p-6">
          {Object.entries(transkript).map(([donemAdi, dersler], idx) => (
            <div key={idx} className="mb-8 last:mb-0">
              <h3 className="text-lg font-semibold text-[#210F61] mb-4 pb-2 border-b-2 border-[#210F61]">
                {donemAdi}
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-500 text-sm">
                      <th className="pb-3 pr-4">Ders Kodu</th>
                      <th className="pb-3 pr-4">Ders Adı</th>
                      <th className="pb-3 pr-4 text-center">Kredi</th>
                      <th className="pb-3 pr-4 text-center">AKTS</th>
                      <th className="pb-3 pr-4 text-center">Harf Notu</th>
                      <th className="pb-3 text-center">Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dersler.map((ders, dersIdx) => (
                      <tr key={dersIdx} className="border-b last:border-0">
                        <td className="py-3 pr-4 font-medium">{ders.dersKodu}</td>
                        <td className="py-3 pr-4">{ders.dersAdi}</td>
                        <td className="py-3 pr-4 text-center">{ders.kredi}</td>
                        <td className="py-3 pr-4 text-center">{ders.akts}</td>
                        <td className={`py-3 pr-4 text-center font-bold ${getHarfNotuColor(ders.harfNotu)}`}>
                          {ders.harfNotu}
                        </td>
                        <td className="py-3 text-center">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            ders.durum === 'Geçti' 
                              ? 'bg-green-100 text-green-700' 
                              : ders.durum === 'Kaldı'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {ders.durum}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Dönem Özeti */}
              <div className="mt-4 flex justify-end gap-6 text-sm">
                <div>
                  <span className="text-gray-500">Toplam Kredi:</span>
                  <span className="ml-2 font-semibold">
                    {dersler.reduce((sum, d) => sum + d.kredi, 0)}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Toplam AKTS:</span>
                  <span className="ml-2 font-semibold">
                    {dersler.reduce((sum, d) => sum + d.akts, 0)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Alt Bilgi */}
        <div className="bg-gray-50 p-6 text-center text-sm text-gray-500 print:bg-white">
          <p>Bu belge {new Date().toLocaleDateString('tr-TR')} tarihinde Öğrenci Bilgi Sistemi üzerinden alınmıştır.</p>
          <p className="mt-1">Resmi belge olarak kullanılamaz.</p>
        </div>
      </div>
    </div>
  );
}
