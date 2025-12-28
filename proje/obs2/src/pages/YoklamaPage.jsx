import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import YoklamaTable from '../components/YoklamaTable';
import { ogrenciService, authService } from '../services/api';

export default function YoklamaPage() {
  const [student, setStudent] = useState(null);
  const [dersler, setDersler] = useState([]);
  const [yoklamalar, setYoklamalar] = useState([]);
  const [loading, setLoading] = useState(true);

  const { ogrNo } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Öğrenci bilgilerini localStorage'dan al
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          setStudent(currentUser);
          
          // Öğrencinin derslerini al
          const derslerRes = await ogrenciService.getDersler(currentUser.ogrNo);
          setDersler(derslerRes?.dersler || derslerRes || []);
          
          // Yoklama bilgilerini al ve normalize et
          const yoklamaRes = await ogrenciService.getYoklama(currentUser.ogrNo);
          const rawYoklamalar = yoklamaRes?.yoklamalar || yoklamaRes || [];
          const normalized = rawYoklamalar.map((y) => ({
            DersID: y.dersId || y.DersID || y.ders?.id,
            Durum: y.durum || y.Durum,
            Tarih: y.tarih,
          }));
          setYoklamalar(normalized);
        }
      } catch (error) {
        console.error('Veri alınamadı:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ogrNo]);

  // Yoklama verilerini derslerle eşleştir
  const getYoklamaData = () => {
    return (dersler || []).map((od) => {
      const ders = od.ders || od;
      const dersYoklamalari = yoklamalar.filter((y) => y.DersID === ders?.id);
      const toplamDers = dersYoklamalari.length;
      const devamsizlik = dersYoklamalari.filter((y) => (y.Durum || '').toLowerCase() !== 'var').length;
      const devamOrani = toplamDers > 0 ? (((toplamDers - devamsizlik) / toplamDers) * 100).toFixed(0) : '100';

      return {
        DersID: ders?.id,
        DersKodu: ders?.dersKodu,
        DersAdi: ders?.dersAdi,
        kredi: ders?.kredi,
        DonemID: ders?.donemId,
        toplamDers,
        devamsizlik,
        devamOrani,
        yoklamalar: dersYoklamalari,
      };
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className='space-y-8 mt-20'>
      <h1 className='text-center text-3xl font-bold'>
        {student?.bolum?.bolumAdi || 'Yoklama Bilgisi'}
      </h1>

      <div>
        {dersler.length > 0 ? (
          <YoklamaTable yoklama={yoklamalar} dersler={getYoklamaData()} />
        ) : (
          <div className="text-center text-gray-500 py-8">
            <p>Henüz yoklama verisi bulunmamaktadır.</p>
          </div>
        )}
      </div>
    </div>
  );
}
