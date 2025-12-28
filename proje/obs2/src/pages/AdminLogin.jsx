import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Button,
  Typography,
} from '@material-tailwind/react';
import { ShieldCheckIcon, UserIcon, LockClosedIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { authService } from '../services/api';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    sifre: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.loginAdmin(formData);
      
      // Token ve admin bilgilerini kaydet
      localStorage.setItem('token', response.token);
      localStorage.setItem('admin', JSON.stringify(response.admin));
      localStorage.setItem('userType', 'admin');

      // Admin dashboard'a yönlendir
      navigate('/admin-dashboard');
    } catch (error) {
      console.error('Login hatası:', error);
      setError(error.response?.data?.error || 'Giriş başarısız. E-posta veya şifre hatalı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 flex items-center justify-center p-4">
      {/* Ana Giriş Sayfasına Dön Butonu */}
      <Link to="/login" className="absolute top-4 left-4">
        <Button variant="text" color="white" className="flex items-center gap-2">
          <ArrowLeftIcon className="h-5 w-5" />
          Ana Giriş Sayfası
        </Button>
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader
          variant="gradient"
          color="purple"
          className="mb-4 grid h-28 place-items-center"
        >
          <div className="flex items-center gap-3">
            <ShieldCheckIcon className="h-12 w-12 text-white" />
            <div className="text-center">
              <Typography variant="h4" color="white">
                Admin Girişi
              </Typography>
              <Typography variant="small" color="white" className="opacity-80">
                Öğrenci Bilgi Sistemi
              </Typography>
            </div>
          </div>
        </CardHeader>
        
        <CardBody className="flex flex-col gap-4">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="relative">
              <Input
                type="email"
                name="email"
                label="E-posta"
                size="lg"
                value={formData.email}
                onChange={handleChange}
                required
                icon={<UserIcon className="h-5 w-5" />}
              />
            </div>

            <div className="relative">
              <Input
                type="password"
                name="sifre"
                label="Şifre"
                size="lg"
                value={formData.sifre}
                onChange={handleChange}
                required
                icon={<LockClosedIcon className="h-5 w-5" />}
              />
            </div>

            <Button
              type="submit"
              color="purple"
              fullWidth
              disabled={loading}
              className="mt-2"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Giriş yapılıyor...
                </div>
              ) : (
                'Giriş Yap'
              )}
            </Button>
          </form>

          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <Typography variant="small" className="text-gray-600 text-center">
              <strong>Demo Hesap:</strong><br />
              E-posta: admin@universite.edu.tr<br />
              Şifre: 12345
            </Typography>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default AdminLogin;
