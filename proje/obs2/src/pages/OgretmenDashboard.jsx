import React, { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  Typography,
  Button,
  Spinner,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Select,
  Option,
} from '@material-tailwind/react';
import {
  BookOpenIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  AcademicCapIcon,
  ArrowRightOnRectangleIcon,
  HomeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import api, { notYonetimService, yoklamaService, spService } from '../services/api';

// Tab Components
import DerslerimTab from '../components/ogretmen/DerslerimTab';
import NotlarTab from '../components/ogretmen/NotlarTab';
import YoklamaTab from '../components/ogretmen/YoklamaTab';
import OgrencilerTab from '../components/ogretmen/OgrencilerTab';
import MesajlarTab from '../components/ogretmen/MesajlarTab';
import DersProgramiTab from '../components/ogretmen/DersProgramiTab';

const OgretmenDashboard = () => {
  const navigate = useNavigate();
  
  // State Management
  const [activeTab, setActiveTab] = useState('anasayfa');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  
  // Data State
  const [ogretmen, setOgretmen] = useState(null);
  const [dersler, setDersler] = useState([]);
  const [selectedDers, setSelectedDers] = useState(null);
  const [ogrenciler, setOgrenciler] = useState([]);
  const [sinavlar, setSinavlar] = useState([]);
  const [yoklamalar, setYoklamalar] = useState([]);
  const [notlar, setNotlar] = useState({});
  const [sinavDialogOpen, setSinavDialogOpen] = useState(false);
  const [sinavForm, setSinavForm] = useState({
    sinavAdi: '',
    sinavTarihi: '',
    sinavTuru: 'Vize',
    sure: 60,
    agirlik: 0.4,
  });
  const [istatistikler, setIstatistikler] = useState({
    toplamDers: 0,
    toplamOgrenci: 0,
    bugunDersSayisi: 0,
    bekleyenMesaj: 0
  });

  // SQL Server fonksiyon/view/log verileri
  const [sqlArtifacts, setSqlArtifacts] = useState({
    bolumOgrenciSayisi: null,
    bolumOrtalamaAgno: null,
    donemDersSayisi: null,
    bolumOgrenciler: [],
    notlarLog: [],
    yoklamaLog: []
  });

  // Menu Items
  const menuItems = [
    { id: 'anasayfa', label: 'Ana Sayfa', icon: HomeIcon },
    { id: 'derslerim', label: 'Derslerim', icon: BookOpenIcon },
    { id: 'notlar', label: 'Not Yönetimi', icon: ClipboardDocumentListIcon },
    { id: 'yoklama', label: 'Yoklama', icon: CalendarDaysIcon },
    { id: 'ogrenciler', label: 'Öğrenciler', icon: UserGroupIcon },
    { id: 'mesajlar', label: 'Mesajlar', icon: ChatBubbleLeftRightIcon },
    { id: 'ders-programi', label: 'Ders Programı', icon: CalendarDaysIcon },
  ];

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load students when a course is selected
  useEffect(() => {
    if (selectedDers) {
      loadOgrenciler(selectedDers.id);
      loadSinavlar(selectedDers.id);
      loadYoklamalar(selectedDers.id);
      // Ders değişince önceki dersin not-giriş state'ini karıştırmamak için temizle
      setNotlar({});
    }
  }, [selectedDers]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Load teacher info (includes verdigiDersler)
      const ogretmenResponse = await api.get('/auth/me');
      const userData = ogretmenResponse.data.user;
      setOgretmen(userData);

      // Use verdigiDersler from /me response or fetch separately
      let derslerData = [];
      if (userData.verdigiDersler && userData.verdigiDersler.length > 0) {
        // Extract ders from verdigiDersler relation
        derslerData = userData.verdigiDersler.map(vd => vd.ders);
      } else {
        // Fallback: fetch from separate endpoint
        try {
          const derslerResponse = await api.get('/ogretmen/dersler');
          derslerData = derslerResponse.data?.dersler || derslerResponse.data || [];
        } catch (e) {
          console.log('Dersler ayrı endpoint\'den alınamadı, verdigiDersler kullanılacak');
        }

        // Ek fallback: SP üzerinden bölüm derslerini çek (SQL Server SP kullanımı)
        if ((!derslerData || derslerData.length === 0) && userData?.bolumId) {
          try {
            derslerData = await spService.getBolumDersleri(userData.bolumId);
          } catch (err) {
            console.log('SP ile dersler alınamadı:', err.message);
          }
        }
      }
      
      setDersler(Array.isArray(derslerData) ? derslerData : []);

      // Calculate statistics
      let toplamOgrenci = 0;
      (Array.isArray(derslerData) ? derslerData : []).forEach(ders => {
        toplamOgrenci += ders.ogrenciSayisi || ders._count?.ogrenciDersleri || 0;
      });

      setIstatistikler({
        toplamDers: derslerData.length,
        toplamOgrenci,
        bugunDersSayisi: Math.floor(Math.random() * 4) + 1,
        bekleyenMesaj: Math.floor(Math.random() * 5)
      });

      // SQL Server fonksiyon/view/loglarını yükle
      if (userData?.bolumId) {
        fetchSqlArtifacts(userData.bolumId, derslerData);
      }

    } catch (error) {
      console.error('Veri yüklenirken hata:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSqlArtifacts = async (bolumId, derslerList = []) => {
    try {
      const [ogrenciSayisi, ortAgno, bolumOgrencileri, notlarLog, yoklamaLog] = await Promise.all([
        spService.getBolumOgrenciSayisi(bolumId),
        spService.getBolumOrtalamaAgno(bolumId),
        spService.getBolumOgrencileriView(bolumId),
        spService.getNotlarLog(),
        spService.getYoklamaLog(),
      ]);

      // Donem bilgisi yoksa ders sayısını mevcut ders listesinden türet
      const donemId = (derslerList?.[0]?.donemId) || null;
      const donemDersSayisi = donemId ? await spService.getDonemDersSayisi(donemId) : (Array.isArray(derslerList) ? derslerList.length : 0);

      setSqlArtifacts({
        bolumOgrenciSayisi: ogrenciSayisi,
        bolumOrtalamaAgno: ortAgno,
        donemDersSayisi,
        bolumOgrenciler: Array.isArray(bolumOgrencileri) ? bolumOgrencileri : [],
        notlarLog: Array.isArray(notlarLog) ? notlarLog : [],
        yoklamaLog: Array.isArray(yoklamaLog) ? yoklamaLog : [],
      });
    } catch (error) {
      console.error('SQL objeleri alınamadı:', error);
    }
  };

  const loadOgrenciler = async (dersId) => {
    try {
      const response = await api.get(`/ogretmen/ders/${dersId}/ogrenciler`);
      // Backend formatı bazen { ogrenciler: [...] } olabilir.
      const data = response.data?.ogrenciler ?? response.data;
      setOgrenciler(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Öğrenciler yüklenirken hata:', error);
      setOgrenciler([]);
    }
  };

  const loadSinavlar = async (dersId) => {
    try {
      const response = await notYonetimService.getSinavlar(dersId);
      const sinavlarData = response?.sinavlar || [];
      setSinavlar(sinavlarData);

      // Mevcut notları önceden doldur (prefill)
      await loadExistingNotlar(sinavlarData);
    } catch (error) {
      console.error('Sınavlar yüklenirken hata:', error);
      setSinavlar([]);
    }
  };

  const loadExistingNotlar = async (sinavlarList) => {
    try {
      const newNotlar = {};
      for (const sinav of sinavlarList) {
        try {
          const resp = await notYonetimService.getSinavNotlari(sinav.id);
          const notlarArr = Array.isArray(resp?.notlar) ? resp.notlar : (Array.isArray(resp) ? resp : []);
          for (const n of notlarArr) {
            if (n.ogrenciId && n.sinavId && n.puan !== undefined && n.puan !== null) {
              newNotlar[`${n.ogrenciId}-${n.sinavId}`] = n.puan;
            }
          }
        } catch (e) {
          // 404 durumunda servis zaten boş döner; diğer hatalarda uyarı ver
          if (e?.response?.status !== 404) {
            console.warn('Notlar alınamadı (sinavId:', sinav.id, '):', e.message);
          }
        }
      }
      setNotlar(newNotlar);
    } catch (error) {
      console.error('Mevcut notlar yüklenirken hata:', error);
    }
  };

  const loadYoklamalar = async (dersId) => {
    try {
      const response = await yoklamaService.getByDers(dersId);
      // Backend formatı: { yoklamalar: [...] } veya direkt array olabilir
      const data = response?.yoklamalar ?? response;
      setYoklamalar(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Yoklamalar yüklenirken hata:', error);
      setYoklamalar([]);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleSelectDers = (ders) => {
    setSelectedDers(ders);
    // Automatically switch to grades tab after selecting a course
    setActiveTab('notlar');
  };

  const openSinavDialog = () => {
    if (!selectedDers) {
      alert('Önce bir ders seçmelisiniz.');
      return;
    }

    setSinavForm({
      sinavAdi: `${selectedDers.dersAdi} - Vize`,
      sinavTarihi: '',
      sinavTuru: 'Vize',
      sure: 60,
      agirlik: 0.4,
    });
    setSinavDialogOpen(true);
  };

  const handleSinavTuruChange = (tur) => {
    const defaultAgirlik = tur === 'Final' || tur === 'Bütünleme' ? 0.6 : 0.4;
    const defaultAdi = `${selectedDers?.dersAdi || ''} - ${tur}`.trim();
    setSinavForm((prev) => ({
      ...prev,
      sinavTuru: tur,
      agirlik: defaultAgirlik,
      sinavAdi: prev.sinavAdi?.trim() ? prev.sinavAdi : defaultAdi,
    }));
  };

  const handleCreateSinav = async () => {
    try {
      if (!selectedDers) {
        alert('Önce bir ders seçmelisiniz.');
        return;
      }

      if (!sinavForm.sinavAdi?.trim() || !sinavForm.sinavTarihi) {
        alert('Sınav adı ve tarihi zorunludur.');
        return;
      }

      await notYonetimService.createSinav({
        sinavAdi: sinavForm.sinavAdi.trim(),
        dersId: selectedDers.id,
        sinavTarihi: sinavForm.sinavTarihi,
        sinavTuru: sinavForm.sinavTuru,
        sure: sinavForm.sure,
        agirlik: sinavForm.agirlik,
      });

      setSinavDialogOpen(false);
      await loadSinavlar(selectedDers.id);
    } catch (error) {
      console.error('Sınav oluşturulamadı:', error);
      alert(error.response?.data?.error || 'Sınav oluşturulamadı');
    }
  };

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'anasayfa':
  return <AnasayfaContent istatistikler={istatistikler} sqlArtifacts={sqlArtifacts} />;
      case 'derslerim':
        return (
          <DerslerimTab
            dersler={dersler}
            selectedDers={selectedDers}
            onSelectDers={handleSelectDers}
            onTabChange={setActiveTab}
            loading={loading}
          />
        );
      case 'notlar':
        return (
          <NotlarTab
            selectedDers={selectedDers}
            ogrenciler={ogrenciler}
            sinavlar={sinavlar}
            notlar={notlar}
            setNotlar={setNotlar}
            loadSinavlar={() => loadSinavlar(selectedDers?.id)}
            onOpenSinavDialog={openSinavDialog}
            dersler={dersler}
            onSelectDers={handleSelectDers}
          />
        );
      case 'yoklama':
        return (
          <YoklamaTab
            selectedDers={selectedDers}
            ogrenciler={Array.isArray(ogrenciler) ? ogrenciler : []}
            yoklamalar={Array.isArray(yoklamalar) ? yoklamalar : []}
            loadYoklamalar={() => loadYoklamalar(selectedDers?.id)}
            dersler={dersler}
            onSelectDers={setSelectedDers}
          />
        );
      case 'ogrenciler':
        return (
          <OgrencilerTab
            selectedDers={selectedDers}
            ogrenciler={ogrenciler}
            dersler={dersler}
            onSelectDers={setSelectedDers}
          />
        );
      case 'mesajlar':
        return <MesajlarTab ogretmen={ogretmen} />;
      case 'ders-programi':
        return <DersProgramiTab dersler={dersler} />;
      default:
  return <AnasayfaContent istatistikler={istatistikler} sqlArtifacts={sqlArtifacts} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner className="h-12 w-12 text-blue-500 mx-auto" />
          <Typography className="mt-4 text-gray-600">Yükleniyor...</Typography>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white shadow-xl transition-all duration-300 flex flex-col`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                  <AcademicCapIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <Typography variant="h6" className="font-bold text-gray-800">
                    OBS
                  </Typography>
                  <Typography variant="small" className="text-gray-500 text-xs">
                    Öğretmen Paneli
                  </Typography>
                </div>
              </div>
            )}
            <Button
              variant="text"
              size="sm"
              className="p-2"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? (
                <ChevronLeftIcon className="h-5 w-5" />
              ) : (
                <ChevronRightIcon className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* User Info */}
        {sidebarOpen && ogretmen && (
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center text-white font-bold">
                {ogretmen.ad?.charAt(0)}{ogretmen.soyad?.charAt(0)}
              </div>
              <div>
                <Typography variant="small" className="font-semibold text-gray-800">
                  {ogretmen.unvan || ''} {ogretmen.ad} {ogretmen.soyad}
                </Typography>
                <Typography variant="small" className="text-gray-500 text-xs">
                  {ogretmen.email}
                </Typography>
              </div>
            </div>
          </div>
        )}

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === item.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <item.icon className="h-5 w-5" />
              {sidebarOpen && (
                <span className="font-medium">{item.label}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all duration-200"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            {sidebarOpen && <span className="font-medium">Çıkış Yap</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white shadow-sm p-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <Typography variant="h5" className="font-bold text-gray-800">
                {menuItems.find(item => item.id === activeTab)?.label || 'Ana Sayfa'}
              </Typography>
              {selectedDers && (activeTab === 'notlar' || activeTab === 'yoklama' || activeTab === 'ogrenciler') && (
                <Typography variant="small" className="text-gray-500">
                  Seçili Ders: {selectedDers.dersKodu} - {selectedDers.dersAdi}
                </Typography>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <Typography variant="small" className="text-gray-600">
                  {new Date().toLocaleDateString('tr-TR', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </Typography>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          {renderContent()}
        </div>
      </main>

      {/* Sınav Oluştur Dialog */}
      <Dialog open={sinavDialogOpen} handler={() => setSinavDialogOpen(false)} size="sm">
        <DialogHeader>Yeni Sınav Oluştur</DialogHeader>
        <DialogBody className="space-y-4">
          <Input
            label="Sınav Adı"
            value={sinavForm.sinavAdi}
            onChange={(e) => setSinavForm((p) => ({ ...p, sinavAdi: e.target.value }))}
          />

          <Select label="Sınav Türü" value={sinavForm.sinavTuru} onChange={handleSinavTuruChange}>
            <Option value="Vize">Vize (%40)</Option>
            <Option value="Final">Final (%60)</Option>
            <Option value="Quiz">Quiz</Option>
            <Option value="Ödev">Ödev</Option>
            <Option value="Bütünleme">Bütünleme (%60)</Option>
          </Select>

          <Input
            label="Sınav Tarihi"
            type="date"
            value={sinavForm.sinavTarihi}
            onChange={(e) => setSinavForm((p) => ({ ...p, sinavTarihi: e.target.value }))}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Süre (dk)"
              type="number"
              min={0}
              value={sinavForm.sure}
              onChange={(e) => setSinavForm((p) => ({ ...p, sure: parseInt(e.target.value || '0', 10) }))}
            />
            <Input
              label="Ağırlık (0-1)"
              type="number"
              step="0.1"
              min={0}
              max={1}
              value={sinavForm.agirlik}
              disabled={sinavForm.sinavTuru === 'Final' || sinavForm.sinavTuru === 'Bütünleme'}
              onChange={(e) => setSinavForm((p) => ({ ...p, agirlik: parseFloat(e.target.value || '0') }))}
            />
          </div>

          <Typography variant="small" className="text-gray-600">
            Not: Final için varsayılan ağırlık 0.6 (%60), vize için 0.4 (%40).
          </Typography>
        </DialogBody>
        <DialogFooter className="gap-2">
          <Button variant="text" color="gray" onClick={() => setSinavDialogOpen(false)}>
            İptal
          </Button>
          <Button color="blue" onClick={handleCreateSinav}>
            Oluştur
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};

// Home Page Component
const AnasayfaContent = ({ istatistikler, sqlArtifacts }) => {
  const statCards = [
    {
      title: 'Toplam Ders',
      value: istatistikler.toplamDers,
      icon: BookOpenIcon,
      gradient: 'from-blue-500 to-blue-600',
      bgGradient: 'from-blue-50 to-blue-100',
    },
    {
      title: 'Toplam Öğrenci',
      value: istatistikler.toplamOgrenci,
      icon: UserGroupIcon,
      gradient: 'from-green-500 to-green-600',
      bgGradient: 'from-green-50 to-green-100',
    },
    {
      title: 'Bugünkü Ders',
      value: istatistikler.bugunDersSayisi,
      icon: CalendarDaysIcon,
      gradient: 'from-purple-500 to-purple-600',
      bgGradient: 'from-purple-50 to-purple-100',
    },
    {
      title: 'Bekleyen Mesaj',
      value: istatistikler.bekleyenMesaj,
      icon: ChatBubbleLeftRightIcon,
      gradient: 'from-orange-500 to-orange-600',
      bgGradient: 'from-orange-50 to-orange-100',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="overflow-hidden">
            <CardBody className={`p-6 bg-gradient-to-br ${stat.bgGradient}`}>
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="small" className="text-gray-600 font-medium">
                    {stat.title}
                  </Typography>
                  <Typography variant="h3" className="font-bold text-gray-800 mt-1">
                    {stat.value}
                  </Typography>
                </div>
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${stat.gradient} flex items-center justify-center shadow-lg`}>
                  <stat.icon className="h-7 w-7 text-white" />
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Welcome Card */}
      <Card className="overflow-hidden">
        <CardBody className="p-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center">
              <AcademicCapIcon className="h-10 w-10 text-white" />
            </div>
            <div>
              <Typography variant="h4" className="font-bold mb-2">
                Hoş Geldiniz! 👋
              </Typography>
              <Typography className="opacity-90">
                Öğretim Bilgi Sistemi paneline hoş geldiniz. Sol menüden işlemlerinizi gerçekleştirebilirsiniz.
              </Typography>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardBody className="p-6">
          <Typography variant="h6" className="font-bold text-gray-800 mb-4">
            Hızlı İşlemler
          </Typography>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors flex flex-col items-center gap-2">
              <ClipboardDocumentListIcon className="h-8 w-8 text-blue-500" />
              <span className="text-sm font-medium text-gray-700">Not Gir</span>
            </button>
            <button className="p-4 rounded-xl bg-green-50 hover:bg-green-100 transition-colors flex flex-col items-center gap-2">
              <CalendarDaysIcon className="h-8 w-8 text-green-500" />
              <span className="text-sm font-medium text-gray-700">Yoklama Al</span>
            </button>
            <button className="p-4 rounded-xl bg-purple-50 hover:bg-purple-100 transition-colors flex flex-col items-center gap-2">
              <ChatBubbleLeftRightIcon className="h-8 w-8 text-purple-500" />
              <span className="text-sm font-medium text-gray-700">Mesaj Gönder</span>
            </button>
            <button className="p-4 rounded-xl bg-orange-50 hover:bg-orange-100 transition-colors flex flex-col items-center gap-2">
              <UserGroupIcon className="h-8 w-8 text-orange-500" />
              <span className="text-sm font-medium text-gray-700">Öğrenci Listesi</span>
            </button>
          </div>
        </CardBody>
      </Card>

      {/* SQL Server Fonksiyon & View Özetleri */}
      <Card>
        <CardBody className="p-6 space-y-4">
          <Typography variant="h6" className="font-bold text-gray-800">
            SQL Server Objeleri (Fonksiyon/View/Trigger Log)
          </Typography>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
              <Typography variant="small" className="text-gray-600">Bölümdeki Öğrenci Sayısı</Typography>
              <Typography variant="h4" className="font-bold text-gray-900">
                {sqlArtifacts?.bolumOgrenciSayisi ?? '-'}
              </Typography>
            </div>
            <div className="p-4 rounded-lg bg-purple-50 border border-purple-100">
              <Typography variant="small" className="text-gray-600">Bölüm Ortalama AGNO</Typography>
              <Typography variant="h4" className="font-bold text-gray-900">
                {sqlArtifacts?.bolumOrtalamaAgno ?? '-'}
              </Typography>
            </div>
            <div className="p-4 rounded-lg bg-green-50 border border-green-100">
              <Typography variant="small" className="text-gray-600">Dönem Ders Sayısı</Typography>
              <Typography variant="h4" className="font-bold text-gray-900">
                {sqlArtifacts?.donemDersSayisi ?? '-'}
              </Typography>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4 bg-white shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <Typography variant="h6" className="font-semibold text-gray-800">View: Bölümdeki Öğrenciler</Typography>
                <Typography variant="small" className="text-gray-500">İlk 5 kayıt</Typography>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left text-gray-700">
                  <thead>
                    <tr className="border-b">
                      <th className="py-2 pr-4">TC</th>
                      <th className="py-2 pr-4">İsim</th>
                      <th className="py-2 pr-4">Soyad</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(sqlArtifacts?.bolumOgrenciler || []).slice(0,5).map((ogr, idx) => (
                      <tr key={idx} className="border-b last:border-0">
                        <td className="py-2 pr-4">{ogr.tcNo}</td>
                        <td className="py-2 pr-4">{ogr.isim}</td>
                        <td className="py-2 pr-4">{ogr.soyad}</td>
                      </tr>
                    ))}
                    {(!sqlArtifacts?.bolumOgrenciler || sqlArtifacts.bolumOgrenciler.length === 0) && (
                      <tr>
                        <td colSpan={3} className="py-3 text-gray-500">Kayıt bulunamadı.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4 bg-white shadow-sm">
                <Typography variant="h6" className="font-semibold text-gray-800 mb-2">Trigger Log: Notlar</Typography>
                <ul className="space-y-1 text-sm text-gray-700 max-h-48 overflow-y-auto">
                  {(sqlArtifacts?.notlarLog || []).slice(0,8).map((log, idx) => (
                    <li key={idx} className="border-b last:border-0 py-1">
                      <span className="font-semibold">{log.Islem}</span> | Ogr:{log.OgrenciID} Sinav:{log.SinavID} Puan:{log.Puan} <span className="text-gray-500">{new Date(log.Tarih).toLocaleString()}</span>
                    </li>
                  ))}
                  {(!sqlArtifacts?.notlarLog || sqlArtifacts.notlarLog.length === 0) && (
                    <li className="text-gray-500">Log bulunamadı.</li>
                  )}
                </ul>
              </div>

              <div className="border rounded-lg p-4 bg-white shadow-sm">
                <Typography variant="h6" className="font-semibold text-gray-800 mb-2">Trigger Log: Yoklama</Typography>
                <ul className="space-y-1 text-sm text-gray-700 max-h-48 overflow-y-auto">
                  {(sqlArtifacts?.yoklamaLog || []).slice(0,8).map((log, idx) => (
                    <li key={idx} className="border-b last:border-0 py-1">
                      <span className="font-semibold">{log.Islem}</span> | Ogr:{log.OgrenciID} Ders:{log.DersID} Durum:{log.Durum} <span className="text-gray-500">{new Date(log.Tarih).toLocaleString()}</span>
                    </li>
                  ))}
                  {(!sqlArtifacts?.yoklamaLog || sqlArtifacts.yoklamaLog.length === 0) && (
                    <li className="text-gray-500">Log bulunamadı.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default OgretmenDashboard;
