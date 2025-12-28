import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FaCalculator, FaBookOpen } from 'react-icons/fa';
import { ogrenciService } from '../services/api';

const LETTER_POINTS = {
  AA: 4.0,
  BA: 3.5,
  BB: 3.0,
  CB: 2.5,
  CC: 2.0,
  DC: 1.5,
  DD: 1.0,
  FD: 0.5,
  FF: 0.0,
};

const gradeOptions = Object.keys(LETTER_POINTS);

export default function AgnoCalculator() {
  const { ogrNo } = useParams();
  const [dersler, setDersler] = useState([]);
  const [harfMap, setHarfMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const dersRes = await ogrenciService.getDersler(ogrNo);
        const list = Array.isArray(dersRes?.dersler) ? dersRes.dersler : Array.isArray(dersRes) ? dersRes : [];
        setDersler(list);
        // Prefill existing grades if any
        const initial = {};
        list.forEach((dk) => {
          const ders = dk.ders || dk;
          if (dk.harfNotu) initial[ders.id] = dk.harfNotu;
        });
        setHarfMap(initial);
      } catch (error) {
        console.error('Dersler alınamadı', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [ogrNo]);

  const hesap = useMemo(() => {
    let toplamKredi = 0;
    let toplamPuan = 0;

    dersler.forEach((dk) => {
      const ders = dk.ders || dk;
      const harf = harfMap[ders.id];
      const puan = LETTER_POINTS[harf] ?? null;
      if (puan !== null && ders?.kredi) {
        toplamKredi += ders.kredi;
        toplamPuan += puan * ders.kredi;
      }
    });

    const agno = toplamKredi > 0 ? (toplamPuan / toplamKredi).toFixed(2) : '0.00';
    return { agno, toplamKredi };
  }, [dersler, harfMap]);

  const handleChange = (dersId, value) => {
    setHarfMap((prev) => ({ ...prev, [dersId]: value }));
  };

  const grouped = useMemo(() => {
    const map = new Map();
    dersler.forEach((dk) => {
      const ders = dk.ders || dk;
      const donemId = ders?.donem?.id || ders?.donemId || 0;
      const donemAdi = ders?.donem?.donemAdi || `${donemId}. Dönem`;
      const key = `${donemId}-${donemAdi}`;
      if (!map.has(key)) map.set(key, { donemId, donemAdi, items: [] });
      map.get(key).items.push(dk);
    });
    return Array.from(map.values()).sort((a, b) => a.donemId - b.donemId);
  }, [dersler]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#210F61]"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaCalculator className="text-[#210F61]" /> AGNO Hesaplama
          </h1>
          <p className="text-gray-500 mt-1">Aldığınız derslere harf notu girerek AGNO'yu hesaplayın.</p>
        </div>
        <div className="bg-gradient-to-r from-[#210F61] to-[#4a2c9a] text-white rounded-xl p-4 shadow">
          <p className="text-white/80 text-sm">Hesaplanan AGNO</p>
          <p className="text-4xl font-bold leading-tight">{hesap.agno}</p>
          <p className="text-white/70 text-xs mt-1">Toplam kredi: {hesap.toplamKredi || 0}</p>
        </div>
      </div>

      <div className="space-y-4">
        {grouped.map((group) => (
          <div key={group.donemId} className="overflow-x-auto bg-white rounded-2xl shadow-lg">
            <div className="bg-gray-50 px-4 py-3 border-b flex items-center justify-between">
              <h2 className="font-semibold text-lg">{group.donemAdi}</h2>
              <span className="text-sm text-gray-500">{group.items.length} ders</span>
            </div>
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Ders</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Kredi</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Dönem</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Harf Notu</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {group.items.map((dk) => {
                  const ders = dk.ders || dk;
                  return (
                    <tr key={ders.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#210F61]/10 flex items-center justify-center">
                          <FaBookOpen className="text-[#210F61]" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{ders.dersAdi}</p>
                          <p className="text-sm text-gray-500">{ders.dersKodu}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{ders.kredi}</td>
                      <td className="px-4 py-3 text-gray-700">{ders.donem?.donemAdi || `Dönem ${ders.donemId || ''}`}</td>
                      <td className="px-4 py-3">
                        <select
                          value={harfMap[ders.id] || ''}
                          onChange={(e) => handleChange(ders.id, e.target.value)}
                          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#210F61]"
                        >
                          <option value="">Seçiniz</option>
                          {gradeOptions.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}
