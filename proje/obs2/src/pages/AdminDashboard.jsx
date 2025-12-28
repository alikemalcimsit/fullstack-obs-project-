import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardBody,
  Typography,
  Button,
  Chip,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Select,
  Option,
  Tabs,
  TabsHeader,
  Tab,
  IconButton,
} from '@material-tailwind/react';
import {
  ShieldCheckIcon,
  UserGroupIcon,
  AcademicCapIcon,
  BookOpenIcon,
  BuildingLibraryIcon,
  ChartBarIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ArrowLeftOnRectangleIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { adminService } from '../services/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    ogrenciSayisi: 0,
    ogretmenSayisi: 0,
    dersSayisi: 0,
    bolumSayisi: 0,
  });

  // Data states
  const [ogrenciler, setOgrenciler] = useState([]);
  const [ogretmenler, setOgretmenler] = useState([]);
  const [dersler, setDersler] = useState([]);
  const [bolumler, setBolumler] = useState([]);

  // Dialog states
  const [ogretmenDialogOpen, setOgretmenDialogOpen] = useState(false);
  const [dersDialogOpen, setDersDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Form states
  const [ogretmenForm, setOgretmenForm] = useState({
    tcNo: '',
    isim: '',
    soyad: '',
    email: '',
    sifre: '',
    telNo: '',
    unvan: '',
    bolumId: '',
  });

  const [dersForm, setDersForm] = useState({
    dersKodu: '',
    dersAdi: '',
    kredi: '',
    bolumId: '',
    dersTuru: 'Zorunlu',
    ogretmenId: '',
  });

  // Search states
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const storedAdmin = localStorage.getItem('admin');
    if (storedAdmin && storedAdmin !== 'undefined') {
      try {
        setAdmin(JSON.parse(storedAdmin));
        loadData();
      } catch (e) {
        console.error('Admin bilgisi parse edilemedi:', e);
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [ogrenciData, ogretmenData, dersData, bolumData] = await Promise.all([
        adminService.getOgrenciler().catch(() => []),
        adminService.getOgretmenler().catch(() => []),
        adminService.getDersler().catch(() => []),
        adminService.getBolumler().catch(() => []),
      ]);

      const ogrenciArr = Array.isArray(ogrenciData) ? ogrenciData : [];
      const ogretmenArr = Array.isArray(ogretmenData) ? ogretmenData : [];
      const dersArr = Array.isArray(dersData) ? dersData : [];
      const bolumArr = Array.isArray(bolumData) ? bolumData : [];

      setOgrenciler(ogrenciArr);
      setOgretmenler(ogretmenArr);
      setDersler(dersArr);
      setBolumler(bolumArr);

      setStats({
        ogrenciSayisi: ogrenciArr.length,
        ogretmenSayisi: ogretmenArr.length,
        dersSayisi: dersArr.length,
        bolumSayisi: bolumArr.length,
      });
    } catch (error) {
      console.error('Veri yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  // Tab bazlı veri yükleme
  const loadTabData = async (tab) => {
    try {
      setLoading(true);
      console.log('Loading tab data for:', tab);
      switch (tab) {
        case 'ogrenciler':
          const ogrenciData = await adminService.getOgrenciler().catch(() => []);
          console.log('Öğrenci data:', ogrenciData);
          setOgrenciler(Array.isArray(ogrenciData) ? ogrenciData : []);
          break;
        case 'ogretmenler':
          const ogretmenData = await adminService.getOgretmenler().catch(() => []);
          console.log('Öğretmen data:', ogretmenData);
          setOgretmenler(Array.isArray(ogretmenData) ? ogretmenData : []);
          break;
        case 'dersler':
          const dersData = await adminService.getDersler().catch(() => []);
          console.log('Ders data:', dersData);
          setDersler(Array.isArray(dersData) ? dersData : []);
          break;
        case 'bolumler':
          const bolumData = await adminService.getBolumler().catch(() => []);
          console.log('Bölüm data:', bolumData);
          setBolumler(Array.isArray(bolumData) ? bolumData : []);
          break;
        case 'dashboard':
          await loadData();
          return; // loadData kendi setLoading'ini yönetiyor
        default:
          break;
      }
    } catch (error) {
      console.error('Tab verisi yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  // Tab değiştiğinde verileri yeniden yükle
  useEffect(() => {
    if (admin) {
      loadTabData(activeTab);
    }
  }, [activeTab]);

  // Öğretmen işlemleri
  const handleOgretmenSubmit = async () => {
    try {
      if (editMode) {
        await adminService.updateOgretmen(selectedItem.id, ogretmenForm);
      } else {
        await adminService.addOgretmen(ogretmenForm);
      }
      setOgretmenDialogOpen(false);
      resetOgretmenForm();
      loadData();
    } catch (error) {
      console.error('Öğretmen kaydedilirken hata:', error);
      alert('İşlem başarısız!');
    }
  };

  const handleOgretmenEdit = (ogretmen) => {
    setSelectedItem(ogretmen);
    setOgretmenForm({
      tcNo: ogretmen.tcNo,
      isim: ogretmen.isim,
      soyad: ogretmen.soyad,
      email: ogretmen.email,
      sifre: '',
      telNo: ogretmen.telNo || '',
      unvan: ogretmen.unvan || '',
      bolumId: ogretmen.bolumId?.toString() || '',
    });
    setEditMode(true);
    setOgretmenDialogOpen(true);
  };

  const handleOgretmenDelete = async (id) => {
    if (window.confirm('Bu öğretmeni silmek istediğinize emin misiniz?')) {
      try {
        await adminService.deleteOgretmen(id);
        loadData();
      } catch (error) {
        console.error('Öğretmen silinirken hata:', error);
        alert('Silme işlemi başarısız!');
      }
    }
  };

  const resetOgretmenForm = () => {
    setOgretmenForm({
      tcNo: '',
      isim: '',
      soyad: '',
      email: '',
      sifre: '',
      telNo: '',
      unvan: '',
      bolumId: '',
    });
    setEditMode(false);
    setSelectedItem(null);
  };

  // Ders işlemleri
  const handleDersSubmit = async () => {
    try {
      if (editMode) {
        await adminService.updateDers(selectedItem.id, dersForm);
      } else {
        await adminService.addDers(dersForm);
      }
      setDersDialogOpen(false);
      resetDersForm();
      loadData();
    } catch (error) {
      console.error('Ders kaydedilirken hata:', error);
      alert('İşlem başarısız!');
    }
  };

  const handleDersEdit = (ders) => {
    setSelectedItem(ders);
    setDersForm({
      dersKodu: ders.dersKodu,
      dersAdi: ders.dersAdi,
      kredi: ders.kredi?.toString() || '',
      bolumId: ders.bolumId?.toString() || '',
      dersTuru: ders.dersTuru || 'Zorunlu',
      ogretmenId: ders.ogretmenId?.toString() || '',
    });
    setEditMode(true);
    setDersDialogOpen(true);
  };

  const handleDersDelete = async (id) => {
    if (window.confirm('Bu dersi silmek istediğinize emin misiniz?')) {
      try {
        await adminService.deleteDers(id);
        loadData();
      } catch (error) {
        console.error('Ders silinirken hata:', error);
        alert('Silme işlemi başarısız!');
      }
    }
  };

  const resetDersForm = () => {
    setDersForm({
      dersKodu: '',
      dersAdi: '',
      kredi: '',
      bolumId: '',
      dersTuru: 'Zorunlu',
      ogretmenId: '',
    });
    setEditMode(false);
    setSelectedItem(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('admin');
    localStorage.removeItem('userType');
    navigate('/admin-login');
  };

  // Filtreleme
  const filteredOgrenciler = ogrenciler.filter(
    (o) =>
      o.isim?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.soyad?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.ogrNo?.includes(searchTerm)
  );

  const filteredOgretmenler = ogretmenler.filter(
    (o) =>
      o.isim?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.soyad?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDersler = dersler.filter(
    (d) =>
      d.dersAdi?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.dersKodu?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-4 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <ShieldCheckIcon className="h-10 w-10" />
            <div>
              <h1 className="text-2xl font-bold">Admin Paneli</h1>
              <p className="text-sm opacity-80">
                {admin?.isim} {admin?.soyad}
              </p>
            </div>
          </div>
          <Button
            color="white"
            variant="text"
            className="flex items-center gap-2"
            onClick={handleLogout}
          >
            <ArrowLeftOnRectangleIcon className="h-5 w-5" />
            Çıkış
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Navigation Tabs */}
        <Tabs value={activeTab} className="mb-6">
          <TabsHeader>
            <Tab value="dashboard" onClick={() => setActiveTab('dashboard')}>
              <div className="flex items-center gap-2">
                <ChartBarIcon className="h-5 w-5" />
                Dashboard
              </div>
            </Tab>
            <Tab value="ogrenciler" onClick={() => setActiveTab('ogrenciler')}>
              <div className="flex items-center gap-2">
                <UserGroupIcon className="h-5 w-5" />
                Öğrenciler
              </div>
            </Tab>
            <Tab value="ogretmenler" onClick={() => setActiveTab('ogretmenler')}>
              <div className="flex items-center gap-2">
                <AcademicCapIcon className="h-5 w-5" />
                Öğretmenler
              </div>
            </Tab>
            <Tab value="dersler" onClick={() => setActiveTab('dersler')}>
              <div className="flex items-center gap-2">
                <BookOpenIcon className="h-5 w-5" />
                Dersler
              </div>
            </Tab>
            <Tab value="bolumler" onClick={() => setActiveTab('bolumler')}>
              <div className="flex items-center gap-2">
                <BuildingLibraryIcon className="h-5 w-5" />
                Bölümler
              </div>
            </Tab>
          </TabsHeader>
        </Tabs>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardBody className="text-center">
                <UserGroupIcon className="h-12 w-12 mx-auto mb-2" />
                <Typography variant="h3">{stats.ogrenciSayisi}</Typography>
                <Typography>Öğrenci</Typography>
              </CardBody>
            </Card>
            <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
              <CardBody className="text-center">
                <AcademicCapIcon className="h-12 w-12 mx-auto mb-2" />
                <Typography variant="h3">{stats.ogretmenSayisi}</Typography>
                <Typography>Öğretmen</Typography>
              </CardBody>
            </Card>
            <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
              <CardBody className="text-center">
                <BookOpenIcon className="h-12 w-12 mx-auto mb-2" />
                <Typography variant="h3">{stats.dersSayisi}</Typography>
                <Typography>Ders</Typography>
              </CardBody>
            </Card>
            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardBody className="text-center">
                <BuildingLibraryIcon className="h-12 w-12 mx-auto mb-2" />
                <Typography variant="h3">{stats.bolumSayisi}</Typography>
                <Typography>Bölüm</Typography>
              </CardBody>
            </Card>
          </div>
        )}

        {/* Öğrenciler Tab */}
        {activeTab === 'ogrenciler' && (
          <Card>
            <CardBody>
              <div className="flex justify-between items-center mb-4">
                <Typography variant="h5">Öğrenci Listesi</Typography>
                <div className="w-72">
                  <Input
                    label="Ara..."
                    icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-max table-auto text-left">
                  <thead>
                    <tr className="bg-blue-gray-50">
                      <th className="p-4">Öğrenci No</th>
                      <th className="p-4">Ad Soyad</th>
                      <th className="p-4">E-posta</th>
                      <th className="p-4">Bölüm</th>
                      <th className="p-4">Durum</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOgrenciler.map((ogr, index) => (
                      <tr key={ogr.id} className={index % 2 === 0 ? 'bg-blue-gray-50/50' : ''}>
                        <td className="p-4">{ogr.ogrNo}</td>
                        <td className="p-4">
                          {ogr.isim} {ogr.soyad}
                        </td>
                        <td className="p-4">{ogr.email}</td>
                        <td className="p-4">{ogr.bolum?.bolumAdi || '-'}</td>
                        <td className="p-4">
                          <Chip size="sm" value="Aktif" color="green" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Öğretmenler Tab */}
        {activeTab === 'ogretmenler' && (
          <Card>
            <CardBody>
              <div className="flex justify-between items-center mb-4">
                <Typography variant="h5">Öğretmen Listesi</Typography>
                <div className="flex gap-4">
                  <div className="w-72">
                    <Input
                      label="Ara..."
                      icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button
                    color="green"
                    className="flex items-center gap-2"
                    onClick={() => {
                      resetOgretmenForm();
                      setOgretmenDialogOpen(true);
                    }}
                  >
                    <PlusIcon className="h-5 w-5" />
                    Yeni Öğretmen
                  </Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-max table-auto text-left">
                  <thead>
                    <tr className="bg-blue-gray-50">
                      <th className="p-4">Unvan</th>
                      <th className="p-4">Ad Soyad</th>
                      <th className="p-4">E-posta</th>
                      <th className="p-4">Bölüm</th>
                      <th className="p-4">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOgretmenler.map((ogr, index) => (
                      <tr key={ogr.id} className={index % 2 === 0 ? 'bg-blue-gray-50/50' : ''}>
                        <td className="p-4">{ogr.unvan}</td>
                        <td className="p-4">
                          {ogr.isim} {ogr.soyad}
                        </td>
                        <td className="p-4">{ogr.email}</td>
                        <td className="p-4">{ogr.bolum?.bolumAdi || '-'}</td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <IconButton
                              size="sm"
                              color="blue"
                              variant="text"
                              onClick={() => handleOgretmenEdit(ogr)}
                            >
                              <PencilIcon className="h-4 w-4" />
                            </IconButton>
                            <IconButton
                              size="sm"
                              color="red"
                              variant="text"
                              onClick={() => handleOgretmenDelete(ogr.id)}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </IconButton>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Dersler Tab */}
        {activeTab === 'dersler' && (
          <Card>
            <CardBody>
              <div className="flex justify-between items-center mb-4">
                <Typography variant="h5">Ders Listesi</Typography>
                <div className="flex gap-4">
                  <div className="w-72">
                    <Input
                      label="Ara..."
                      icon={<MagnifyingGlassIcon className="h-5 w-5" />}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Button
                    color="green"
                    className="flex items-center gap-2"
                    onClick={() => {
                      resetDersForm();
                      setDersDialogOpen(true);
                    }}
                  >
                    <PlusIcon className="h-5 w-5" />
                    Yeni Ders
                  </Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-max table-auto text-left">
                  <thead>
                    <tr className="bg-blue-gray-50">
                      <th className="p-4">Ders Kodu</th>
                      <th className="p-4">Ders Adı</th>
                      <th className="p-4">Kredi</th>
                      <th className="p-4">Tür</th>
                      <th className="p-4">Öğretmen</th>
                      <th className="p-4">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDersler.map((ders, index) => (
                      <tr key={ders.id} className={index % 2 === 0 ? 'bg-blue-gray-50/50' : ''}>
                        <td className="p-4">{ders.dersKodu}</td>
                        <td className="p-4">{ders.dersAdi}</td>
                        <td className="p-4">{ders.kredi}</td>
                        <td className="p-4">
                          <Chip
                            size="sm"
                            value={ders.dersTuru || 'Zorunlu'}
                            color={ders.dersTuru === 'Seçmeli' ? 'orange' : 'blue'}
                          />
                        </td>
                        <td className="p-4">
                          {ders.ogretmenDersleri?.length > 0
                            ? `${ders.ogretmenDersleri[0].ogretmen?.unvan || ''} ${ders.ogretmenDersleri[0].ogretmen?.isim || ''} ${ders.ogretmenDersleri[0].ogretmen?.soyad || ''}`
                            : '-'}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <IconButton
                              size="sm"
                              color="blue"
                              variant="text"
                              onClick={() => handleDersEdit(ders)}
                            >
                              <PencilIcon className="h-4 w-4" />
                            </IconButton>
                            <IconButton
                              size="sm"
                              color="red"
                              variant="text"
                              onClick={() => handleDersDelete(ders.id)}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </IconButton>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        )}

        {/* Bölümler Tab */}
        {activeTab === 'bolumler' && (
          <Card>
            <CardBody>
              <Typography variant="h5" className="mb-4">
                Bölüm Listesi
              </Typography>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {bolumler.map((bolum) => (
                  <Card key={bolum.id} className="border">
                    <CardBody>
                      <Typography variant="h6">{bolum.bolumAdi}</Typography>
                      <Typography variant="small" className="text-gray-500">
                        Dönem Sayısı: {bolum.donemSayisi || 8}
                      </Typography>
                      <Typography variant="small" className="text-gray-500">
                        Fakülte: {bolum.fakulte?.fakulteAdi || '-'}
                      </Typography>
                      <div className="mt-2 flex gap-2 flex-wrap">
                        <Chip
                          size="sm"
                          value={`${bolum.ogrenciSayisi || bolum._count?.ogrenciler || 0} Öğrenci`}
                          color="blue"
                        />
                        <Chip
                          size="sm"
                          value={`${bolum.ogretmenSayisi || bolum._count?.ogretmenler || 0} Öğretmen`}
                          color="purple"
                        />
                        <Chip
                          size="sm"
                          value={`${bolum.dersSayisi || bolum._count?.dersler || 0} Ders`}
                          color="green"
                        />
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </CardBody>
          </Card>
        )}
      </div>

      {/* Öğretmen Dialog */}
      <Dialog open={ogretmenDialogOpen} handler={() => setOgretmenDialogOpen(false)} size="md">
        <DialogHeader>{editMode ? 'Öğretmen Düzenle' : 'Yeni Öğretmen Ekle'}</DialogHeader>
        <DialogBody divider className="max-h-96 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="TC Kimlik No"
              value={ogretmenForm.tcNo}
              onChange={(e) => setOgretmenForm({ ...ogretmenForm, tcNo: e.target.value })}
            />
            <Select
              label="Unvan"
              value={ogretmenForm.unvan}
              onChange={(val) => setOgretmenForm({ ...ogretmenForm, unvan: val })}
            >
              <Option value="Prof. Dr.">Prof. Dr.</Option>
              <Option value="Doç. Dr.">Doç. Dr.</Option>
              <Option value="Dr. Öğr. Üyesi">Dr. Öğr. Üyesi</Option>
              <Option value="Öğr. Gör.">Öğr. Gör.</Option>
              <Option value="Arş. Gör.">Arş. Gör.</Option>
            </Select>
            <Input
              label="İsim"
              value={ogretmenForm.isim}
              onChange={(e) => setOgretmenForm({ ...ogretmenForm, isim: e.target.value })}
            />
            <Input
              label="Soyad"
              value={ogretmenForm.soyad}
              onChange={(e) => setOgretmenForm({ ...ogretmenForm, soyad: e.target.value })}
            />
            <Input
              label="E-posta"
              type="email"
              value={ogretmenForm.email}
              onChange={(e) => setOgretmenForm({ ...ogretmenForm, email: e.target.value })}
            />
            <Input
              label={editMode ? 'Yeni Şifre (boş bırakılabilir)' : 'Şifre'}
              type="password"
              value={ogretmenForm.sifre}
              onChange={(e) => setOgretmenForm({ ...ogretmenForm, sifre: e.target.value })}
            />
            <Input
              label="Telefon"
              value={ogretmenForm.telNo}
              onChange={(e) => setOgretmenForm({ ...ogretmenForm, telNo: e.target.value })}
            />
            <Select
              label="Bölüm"
              value={ogretmenForm.bolumId}
              onChange={(val) => setOgretmenForm({ ...ogretmenForm, bolumId: val })}
            >
              {bolumler.map((bolum) => (
                <Option key={bolum.id} value={bolum.id.toString()}>
                  {bolum.bolumAdi}
                </Option>
              ))}
            </Select>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={() => {
              setOgretmenDialogOpen(false);
              resetOgretmenForm();
            }}
          >
            İptal
          </Button>
          <Button color="green" onClick={handleOgretmenSubmit}>
            {editMode ? 'Güncelle' : 'Ekle'}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Ders Dialog */}
      <Dialog open={dersDialogOpen} handler={() => setDersDialogOpen(false)} size="md">
        <DialogHeader>{editMode ? 'Ders Düzenle' : 'Yeni Ders Ekle'}</DialogHeader>
        <DialogBody divider className="max-h-96 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Ders Kodu"
              value={dersForm.dersKodu}
              onChange={(e) => setDersForm({ ...dersForm, dersKodu: e.target.value })}
            />
            <Input
              label="Ders Adı"
              value={dersForm.dersAdi}
              onChange={(e) => setDersForm({ ...dersForm, dersAdi: e.target.value })}
            />
            <Input
              label="Kredi"
              type="number"
              value={dersForm.kredi}
              onChange={(e) => setDersForm({ ...dersForm, kredi: e.target.value })}
            />
            <Select
              label="Ders Türü"
              value={dersForm.dersTuru}
              onChange={(val) => setDersForm({ ...dersForm, dersTuru: val })}
            >
              <Option value="Zorunlu">Zorunlu</Option>
              <Option value="Seçmeli">Seçmeli</Option>
            </Select>
            <Select
              label="Bölüm"
              value={dersForm.bolumId}
              onChange={(val) => setDersForm({ ...dersForm, bolumId: val })}
            >
              {bolumler.map((bolum) => (
                <Option key={bolum.id} value={bolum.id.toString()}>
                  {bolum.bolumAdi}
                </Option>
              ))}
            </Select>
            <Select
              label="Öğretmen"
              value={dersForm.ogretmenId}
              onChange={(val) => setDersForm({ ...dersForm, ogretmenId: val })}
            >
              {ogretmenler.map((ogr) => (
                <Option key={ogr.id} value={ogr.id.toString()}>
                  {ogr.unvan} {ogr.isim} {ogr.soyad}
                </Option>
              ))}
            </Select>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={() => {
              setDersDialogOpen(false);
              resetDersForm();
            }}
          >
            İptal
          </Button>
          <Button color="green" onClick={handleDersSubmit}>
            {editMode ? 'Güncelle' : 'Ekle'}
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
