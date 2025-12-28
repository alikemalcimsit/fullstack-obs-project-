import React, { useState } from "react";
import bg from ".././assets/bg.webp";
import logo from ".././assets/logo.png";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/api";

export default function Login() {
  const [ogrNo, setOgrNo] = useState('');
  const [sifre, setSifre] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userType, setUserType] = useState('ogrenci'); // 'ogrenci', 'ogretmen', 'admin'

  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!ogrNo || !sifre) {
      setError(userType === 'ogrenci' ? 'Lütfen öğrenci numarası ve şifre giriniz' : 'Lütfen e-posta ve şifre giriniz');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (userType === 'ogrenci') {
        const response = await authService.login(ogrNo, sifre);
        console.log("Öğrenci Girişi Başarılı", response);
        localStorage.setItem('userType', 'ogrenci');
        navigate(`/${response.user.ogrNo}`);
      } else if (userType === 'ogretmen') {
        const response = await authService.loginOgretmen({ email: ogrNo, sifre });
        console.log("Öğretmen Girişi Başarılı", response);
        navigate('/ogretmen-dashboard');
      } else if (userType === 'admin') {
        const response = await authService.loginAdmin({ email: ogrNo, sifre });
        console.log("Admin Girişi Başarılı", response);
        navigate('/admin-dashboard');
      }
    } catch (error) {
      console.error('Giriş hatası:', error);
      setError(error.response?.data?.error || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  const getPlaceholder = () => {
    switch (userType) {
      case 'ogrenci':
        return 'Öğrenci Numarası';
      case 'ogretmen':
        return 'E-posta Adresi';
      case 'admin':
        return 'E-posta Adresi';
      default:
        return 'Kullanıcı Adı';
    }
  };

  const getTitle = () => {
    switch (userType) {
      case 'ogrenci':
        return 'Öğrenci Girişi';
      case 'ogretmen':
        return 'Öğretmen Girişi';
      case 'admin':
        return 'Admin Girişi';
      default:
        return 'Giriş Yap';
    }
  };

  const getButtonColor = () => {
    switch (userType) {
      case 'ogrenci':
        return 'bg-[#210F61] hover:bg-[#2d1a7a]';
      case 'ogretmen':
        return 'bg-green-600 hover:bg-green-700';
      case 'admin':
        return 'bg-purple-600 hover:bg-purple-700';
      default:
        return 'bg-[#210F61] hover:bg-[#2d1a7a]';
    }
  };

  return (
    <div>
      <div
        className="bg-cover flex items-center justify-center bg-center h-screen w-screen"
        style={{ backgroundImage: `url(${bg})` }}
      >
        <div className="w-[570px] flex flex-col backdrop-blur-md items-center justify-center h-auto py-10 rounded-[70px] bg-[#D9D9D9]/10">
          <img alt="logo" src={logo} className="w-24 h-24 object-contain" />
          <h1 className="text-2xl font-semibold mt-2 text-white">
            Öğrenci Bilgi Sistemi
          </h1>
          
          {/* Kullanıcı Tipi Seçim Butonları */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => { setUserType('ogrenci'); setError(''); setOgrNo(''); setSifre(''); }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                userType === 'ogrenci'
                  ? 'bg-[#210F61] text-white'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              👨‍🎓 Öğrenci
            </button>
            <button
              onClick={() => { setUserType('ogretmen'); setError(''); setOgrNo(''); setSifre(''); }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                userType === 'ogretmen'
                  ? 'bg-green-600 text-white'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              👨‍🏫 Öğretmen
            </button>
            <button
              onClick={() => { setUserType('admin'); setError(''); setOgrNo(''); setSifre(''); }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                userType === 'admin'
                  ? 'bg-purple-600 text-white'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              🛡️ Admin
            </button>
          </div>

          <p className="text-white/70 text-sm mt-3">{getTitle()}</p>

          {error && (
            <div className="w-2/3 mt-4 bg-red-500/20 border border-red-500 text-red-100 px-4 py-2 rounded-xl text-sm text-center">
              {error}
            </div>
          )}

          <div className="w-2/3 mt-4">
            <input
              value={ogrNo}
              onChange={(e) => setOgrNo(e.target.value)}
              onKeyPress={handleKeyPress}
              type={userType === 'ogrenci' ? 'text' : 'email'}
              placeholder={getPlaceholder()}
              className="py-4 px-4 border-[1px] border-[#210F61] w-full mb-4 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#210F61]"
            />
            <input
              value={sifre}
              onChange={(e) => setSifre(e.target.value)}
              onKeyPress={handleKeyPress}
              type="password"
              placeholder="Şifre"
              className="py-4 px-4 border-[1px] border-[#210F61] w-full mb-4 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#210F61]"
            />
          </div>

          <div className="mb-4">
            <button
              onClick={handleLogin}
              disabled={loading}
              className={`px-16 py-3 rounded-full text-white transition-all duration-200 ${getButtonColor()} ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </button>
          </div>

          {userType === 'ogrenci' && (
            <div>
              <button
                onClick={() => navigate('/register')}
                className="px-16 py-3 rounded-full bg-[#E5B77C] text-black hover:bg-[#d4a66b] transition-all duration-200"
              >
                Kayıt Ol
              </button>
            </div>
          )}

          {/* Demo Bilgileri */}
          <div className="mt-4 text-center">
            <p className="text-white/50 text-xs">Demo Hesap Bilgileri:</p>
            {userType === 'ogrenci' && (
              <p className="text-white/70 text-xs mt-1">No: 210707069 | Şifre: 12345</p>
            )}
            {userType === 'ogretmen' && (
              <p className="text-white/70 text-xs mt-1">mete.yaganoglu@universite.edu.tr | Şifre: 12345</p>
            )}
            {userType === 'admin' && (
              <p className="text-white/70 text-xs mt-1">admin@universite.edu.tr | Şifre: 12345</p>
            )}
          </div>

          <p className="text-white/50 text-xs mt-4">
            © 2024 Öğrenci Bilgi Sistemi
          </p>
        </div>
      </div>
    </div>
  );
}
