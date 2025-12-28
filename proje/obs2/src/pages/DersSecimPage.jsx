import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ogrenciService } from '../services/api';
import { FaBook, FaPlus, FaCheck, FaUserTie, FaClock } from 'react-icons/fa';

export default function DersSecimPage() {
  const { ogrNo } = useParams();
  const [student, setStudent] = useState(null);
  const [availableDersler, setAvailableDersler] = useState([]);
  const [kayitliDersler, setKayitliDersler] = useState([]);
  const [selectedDersler, setSelectedDersler] = useState([]);
  const [kurallar, setKurallar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('mevcut');
  const [submitting, setSubmitting] = useState(false);
  const maxKredi = kurallar?.maxKredi || 40;
  const aktifKredi = kurallar?.aktifKredi || 0;

  const fetchData = async () => {
    setLoading(true);
    try {
      const studentResponse = await ogrenciService.getByOgrNo(ogrNo);
      setStudent(studentResponse.user);

      const derslerResponse = await ogrenciService.getDersler(ogrNo);
      setKayitliDersler(derslerResponse.dersler || []);

      const availableResponse = await ogrenciService.getUygunDersler(ogrNo);
      setAvailableDersler(availableResponse.dersler || []);
      setKurallar(availableResponse.kurallar || null);
    } catch (error) {
      console.error('Veri alınamadı:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ogrNo]);

  const isKayitli = (dersId) => {
    return kayitliDersler.some(kd => kd.dersId === dersId);
  };

  const isSelected = (dersId) => {
    return selectedDersler.includes(dersId);
  };

  const getSecilenToplamKredi = (candidateIds = selectedDersler) => {
    return availableDersler
      .filter((d) => candidateIds.includes(d.id))
      .reduce((sum, d) => sum + (d.kredi || 0), 0);
  };

  const toggleDers = (ders) => {
    if (!ders?.secilebilir || ders?.kontenjanKalan <= 0) return;

    if (isSelected(ders.id)) {
      setSelectedDersler((prev) => prev.filter((id) => id !== ders.id));
    } else {
      const yeniSecimler = [...selectedDersler, ders.id];
      const yeniKredi = aktifKredi + getSecilenToplamKredi(yeniSecimler);
      if (yeniKredi > maxKredi) {
        alert(`Maksimum ${maxKredi} kredi sınırını aşıyorsunuz.`);
        return;
      }
      setSelectedDersler(yeniSecimler);
    }
  };

  const getToplam = () => {
    const secilenDersler = availableDersler.filter(d => isSelected(d.id));
    return {
      kredi: secilenDersler.reduce((sum, d) => sum + d.kredi, 0),
      akts: secilenDersler.reduce((sum, d) => sum + d.akts, 0),
      ders: secilenDersler.length,
    };
  };

  const handleSubmit = async () => {
    if (selectedDersler.length === 0) return;
    setSubmitting(true);
    try {
  const response = await ogrenciService.submitDersSecim(ogrNo, selectedDersler);
  alert(response.message || 'Dersleriniz kaydedildi.');
      setSelectedDersler([]);
      await fetchData();
    } catch (error) {
      const msg = error?.response?.data?.error || 'Ders seçimi gönderilemedi';
      alert(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#210F61]"></div>
      </div>
    );
  }

  const toplam = getToplam();

  return (
    <div className="p-6">
      {/* Başlık */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaBook className="text-[#210F61]" />
            Ders Seçimi
          </h1>
          <p className="text-gray-500 mt-1">
            {student?.okuduguDonem}. Dönem için ders seçimi yapın
          </p>
          {kurallar?.hasLowerFF && (
            <p className="text-sm text-red-600 mt-1">Alttan FF dersleriniz önceliklidir, onları seçmeden üstten ders alamazsınız.</p>
          )}
          {kurallar && !kurallar.allowUpper && (
            <p className="text-sm text-orange-600">Üstten ders alabilmek için AGNO ≥ 2.5 ve alttan FF olmamalı.</p>
          )}
        </div>

        {/* Seçim Özeti */}
        {selectedDersler.length > 0 && (
          <div className="bg-[#210F61] text-white rounded-xl p-4">
            <p className="text-sm text-white/70">Seçilen</p>
            <div className="flex gap-4 mt-1">
              <div>
                <span className="text-2xl font-bold">{toplam.ders}</span>
                <span className="text-sm ml-1">Ders</span>
              </div>
              <div>
                <span className="text-2xl font-bold">{toplam.kredi}</span>
                <span className="text-sm ml-1">Kredi</span>
              </div>
              <div>
                <span className="text-2xl font-bold">{toplam.akts}</span>
                <span className="text-sm ml-1">AKTS</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tab Bar */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('mevcut')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'mevcut'
              ? 'bg-[#210F61] text-white'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          Kayıtlı Dersler ({kayitliDersler.length})
        </button>
        <button
          onClick={() => setActiveTab('secim')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'secim'
              ? 'bg-[#210F61] text-white'
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          Ders Seçimi
        </button>
      </div>

      {/* Kayıtlı Dersler */}
      {activeTab === 'mevcut' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kayitliDersler.length > 0 ? (
            kayitliDersler.map((kayit) => (
              <div
                key={kayit.id}
                className="bg-white rounded-xl shadow-md p-4 border-l-4 border-green-500"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-800">{kayit.ders.dersAdi}</h3>
                    <p className="text-sm text-gray-500">{kayit.ders.dersKodu}</p>
                  </div>
                  <FaCheck className="text-green-500" />
                </div>
                <div className="flex gap-4 mt-3 text-sm text-gray-600">
                  <span>{kayit.ders.kredi} Kredi</span>
                  <span>{kayit.ders.akts} AKTS</span>
                </div>
                {kayit.ders.ogretmenDersleri?.[0] && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                    <FaUserTie />
                    <span>
                      {kayit.ders.ogretmenDersleri[0].ogretmen.unvan} {kayit.ders.ogretmenDersleri[0].ogretmen.isim} {kayit.ders.ogretmenDersleri[0].ogretmen.soyad}
                    </span>
                  </div>
                )}
                <div className="mt-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    kayit.durum === 'Devam Ediyor' 
                      ? 'bg-blue-100 text-blue-700' 
                      : kayit.durum === 'Geçti'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {kayit.durum}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-12 text-gray-500">
              Kayıtlı ders bulunamadı.
            </div>
          )}
        </div>
      )}

      {/* Ders Seçimi */}
      {activeTab === 'secim' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableDersler
              .filter(d => !isKayitli(d.id))
              .map((ders) => (
                <div
                  key={ders.id}
                  onClick={() => toggleDers(ders)}
                  className={`bg-white rounded-xl shadow-md p-4 cursor-pointer transition-all border-2 ${
                    !ders.secilebilir || ders.kontenjanKalan <= 0
                      ? 'border-red-200 bg-red-50 cursor-not-allowed'
                      : isSelected(ders.id)
                        ? 'border-[#210F61] bg-[#210F61]/5'
                        : 'border-transparent hover:border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-800">{ders.dersAdi}</h3>
                      <p className="text-sm text-gray-500">{ders.dersKodu}</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      isSelected(ders.id)
                        ? 'bg-[#210F61] border-[#210F61]'
                        : 'border-gray-300'
                    }`}>
                      {isSelected(ders.id) && <FaCheck className="text-white text-xs" />}
                    </div>
                  </div>
                  <div className="flex gap-4 mt-3 text-sm text-gray-600">
                    <span>{ders.kredi} Kredi</span>
                    <span>{ders.akts} AKTS</span>
                    <span className={ders.zorunlu && !ders.secmeli ? 'text-red-500' : 'text-green-500'}>
                      {ders.zorunlu && !ders.secmeli ? 'Zorunlu' : 'Seçmeli'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                    <FaClock />
                    <span>{ders.donem?.donemAdi}</span>
                  </div>
                  <div className="mt-2 text-sm text-gray-600">
                    Kontenjan: {ders.kontenjanKalan} / {ders.kontenjan}
                    {ders.tekrar && <span className="ml-2 text-orange-600">Alttan tekrar</span>}
                  </div>
                  {ders.ogretmenDersleri?.[0] && (
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                      <FaUserTie />
                      <span>
                        {ders.ogretmenDersleri[0].ogretmen?.isim} {ders.ogretmenDersleri[0].ogretmen?.soyad}
                      </span>
                    </div>
                  )}
                </div>
              ))}
          </div>

          {/* Submit Button */}
          {selectedDersler.length > 0 && (
            <div className="fixed bottom-6 right-6">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl shadow-lg transition-colors text-white ${
                  submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#210F61] hover:bg-[#2d1a7a]'
                }`}
              >
                <FaPlus />
                Seçimi Onayla ({selectedDersler.length} ders)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
