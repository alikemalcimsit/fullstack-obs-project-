const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Fakülteler
  const muhendislikFakultesi = await prisma.fakulte.create({
    data: { fakulteAdi: 'Mühendislik Fakültesi' },
  });

  const hukukFakultesi = await prisma.fakulte.create({
    data: { fakulteAdi: 'Hukuk Fakültesi' },
  });

  const fenFakultesi = await prisma.fakulte.create({
    data: { fakulteAdi: 'Fen Edebiyat Fakültesi' },
  });

  console.log('✅ Fakülteler oluşturuldu');

  // Bölümler
  const bilgisayarMuh = await prisma.bolum.create({
    data: {
      bolumAdi: 'Bilgisayar Mühendisliği',
      fakulteId: muhendislikFakultesi.id,
      donemSayisi: 8,
    },
  });

  const elektrikMuh = await prisma.bolum.create({
    data: {
      bolumAdi: 'Elektrik-Elektronik Mühendisliği',
      fakulteId: muhendislikFakultesi.id,
      donemSayisi: 8,
    },
  });

  const makineMuh = await prisma.bolum.create({
    data: {
      bolumAdi: 'Makine Mühendisliği',
      fakulteId: muhendislikFakultesi.id,
      donemSayisi: 8,
    },
  });

  const hukuk = await prisma.bolum.create({
    data: {
      bolumAdi: 'Hukuk',
      fakulteId: hukukFakultesi.id,
      donemSayisi: 8,
    },
  });

  console.log('✅ Bölümler oluşturuldu');

  // Dönemler
  const donemler = [];
  for (let i = 1; i <= 8; i++) {
    const donem = await prisma.donem.create({
      data: { donemAdi: `${i}. Dönem`, aktif: i === 5 },
    });
    donemler.push(donem);
  }

  console.log('✅ Dönemler oluşturuldu');

  // Sınıflar
  const siniflar = [];
  const sinifAdlari = ['TRS-1', 'TRS-2', 'E-101', 'E-102', 'E-201', 'E-202', 'Lab-1', 'Lab-2'];
  for (const sinifAdi of sinifAdlari) {
    const sinif = await prisma.sinif.create({
      data: { sinifAdi, kapasite: 40 },
    });
    siniflar.push(sinif);
  }

  console.log('✅ Sınıflar oluşturuldu');

  // Şifreleri hashle
  const hashedPassword = await bcrypt.hash('12345', 10);

  // Öğretmenler
  const ogretmen1 = await prisma.ogretmen.create({
    data: {
      tcNo: '11111111111',
      isim: 'Mete',
      soyad: 'Yağanoğlu',
      email: 'mete.yaganoglu@universite.edu.tr',
      sifre: hashedPassword,
      telNo: '+905001112233',
      unvan: 'Prof. Dr.',
      bolumId: bilgisayarMuh.id,
    },
  });

  const ogretmen2 = await prisma.ogretmen.create({
    data: {
      tcNo: '11111111112',
      isim: 'Köksal',
      soyad: 'Erentürk',
      email: 'koksal.erenturk@universite.edu.tr',
      sifre: hashedPassword,
      telNo: '+905001112234',
      unvan: 'Doç. Dr.',
      bolumId: bilgisayarMuh.id,
    },
  });

  const ogretmen3 = await prisma.ogretmen.create({
    data: {
      tcNo: '11111111113',
      isim: 'Ayşe',
      soyad: 'Kaya',
      email: 'ayse.kaya@universite.edu.tr',
      sifre: hashedPassword,
      telNo: '+905001112235',
      unvan: 'Dr. Öğr. Üyesi',
      bolumId: bilgisayarMuh.id,
    },
  });

  console.log('✅ Öğretmenler oluşturuldu');

  // Admin kullanıcıları
  const admin1 = await prisma.admin.create({
    data: {
      tcNo: '99999999999',
      isim: 'Sistem',
      soyad: 'Yöneticisi',
      email: 'admin@universite.edu.tr',
      sifre: hashedPassword,
      telNo: '+905001110000',
      rol: 'superadmin',
    },
  });

  const admin2 = await prisma.admin.create({
    data: {
      tcNo: '99999999998',
      isim: 'Öğrenci İşleri',
      soyad: 'Admin',
      email: 'ogrenciisleri@universite.edu.tr',
      sifre: hashedPassword,
      telNo: '+905001110001',
      rol: 'admin',
    },
  });

  console.log('✅ Admin kullanıcıları oluşturuldu');

  // Öğrenciler
  const ogrenci1 = await prisma.ogrenci.create({
    data: {
  tcNo: '18898066916',
  ogrNo: '210707069',
  isim: 'Ramazan',
  soyad: 'Ayaz',
  email: 'ramazanayaz@ogrenci.edu.tr',
      sifre: hashedPassword,
      telNo: '+905060237736',
      adres: 'Adana/Ceyhan',
      dogumTarihi: new Date('1999-05-12'),
      cinsiyet: 'Erkek',
  fotograf: 'https://picsum.photos/seed/ramazanayaz/200',
      statu: 'Aktif',
      geldigiOkul: 'Oltu Fen Lisesi',
      agno: 3.00,
      sube: 'A',
      okuduguDonem: 5,
      akademikYil: '2024-2025',
      gelisSekli: 'YKS',
      gelisPuani: 350.0,
      bolumId: bilgisayarMuh.id,
    },
  });

  const ogrenci2 = await prisma.ogrenci.create({
    data: {
      tcNo: '53716115101',
      ogrNo: '210707020',
      isim: 'Sefa',
      soyad: 'Özay',
      email: 'sefaozay@ogrenci.edu.tr',
      sifre: hashedPassword,
      telNo: '+905545679898',
      adres: 'İstanbul/Kartal',
  dogumTarihi: new Date('1998-11-03'),
  cinsiyet: 'Erkek',
  fotograf: 'https://picsum.photos/seed/sefa/200',
      statu: 'Aktif',
      geldigiOkul: 'Kartal Anadolu Lisesi',
      agno: 2.50,
      sube: 'B',
      okuduguDonem: 5,
      akademikYil: '2024-2025',
      gelisSekli: 'YKS',
      gelisPuani: 320.0,
      bolumId: bilgisayarMuh.id,
    },
  });

  const ogrenci4 = await prisma.ogrenci.create({
    data: {
      tcNo: '53716115103',
      ogrNo: '210707022',
      isim: 'Zeynep',
      soyad: 'Demir',
      email: 'zeynepdemir@ogrenci.edu.tr',
      sifre: hashedPassword,
      telNo: '+905555551111',
      adres: 'İzmir/Bornova',
  dogumTarihi: new Date('2000-02-18'),
  cinsiyet: 'Kadın',
  fotograf: 'https://picsum.photos/seed/zeynep/200',
      statu: 'Aktif',
      agno: 2.80,
      sube: 'A',
      okuduguDonem: 5,
      akademikYil: '2024-2025',
      gelisSekli: 'YKS',
      gelisPuani: 360.0,
      bolumId: bilgisayarMuh.id,
    },
  });

  const ogrenci3 = await prisma.ogrenci.create({
    data: {
      tcNo: '53716115102',
      ogrNo: '210707021',
      isim: 'Mehmet',
      soyad: 'Yılmaz',
      email: 'mehmetyilmaz@ogrenci.edu.tr',
      sifre: hashedPassword,
      telNo: '+905321234567',
      adres: 'Ankara/Çankaya',
  dogumTarihi: new Date('1999-08-25'),
  cinsiyet: 'Erkek',
  fotograf: 'https://picsum.photos/seed/mehmet/200',
      statu: 'Aktif',
      geldigiOkul: 'Ankara Fen Lisesi',
      agno: 3.50,
      sube: 'A',
      okuduguDonem: 5,
      akademikYil: '2024-2025',
      gelisSekli: 'YKS',
      gelisPuani: 380.0,
      bolumId: bilgisayarMuh.id,
    },
  });

  console.log('✅ Öğrenciler oluşturuldu');

  // Dersler - 5. Dönem için
  const dersler5Donem = [
    { dersKodu: 'BLM301', dersAdi: 'Veri Tabanı Yönetim Sistemleri', kredi: 4, akts: 6, zorunlu: true, secmeli: false, kontenjan: 30 },
    { dersKodu: 'BLM303', dersAdi: 'Yazılım Mühendisliği', kredi: 3, akts: 5, zorunlu: true, secmeli: false, kontenjan: 30 },
    { dersKodu: 'BLM305', dersAdi: 'İşletim Sistemleri', kredi: 4, akts: 6, zorunlu: true, secmeli: false, kontenjan: 30 },
    { dersKodu: 'BLM307', dersAdi: 'Yapay Zekaya Giriş', kredi: 3, akts: 5, zorunlu: true, secmeli: false, kontenjan: 30 },
  { dersKodu: 'BLM309', dersAdi: 'Bilgisayar Ağları', kredi: 3, akts: 5, zorunlu: true, secmeli: false, kontenjan: 30 },
  // Elective with low quota to test kontenjan
  { dersKodu: 'BLM311', dersAdi: 'Web Programlama', kredi: 3, akts: 5, zorunlu: false, secmeli: true, kontenjan: 2 },
  ];

  const createdDersler = [];
  for (const dersData of dersler5Donem) {
    const ders = await prisma.ders.create({
      data: {
        ...dersData,
        bolumId: bilgisayarMuh.id,
        donemId: donemler[4].id, // 5. dönem
        zorunlu: dersData.zorunlu,
        secmeli: dersData.secmeli,
        kontenjan: dersData.kontenjan,
      },
    });
    createdDersler.push(ders);
  }

  // 1. Dönem Dersleri
  const dersler1Donem = [
    { dersKodu: 'BLM101', dersAdi: 'Programlamaya Giriş', kredi: 4, akts: 6, zorunlu: true, secmeli: false, kontenjan: 40 },
    { dersKodu: 'MAT101', dersAdi: 'Matematik I', kredi: 4, akts: 6, zorunlu: true, secmeli: false, kontenjan: 40 },
    { dersKodu: 'FIZ101', dersAdi: 'Fizik I', kredi: 4, akts: 5, zorunlu: true, secmeli: false, kontenjan: 40 },
    { dersKodu: 'KIM101', dersAdi: 'Genel Kimya', kredi: 3, akts: 4, zorunlu: true, secmeli: false, kontenjan: 40 },
    { dersKodu: 'YDL101', dersAdi: 'İngilizce I', kredi: 3, akts: 4, zorunlu: false, secmeli: true, kontenjan: 25 },
    { dersKodu: 'BLM103', dersAdi: 'Bilgisayar Mühendisliğine Giriş', kredi: 2, akts: 3, zorunlu: true, secmeli: false, kontenjan: 40 },
  ];

  const createdDersler1 = [];
  for (const dersData of dersler1Donem) {
    const ders = await prisma.ders.create({
      data: {
        ...dersData,
        bolumId: bilgisayarMuh.id,
        donemId: donemler[0].id,
        zorunlu: dersData.zorunlu,
        secmeli: dersData.secmeli,
        kontenjan: dersData.kontenjan,
      },
    });
    createdDersler1.push(ders);
  }

  // 6. Dönem üstten ders (seçmeli) - üstten alma kuralı testi
  const usttenDers = await prisma.ders.create({
    data: {
      dersKodu: 'BLM401',
      dersAdi: 'Makine Öğrenmesi',
      kredi: 4,
      akts: 6,
      bolumId: bilgisayarMuh.id,
      donemId: donemler[5].id, // 6. dönem
      zorunlu: false,
      secmeli: true,
      kontenjan: 20,
    },
  });

  console.log('✅ Dersler oluşturuldu');

  // Öğretmen-Ders İlişkileri
  await prisma.ogretmenDers.create({
    data: { ogretmenId: ogretmen1.id, dersId: createdDersler[0].id },
  });
  await prisma.ogretmenDers.create({
    data: { ogretmenId: ogretmen1.id, dersId: createdDersler[1].id },
  });
  await prisma.ogretmenDers.create({
    data: { ogretmenId: ogretmen2.id, dersId: createdDersler[2].id },
  });
  await prisma.ogretmenDers.create({
    data: { ogretmenId: ogretmen2.id, dersId: createdDersler[3].id },
  });
  await prisma.ogretmenDers.create({
    data: { ogretmenId: ogretmen3.id, dersId: createdDersler[4].id },
  });
  await prisma.ogretmenDers.create({
    data: { ogretmenId: ogretmen3.id, dersId: createdDersler[5].id },
  });

  console.log('✅ Öğretmen-Ders ilişkileri oluşturuldu');

  // Öğrenci-Ders Kayıtları
  const ogrencilerList = [ogrenci1, ogrenci2, ogrenci3, ogrenci4];
  for (const [idx, ogrenci] of ogrencilerList.entries()) {
    for (const ders of createdDersler) {
      if (ders.dersKodu === 'BLM311' && idx > 1) continue; // kontenjan 2: sadece ilk iki öğrenci
      await prisma.ogrenciDers.create({
        data: {
          ogrenciId: ogrenci.id,
          dersId: ders.id,
          durum: 'Devam Ediyor',
        },
      });
    }
  }

  console.log('✅ Öğrenci-Ders kayıtları oluşturuldu');

  // 1. dönemden FF almış kayıt (alttan ders) - ogrenci2
  await prisma.ogrenciDers.create({
    data: {
      ogrenciId: ogrenci2.id,
      dersId: createdDersler1[0].id, // BLM101
      harfNotu: 'FF',
      durum: 'Kaldı',
    },
  });

  // Üstten ders kaydı (usta ders) sadece yüksek agno'lu ogrenci3 için
  await prisma.ogrenciDers.create({
    data: {
      ogrenciId: ogrenci3.id,
      dersId: usttenDers.id,
      durum: 'Devam Ediyor',
    },
  });

  // Ders Programı
  const gunler = [1, 2, 3, 4, 5]; // Pazartesi - Cuma
  const saatler = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00'];

  let saat = 0;
  for (let i = 0; i < createdDersler.length; i++) {
    await prisma.dersProgrami.create({
      data: {
        dersId: createdDersler[i].id,
        ogretmenId: i < 2 ? ogretmen1.id : i < 4 ? ogretmen2.id : ogretmen3.id,
        sinifId: siniflar[i % siniflar.length].id,
        gun: gunler[i % 5],
        baslangic: saatler[i],
        bitis: saatler[i].replace(':00', ':50'),
      },
    });
  }

  console.log('✅ Ders programı oluşturuldu');

  // Yoklama Kayıtları
  const tarihler = [
    new Date('2024-12-01'),
    new Date('2024-12-08'),
    new Date('2024-12-15'),
    new Date('2024-12-22'),
  ];

  for (const ogrenci of [ogrenci1, ogrenci2, ogrenci3]) {
    for (const ders of createdDersler.slice(0, 3)) {
      for (const tarih of tarihler) {
        await prisma.yoklama.create({
          data: {
            ogrenciId: ogrenci.id,
            dersId: ders.id,
            tarih,
            durum: Math.random() > 0.2 ? 'Var' : 'Yok',
          },
        });
      }
    }
  }

  console.log('✅ Yoklama kayıtları oluşturuldu');

  // Sınavlar
  for (const ders of createdDersler) {
    await prisma.sinav.create({
      data: {
        sinavAdi: `${ders.dersAdi} - Vize`,
        dersId: ders.id,
        sinavTarihi: new Date('2024-11-15'),
        sinavTuru: 'Vize',
        sure: 60,
      },
    });
    await prisma.sinav.create({
      data: {
        sinavAdi: `${ders.dersAdi} - Final`,
        dersId: ders.id,
        sinavTarihi: new Date('2025-01-15'),
        sinavTuru: 'Final',
        sure: 90,
      },
    });
  }

  console.log('✅ Sınavlar oluşturuldu');

  // Notlar (Vize notları)
  const sinavlar = await prisma.sinav.findMany({ where: { sinavTuru: 'Vize' } });
  for (const ogrenci of [ogrenci1, ogrenci2, ogrenci3, ogrenci4]) {
    for (const sinav of sinavlar) {
      await prisma.not.create({
        data: {
          ogrenciId: ogrenci.id,
          sinavId: sinav.id,
          puan: Math.floor(Math.random() * 40) + 50, // 50-90 arası
        },
      });
    }
  }

  console.log('✅ Notlar oluşturuldu');

  // Duyurular
  const duyurular = [
    {
      baslik: 'Bahar Dönemi Ders Kayıtları',
      icerik: '2024-2025 Bahar dönemi ders kayıtları 20 Ocak - 25 Ocak tarihleri arasında yapılacaktır. Öğrencilerimizin danışman onaylarını almayı unutmamaları rica olunur.',
      onemliMi: true,
    },
    {
      baslik: 'Final Sınavları Programı',
      icerik: 'Final sınavları programı yayınlanmıştır. Öğrenci Bilgi Sisteminden detaylı bilgi alabilirsiniz.',
      onemliMi: true,
    },
    {
      baslik: 'Online Yabancı Dil Kursları',
      icerik: 'Üniversitemiz Dil Eğitimi Merkezi tarafından düzenlenecek olan YDS/YÖKDİL, IELTS hazırlık kursları başvuruları başlamıştır.',
      onemliMi: false,
    },
    {
      baslik: 'Kariyer Günleri Etkinliği',
      icerik: 'Bilgisayar Mühendisliği Bölümü Kariyer Günleri 15-16 Ocak tarihlerinde gerçekleştirilecektir. Sektörden önemli firmalar katılacaktır.',
      onemliMi: false,
    },
  ];

  for (const duyuru of duyurular) {
    await prisma.duyuru.create({ data: duyuru });
  }

  console.log('✅ Duyurular oluşturuldu');

  // Mesajlar
  await prisma.mesaj.create({
    data: {
      gonderenOgretmenId: ogretmen1.id,
      aliciOgrenciId: ogrenci1.id,
      konu: 'Proje Ödevi Hakkında',
      mesajMetni: 'Merhaba, Veri Tabanı Yönetim Sistemleri proje ödevi son teslim tarihi 7 Ocak olarak belirlenmiştir. Başarılar dilerim.',
    },
  });

  await prisma.mesaj.create({
    data: {
      gonderenOgretmenId: ogretmen2.id,
      aliciOgrenciId: ogrenci1.id,
      konu: 'Ders Notu Hakkında',
      mesajMetni: 'İşletim Sistemleri dersi vize notlarınız sisteme girilmiştir. Başarılarınızın devamını dilerim.',
    },
  });

  await prisma.mesaj.create({
    data: {
      gonderenOgrenciId: ogrenci1.id,
      aliciOgretmenId: ogretmen1.id,
      konu: 'Proje Sorusu',
      mesajMetni: 'Hocam, proje ödevinde kullanacağımız veritabanı türü ile ilgili bir sorum olacaktı. Görüşme talep edebilir miyim?',
    },
  });

  console.log('✅ Mesajlar oluşturuldu');

  // Kulüpler
  const bilisimKulubu = await prisma.kulup.create({
    data: {
      kulupAdi: 'Bilişim Kulübü',
      aciklama: 'Yazılım geliştirme, siber güvenlik ve teknoloji alanlarında etkinlikler düzenler.',
    },
  });

  const robotikKulubu = await prisma.kulup.create({
    data: {
      kulupAdi: 'Robotik Kulübü',
      aciklama: 'Robot tasarımı ve yapay zeka projeleri üzerine çalışmalar yapar.',
    },
  });

  console.log('✅ Kulüpler oluşturuldu');

  // Kulüp Üyelikleri
  await prisma.kulupUyelik.create({
    data: {
      ogrenciId: ogrenci1.id,
      kulupId: bilisimKulubu.id,
      pozisyon: 'Başkan',
    },
  });

  await prisma.kulupUyelik.create({
    data: {
      ogrenciId: ogrenci2.id,
      kulupId: bilisimKulubu.id,
      pozisyon: 'Üye',
    },
  });

  await prisma.kulupUyelik.create({
    data: {
      ogrenciId: ogrenci3.id,
      kulupId: robotikKulubu.id,
      pozisyon: 'Başkan Yardımcısı',
    },
  });

  console.log('✅ Kulüp üyelikleri oluşturuldu');

  console.log('🎉 Database seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
