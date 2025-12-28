import React from 'react';
import {
  Card,
  CardBody,
  Typography,
  Button,
  Chip,
} from '@material-tailwind/react';
import {
  BookOpenIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

const DerslerimTab = ({ dersler, selectedDers, onSelectDers, onTabChange }) => {
  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <Typography variant="h4" className="text-gray-800 flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-[#210F61] to-[#3a1f8f] rounded-xl flex items-center justify-center">
            <BookOpenIcon className="h-7 w-7 text-white" />
          </div>
          Derslerim
        </Typography>
        <Chip value={`${dersler.length} Ders`} color="blue" />
      </div>

      {/* Ders Kartları */}
      {dersler.length === 0 ? (
        <Card className="shadow-lg">
          <CardBody className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpenIcon className="h-10 w-10 text-gray-400" />
            </div>
            <Typography variant="h5" className="text-gray-600 mb-2">
              Henüz Ders Atanmamış
            </Typography>
            <Typography className="text-gray-500">
              Size atanmış ders bulunmamaktadır.
            </Typography>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dersler.map((ders) => (
            <Card
              key={ders.id}
              className={`cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                selectedDers?.id === ders.id
                  ? 'ring-2 ring-[#210F61] shadow-xl bg-gradient-to-br from-blue-50 to-purple-50'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => onSelectDers(ders)}
            >
              <CardBody className="p-6">
                {/* Üst Kısım */}
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#210F61] to-[#3a1f8f] rounded-xl flex items-center justify-center shadow-lg">
                    <BookOpenIcon className="h-8 w-8 text-white" />
                  </div>
                  {selectedDers?.id === ders.id && (
                    <Chip
                      size="sm"
                      value="Seçili"
                      color="green"
                      icon={<CheckCircleIcon className="h-4 w-4" />}
                    />
                  )}
                </div>

                {/* Ders Bilgileri */}
                <Typography variant="h5" className="text-gray-800 mb-1">
                  {ders.dersAdi}
                </Typography>
                <Typography variant="small" className="text-gray-500 font-mono mb-4">
                  {ders.dersKodu}
                </Typography>

                {/* İstatistikler */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-blue-50 rounded-lg p-3 text-center">
                    <Typography variant="small" className="text-gray-600">Kredi</Typography>
                    <Typography variant="h5" color="blue">{ders.kredi}</Typography>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-3 text-center">
                    <Typography variant="small" className="text-gray-600">AKTS</Typography>
                    <Typography variant="h5" color="purple">{ders.akts}</Typography>
                  </div>
                </div>

                {/* Alt Bilgiler */}
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <UserGroupIcon className="h-4 w-4" />
                    <span>{ders.ogrenciSayisi || 0} Öğrenci</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <ClockIcon className="h-4 w-4" />
                    <span>{ders.donem?.donemAdi || 'Dönem'}</span>
                  </div>
                </div>

                {/* Hızlı Erişim Butonları */}
                {selectedDers?.id === ders.id && (
                  <div className="mt-4 pt-4 border-t flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      color="blue"
                      variant="outlined"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTabChange('notlar');
                      }}
                    >
                      Notlar
                    </Button>
                    <Button
                      size="sm"
                      color="green"
                      variant="outlined"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTabChange('yoklama');
                      }}
                    >
                      Yoklama
                    </Button>
                    <Button
                      size="sm"
                      color="purple"
                      variant="outlined"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTabChange('ogrenciler');
                      }}
                    >
                      Öğrenciler
                    </Button>
                  </div>
                )}
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default DerslerimTab;
