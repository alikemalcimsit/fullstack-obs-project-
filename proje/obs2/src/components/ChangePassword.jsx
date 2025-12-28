import React, { useState } from 'react'
import { authService } from '../services/api';

export default function ChangePassword() {
  const [eskiSifre, setEskiSifre] = useState('');
  const [yeniSifre, setYeniSifre] = useState('');
  const [yeniSifreTekrar, setYeniSifreTekrar] = useState('');
  const [onay, setOnay] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validasyonlar
    if (!eskiSifre || !yeniSifre || !yeniSifreTekrar) {
      setMessage({ type: 'error', text: 'Tüm alanları doldurunuz.' });
      return;
    }

    if (yeniSifre !== yeniSifreTekrar) {
      setMessage({ type: 'error', text: 'Yeni şifreler eşleşmiyor.' });
      return;
    }

    if (yeniSifre.length < 6) {
      setMessage({ type: 'error', text: 'Yeni şifre en az 6 karakter olmalıdır.' });
      return;
    }

    if (!onay) {
      setMessage({ type: 'error', text: 'Lütfen şifre değiştirme işlemini onaylayınız.' });
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      
      await authService.sifreDegistir(eskiSifre, yeniSifre);
      
      setMessage({ type: 'success', text: 'Şifreniz başarıyla değiştirildi.' });
      
      // Formu temizle
      setEskiSifre('');
      setYeniSifre('');
      setYeniSifreTekrar('');
      setOnay(false);
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Şifre değiştirilemedi.';
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='bg-[#1C2534] rounded-2xl p-4 py-10'>
      <h1 className='text-white text-center text-2xl mb-3'>Şifre Değiştir</h1>
      <div className='border-b-2 border-[#BFBFBF] mb-5'></div>
      
      {message.text && (
        <div className={`text-center mb-4 p-2 rounded-lg ${
          message.type === 'error' ? 'bg-red-500/20 text-red-300' : 'bg-green-500/20 text-green-300'
        }`}>
          {message.text}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className='flex flex-col justify-center items-center mt-10'>
        <div className='flex items-center gap-x-12 mb-5 text-white'>
          <span className='w-32'>Eski Şifre</span>
          <input 
            type='password' 
            value={eskiSifre}
            onChange={(e) => setEskiSifre(e.target.value)}
            className='py-2 px-2 rounded-lg text-black' 
            placeholder='Eski şifreniz'
          />
        </div>
        <div className='flex items-center gap-x-12 mb-5 text-white'>
          <span className='w-32'>Yeni Şifre</span>
          <input 
            type='password' 
            value={yeniSifre}
            onChange={(e) => setYeniSifre(e.target.value)}
            className='py-2 px-2 rounded-lg text-black' 
            placeholder='Yeni şifreniz'
          />
        </div>
        <div className='flex items-center gap-x-12 mb-5 text-white'>
          <span className='w-32'>Yeni Şifre (Tekrar)</span>
          <input 
            type='password' 
            value={yeniSifreTekrar}
            onChange={(e) => setYeniSifreTekrar(e.target.value)}
            className='py-2 px-2 rounded-lg text-black' 
            placeholder='Yeni şifrenizi tekrar girin'
          />
        </div>
        <div className='flex items-center justify-center w-full gap-x-4 mb-5 text-white'>
          <input 
            type='checkbox' 
            checked={onay}
            onChange={(e) => setOnay(e.target.checked)}
            style={{height:"20px", width:"20px"}}
          />
          <span>Şifre değiştirme işlemini onaylıyorum</span>
        </div>
        <button 
          type='submit'
          disabled={loading}
          className='text-white w-1/2 m-auto flex items-center justify-center hover:bg-[#ff9155] bg-[#FF7227] py-4 px-2 rounded-2xl disabled:bg-gray-500 transition-colors'
        >
          {loading ? 'İşleniyor...' : 'Şifreyi Değiştir'}
        </button>
      </form>
    </div>
  )
}
