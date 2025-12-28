import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import bg from ".././assets/bg.webp";
import logo from ".././assets/logo.png";
import { authService } from '../services/api';

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    ogrenciNo: '',
    tcNo: '',
    isim: '',
    soyad: '',
    email: '',
    sifre: '',
    sifreTekrar: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validasyonlar
    if (!formData.ogrenciNo || !formData.tcNo || !formData.isim || 
        !formData.soyad || !formData.email || !formData.sifre) {
      setError('Lütfen tüm alanları doldurunuz.');
      return;
    }

    if (formData.sifre !== formData.sifreTekrar) {
      setError('Şifreler eşleşmiyor.');
      return;
    }

    if (formData.sifre.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.');
      return;
    }

    if (formData.tcNo.length !== 11) {
      setError('TC Kimlik numarası 11 haneli olmalıdır.');
      return;
    }

    try {
      setLoading(true);
      
      await authService.register({
        ogrenciNo: formData.ogrenciNo,
        tcNo: formData.tcNo,
        isim: formData.isim,
        soyad: formData.soyad,
        email: formData.email,
        sifre: formData.sifre
      });

      alert('Kayıt başarılı! Giriş yapabilirsiniz.');
      navigate('/');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Kayıt sırasında bir hata oluştu.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="bg-cover flex items-center justify-center bg-center min-h-screen w-screen py-8"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="w-[570px] flex flex-col items-center justify-center py-8 px-6 rounded-[70px] backdrop-blur-sm bg-[#D9D9D9]/30">
        <img alt="logo" src={logo} className="w-32 h-32 object-contain mb-4" />
        <h1 className="text-2xl font-bold text-white mb-6">Öğrenci Kayıt</h1>
        
        {error && (
          <div className="w-2/3 mb-4 p-3 bg-red-500/80 text-white rounded-xl text-center">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
          <div className="w-2/3 mb-3">
            <input 
              type="text" 
              name="ogrenciNo"
              value={formData.ogrenciNo}
              onChange={handleChange}
              placeholder="Öğrenci Numarası" 
              className="py-4 px-4 border-[1px] border-[#210F61] w-full bg-white rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>
          
          <div className="w-2/3 mb-3">
            <input 
              type="text" 
              name="tcNo"
              value={formData.tcNo}
              onChange={handleChange}
              placeholder="TC Kimlik Numarası" 
              maxLength={11}
              className="py-4 px-4 border-[1px] border-[#210F61] w-full bg-white rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="w-2/3 mb-3 flex gap-2">
            <input 
              type="text" 
              name="isim"
              value={formData.isim}
              onChange={handleChange}
              placeholder="İsim" 
              className="py-4 px-4 border-[1px] border-[#210F61] w-full bg-white rounded-xl focus:outline-none focus:border-blue-500"
            />
            <input 
              type="text" 
              name="soyad"
              value={formData.soyad}
              onChange={handleChange}
              placeholder="Soyad" 
              className="py-4 px-4 border-[1px] border-[#210F61] w-full bg-white rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="w-2/3 mb-3">
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="E-posta Adresi" 
              className="py-4 px-4 border-[1px] border-[#210F61] w-full bg-white rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="w-2/3 mb-3">
            <input 
              type="password" 
              name="sifre"
              value={formData.sifre}
              onChange={handleChange}
              placeholder="Şifre" 
              className="py-4 px-4 border-[1px] border-[#210F61] w-full bg-white rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="w-2/3 mb-4">
            <input 
              type="password" 
              name="sifreTekrar"
              value={formData.sifreTekrar}
              onChange={handleChange}
              placeholder="Şifre Tekrar" 
              className="py-4 px-4 border-[1px] border-[#210F61] w-full bg-white rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-2/3 py-4 bg-[#210F61] text-white rounded-xl font-semibold hover:bg-[#3a1fa8] transition-colors disabled:bg-gray-500"
          >
            {loading ? 'Kayıt Yapılıyor...' : 'Kayıt Ol'}
          </button>

          <p className="text-white mt-4">
            Zaten hesabınız var mı?{' '}
            <button 
              type="button"
              onClick={() => navigate('/')}
              className="text-blue-300 hover:text-blue-100 underline"
            >
              Giriş Yap
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
