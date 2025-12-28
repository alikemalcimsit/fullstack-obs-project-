import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import LessonTable from '../components/LessonTable';
import { ogrenciService, authService } from '../services/api';

export default function LessonList() {
  const [student, setStudent] = useState(null);
  const [dersler, setDersler] = useState([]);
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
          const dersArray = Array.isArray(derslerRes?.dersler)
            ? derslerRes.dersler
            : Array.isArray(derslerRes)
              ? derslerRes
              : [];
          setDersler(dersArray);
        }
      } catch (error) {
        console.error('Veri alınamadı:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ogrNo]);

  // Dersleri döneme göre grupla
  const resolveDonemNo = (od) => od?.ders?.donem?.id ?? od?.ders?.donemId ?? 0;

  const getDerslerByDonem = (donemNo) => {
    if (!Array.isArray(dersler)) return [];
    return dersler.filter((od) => resolveDonemNo(od) === donemNo);
  };

  // Toplam dönem sayısını bul
  const maxDonem = Array.isArray(dersler)
    ? dersler.reduce((max, od) => {
        const donemNo = resolveDonemNo(od) || 0;
        return donemNo > max ? donemNo : max;
      }, 0)
    : 0;

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
        {student?.bolum?.bolumAdi || 'Ders Listesi'}
      </h1>
      
      {dersler.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <p>Henüz kayıtlı ders bulunmamaktadır.</p>
        </div>
      ) : (
        Array.from({ length: maxDonem || 8 }, (_, index) => {
          const donemDersler = getDerslerByDonem(index + 1);
          if (donemDersler.length === 0) return null;
          return (
            <div key={index}>
              <LessonTable 
                index={index + 1} 
                dersler={donemDersler.map(od => ({
                  id: od.ders?.id ?? od.dersId ?? od.id,
                  dersKodu: od.ders?.dersKodu,
                  dersAdi: od.ders?.dersAdi,
                  kredi: od.ders?.kredi,
                  akts: od.ders?.akts,
                  zorunlu: od.ders?.zorunlu,
                  durum: od.durum
                }))} 
              />
            </div>
          );
        })
      )}
    </div>
  );
}
