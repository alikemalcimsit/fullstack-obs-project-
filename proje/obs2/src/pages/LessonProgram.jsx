import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { ogrenciService } from "../services/api";

export default function LessonProgram() {
  const [dersProgrami, setDersProgrami] = useState([]);
  const [loading, setLoading] = useState(true);

  const { ogrNo } = useParams();

  const gunMap = useMemo(
    () => ({
      1: "Pazartesi",
      2: "Salı",
      3: "Çarşamba",
      4: "Perşembe",
      5: "Cuma",
      Pazartesi: "Pazartesi",
      Salı: "Salı",
      Çarşamba: "Çarşamba",
      Perşembe: "Perşembe",
      Cuma: "Cuma",
    }),
    []
  );

  const fallbackSlots = useMemo(
    () => [
      { gun: "Pazartesi", baslangic: "09:00", bitis: "10:50", derslik: "D101" },
      { gun: "Salı", baslangic: "11:00", bitis: "12:50", derslik: "D201" },
      { gun: "Çarşamba", baslangic: "13:30", bitis: "15:20", derslik: "Lab-1" },
      { gun: "Perşembe", baslangic: "09:00", bitis: "10:50", derslik: "D102" },
      { gun: "Cuma", baslangic: "11:00", bitis: "12:50", derslik: "D202" },
    ],
    []
  );

  useEffect(() => {
    const fetchDersProgrami = async () => {
      try {
        setLoading(true);

        // Öğrencinin derslerini al
        const derslerRes = await ogrenciService.getDersler(ogrNo);
        const dersler = Array.isArray(derslerRes?.dersler)
          ? derslerRes.dersler
          : Array.isArray(derslerRes)
          ? derslerRes
          : [];

        // Dersleri id bazlı hızlı erişim için map'le
        const dersMap = new Map(
          dersler.map((d) => {
            const ders = d.ders || d;
            return [ders.id, ders];
          })
        );

        // Program endpoint'ini dene; yoksa fallback kullan
        let programKayitlari = [];
        try {
          const programRes = await ogrenciService.getProgram(ogrNo);
          const rawProgram = Array.isArray(programRes?.program)
            ? programRes.program
            : Array.isArray(programRes)
            ? programRes
            : [];
          programKayitlari = rawProgram;
        } catch (err) {
          console.warn("Program getirilemedi, fallback kullanılacak", err?.message || err);
        }

        // Program kaydı varsa onu kullan, yoksa derslerden haftaya yayılmış sanal program üret
        let program = [];

        if (programKayitlari.length > 0) {
          program = programKayitlari.map((p) => {
            const dersFromMap = dersMap.get(p.dersId) || p.ders || {};
            const ogretmenKaydi =
              p.ogretmen ||
              dersFromMap?.ogretmenDersleri?.[0]?.ogretmen ||
              dersler.find((d) => (d.ders || d)?.id === p.dersId)?.ogretmenDersler?.[0]?.ogretmen;

            return {
              dersKodu: dersFromMap?.dersKodu || "-",
              dersAdi: dersFromMap?.dersAdi || "-",
              gun: gunMap[p.gun] || p.gun || "-",
              baslangicSaati: p.baslangic || "-",
              bitisSaati: p.bitis || "-",
              derslik: p.sinif?.sinifAdi || "-",
              ogretmen: ogretmenKaydi ? `${ogretmenKaydi.isim} ${ogretmenKaydi.soyad}` : "-",
            };
          });
        } else {
          program = dersler.map((d, idx) => {
            const ders = d.ders || d;
            const ogretmenKaydi = d.ogretmenDersler?.[0]?.ogretmen || ders.ogretmenDersleri?.[0]?.ogretmen || null;
            const slot = fallbackSlots[idx % fallbackSlots.length];

            return {
              dersKodu: ders.dersKodu,
              dersAdi: ders.dersAdi,
              gun: slot.gun,
              baslangicSaati: slot.baslangic,
              bitisSaati: slot.bitis,
              derslik: slot.derslik,
              ogretmen: ogretmenKaydi ? `${ogretmenKaydi.isim} ${ogretmenKaydi.soyad}` : "-",
            };
          });
        }

        setDersProgrami(program);
      } catch (error) {
        console.error("Ders programı alınamadı:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDersProgrami();
  }, [ogrNo]);

  // Günlere göre grupla
  const gunler = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma'];
  
  const getDerslerByGun = (gun) => {
    return dersProgrami.filter(d => d.gun === gun);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="px-4">
      <h1 className="text-center font-bold text-3xl mt-20 mb-8">Ders Programı</h1>
      
      {dersProgrami.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <p>Ders programı bulunamadı.</p>
        </div>
      ) : (
        <>
          {/* Tablo Görünümü */}
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-xl shadow-lg overflow-hidden">
              <thead className="bg-[#1C2534] text-white">
                <tr>
                  <th className="py-3 px-4 text-left">Ders Kodu</th>
                  <th className="py-3 px-4 text-left">Ders Adı</th>
                  <th className="py-3 px-4 text-left">Gün</th>
                  <th className="py-3 px-4 text-left">Saat</th>
                  <th className="py-3 px-4 text-left">Derslik</th>
                  <th className="py-3 px-4 text-left">Öğretmen</th>
                </tr>
              </thead>
              <tbody>
                {dersProgrami.map((ders, index) => (
                  <tr 
                    key={index} 
                    className={`${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-100 transition-colors`}
                  >
                    <td className="py-3 px-4 font-medium">{ders.dersKodu}</td>
                    <td className="py-3 px-4">{ders.dersAdi}</td>
                    <td className="py-3 px-4">{ders.gun}</td>
                    <td className="py-3 px-4">{ders.baslangicSaati} - {ders.bitisSaati}</td>
                    <td className="py-3 px-4">{ders.derslik}</td>
                    <td className="py-3 px-4">{ders.ogretmen}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Haftalık Görünüm */}
          <h2 className="text-center font-bold text-2xl mt-12 mb-6">Haftalık Görünüm</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {gunler.map((gun) => (
              <div key={gun} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-[#1C2534] text-white py-3 px-4 text-center font-semibold">
                  {gun}
                </div>
                <div className="p-3 space-y-2 min-h-[200px]">
                  {getDerslerByGun(gun).length > 0 ? (
                    getDerslerByGun(gun).map((ders, index) => (
                      <div 
                        key={index} 
                        className="bg-blue-50 border-l-4 border-blue-500 p-2 rounded"
                      >
                        <div className="font-medium text-sm">{ders.dersAdi}</div>
                        <div className="text-xs text-gray-500">
                          {ders.baslangicSaati} - {ders.bitisSaati}
                        </div>
                        <div className="text-xs text-gray-400">{ders.derslik}</div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center text-gray-400 text-sm py-4">
                      Ders yok
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}