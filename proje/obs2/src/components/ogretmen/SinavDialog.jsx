import React, { useState } from 'react';
import {
  Card,
  CardBody,
  Typography,
  Button,
  Input,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Select,
  Option,
} from '@material-tailwind/react';
import {
  DocumentTextIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { notYonetimService } from '../../services/api';

const SinavDialog = ({ open, onClose, selectedDers, onSuccess }) => {
  const [yeniSinav, setYeniSinav] = useState({
    sinavTuru: 'Vize',
    sinavAdi: '',
    sinavTarihi: new Date().toISOString().split('T')[0],
    agirlik: 0.4
  });
  const [saving, setSaving] = useState(false);

  const handleSinavOlustur = async () => {
    if (!selectedDers) {
      alert('Lütfen önce bir ders seçin!');
      return;
    }

    setSaving(true);
    try {
      await notYonetimService.createSinav({
        dersId: selectedDers.id,
        ...yeniSinav
      });
      alert('Sınav başarıyla oluşturuldu!');
      onSuccess();
      onClose();
      setYeniSinav({
        sinavTuru: 'Vize',
        sinavAdi: '',
        sinavTarihi: new Date().toISOString().split('T')[0],
        agirlik: 0.4
      });
    } catch (error) {
      console.error('Sınav oluşturulamadı:', error);
      alert('Sınav oluşturulamadı!');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} handler={onClose} size="md">
      <DialogHeader>
        <div className="flex items-center gap-2">
          <DocumentTextIcon className="h-6 w-6 text-blue-500" />
          Yeni Sınav Oluştur
        </div>
      </DialogHeader>
      <DialogBody divider className="space-y-4">
        <div>
          <Typography variant="small" className="mb-2 font-medium">Sınav Türü</Typography>
          <select
            className="w-full p-3 border border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
            value={yeniSinav.sinavTuru}
            onChange={(e) => setYeniSinav({ ...yeniSinav, sinavTuru: e.target.value })}
          >
            <option value="Vize">Vize</option>
            <option value="Final">Final</option>
            <option value="Bütünleme">Bütünleme</option>
            <option value="Quiz">Quiz</option>
            <option value="Ödev">Ödev</option>
          </select>
        </div>
        <Input
          label="Sınav Adı (Opsiyonel)"
          value={yeniSinav.sinavAdi}
          onChange={(e) => setYeniSinav({ ...yeniSinav, sinavAdi: e.target.value })}
          placeholder="Örn: 1. Vize"
        />
        <Input
          type="date"
          label="Sınav Tarihi"
          value={yeniSinav.sinavTarihi}
          onChange={(e) => setYeniSinav({ ...yeniSinav, sinavTarihi: e.target.value })}
        />
        <div>
          <Typography variant="small" className="mb-2 font-medium">Ağırlık (%)</Typography>
          <Input
            type="number"
            min={0}
            max={100}
            value={Math.round(yeniSinav.agirlik * 100)}
            onChange={(e) => setYeniSinav({ ...yeniSinav, agirlik: parseInt(e.target.value) / 100 })}
          />
        </div>
      </DialogBody>
      <DialogFooter className="space-x-2">
        <Button variant="outlined" color="gray" onClick={onClose}>
          İptal
        </Button>
        <Button
          color="blue"
          className="flex items-center gap-2"
          onClick={handleSinavOlustur}
          disabled={saving}
        >
          <PlusIcon className="h-4 w-4" />
          {saving ? 'Oluşturuluyor...' : 'Oluştur'}
        </Button>
      </DialogFooter>
    </Dialog>
  );
};

export default SinavDialog;
