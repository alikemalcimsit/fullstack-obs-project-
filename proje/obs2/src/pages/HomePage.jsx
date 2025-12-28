import React, { useEffect, useState } from 'react'
import TimelineCard from '../components/TimelineCard'
import AttentionCard from '../components/AttentionCard'
import AnnouncementsCard from '../components/AnnouncementsCard'
import MessagesCard from '../components/MessagesCard'
import { useParams } from 'react-router-dom'
import { ogrenciService, duyuruService } from '../services/api'

export default function HomePage() {
  const [student, setStudent] = useState(null);
  const [duyurular, setDuyurular] = useState([]);
  const [loading, setLoading] = useState(true);
  const { ogrNo } = useParams();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const getDuyurular = async () => {
        try {
          const response = await duyuruService.getAll();
          setDuyurular(response.duyurular || []);
        } catch (error) {
          console.error('Duyurular alınamadı:', error);
        }
      };

      const getStudent = async () => {
        try {
          const response = await ogrenciService.getByOgrNo(ogrNo);
          setStudent(response.user);
        } catch (error) {
          console.error('Öğrenci bilgisi alınamadı:', error);
        }
      };

      await Promise.all([getStudent(), getDuyurular()]);
      setLoading(false);
    };
    fetchData();
  }, [ogrNo]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#210F61]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero / Welcome */}
      <div className="bg-gradient-to-r from-[#210F61] via-[#3b2f86] to-[#5b4fb3] rounded-3xl text-white p-6 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-white/70 text-sm">Bugün {new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          <h1 className="text-3xl font-bold mt-2">Hoş geldin, {student?.isim} 👋</h1>
          <p className="text-white/80 mt-1">Bölüm: {student?.bolum?.bolumAdi || '-'} • {student?.okuduguDonem}. Dönem</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-4">
          <div className="bg-white/10 backdrop-blur rounded-2xl px-4 py-3 text-right">
            <p className="text-white/70 text-xs">AGNO</p>
            <p className="text-2xl font-semibold">{student?.agno?.toFixed(2) || '0.00'}</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-2xl px-4 py-3 text-right">
            <p className="text-white/70 text-xs">Kredi</p>
            <p className="text-2xl font-semibold">{student?.toplamKredi || '—'}</p>
          </div>
        </div>
      </div>

      {/* Timeline & Attention */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-3xl shadow-lg p-4 border border-gray-100">
            <TimelineCard student={student} />
          </div>
        </div>
        <div>
          <div className="bg-white rounded-3xl shadow-lg p-4 border border-gray-100">
            <AttentionCard student={student} />
          </div>
        </div>
      </div>

      {/* Duyurular & Mesajlar */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h6 className="font-semibold text-lg text-gray-800">Duyurular</h6>
          </div>
          {duyurular.length > 0 ? (
            duyurular.map((duyuru) => (
              <AnnouncementsCard
                key={duyuru?.id}
                title={duyuru?.baslik}
                content={duyuru?.icerik}
                onemli={duyuru?.onemliMi}
                tarih={duyuru?.yayinTarihi}
              />
            ))
          ) : (
            <div className="bg-white rounded-xl p-6 shadow-md text-center text-gray-500 border border-dashed border-gray-200">
              Henüz duyuru bulunmuyor.
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h6 className="font-semibold text-lg text-gray-800">Mesajlar</h6>
            <button className="font-semibold text-sm text-[#210F61] hover:underline">
              Tümünü Gör
            </button>
          </div>
          <div className="bg-white rounded-3xl shadow-lg p-4 border border-gray-100">
            <MessagesCard student={student} />
          </div>
        </div>
      </div>
    </div>
  )
}
