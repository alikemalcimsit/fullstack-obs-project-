BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[fakulteler] (
    [id] INT NOT NULL IDENTITY(1,1),
    [fakulteAdi] VARCHAR(100) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [fakulteler_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [fakulteler_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[bolumler] (
    [id] INT NOT NULL IDENTITY(1,1),
    [bolumAdi] VARCHAR(100) NOT NULL,
    [fakulteId] INT NOT NULL,
    [donemSayisi] INT NOT NULL CONSTRAINT [bolumler_donemSayisi_df] DEFAULT 8,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [bolumler_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [bolumler_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[donemler] (
    [id] INT NOT NULL IDENTITY(1,1),
    [donemAdi] VARCHAR(50) NOT NULL,
    [yil] VARCHAR(20),
    [aktif] BIT NOT NULL CONSTRAINT [donemler_aktif_df] DEFAULT 0,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [donemler_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [donemler_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[siniflar] (
    [id] INT NOT NULL IDENTITY(1,1),
    [sinifAdi] VARCHAR(50) NOT NULL,
    [kapasite] INT NOT NULL CONSTRAINT [siniflar_kapasite_df] DEFAULT 30,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [siniflar_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [siniflar_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[ogrenciler] (
    [id] INT NOT NULL IDENTITY(1,1),
    [tcNo] VARCHAR(11) NOT NULL,
    [ogrNo] VARCHAR(20) NOT NULL,
    [isim] VARCHAR(50) NOT NULL,
    [soyad] VARCHAR(50) NOT NULL,
    [email] VARCHAR(100) NOT NULL,
    [sifre] VARCHAR(255) NOT NULL,
    [telNo] VARCHAR(20),
    [adres] TEXT,
    [dogumTarihi] DATETIME2,
    [cinsiyet] VARCHAR(10),
    [fotograf] TEXT,
    [statu] VARCHAR(50) NOT NULL CONSTRAINT [ogrenciler_statu_df] DEFAULT 'Aktif',
    [geldigiOkul] VARCHAR(100),
    [kayitTarihi] DATETIME2 NOT NULL CONSTRAINT [ogrenciler_kayitTarihi_df] DEFAULT CURRENT_TIMESTAMP,
    [mezuniyetTarihi] DATETIME2,
    [agno] FLOAT(53) NOT NULL CONSTRAINT [ogrenciler_agno_df] DEFAULT 0.00,
    [sube] VARCHAR(5),
    [okuduguDonem] INT NOT NULL CONSTRAINT [ogrenciler_okuduguDonem_df] DEFAULT 1,
    [akademikYil] VARCHAR(20),
    [gelisSekli] VARCHAR(20),
    [gelisPuani] FLOAT(53),
    [bolumId] INT NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [ogrenciler_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [ogrenciler_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [ogrenciler_tcNo_key] UNIQUE NONCLUSTERED ([tcNo]),
    CONSTRAINT [ogrenciler_ogrNo_key] UNIQUE NONCLUSTERED ([ogrNo]),
    CONSTRAINT [ogrenciler_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[ogretmenler] (
    [id] INT NOT NULL IDENTITY(1,1),
    [tcNo] VARCHAR(11) NOT NULL,
    [isim] VARCHAR(50) NOT NULL,
    [soyad] VARCHAR(50) NOT NULL,
    [email] VARCHAR(100) NOT NULL,
    [sifre] VARCHAR(255) NOT NULL,
    [telNo] VARCHAR(20),
    [unvan] VARCHAR(50),
    [bolumId] INT NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [ogretmenler_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [ogretmenler_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [ogretmenler_tcNo_key] UNIQUE NONCLUSTERED ([tcNo]),
    CONSTRAINT [ogretmenler_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[adminler] (
    [id] INT NOT NULL IDENTITY(1,1),
    [tcNo] VARCHAR(11) NOT NULL,
    [isim] VARCHAR(50) NOT NULL,
    [soyad] VARCHAR(50) NOT NULL,
    [email] VARCHAR(100) NOT NULL,
    [sifre] VARCHAR(255) NOT NULL,
    [telNo] VARCHAR(20),
    [rol] VARCHAR(20) NOT NULL CONSTRAINT [adminler_rol_df] DEFAULT 'admin',
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [adminler_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [adminler_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [adminler_tcNo_key] UNIQUE NONCLUSTERED ([tcNo]),
    CONSTRAINT [adminler_email_key] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[dersler] (
    [id] INT NOT NULL IDENTITY(1,1),
    [dersKodu] VARCHAR(20) NOT NULL,
    [dersAdi] VARCHAR(100) NOT NULL,
    [kredi] INT NOT NULL CONSTRAINT [dersler_kredi_df] DEFAULT 3,
    [akts] INT NOT NULL CONSTRAINT [dersler_akts_df] DEFAULT 5,
    [bolumId] INT NOT NULL,
    [donemId] INT NOT NULL,
    [zorunlu] BIT NOT NULL CONSTRAINT [dersler_zorunlu_df] DEFAULT 1,
    [secmeli] BIT NOT NULL CONSTRAINT [dersler_secmeli_df] DEFAULT 0,
    [kontenjan] INT NOT NULL CONSTRAINT [dersler_kontenjan_df] DEFAULT 40,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [dersler_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [dersler_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [dersler_dersKodu_key] UNIQUE NONCLUSTERED ([dersKodu])
);

-- CreateTable
CREATE TABLE [dbo].[ogrenci_ders] (
    [id] INT NOT NULL IDENTITY(1,1),
    [ogrenciId] INT NOT NULL,
    [dersId] INT NOT NULL,
    [harfNotu] VARCHAR(5),
    [donemNotu] FLOAT(53),
    [vize] FLOAT(53),
    [final] FLOAT(53),
    [butunleme] FLOAT(53),
    [devamsizlik] INT NOT NULL CONSTRAINT [ogrenci_ders_devamsizlik_df] DEFAULT 0,
    [durum] VARCHAR(30) NOT NULL CONSTRAINT [ogrenci_ders_durum_df] DEFAULT 'Devam Ediyor',
    [kayitTarihi] DATETIME2 NOT NULL CONSTRAINT [ogrenci_ders_kayitTarihi_df] DEFAULT CURRENT_TIMESTAMP,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [ogrenci_ders_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [ogrenci_ders_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [ogrenci_ders_ogrenciId_dersId_key] UNIQUE NONCLUSTERED ([ogrenciId],[dersId])
);

-- CreateTable
CREATE TABLE [dbo].[ogretmen_ders] (
    [id] INT NOT NULL IDENTITY(1,1),
    [ogretmenId] INT NOT NULL,
    [dersId] INT NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [ogretmen_ders_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [ogretmen_ders_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [ogretmen_ders_ogretmenId_dersId_key] UNIQUE NONCLUSTERED ([ogretmenId],[dersId])
);

-- CreateTable
CREATE TABLE [dbo].[ders_secimleri] (
    [id] INT NOT NULL IDENTITY(1,1),
    [ogrenciId] INT NOT NULL,
    [dersId] INT NOT NULL,
    [ogretmenId] INT,
    [onayDurumu] VARCHAR(20) NOT NULL CONSTRAINT [ders_secimleri_onayDurumu_df] DEFAULT 'Beklemede',
    [secimTarihi] DATETIME2 NOT NULL CONSTRAINT [ders_secimleri_secimTarihi_df] DEFAULT CURRENT_TIMESTAMP,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [ders_secimleri_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [ders_secimleri_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[ders_programlari] (
    [id] INT NOT NULL IDENTITY(1,1),
    [dersId] INT NOT NULL,
    [ogretmenId] INT NOT NULL,
    [sinifId] INT NOT NULL,
    [gun] INT NOT NULL,
    [baslangic] VARCHAR(5) NOT NULL,
    [bitis] VARCHAR(5) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [ders_programlari_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [ders_programlari_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[sinavlar] (
    [id] INT NOT NULL IDENTITY(1,1),
    [sinavAdi] VARCHAR(100) NOT NULL,
    [dersId] INT NOT NULL,
    [sinavTarihi] DATETIME2 NOT NULL,
    [sinavTuru] VARCHAR(30) NOT NULL,
    [sure] INT,
    [agirlik] FLOAT(53) NOT NULL CONSTRAINT [sinavlar_agirlik_df] DEFAULT 0.4,
    [notlarAcikMi] BIT NOT NULL CONSTRAINT [sinavlar_notlarAcikMi_df] DEFAULT 0,
    [harfNotuAcikMi] BIT NOT NULL CONSTRAINT [sinavlar_harfNotuAcikMi_df] DEFAULT 0,
    [ortalama] FLOAT(53),
    [standartSapma] FLOAT(53),
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [sinavlar_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [sinavlar_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[notlar] (
    [id] INT NOT NULL IDENTITY(1,1),
    [ogrenciId] INT NOT NULL,
    [sinavId] INT NOT NULL,
    [puan] FLOAT(53) NOT NULL,
    [tSkoru] FLOAT(53),
    [harfNotu] VARCHAR(5),
    [aciklama] VARCHAR(255),
    [geriCekildiMi] BIT NOT NULL CONSTRAINT [notlar_geriCekildiMi_df] DEFAULT 0,
    [geriCekmeTarihi] DATETIME2,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [notlar_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [notlar_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [notlar_ogrenciId_sinavId_key] UNIQUE NONCLUSTERED ([ogrenciId],[sinavId])
);

-- CreateTable
CREATE TABLE [dbo].[yoklamalar] (
    [id] INT NOT NULL IDENTITY(1,1),
    [ogrenciId] INT NOT NULL,
    [dersId] INT NOT NULL,
    [tarih] DATETIME2 NOT NULL,
    [durum] VARCHAR(10) NOT NULL,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [yoklamalar_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [yoklamalar_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[mesajlar] (
    [id] INT NOT NULL IDENTITY(1,1),
    [gonderenOgrenciId] INT,
    [gonderenOgretmenId] INT,
    [aliciOgrenciId] INT,
    [aliciOgretmenId] INT,
    [konu] VARCHAR(200),
    [mesajMetni] TEXT NOT NULL,
    [okundu] BIT NOT NULL CONSTRAINT [mesajlar_okundu_df] DEFAULT 0,
    [tarih] DATETIME2 NOT NULL CONSTRAINT [mesajlar_tarih_df] DEFAULT CURRENT_TIMESTAMP,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [mesajlar_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [mesajlar_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[duyurular] (
    [id] INT NOT NULL IDENTITY(1,1),
    [baslik] VARCHAR(255) NOT NULL,
    [icerik] TEXT NOT NULL,
    [ogretmenId] INT,
    [onemliMi] BIT NOT NULL CONSTRAINT [duyurular_onemliMi_df] DEFAULT 0,
    [aktif] BIT NOT NULL CONSTRAINT [duyurular_aktif_df] DEFAULT 1,
    [yayinTarihi] DATETIME2 NOT NULL CONSTRAINT [duyurular_yayinTarihi_df] DEFAULT CURRENT_TIMESTAMP,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [duyurular_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [duyurular_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[kulupler] (
    [id] INT NOT NULL IDENTITY(1,1),
    [kulupAdi] VARCHAR(100) NOT NULL,
    [aciklama] TEXT,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [kulupler_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [kulupler_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- CreateTable
CREATE TABLE [dbo].[kulup_uyelikleri] (
    [id] INT NOT NULL IDENTITY(1,1),
    [ogrenciId] INT NOT NULL,
    [kulupId] INT NOT NULL,
    [pozisyon] VARCHAR(50),
    [katilimTarihi] DATETIME2 NOT NULL CONSTRAINT [kulup_uyelikleri_katilimTarihi_df] DEFAULT CURRENT_TIMESTAMP,
    [createdAt] DATETIME2 NOT NULL CONSTRAINT [kulup_uyelikleri_createdAt_df] DEFAULT CURRENT_TIMESTAMP,
    [updatedAt] DATETIME2 NOT NULL,
    CONSTRAINT [kulup_uyelikleri_pkey] PRIMARY KEY CLUSTERED ([id]),
    CONSTRAINT [kulup_uyelikleri_ogrenciId_kulupId_key] UNIQUE NONCLUSTERED ([ogrenciId],[kulupId])
);

-- AddForeignKey
ALTER TABLE [dbo].[bolumler] ADD CONSTRAINT [bolumler_fakulteId_fkey] FOREIGN KEY ([fakulteId]) REFERENCES [dbo].[fakulteler]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ogrenciler] ADD CONSTRAINT [ogrenciler_bolumId_fkey] FOREIGN KEY ([bolumId]) REFERENCES [dbo].[bolumler]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ogretmenler] ADD CONSTRAINT [ogretmenler_bolumId_fkey] FOREIGN KEY ([bolumId]) REFERENCES [dbo].[bolumler]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[dersler] ADD CONSTRAINT [dersler_bolumId_fkey] FOREIGN KEY ([bolumId]) REFERENCES [dbo].[bolumler]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[dersler] ADD CONSTRAINT [dersler_donemId_fkey] FOREIGN KEY ([donemId]) REFERENCES [dbo].[donemler]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ogrenci_ders] ADD CONSTRAINT [ogrenci_ders_ogrenciId_fkey] FOREIGN KEY ([ogrenciId]) REFERENCES [dbo].[ogrenciler]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ogrenci_ders] ADD CONSTRAINT [ogrenci_ders_dersId_fkey] FOREIGN KEY ([dersId]) REFERENCES [dbo].[dersler]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ogretmen_ders] ADD CONSTRAINT [ogretmen_ders_ogretmenId_fkey] FOREIGN KEY ([ogretmenId]) REFERENCES [dbo].[ogretmenler]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ogretmen_ders] ADD CONSTRAINT [ogretmen_ders_dersId_fkey] FOREIGN KEY ([dersId]) REFERENCES [dbo].[dersler]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ders_secimleri] ADD CONSTRAINT [ders_secimleri_ogrenciId_fkey] FOREIGN KEY ([ogrenciId]) REFERENCES [dbo].[ogrenciler]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ders_secimleri] ADD CONSTRAINT [ders_secimleri_dersId_fkey] FOREIGN KEY ([dersId]) REFERENCES [dbo].[dersler]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ders_secimleri] ADD CONSTRAINT [ders_secimleri_ogretmenId_fkey] FOREIGN KEY ([ogretmenId]) REFERENCES [dbo].[ogretmenler]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ders_programlari] ADD CONSTRAINT [ders_programlari_dersId_fkey] FOREIGN KEY ([dersId]) REFERENCES [dbo].[dersler]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ders_programlari] ADD CONSTRAINT [ders_programlari_ogretmenId_fkey] FOREIGN KEY ([ogretmenId]) REFERENCES [dbo].[ogretmenler]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[ders_programlari] ADD CONSTRAINT [ders_programlari_sinifId_fkey] FOREIGN KEY ([sinifId]) REFERENCES [dbo].[siniflar]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[sinavlar] ADD CONSTRAINT [sinavlar_dersId_fkey] FOREIGN KEY ([dersId]) REFERENCES [dbo].[dersler]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[notlar] ADD CONSTRAINT [notlar_ogrenciId_fkey] FOREIGN KEY ([ogrenciId]) REFERENCES [dbo].[ogrenciler]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[notlar] ADD CONSTRAINT [notlar_sinavId_fkey] FOREIGN KEY ([sinavId]) REFERENCES [dbo].[sinavlar]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[yoklamalar] ADD CONSTRAINT [yoklamalar_ogrenciId_fkey] FOREIGN KEY ([ogrenciId]) REFERENCES [dbo].[ogrenciler]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[yoklamalar] ADD CONSTRAINT [yoklamalar_dersId_fkey] FOREIGN KEY ([dersId]) REFERENCES [dbo].[dersler]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[mesajlar] ADD CONSTRAINT [mesajlar_gonderenOgrenciId_fkey] FOREIGN KEY ([gonderenOgrenciId]) REFERENCES [dbo].[ogrenciler]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[mesajlar] ADD CONSTRAINT [mesajlar_gonderenOgretmenId_fkey] FOREIGN KEY ([gonderenOgretmenId]) REFERENCES [dbo].[ogretmenler]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[mesajlar] ADD CONSTRAINT [mesajlar_aliciOgrenciId_fkey] FOREIGN KEY ([aliciOgrenciId]) REFERENCES [dbo].[ogrenciler]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[mesajlar] ADD CONSTRAINT [mesajlar_aliciOgretmenId_fkey] FOREIGN KEY ([aliciOgretmenId]) REFERENCES [dbo].[ogretmenler]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[duyurular] ADD CONSTRAINT [duyurular_ogretmenId_fkey] FOREIGN KEY ([ogretmenId]) REFERENCES [dbo].[ogretmenler]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[kulup_uyelikleri] ADD CONSTRAINT [kulup_uyelikleri_ogrenciId_fkey] FOREIGN KEY ([ogrenciId]) REFERENCES [dbo].[ogrenciler]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[kulup_uyelikleri] ADD CONSTRAINT [kulup_uyelikleri_kulupId_fkey] FOREIGN KEY ([kulupId]) REFERENCES [dbo].[kulupler]([id]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
