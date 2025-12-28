import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { mesajService, authService } from "../services/api";

export default function Messages() {
  const { ogrNo } = useParams();
  
  const [gelenMesajlar, setGelenMesajlar] = useState([]);
  const [gidenMesajlar, setGidenMesajlar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [activeTab, setActiveTab] = useState('gelen');
  
  // Yeni mesaj state'leri
  const [aliciEmail, setAliciEmail] = useState('');
  const [konu, setKonu] = useState('');
  const [metin, setMetin] = useState('');
  const [showNewMessage, setShowNewMessage] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Öğrenci bilgilerini localStorage'dan al
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          // Gelen mesajları al
          const mesajlarRes = await mesajService.getByOgrenciId(currentUser.id);
          // Gelen ve giden mesajları ayır
          const gelen = (mesajlarRes || []).filter(m => m.aliciOgrenciId === currentUser.id);
          const giden = (mesajlarRes || []).filter(m => m.gonderenOgrenciId === currentUser.id);
          setGelenMesajlar(gelen);
          setGidenMesajlar(giden);
        }
      } catch (error) {
        console.error('Mesajlar alınamadı:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [ogrNo]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!metin.trim()) {
      alert('Lütfen mesaj metni giriniz.');
      return;
    }

    try {
      setSending(true);
      
      // Not: API katmanında mesajService.send mevcut. Bu sayfa eski akış kullandığı için
      // backend sözleşmesi netleşene kadar burada send ile ilerliyoruz.
      await mesajService.send({
        aliciEmail,
        konu,
        mesajMetni: metin,
      });
      
      alert('Mesaj başarıyla gönderildi!');
      
      // Formu temizle
      setAliciEmail('');
      setKonu('');
      setMetin('');
      setShowNewMessage(false);
      
      // Mesajları yenile (mevcut kullanıcı için tekrar çek)
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        const mesajlarRes = await mesajService.getByOgrenciId(currentUser.id);
        const gelen = (mesajlarRes || []).filter(m => m.aliciOgrenciId === currentUser.id);
        const giden = (mesajlarRes || []).filter(m => m.gonderenOgrenciId === currentUser.id);
        setGelenMesajlar(gelen);
        setGidenMesajlar(giden);
      }
    } catch (error) {
      console.error('Mesaj gönderilemedi:', error);
      alert('Mesaj gönderilemedi: ' + (error.response?.data?.message || error.message));
    } finally {
      setSending(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
    <div className="mx-4 md:mx-20">
      {/* Başlık ve Yeni Mesaj Butonu */}
      <div className="flex justify-between items-center mt-10 mb-6">
        <h1 className="text-3xl font-bold">Mesajlar</h1>
        <button
          onClick={() => setShowNewMessage(!showNewMessage)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showNewMessage ? 'İptal' : '+ Yeni Mesaj'}
        </button>
      </div>

      {/* Yeni Mesaj Formu */}
      {showNewMessage && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Yeni Mesaj Gönder</h2>
          <form onSubmit={handleSendMessage}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alıcı E-posta
                </label>
                <input
                  type="email"
                  value={aliciEmail}
                  onChange={(e) => setAliciEmail(e.target.value)}
                  className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                  placeholder="ornek@mail.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Konu
                </label>
                <input
                  type="text"
                  value={konu}
                  onChange={(e) => setKonu(e.target.value)}
                  className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:outline-none"
                  placeholder="Mesaj konusu"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mesaj
                </label>
                <textarea
                  value={metin}
                  onChange={(e) => setMetin(e.target.value)}
                  className="w-full p-3 border-2 border-gray-300 rounded-xl h-32 focus:border-blue-500 focus:outline-none resize-none"
                  placeholder="Mesajınızı yazın..."
                  required
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="w-full py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:bg-gray-400"
              >
                {sending ? 'Gönderiliyor...' : 'Gönder'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tab Navigasyonu */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('gelen')}
          className={`px-6 py-3 font-medium ${
            activeTab === 'gelen'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Gelen Kutusu ({gelenMesajlar.length})
        </button>
        <button
          onClick={() => setActiveTab('giden')}
          className={`px-6 py-3 font-medium ${
            activeTab === 'giden'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Gönderilenler ({gidenMesajlar.length})
        </button>
      </div>

      {/* Mesaj Listesi */}
      <div className="space-y-4">
        {activeTab === 'gelen' ? (
          gelenMesajlar.length > 0 ? (
            gelenMesajlar.map((mesaj, i) => (
              <div key={i} className={`bg-white rounded-xl shadow-md p-4 border-l-4 ${mesaj.okundu ? 'border-gray-300' : 'border-blue-500'}`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      {mesaj.gonderenOgretmen?.isim} {mesaj.gonderenOgretmen?.soyad || 'Bilinmeyen Gönderen'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {mesaj.konu || 'Konu Yok'}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {formatDate(mesaj.gonderimTarihi)}
                  </span>
                </div>
                <p className="text-gray-600">{mesaj.icerik}</p>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-8">
              <p>Gelen kutunuz boş.</p>
            </div>
          )
        ) : (
          gidenMesajlar.length > 0 ? (
            gidenMesajlar.map((mesaj, i) => (
              <div key={i} className="bg-white rounded-xl shadow-md p-4 border-l-4 border-green-400">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-800">
                      Alıcı: {mesaj.aliciOgretmen?.isim} {mesaj.aliciOgretmen?.soyad || mesaj.aliciOgrenci?.isim || 'Bilinmeyen'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {mesaj.konu || 'Konu Yok'}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400">
                    {formatDate(mesaj.gonderimTarihi)}
                  </span>
                </div>
                <p className="text-gray-600">{mesaj.icerik}</p>
              </div>
            ))
          ) : (
            <div className="text-center text-gray-500 py-8">
              <p>Gönderilmiş mesajınız yok.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
  