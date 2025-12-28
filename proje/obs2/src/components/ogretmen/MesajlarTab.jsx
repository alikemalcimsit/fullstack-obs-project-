import React, { useState, useEffect } from 'react';
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
  Textarea,
  Avatar,
} from '@material-tailwind/react';
import {
  EnvelopeIcon,
  PaperAirplaneIcon,
  InboxIcon,
  PlusIcon,
  CheckCircleIcon,
  ClockIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { mesajService } from '../../services/api';

const MesajlarTab = ({ ogretmen }) => {
  const [yeniMesajDialog, setYeniMesajDialog] = useState(false);
  const [selectedMesaj, setSelectedMesaj] = useState(null);
  const [mesajlar, setMesajlar] = useState([]);
  const [loading, setLoading] = useState(false);
  const [yeniMesaj, setYeniMesaj] = useState({
    aliciId: '',
    konu: '',
    mesajMetni: ''
  });
  const [sending, setSending] = useState(false);

  // Mesajları yükle
  useEffect(() => {
    loadMesajlar();
  }, []);

  const loadMesajlar = async () => {
    setLoading(true);
    try {
      const response = await mesajService.getAll();
      setMesajlar(response.data || []);
    } catch (error) {
      console.error('Mesajlar yüklenirken hata:', error);
      setMesajlar([]);
    } finally {
      setLoading(false);
    }
  };

  // Mesaj gönder
  const handleMesajGonder = async () => {
    if (!yeniMesaj.aliciId || !yeniMesaj.konu || !yeniMesaj.mesajMetni) {
      alert('Lütfen tüm alanları doldurun!');
      return;
    }

    setSending(true);
    try {
      await mesajService.gonder({
        gonderenOgretmenId: ogretmen?.id,
        aliciOgrenciId: parseInt(yeniMesaj.aliciId),
        konu: yeniMesaj.konu,
        mesajMetni: yeniMesaj.mesajMetni
      });
      alert('Mesaj başarıyla gönderildi!');
      setYeniMesajDialog(false);
      setYeniMesaj({ aliciId: '', konu: '', mesajMetni: '' });
      loadMesajlar();
    } catch (error) {
      console.error('Mesaj gönderilemedi:', error);
      alert('Mesaj gönderilemedi!');
    } finally {
      setSending(false);
    }
  };

  // Gelen ve giden mesajları ayır
  const ogretmenId = ogretmen?.id;
  const gelenMesajlar = (mesajlar || []).filter(m => m.aliciOgretmenId === ogretmenId);
  const gidenMesajlar = (mesajlar || []).filter(m => m.gonderenOgretmenId === ogretmenId);

  return (
    <div className="space-y-6">
      {/* Başlık Kartı */}
      <Card className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 text-white shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-32 translate-x-32"></div>
        <CardBody className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <EnvelopeIcon className="h-7 w-7" />
                </div>
                <div>
                  <Typography variant="h4" className="font-bold">Mesajlar</Typography>
                  <Typography className="opacity-80 text-sm">Öğrencilerle iletişim</Typography>
                </div>
              </div>
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="bg-white/10 rounded-lg px-4 py-2">
                  <Typography variant="small" className="opacity-70">Gelen</Typography>
                  <Typography variant="h5">{gelenMesajlar.length}</Typography>
                </div>
                <div className="bg-white/10 rounded-lg px-4 py-2">
                  <Typography variant="small" className="opacity-70">Giden</Typography>
                  <Typography variant="h5">{gidenMesajlar.length}</Typography>
                </div>
                <div className="bg-white/10 rounded-lg px-4 py-2">
                  <Typography variant="small" className="opacity-70">Okunmamış</Typography>
                  <Typography variant="h5">{gelenMesajlar.filter(m => !m.okundu).length}</Typography>
                </div>
              </div>
            </div>
            <Button
              size="lg"
              color="white"
              className="flex items-center gap-2 text-indigo-600 font-semibold shadow-lg"
              onClick={() => setYeniMesajDialog(true)}
            >
              <PlusIcon className="h-5 w-5" />
              Yeni Mesaj
            </Button>
          </div>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gelen Mesajlar */}
        <Card className="shadow-lg">
          <CardBody>
            <Typography variant="h5" className="mb-4 flex items-center gap-2">
              <InboxIcon className="h-6 w-6 text-blue-600" />
              Gelen Mesajlar
            </Typography>

            {gelenMesajlar.length === 0 ? (
              <div className="text-center py-8">
                <InboxIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <Typography className="text-gray-500">Henüz gelen mesaj yok</Typography>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {gelenMesajlar.map(mesaj => (
                  <div
                    key={mesaj.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                      mesaj.okundu ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'
                    }`}
                    onClick={() => setSelectedMesaj(mesaj)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar size="sm" className="bg-blue-500">
                          {mesaj.gonderenOgrenci?.isim?.charAt(0) || 'Ö'}
                        </Avatar>
                        <div>
                          <Typography variant="small" className="font-semibold">
                            {mesaj.gonderenOgrenci?.isim} {mesaj.gonderenOgrenci?.soyad}
                          </Typography>
                          <Typography variant="small" className="text-gray-600 truncate max-w-[200px]">
                            {mesaj.konu}
                          </Typography>
                        </div>
                      </div>
                      <div className="text-right">
                        <Typography variant="small" className="text-gray-500 text-xs">
                          {new Date(mesaj.createdAt).toLocaleDateString('tr-TR')}
                        </Typography>
                        {!mesaj.okundu && (
                          <Chip size="sm" value="Yeni" color="blue" className="mt-1" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        {/* Giden Mesajlar */}
        <Card className="shadow-lg">
          <CardBody>
            <Typography variant="h5" className="mb-4 flex items-center gap-2">
              <PaperAirplaneIcon className="h-6 w-6 text-green-600" />
              Giden Mesajlar
            </Typography>

            {gidenMesajlar.length === 0 ? (
              <div className="text-center py-8">
                <PaperAirplaneIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <Typography className="text-gray-500">Henüz gönderilmiş mesaj yok</Typography>
              </div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {gidenMesajlar.map(mesaj => (
                  <div
                    key={mesaj.id}
                    className="p-4 rounded-lg border border-gray-200 bg-gray-50 cursor-pointer transition-all hover:shadow-md"
                    onClick={() => setSelectedMesaj(mesaj)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar size="sm" className="bg-green-500">
                          {mesaj.aliciOgrenci?.isim?.charAt(0) || 'Ö'}
                        </Avatar>
                        <div>
                          <Typography variant="small" className="font-semibold">
                            {mesaj.aliciOgrenci?.isim} {mesaj.aliciOgrenci?.soyad}
                          </Typography>
                          <Typography variant="small" className="text-gray-600 truncate max-w-[200px]">
                            {mesaj.konu}
                          </Typography>
                        </div>
                      </div>
                      <div className="text-right">
                        <Typography variant="small" className="text-gray-500 text-xs">
                          {new Date(mesaj.createdAt).toLocaleDateString('tr-TR')}
                        </Typography>
                        <Chip
                          size="sm"
                          value={mesaj.okundu ? 'Okundu' : 'Gönderildi'}
                          color={mesaj.okundu ? 'green' : 'gray'}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Yeni Mesaj Dialog */}
      <Dialog open={yeniMesajDialog} handler={() => setYeniMesajDialog(false)} size="md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <PaperAirplaneIcon className="h-6 w-6 text-blue-500" />
            Yeni Mesaj Gönder
          </div>
        </DialogHeader>
        <DialogBody divider className="space-y-4">
          <div>
            <Typography variant="small" className="mb-2 font-medium">Alıcı E-posta</Typography>
            <Input
              type="email"
              placeholder="ornek@universite.edu.tr"
              value={yeniMesaj.aliciId}
              onChange={(e) => setYeniMesaj({ ...yeniMesaj, aliciId: e.target.value })}
            />
          </div>
          <Input
            label="Konu"
            value={yeniMesaj.konu}
            onChange={(e) => setYeniMesaj({ ...yeniMesaj, konu: e.target.value })}
          />
          <Textarea
            label="Mesaj"
            value={yeniMesaj.mesajMetni}
            onChange={(e) => setYeniMesaj({ ...yeniMesaj, mesajMetni: e.target.value })}
            rows={5}
          />
        </DialogBody>
        <DialogFooter className="space-x-2">
          <Button variant="outlined" color="gray" onClick={() => setYeniMesajDialog(false)}>
            İptal
          </Button>
          <Button
            color="blue"
            className="flex items-center gap-2"
            onClick={handleMesajGonder}
            disabled={sending}
          >
            <PaperAirplaneIcon className="h-4 w-4" />
            {sending ? 'Gönderiliyor...' : 'Gönder'}
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Mesaj Detay Dialog */}
      <Dialog open={!!selectedMesaj} handler={() => setSelectedMesaj(null)} size="md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <EnvelopeIcon className="h-6 w-6 text-blue-500" />
            {selectedMesaj?.konu}
          </div>
        </DialogHeader>
        <DialogBody divider>
          {selectedMesaj && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar size="md" className="bg-blue-500">
                  <UserCircleIcon className="h-8 w-8" />
                </Avatar>
                <div>
                  <Typography variant="small" className="font-semibold">
                    {selectedMesaj.gonderenOgrenci 
                      ? `${selectedMesaj.gonderenOgrenci.isim} ${selectedMesaj.gonderenOgrenci.soyad}`
                      : selectedMesaj.aliciOgrenci 
                        ? `Kime: ${selectedMesaj.aliciOgrenci.isim} ${selectedMesaj.aliciOgrenci.soyad}`
                        : 'Bilinmiyor'}
                  </Typography>
                  <div className="flex items-center gap-2 text-gray-500">
                    <ClockIcon className="h-4 w-4" />
                    <Typography variant="small">
                      {new Date(selectedMesaj.createdAt).toLocaleString('tr-TR')}
                    </Typography>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <Typography className="whitespace-pre-wrap">
                  {selectedMesaj.mesajMetni}
                </Typography>
              </div>
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button variant="outlined" color="gray" onClick={() => setSelectedMesaj(null)}>
            Kapat
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
};

export default MesajlarTab;
