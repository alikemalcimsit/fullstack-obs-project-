import axios from 'axios';

// API Base URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Axios instance oluştur
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - token ekle
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - hata yönetimi
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token geçersiz veya süresi dolmuş
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// =====================================================
// AUTH SERVICES
// =====================================================

export const authService = {
  login: async (ogrNo, sifre) => {
    const response = await api.post('/auth/login', { ogrNo, sifre });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  loginOgretmen: async (credentials) => {
    const response = await api.post('/auth/login/ogretmen', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('ogretmen', JSON.stringify(response.data.ogretmen));
      localStorage.setItem('userType', 'ogretmen');
    }
    return response.data;
  },

  loginAdmin: async (credentials) => {
    const response = await api.post('/auth/login/admin', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('admin', JSON.stringify(response.data.admin));
      localStorage.setItem('userType', 'admin');
    }
    return response.data;
  },

  // Genel giriş (kullanıcı tipine göre)
  loginUnified: async (email, sifre, userType) => {
    const response = await api.post('/auth/login/unified', { email, sifre, userType });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  changePassword: async (ogrNo, eskiSifre, yeniSifre) => {
    const response = await api.post('/auth/change-password', { ogrNo, eskiSifre, yeniSifre });
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },
};

// =====================================================
// ÖĞRENCI SERVICES
// =====================================================

export const ogrenciService = {
  getAll: async () => {
    const response = await api.get('/ogrenciler');
    return response.data;
  },

  getByOgrNo: async (ogrNo) => {
    const response = await api.get(`/ogrenciler/ogrno/${ogrNo}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/ogrenciler/${id}`);
    return response.data;
  },

  update: async (ogrNo, data) => {
    const response = await api.put(`/ogrenciler/${ogrNo}`, data);
    return response.data;
  },

  getDersler: async (ogrNo) => {
    const response = await api.get(`/ogrenciler/${ogrNo}/dersler`);
    return response.data;
  },

  getNotlar: async (ogrNo) => {
    const response = await api.get(`/ogrenciler/${ogrNo}/notlar`);
    return response.data;
  },

  getYoklama: async (ogrNo) => {
    const response = await api.get(`/ogrenciler/${ogrNo}/yoklama`);
    return response.data;
  },

  getProgram: async (ogrNo) => {
    const response = await api.get(`/ogrenciler/${ogrNo}/program`);
    return response.data;
  },

  getTranskript: async (ogrNo) => {
    const response = await api.get(`/ogrenciler/${ogrNo}/transkript`);
    return response.data;
  },

  getUygunDersler: async (ogrNo) => {
    const response = await api.get(`/ogrenciler/${ogrNo}/uygun-dersler`);
    return response.data;
  },

  submitDersSecim: async (ogrNo, dersIds) => {
    const response = await api.post(`/ogrenciler/${ogrNo}/ders-secim`, { dersIds });
    return response.data;
  },
};

// =====================================================
// DERS SERVICES
// =====================================================

export const dersService = {
  getAll: async (params = {}) => {
    const response = await api.get('/dersler', { params });
    return response.data;
  },

  getByBolum: async (bolumId) => {
    const response = await api.get(`/dersler/bolum/${bolumId}`);
    return response.data;
  },

  getByDonem: async (donemId) => {
    const response = await api.get(`/dersler/donem/${donemId}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/dersler/${id}`);
    return response.data;
  },

  getProgram: async (dersId) => {
    const response = await api.get(`/dersler/${dersId}/program`);
    return response.data;
  },

  getOgrenciler: async (dersId) => {
    const response = await api.get(`/dersler/${dersId}/ogrenciler`);
    return response.data;
  },

  getDonemler: async () => {
    const response = await api.get('/dersler/meta/donemler');
    return response.data;
  },
};

// =====================================================
// DUYURU SERVICES
// =====================================================

export const duyuruService = {
  getAll: async (params = {}) => {
    const response = await api.get('/duyurular', { params });
    return response.data;
  },

  getOnemli: async () => {
    const response = await api.get('/duyurular/onemli');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/duyurular/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/duyurular', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await api.put(`/duyurular/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/duyurular/${id}`);
    return response.data;
  },
};

// =====================================================
// YOKLAMA SERVICES
// =====================================================

export const yoklamaService = {
  getByOgrenci: async (ogrNo) => {
    const response = await api.get(`/yoklama/ogrenci/${ogrNo}`);
    return response.data;
  },

  getByOgrenciAndDers: async (ogrNo, dersId) => {
    const response = await api.get(`/yoklama/ogrenci/${ogrNo}/ders/${dersId}`);
    return response.data;
  },

  getByDers: async (dersId, tarih = null) => {
    const params = tarih ? { tarih } : {};
    const response = await api.get(`/yoklama/ders/${dersId}`, { params });
    return response.data;
  },

  save: async (data) => {
    const response = await api.post('/yoklama', data);
    return response.data;
  },

  update: async (id, durum) => {
    const response = await api.put(`/yoklama/${id}`, { durum });
    return response.data;
  },

  getTarihler: async (dersId) => {
    const response = await api.get(`/yoklama/ders/${dersId}/tarihler`);
    return response.data;
  },
};

// =====================================================
// NOT SERVICES
// =====================================================

export const notService = {
  getByOgrenci: async (ogrNo) => {
    const response = await api.get(`/notlar/ogrenci/${ogrNo}`);
    return response.data;
  },

  getByOgrenciAndDers: async (ogrNo, dersId) => {
    const response = await api.get(`/notlar/ogrenci/${ogrNo}/ders/${dersId}`);
    return response.data;
  },

  getSinavlar: async (dersId) => {
    const response = await api.get(`/notlar/ders/${dersId}/sinavlar`);
    return response.data;
  },

  getBySinav: async (sinavId) => {
    const response = await api.get(`/notlar/sinav/${sinavId}`);
    return response.data;
  },

  save: async (data) => {
    const response = await api.post('/notlar', data);
    return response.data;
  },

  update: async (id, puan) => {
    const response = await api.put(`/notlar/${id}`, { puan });
    return response.data;
  },

  createSinav: async (data) => {
    const response = await api.post('/notlar/sinav', data);
    return response.data;
  },
};

// =====================================================
// BÖLÜM SERVICES
// =====================================================

export const bolumService = {
  getAll: async () => {
    const response = await api.get('/bolumler');
    return response.data;
  },

  getFakulteler: async () => {
    const response = await api.get('/bolumler/fakulteler');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/bolumler/${id}`);
    return response.data;
  },

  getOgrenciler: async (id) => {
    const response = await api.get(`/bolumler/${id}/ogrenciler`);
    return response.data;
  },

  getOgretmenler: async (id) => {
    const response = await api.get(`/bolumler/${id}/ogretmenler`);
    return response.data;
  },

  getDersler: async (id, donemId = null) => {
    const params = donemId ? { donemId } : {};
    const response = await api.get(`/bolumler/${id}/dersler`, { params });
    return response.data;
  },

  getIstatistikler: async (id) => {
    const response = await api.get(`/bolumler/${id}/istatistikler`);
    return response.data;
  },
};

// =====================================================
// ÖĞRETMEN SERVICES
// =====================================================

export const ogretmenService = {
  getAll: async () => {
    const response = await api.get('/ogretmenler');
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/ogretmenler/${id}`);
    return response.data;
  },

  getByTcNo: async (tcNo) => {
    const response = await api.get(`/ogretmenler/tc/${tcNo}`);
    return response.data;
  },

  getDersler: async (id) => {
    const response = await api.get(`/ogretmenler/${id}/dersler`);
    return response.data;
  },

  getProgram: async (id) => {
    const response = await api.get(`/ogretmenler/${id}/program`);
    return response.data;
  },

  getOgrenciler: async (id, dersId) => {
    const response = await api.get(`/ogretmenler/${id}/ogrenciler/${dersId}`);
    return response.data;
  },

  // Öğretmenin verdiği dersleri getir (not girişi için)
  getVerdigiDersler: async (ogretmenId) => {
    const response = await api.get(`/notlar/ogretmen/${ogretmenId}/dersler`);
    return response.data;
  },
};

// =====================================================
// ADMIN SERVICES
// =====================================================

export const adminService = {
  // Dashboard istatistikleri
  getDashboard: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  // Öğrenci yönetimi
  getOgrenciler: async (params = {}) => {
    const response = await api.get('/admin/ogrenciler', { params });
    return response.data.ogrenciler || response.data || [];
  },

  addOgrenci: async (data) => {
    const response = await api.post('/admin/ogrenci', data);
    return response.data;
  },

  updateOgrenci: async (id, data) => {
    const response = await api.put(`/admin/ogrenci/${id}`, data);
    return response.data;
  },

  deleteOgrenci: async (id) => {
    const response = await api.delete(`/admin/ogrenci/${id}`);
    return response.data;
  },

  // Öğretmen yönetimi
  getOgretmenler: async () => {
    const response = await api.get('/admin/ogretmenler');
    return response.data?.ogretmenler || response.data || [];
  },

  addOgretmen: async (data) => {
    const response = await api.post('/admin/ogretmen', data);
    return response.data;
  },

  updateOgretmen: async (id, data) => {
    const response = await api.put(`/admin/ogretmen/${id}`, data);
    return response.data;
  },

  deleteOgretmen: async (id) => {
    const response = await api.delete(`/admin/ogretmen/${id}`);
    return response.data;
  },

  // Ders yönetimi
  getDersler: async () => {
    const response = await api.get('/admin/dersler');
    return response.data?.dersler || response.data || [];
  },

  addDers: async (data) => {
    const response = await api.post('/admin/ders', data);
    return response.data;
  },

  updateDers: async (id, data) => {
    const response = await api.put(`/admin/ders/${id}`, data);
    return response.data;
  },

  deleteDers: async (id) => {
    const response = await api.delete(`/admin/ders/${id}`);
    return response.data;
  },

  // Fakülte ve Bölüm
  getFakulteler: async () => {
    const response = await api.get('/admin/fakulteler');
    return response.data?.fakulteler || response.data || [];
  },

  getBolumler: async () => {
    const response = await api.get('/admin/bolumler');
    return response.data?.bolumler || response.data || [];
  },

  // Dönem yönetimi
  getDonemler: async () => {
    const response = await api.get('/admin/donemler');
    return response.data?.donemler || response.data || [];
  },

  setAktifDonem: async (donemId) => {
    const response = await api.put(`/admin/donem/${donemId}/aktif`);
    return response.data;
  },

  // Duyuru yönetimi
  getDuyurular: async () => {
    const response = await api.get('/admin/duyurular');
    return response.data || [];
  },

  addDuyuru: async (data) => {
    const response = await api.post('/admin/duyuru', data);
    return response.data;
  },

  deleteDuyuru: async (id) => {
    const response = await api.delete(`/admin/duyuru/${id}`);
    return response.data;
  },
};

// =====================================================
// NOT YÖNETİMİ SERVICES (Öğretmen için)
// =====================================================

export const notYonetimService = {
  // Sınav oluştur
  createSinav: async (data) => {
    const response = await api.post('/notlar/sinav', data);
    return response.data;
  },

  // Sınavları getir
  getSinavlar: async (dersId) => {
    const response = await api.get(`/notlar/ders/${dersId}/sinavlar`);
    return response.data;
  },

  // Sınav notlarını getir
  getSinavNotlari: async (sinavId) => {
    try {
      const response = await api.get(`/notlar/sinav/${sinavId}/notlar`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        // Henüz not girilmemişse 404 dönüyor olabilir; boş listeyle devam et
        return { notlar: [] };
      }
      throw error;
    }
  },

  // Dersin tüm notlarını getir
  getTumNotlar: async (dersId) => {
    const response = await api.get(`/notlar/ders/${dersId}/tumnotlar`);
    return response.data;
  },

  // Tek not kaydet
  saveNot: async (data) => {
    const response = await api.post('/notlar/not', data);
    return response.data;
  },

  // Toplu not kaydet (backend: POST /notlar  { sinavId, notlar: [{ ogrenciId, puan }] })
  saveNotlar: async (sinavId, notlar) => {
    const response = await api.post('/notlar', { sinavId, notlar });
    return response.data;
  },

  // T-Skoru hesapla
  hesaplaTSkoru: async (sinavId) => {
    // backend route: POST /notlar/sinav/:sinavId/t-skoru-hesapla
    const response = await api.post(`/notlar/sinav/${sinavId}/t-skoru-hesapla`);
    return response.data;
  },

  // Notları aç/kapat
  notlariAcKapat: async (sinavId, acikMi) => {
    // backend tek route: PUT /notlar/sinav/:sinavId/notlari-ac  body: { acikMi }
    const response = await api.put(`/notlar/sinav/${sinavId}/notlari-ac`, { acikMi });
    return response.data;
  },

  // Harf notlarını açıkla
  harfNotuAcikla: async (sinavId) => {
    // backend route: PUT /notlar/sinav/:sinavId/harf-notu-acikla
    const response = await api.put(`/notlar/sinav/${sinavId}/harf-notu-acikla`);
    return response.data;
  },

  // Sınav istatistikleri
  getSinavIstatistik: async (sinavId) => {
    const response = await api.get(`/notlar/sinav/${sinavId}/istatistik`);
    return response.data;
  },

  // Sınav sil
  deleteSinav: async (sinavId) => {
    const response = await api.delete(`/notlar/sinav/${sinavId}`);
    return response.data;
  },

  // Öğrencinin ders notları
  getOgrenciDersNotlari: async (ogrenciId, dersId) => {
    const response = await api.get(`/notlar/ogrenci/${ogrenciId}/ders/${dersId}`);
    return response.data;
  },
};

// =====================================================
// MESAJ SERVICES (Güncellenmiş)
// =====================================================

export const mesajService = {
  // Tüm mesajları getir (öğretmen için)
  getAll: async () => {
    const response = await api.get('/ogretmen/mesajlar');
    return response;
  },

  // Öğretmen mesaj gönder
  gonder: async (data) => {
    const response = await api.post('/ogretmen/mesaj', data);
    return response;
  },

  // Öğrenci bazlı mesaj kutusu
  getByOgrenciId: async (ogrenciId) => {
    const response = await api.get(`/mesajlar/ogrenci/${ogrenciId}`);
    return response.data;
  },

  getGelen: async (ogrenciId) => {
    const response = await api.get(`/mesajlar/gelen/${ogrenciId}`);
    return response.data;
  },

  getGonderilen: async (ogrenciId) => {
    const response = await api.get(`/mesajlar/gonderilen/${ogrenciId}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/mesajlar/${id}`);
    return response.data;
  },

  send: async (data) => {
    const response = await api.post('/mesajlar', data);
    return response.data;
  },

  markAsRead: async (id) => {
    const response = await api.patch(`/mesajlar/${id}/okundu`);
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/mesajlar/${id}`);
    return response.data;
  },
};

// =====================================================
// SP / VIEW SERVICES (SQL Server SP'lerini çağırmak için)
// =====================================================

export const spService = {
  getBolumDersleri: async (bolumId) => {
    const response = await api.get(`/ogretmen/sp/bolum/${bolumId}/dersler`);
    return response.data?.dersler || response.data || [];
  },

  getBolumOgretmenleri: async (bolumId) => {
    const response = await api.get(`/ogretmen/sp/bolum/${bolumId}/ogretmenler`);
    return response.data?.ogretmenler || response.data || [];
  },

  getDonemDersleri: async (donemId) => {
    const response = await api.get(`/ogretmen/sp/donem/${donemId}/dersler`);
    return response.data?.dersler || response.data || [];
  },

  addOgrenci: async (data) => {
    const response = await api.post('/ogretmen/sp/ogrenci', data);
    return response.data;
  },

  getOgrenciYoklama: async (ogrenciId) => {
    const response = await api.get(`/ogretmen/sp/ogrenci/${ogrenciId}/yoklama`);
    return response.data?.yoklama || response.data || [];
  },

  // Fonksiyonlar
  getBolumOgrenciSayisi: async (bolumId) => {
    const response = await api.get(`/ogretmen/sp/fn/bolum/${bolumId}/ogrenci-sayisi`);
    return response.data?.ogrenciSayisi ?? response.data ?? null;
  },

  getDonemDersSayisi: async (donemId) => {
    const response = await api.get(`/ogretmen/sp/fn/donem/${donemId}/ders-sayisi`);
    return response.data?.dersSayisi ?? response.data ?? null;
  },

  getBolumOrtalamaAgno: async (bolumId) => {
    const response = await api.get(`/ogretmen/sp/fn/bolum/${bolumId}/agno`);
    return response.data?.ortalamaAgno ?? response.data ?? null;
  },

  // View
  getBolumOgrencileriView: async (bolumId) => {
    const response = await api.get(`/ogretmen/sp/view/bolum/${bolumId}/ogrenciler`);
    return response.data?.ogrenciler || response.data || [];
  },

  // Trigger logları
  getNotlarLog: async () => {
    const response = await api.get('/ogretmen/sp/logs/notlar');
    return response.data?.logs || response.data || [];
  },

  getYoklamaLog: async () => {
    const response = await api.get('/ogretmen/sp/logs/yoklama');
    return response.data?.logs || response.data || [];
  },
};

export default api;
