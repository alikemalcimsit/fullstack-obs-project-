USE [master]
GO
/****** Object:  Database [obs]    Script Date: 7.01.2024 04:39:40 ******/
CREATE DATABASE [obs]
 CONTAINMENT = NONE
 ON  PRIMARY 
( NAME = N'obs', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL16.SQLEXPRESS\MSSQL\DATA\obs.mdf' , SIZE = 8192KB , MAXSIZE = UNLIMITED, FILEGROWTH = 65536KB )
 LOG ON 
( NAME = N'obs_log', FILENAME = N'C:\Program Files\Microsoft SQL Server\MSSQL16.SQLEXPRESS\MSSQL\DATA\obs_log.ldf' , SIZE = 8192KB , MAXSIZE = 2048GB , FILEGROWTH = 65536KB )
 WITH CATALOG_COLLATION = DATABASE_DEFAULT, LEDGER = OFF
GO
ALTER DATABASE [obs] SET COMPATIBILITY_LEVEL = 160
GO
IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
begin
EXEC [obs].[dbo].[sp_fulltext_database] @action = 'enable'
end
GO
ALTER DATABASE [obs] SET ANSI_NULL_DEFAULT OFF 
GO
ALTER DATABASE [obs] SET ANSI_NULLS OFF 
GO
ALTER DATABASE [obs] SET ANSI_PADDING OFF 
GO
ALTER DATABASE [obs] SET ANSI_WARNINGS OFF 
GO
ALTER DATABASE [obs] SET ARITHABORT OFF 
GO
ALTER DATABASE [obs] SET AUTO_CLOSE ON 
GO
ALTER DATABASE [obs] SET AUTO_SHRINK OFF 
GO
ALTER DATABASE [obs] SET AUTO_UPDATE_STATISTICS ON 
GO
ALTER DATABASE [obs] SET CURSOR_CLOSE_ON_COMMIT OFF 
GO
ALTER DATABASE [obs] SET CURSOR_DEFAULT  GLOBAL 
GO
ALTER DATABASE [obs] SET CONCAT_NULL_YIELDS_NULL OFF 
GO
ALTER DATABASE [obs] SET NUMERIC_ROUNDABORT OFF 
GO
ALTER DATABASE [obs] SET QUOTED_IDENTIFIER OFF 
GO
ALTER DATABASE [obs] SET RECURSIVE_TRIGGERS OFF 
GO
ALTER DATABASE [obs] SET  ENABLE_BROKER 
GO
ALTER DATABASE [obs] SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
GO
ALTER DATABASE [obs] SET DATE_CORRELATION_OPTIMIZATION OFF 
GO
ALTER DATABASE [obs] SET TRUSTWORTHY OFF 
GO
ALTER DATABASE [obs] SET ALLOW_SNAPSHOT_ISOLATION OFF 
GO
ALTER DATABASE [obs] SET PARAMETERIZATION SIMPLE 
GO
ALTER DATABASE [obs] SET READ_COMMITTED_SNAPSHOT OFF 
GO
ALTER DATABASE [obs] SET HONOR_BROKER_PRIORITY OFF 
GO
ALTER DATABASE [obs] SET RECOVERY SIMPLE 
GO
ALTER DATABASE [obs] SET  MULTI_USER 
GO
ALTER DATABASE [obs] SET PAGE_VERIFY CHECKSUM  
GO
ALTER DATABASE [obs] SET DB_CHAINING OFF 
GO
ALTER DATABASE [obs] SET FILESTREAM( NON_TRANSACTED_ACCESS = OFF ) 
GO
ALTER DATABASE [obs] SET TARGET_RECOVERY_TIME = 60 SECONDS 
GO
ALTER DATABASE [obs] SET DELAYED_DURABILITY = DISABLED 
GO
ALTER DATABASE [obs] SET ACCELERATED_DATABASE_RECOVERY = OFF  
GO
ALTER DATABASE [obs] SET QUERY_STORE = ON
GO
ALTER DATABASE [obs] SET QUERY_STORE (OPERATION_MODE = READ_WRITE, CLEANUP_POLICY = (STALE_QUERY_THRESHOLD_DAYS = 30), DATA_FLUSH_INTERVAL_SECONDS = 900, INTERVAL_LENGTH_MINUTES = 60, MAX_STORAGE_SIZE_MB = 1000, QUERY_CAPTURE_MODE = AUTO, SIZE_BASED_CLEANUP_MODE = AUTO, MAX_PLANS_PER_QUERY = 200, WAIT_STATS_CAPTURE_MODE = ON)
GO
USE [obs]
GO
/****** Object:  User [ali]    Script Date: 7.01.2024 04:39:40 ******/
CREATE USER [ali] FOR LOGIN [ali] WITH DEFAULT_SCHEMA=[dbo]
GO
/****** Object:  UserDefinedFunction [dbo].[BolumdekiOgrenciSayisi]    Script Date: 7.01.2024 04:39:40 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[BolumdekiOgrenciSayisi](@BolumID INT)
RETURNS INT
AS
BEGIN
    DECLARE @OgrenciSayisi INT;

    SELECT @OgrenciSayisi = COUNT(*)
    FROM ogrenci
    WHERE BolumID = @BolumID;

    RETURN @OgrenciSayisi;
END;
GO
/****** Object:  UserDefinedFunction [dbo].[DonemdekiDersSayisi]    Script Date: 7.01.2024 04:39:40 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[DonemdekiDersSayisi](@DonemID int)
RETURNS INT
AS
BEGIN
    DECLARE @DersSayisi INT;

    SELECT @DersSayisi = COUNT(*)
    FROM dersler
    WHERE DonemID = @DonemID;

    RETURN @DersSayisi;
END;
GO
/****** Object:  UserDefinedFunction [dbo].[OrtalamaAGNOBolum]    Script Date: 7.01.2024 04:39:40 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE FUNCTION [dbo].[OrtalamaAGNOBolum](@BolumID INT)
RETURNS DECIMAL(5, 2)
AS
BEGIN
    DECLARE @OrtalamaAGNO DECIMAL(5, 2);

    SELECT @OrtalamaAGNO = AVG(agno)
    FROM ogrenci
    WHERE BolumID = @BolumID;

    RETURN @OrtalamaAGNO;
END;
GO
/****** Object:  Table [dbo].[ogrenci]    Script Date: 7.01.2024 04:39:40 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ogrenci](
	[tcNo] [nvarchar](11) NOT NULL,
	[isim] [nvarchar](10) NOT NULL,
	[soyad] [nvarchar](10) NOT NULL,
	[ogrNo] [nvarchar](10) NOT NULL,
	[telNo] [nvarchar](13) NOT NULL,
	[adress] [nvarchar](255) NULL,
	[email] [nvarchar](255) NOT NULL,
	[statu] [nvarchar](50) NOT NULL,
	[geldigiOkul] [nvarchar](100) NOT NULL,
	[kayitTarihi] [datetime] NOT NULL,
	[mezuniyetTarihi] [datetime] NULL,
	[agno] [float] NOT NULL,
	[sube] [char](1) NULL,
	[okuduguDonem] [varchar](10) NULL,
	[akademikDonem] [varchar](10) NULL,
	[gelisSekli] [varchar](5) NULL,
	[gelisPuani] [varchar](5) NULL,
	[BolumID] [int] NULL,
	[sifre] [nvarchar](50) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[tcNo] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  View [dbo].[BolumdekiOgrenciler]    Script Date: 7.01.2024 04:39:40 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
-- View Oluşturma
CREATE VIEW [dbo].[BolumdekiOgrenciler] AS
SELECT tcNo, isim, soyad, BolumID
FROM ogrenci
WHERE BolumID = 1; -- Örnek olarak BolumID = 1 için filtreleme


GO
/****** Object:  Table [dbo].[Bolumler]    Script Date: 7.01.2024 04:39:40 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Bolumler](
	[BolumID] [int] NOT NULL,
	[BolumAdi] [nvarchar](50) NOT NULL,
	[FakulteID] [int] NULL,
	[DönemSayisi] [int] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[BolumID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Dersler]    Script Date: 7.01.2024 04:39:40 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Dersler](
	[DersID] [int] NOT NULL,
	[DersAdi] [nvarchar](50) NOT NULL,
	[BolumID] [int] NULL,
	[DonemID] [int] NULL,
	[kredi] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[DersID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[DersProgrami]    Script Date: 7.01.2024 04:39:40 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[DersProgrami](
	[DersProgramiID] [int] NOT NULL,
	[DersID] [int] NULL,
	[OgretmenID] [nvarchar](11) NULL,
	[SinifID] [int] NULL,
	[Gun] [int] NULL,
	[Saat] [time](7) NULL,
PRIMARY KEY CLUSTERED 
(
	[DersProgramiID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[DersSecim]    Script Date: 7.01.2024 04:39:40 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[DersSecim](
	[SecimID] [int] NOT NULL,
	[OgrenciID] [nvarchar](11) NULL,
	[DersID] [int] NULL,
	[OgretmenID] [nvarchar](11) NULL,
	[OnayDurumu] [nvarchar](10) NULL,
PRIMARY KEY CLUSTERED 
(
	[SecimID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Donemler]    Script Date: 7.01.2024 04:39:40 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Donemler](
	[DonemID] [int] NOT NULL,
	[DonemAdi] [nvarchar](50) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[DonemID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[duyurular]    Script Date: 7.01.2024 04:39:40 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[duyurular](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[Duyuru_basligi] [nvarchar](255) NOT NULL,
	[Duyuru_aciklamasi] [nvarchar](max) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Fakulte]    Script Date: 7.01.2024 04:39:40 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Fakulte](
	[FakulteID] [int] NOT NULL,
	[FakulteAdi] [nvarchar](50) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[FakulteID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Klupler]    Script Date: 7.01.2024 04:39:40 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Klupler](
	[KulupID] [int] NOT NULL,
	[KulupAdi] [nvarchar](50) NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[KulupID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Mesajlar]    Script Date: 7.01.2024 04:39:40 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Mesajlar](
	[MesajID] [int] IDENTITY(1,1) NOT NULL,
	[GonderenOgrenciID] [nvarchar](11) NULL,
	[GonderenOgretmenID] [nvarchar](11) NULL,
	[AliciOgrenciID] [nvarchar](11) NULL,
	[AliciOgretmenID] [nvarchar](11) NULL,
	[MesajMetni] [nvarchar](255) NULL,
	[Tarih] [datetime] NULL,
PRIMARY KEY CLUSTERED 
(
	[MesajID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Notlar]    Script Date: 7.01.2024 04:39:40 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Notlar](
	[OgrenciID] [nvarchar](11) NOT NULL,
	[SinavID] [int] NOT NULL,
	[Puan] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[OgrenciID] ASC,
	[SinavID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[OgrenciDers]    Script Date: 7.01.2024 04:39:40 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[OgrenciDers](
	[OgrenciID] [nvarchar](11) NOT NULL,
	[DersID] [int] NOT NULL,
	[HarfNotu] [nchar](2) NULL,
PRIMARY KEY CLUSTERED 
(
	[OgrenciID] ASC,
	[DersID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Ogretmen]    Script Date: 7.01.2024 04:39:40 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Ogretmen](
	[tcNo] [nvarchar](11) NOT NULL,
	[OgretmenID] [int] NULL,
	[OgretmenAdi] [nvarchar](50) NOT NULL,
	[BolumID] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[tcNo] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[OgretmenDers]    Script Date: 7.01.2024 04:39:40 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[OgretmenDers](
	[OgretmenID] [nvarchar](11) NOT NULL,
	[DersID] [int] NOT NULL,
PRIMARY KEY CLUSTERED 
(
	[OgretmenID] ASC,
	[DersID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Sinavlar]    Script Date: 7.01.2024 04:39:40 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Sinavlar](
	[SinavID] [int] NOT NULL,
	[SinavAdi] [nvarchar](50) NOT NULL,
	[SinavTarihi] [date] NULL,
PRIMARY KEY CLUSTERED 
(
	[SinavID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Siniflar]    Script Date: 7.01.2024 04:39:40 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Siniflar](
	[SinifID] [int] NOT NULL,
	[SinifAdi] [nvarchar](50) NULL,
PRIMARY KEY CLUSTERED 
(
	[SinifID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Uyelik]    Script Date: 7.01.2024 04:39:40 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Uyelik](
	[UyelikID] [int] NOT NULL,
	[OgrenciID] [nvarchar](11) NULL,
	[KulupID] [int] NULL,
PRIMARY KEY CLUSTERED 
(
	[UyelikID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
/****** Object:  Table [dbo].[Yoklama]    Script Date: 7.01.2024 04:39:40 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Yoklama](
	[YoklamaID] [int] NOT NULL,
	[OgrenciID] [nvarchar](10) NULL,
	[DersID] [int] NULL,
	[Tarih] [date] NULL,
	[Durum] [varchar](10) NULL,
PRIMARY KEY CLUSTERED 
(
	[YoklamaID] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
INSERT [dbo].[Bolumler] ([BolumID], [BolumAdi], [FakulteID], [DönemSayisi]) VALUES (1, N'Bilgisayar Mühendisliği', 1, 8)
INSERT [dbo].[Bolumler] ([BolumID], [BolumAdi], [FakulteID], [DönemSayisi]) VALUES (2, N'Hukuk Programı', 2, 8)
INSERT [dbo].[Bolumler] ([BolumID], [BolumAdi], [FakulteID], [DönemSayisi]) VALUES (3, N'Makine Mühendisliği', 1, 8)
GO
INSERT [dbo].[Dersler] ([DersID], [DersAdi], [BolumID], [DonemID], [kredi]) VALUES (1, N'Veri Tabanı Yönetim Sistemleri', 1, 5, 3)
INSERT [dbo].[Dersler] ([DersID], [DersAdi], [BolumID], [DonemID], [kredi]) VALUES (2, N'Yazılım Mühendisliğie Giriş', 1, 5, 3)
INSERT [dbo].[Dersler] ([DersID], [DersAdi], [BolumID], [DonemID], [kredi]) VALUES (3, N'İşletim Sistemleri', 1, 5, 3)
INSERT [dbo].[Dersler] ([DersID], [DersAdi], [BolumID], [DonemID], [kredi]) VALUES (4, N'Zeki Sistemlere Giriş', 1, 5, 3)
INSERT [dbo].[Dersler] ([DersID], [DersAdi], [BolumID], [DonemID], [kredi]) VALUES (5, N'Yabancı Dil 1', 1, 1, 3)
INSERT [dbo].[Dersler] ([DersID], [DersAdi], [BolumID], [DonemID], [kredi]) VALUES (6, N'Kimya', 1, 1, 3)
INSERT [dbo].[Dersler] ([DersID], [DersAdi], [BolumID], [DonemID], [kredi]) VALUES (7, N'Fizik 1', 1, 1, 3)
INSERT [dbo].[Dersler] ([DersID], [DersAdi], [BolumID], [DonemID], [kredi]) VALUES (8, N'Programlamaya Giriş', 1, 1, 3)
INSERT [dbo].[Dersler] ([DersID], [DersAdi], [BolumID], [DonemID], [kredi]) VALUES (9, N'Matematik 1', 1, 1, 3)
INSERT [dbo].[Dersler] ([DersID], [DersAdi], [BolumID], [DonemID], [kredi]) VALUES (10, N'Bilgisayar Mühendisliğine Giriş', 1, 1, 3)
INSERT [dbo].[Dersler] ([DersID], [DersAdi], [BolumID], [DonemID], [kredi]) VALUES (11, N'Bilişim Teknolojilerine Giriş', 1, 1, 3)
INSERT [dbo].[Dersler] ([DersID], [DersAdi], [BolumID], [DonemID], [kredi]) VALUES (12, N'Seçmeli Ders', 1, 1, 3)
INSERT [dbo].[Dersler] ([DersID], [DersAdi], [BolumID], [DonemID], [kredi]) VALUES (13, N'Yabancı Dil 2 ', 1, 2, 3)
INSERT [dbo].[Dersler] ([DersID], [DersAdi], [BolumID], [DonemID], [kredi]) VALUES (14, N'Fizik 2 ', 1, 2, 3)
INSERT [dbo].[Dersler] ([DersID], [DersAdi], [BolumID], [DonemID], [kredi]) VALUES (15, N'Lineer Cebir', 1, 2, 3)
INSERT [dbo].[Dersler] ([DersID], [DersAdi], [BolumID], [DonemID], [kredi]) VALUES (16, N'Ayrık Matematik', 1, 2, 3)
INSERT [dbo].[Dersler] ([DersID], [DersAdi], [BolumID], [DonemID], [kredi]) VALUES (17, N'Matematik 2', 1, 2, 3)
INSERT [dbo].[Dersler] ([DersID], [DersAdi], [BolumID], [DonemID], [kredi]) VALUES (18, N'Nesneye Yönelik Programlama', 1, 2, 3)
INSERT [dbo].[Dersler] ([DersID], [DersAdi], [BolumID], [DonemID], [kredi]) VALUES (19, N'Veri Yapıları Ve Algoritmalar', 1, 3, 3)
INSERT [dbo].[Dersler] ([DersID], [DersAdi], [BolumID], [DonemID], [kredi]) VALUES (20, N'Türk Dili 1', 1, 3, 3)
INSERT [dbo].[Dersler] ([DersID], [DersAdi], [BolumID], [DonemID], [kredi]) VALUES (21, N'Atatürk İlkeleri ve İnkılap Tarihi 1', 1, 3, 3)
INSERT [dbo].[Dersler] ([DersID], [DersAdi], [BolumID], [DonemID], [kredi]) VALUES (22, N'Diferansiyel Denklemler', 1, 3, 3)
INSERT [dbo].[Dersler] ([DersID], [DersAdi], [BolumID], [DonemID], [kredi]) VALUES (23, N'Görsel Programlama', 1, 3, 3)
INSERT [dbo].[Dersler] ([DersID], [DersAdi], [BolumID], [DonemID], [kredi]) VALUES (24, N'Programlama Dilleri', 1, 3, 3)
INSERT [dbo].[Dersler] ([DersID], [DersAdi], [BolumID], [DonemID], [kredi]) VALUES (25, N'Sayısal Tasarım', 1, 3, 3)
INSERT [dbo].[Dersler] ([DersID], [DersAdi], [BolumID], [DonemID], [kredi]) VALUES (26, N'Elektronik Devreler', 1, 4, 3)
INSERT [dbo].[Dersler] ([DersID], [DersAdi], [BolumID], [DonemID], [kredi]) VALUES (27, N'Web Programlama', 1, 4, 3)
INSERT [dbo].[Dersler] ([DersID], [DersAdi], [BolumID], [DonemID], [kredi]) VALUES (28, N'Olasılık ve İstatistik', 1, 4, 3)
INSERT [dbo].[Dersler] ([DersID], [DersAdi], [BolumID], [DonemID], [kredi]) VALUES (29, N'Otomata Teorisi', 1, 4, 3)
INSERT [dbo].[Dersler] ([DersID], [DersAdi], [BolumID], [DonemID], [kredi]) VALUES (30, N'Bilgisayar Organizasyonu ve Tasarımı', 1, 4, 3)
INSERT [dbo].[Dersler] ([DersID], [DersAdi], [BolumID], [DonemID], [kredi]) VALUES (31, N'Sinyaller ve Sistemler', 1, 4, 3)
INSERT [dbo].[Dersler] ([DersID], [DersAdi], [BolumID], [DonemID], [kredi]) VALUES (32, N'Atatürk İlkeleri ve İnkılap Tarihi 2', 1, 4, 3)
INSERT [dbo].[Dersler] ([DersID], [DersAdi], [BolumID], [DonemID], [kredi]) VALUES (33, N'Türk Dili 2', 1, 4, 3)
GO
INSERT [dbo].[DersProgrami] ([DersProgramiID], [DersID], [OgretmenID], [SinifID], [Gun], [Saat]) VALUES (1, 1, N'11111111111', 1, 22, CAST(N'13:00:00' AS Time))
INSERT [dbo].[DersProgrami] ([DersProgramiID], [DersID], [OgretmenID], [SinifID], [Gun], [Saat]) VALUES (2, 2, N'11111111111', 2, 23, CAST(N'14:00:00' AS Time))
INSERT [dbo].[DersProgrami] ([DersProgramiID], [DersID], [OgretmenID], [SinifID], [Gun], [Saat]) VALUES (3, 4, N'11111111111', 2, 25, CAST(N'16:00:00' AS Time))
INSERT [dbo].[DersProgrami] ([DersProgramiID], [DersID], [OgretmenID], [SinifID], [Gun], [Saat]) VALUES (4, 5, N'11111111112', 2, 25, CAST(N'16:00:00' AS Time))
INSERT [dbo].[DersProgrami] ([DersProgramiID], [DersID], [OgretmenID], [SinifID], [Gun], [Saat]) VALUES (5, 7, N'11111111112', 2, 28, CAST(N'12:00:00' AS Time))
INSERT [dbo].[DersProgrami] ([DersProgramiID], [DersID], [OgretmenID], [SinifID], [Gun], [Saat]) VALUES (6, 3, N'11111111111', 1, 26, CAST(N'13:00:00' AS Time))
INSERT [dbo].[DersProgrami] ([DersProgramiID], [DersID], [OgretmenID], [SinifID], [Gun], [Saat]) VALUES (7, 6, N'11111111111', 1, 26, CAST(N'13:00:00' AS Time))
INSERT [dbo].[DersProgrami] ([DersProgramiID], [DersID], [OgretmenID], [SinifID], [Gun], [Saat]) VALUES (8, 8, N'11111111111', 1, 26, CAST(N'13:00:00' AS Time))
INSERT [dbo].[DersProgrami] ([DersProgramiID], [DersID], [OgretmenID], [SinifID], [Gun], [Saat]) VALUES (9, 9, N'11111111111', 1, 26, CAST(N'13:00:00' AS Time))
INSERT [dbo].[DersProgrami] ([DersProgramiID], [DersID], [OgretmenID], [SinifID], [Gun], [Saat]) VALUES (10, 10, N'11111111111', 1, 26, CAST(N'13:00:00' AS Time))
INSERT [dbo].[DersProgrami] ([DersProgramiID], [DersID], [OgretmenID], [SinifID], [Gun], [Saat]) VALUES (11, 11, N'11111111111', 1, 26, CAST(N'13:00:00' AS Time))
INSERT [dbo].[DersProgrami] ([DersProgramiID], [DersID], [OgretmenID], [SinifID], [Gun], [Saat]) VALUES (12, 12, N'11111111111', 1, 26, CAST(N'13:00:00' AS Time))
INSERT [dbo].[DersProgrami] ([DersProgramiID], [DersID], [OgretmenID], [SinifID], [Gun], [Saat]) VALUES (13, 13, N'11111111111', 1, 26, CAST(N'13:00:00' AS Time))
INSERT [dbo].[DersProgrami] ([DersProgramiID], [DersID], [OgretmenID], [SinifID], [Gun], [Saat]) VALUES (14, 14, N'11111111111', 1, 26, CAST(N'13:00:00' AS Time))
INSERT [dbo].[DersProgrami] ([DersProgramiID], [DersID], [OgretmenID], [SinifID], [Gun], [Saat]) VALUES (15, 15, N'11111111111', 1, 26, CAST(N'13:00:00' AS Time))
INSERT [dbo].[DersProgrami] ([DersProgramiID], [DersID], [OgretmenID], [SinifID], [Gun], [Saat]) VALUES (16, 16, N'11111111111', 1, 26, CAST(N'13:00:00' AS Time))
GO
INSERT [dbo].[Donemler] ([DonemID], [DonemAdi]) VALUES (1, N'1.Dönem')
INSERT [dbo].[Donemler] ([DonemID], [DonemAdi]) VALUES (2, N'2.Dönem')
INSERT [dbo].[Donemler] ([DonemID], [DonemAdi]) VALUES (3, N'3.Dönem')
INSERT [dbo].[Donemler] ([DonemID], [DonemAdi]) VALUES (4, N'4.Dönem')
INSERT [dbo].[Donemler] ([DonemID], [DonemAdi]) VALUES (5, N'5.Dönem')
INSERT [dbo].[Donemler] ([DonemID], [DonemAdi]) VALUES (6, N'6.Dönem')
INSERT [dbo].[Donemler] ([DonemID], [DonemAdi]) VALUES (7, N'7.Dönem')
INSERT [dbo].[Donemler] ([DonemID], [DonemAdi]) VALUES (8, N'8.Dönem')
INSERT [dbo].[Donemler] ([DonemID], [DonemAdi]) VALUES (9, N'9.Dönem')
INSERT [dbo].[Donemler] ([DonemID], [DonemAdi]) VALUES (10, N'10.Dönem')
INSERT [dbo].[Donemler] ([DonemID], [DonemAdi]) VALUES (11, N'11.Dönem')
INSERT [dbo].[Donemler] ([DonemID], [DonemAdi]) VALUES (12, N'12.Dönem')
GO
SET IDENTITY_INSERT [dbo].[duyurular] ON 

INSERT [dbo].[duyurular] ([Id], [Duyuru_basligi], [Duyuru_aciklamasi]) VALUES (1, N'Online Yabancı Dil Kursları', N'Ankara Yılıdırm Beyazıt Üniversitesi Dil Eğitimi Uygulama ve Araştırma Merkezi (DİLMER) tarafından düzenlenecek olan "YDS/YÖKDİL Hazırlık, YDS/YÖKDİL Kamp, IELTS Hazırlık, İngilizce Akademik Yazma, İngilizce Akademik Konuşma, Çocuk İngilizcesi, Genel Almanca A1-A2 ve Genel İngilizce A1-A2-B2 dil kursları"')
INSERT [dbo].[duyurular] ([Id], [Duyuru_basligi], [Duyuru_aciklamasi]) VALUES (2, N'Anket Çalışması', N'Ankara Hacı Bayram Üniversitesi Lisansüstü Eğitim Enstitüsü Müdürlüğü Gazetecilik Anabilim Dalı doktora programı öğrencisi Özlem BARIŞ ın, Prof. Dr. Ayşe Elif EMRE KAYA danışmanlığında yürütülen "Z Kuşağının Sosyal Medyada İdeolojik Örgütlenme ve Direniş Kültürü Oluşturma Eylemleri Üzerine Araştırma" konulu doktora tez çalışmasına yönelik anket uygulaması')
INSERT [dbo].[duyurular] ([Id], [Duyuru_basligi], [Duyuru_aciklamasi]) VALUES (3, N'Avrupa elik anket uygulaması', N'Dışişleri Bakanlığı Avrupa Birliği Başkanlığı tarafından yürütülen "Avrupa Koleji Yüksek Lisans Burs Programı" başvurusu ile ilgili detaylı bilgiye ulaşmak için lütfen')
SET IDENTITY_INSERT [dbo].[duyurular] OFF
GO
INSERT [dbo].[Fakulte] ([FakulteID], [FakulteAdi]) VALUES (1, N'Mühendislik Fakültesi')
INSERT [dbo].[Fakulte] ([FakulteID], [FakulteAdi]) VALUES (2, N'Hukuk Fakültesi')
GO
SET IDENTITY_INSERT [dbo].[Mesajlar] ON 

INSERT [dbo].[Mesajlar] ([MesajID], [GonderenOgrenciID], [GonderenOgretmenID], [AliciOgrenciID], [AliciOgretmenID], [MesajMetni], [Tarih]) VALUES (1, NULL, N'11111111111', N'53716115100', NULL, N'Merhaba Veri tabanı yönetim sistemleri proje ödevi son teslim tarihi 7 Ocaktır. Kolay gelsin', CAST(N'2024-01-05T00:00:00.000' AS DateTime))
INSERT [dbo].[Mesajlar] ([MesajID], [GonderenOgrenciID], [GonderenOgretmenID], [AliciOgrenciID], [AliciOgretmenID], [MesajMetni], [Tarih]) VALUES (23, NULL, N'11111111111', N'53716115100', NULL, N'Deneme Mesajları Merhaba', CAST(N'2023-05-22T00:00:00.000' AS DateTime))
INSERT [dbo].[Mesajlar] ([MesajID], [GonderenOgrenciID], [GonderenOgretmenID], [AliciOgrenciID], [AliciOgretmenID], [MesajMetni], [Tarih]) VALUES (24, NULL, N'11111111112', N'53716115100', NULL, N'Deneme Mesajları Merhaba', CAST(N'2023-05-22T00:00:00.000' AS DateTime))
INSERT [dbo].[Mesajlar] ([MesajID], [GonderenOgrenciID], [GonderenOgretmenID], [AliciOgrenciID], [AliciOgretmenID], [MesajMetni], [Tarih]) VALUES (128, NULL, N'11111111112', N'53716115100', NULL, N'Deneme Mesajları Merhaba2', CAST(N'2023-05-22T00:00:00.000' AS DateTime))
INSERT [dbo].[Mesajlar] ([MesajID], [GonderenOgrenciID], [GonderenOgretmenID], [AliciOgrenciID], [AliciOgretmenID], [MesajMetni], [Tarih]) VALUES (130, N'53716115100', NULL, N'53716115100', NULL, N'deneme mesajı 4', NULL)
INSERT [dbo].[Mesajlar] ([MesajID], [GonderenOgrenciID], [GonderenOgretmenID], [AliciOgrenciID], [AliciOgretmenID], [MesajMetni], [Tarih]) VALUES (131, N'53716115100', NULL, N'53716115100', NULL, N'merhaba 5', NULL)
INSERT [dbo].[Mesajlar] ([MesajID], [GonderenOgrenciID], [GonderenOgretmenID], [AliciOgrenciID], [AliciOgretmenID], [MesajMetni], [Tarih]) VALUES (132, N'53716115100', NULL, N'53716115100', NULL, N'mesaj 6', NULL)
SET IDENTITY_INSERT [dbo].[Mesajlar] OFF
GO
INSERT [dbo].[ogrenci] ([tcNo], [isim], [soyad], [ogrNo], [telNo], [adress], [email], [statu], [geldigiOkul], [kayitTarihi], [mezuniyetTarihi], [agno], [sube], [okuduguDonem], [akademikDonem], [gelisSekli], [gelisPuani], [BolumID], [sifre]) VALUES (N'53716115100', N'Ali Kemal', N'Cimşit', N'210707019', N'+905060237736', N'Kars/Selim', N'alikemalcimsit36@gmail.com', N'Devamlı Öğrenci', N'Oltu Fen Lisesi', CAST(N'2021-05-21T00:00:00.000' AS DateTime), NULL, 3, N'A', N'2022/2023', N'2', N'YKS', N'350.0', 1, N'12345')
INSERT [dbo].[ogrenci] ([tcNo], [isim], [soyad], [ogrNo], [telNo], [adress], [email], [statu], [geldigiOkul], [kayitTarihi], [mezuniyetTarihi], [agno], [sube], [okuduguDonem], [akademikDonem], [gelisSekli], [gelisPuani], [BolumID], [sifre]) VALUES (N'53716115133', N'Sefa', N'Özay', N'210707049', N'+905545679898', N'İstanbul/Kartal', N'sefaozay@gmail.com', N'Devamlı Ögrenci', N'Kartal Anadolu Lisesi', CAST(N'2022-05-22T00:00:00.000' AS DateTime), NULL, 2.34, N'B', N'2022/2023', N'2', N'YKS', N'177.3', 2, N'123456')
GO
INSERT [dbo].[OgrenciDers] ([OgrenciID], [DersID], [HarfNotu]) VALUES (N'53716115100', 1, NULL)
INSERT [dbo].[OgrenciDers] ([OgrenciID], [DersID], [HarfNotu]) VALUES (N'53716115100', 2, NULL)
INSERT [dbo].[OgrenciDers] ([OgrenciID], [DersID], [HarfNotu]) VALUES (N'53716115100', 3, NULL)
INSERT [dbo].[OgrenciDers] ([OgrenciID], [DersID], [HarfNotu]) VALUES (N'53716115100', 4, NULL)
INSERT [dbo].[OgrenciDers] ([OgrenciID], [DersID], [HarfNotu]) VALUES (N'53716115100', 5, NULL)
INSERT [dbo].[OgrenciDers] ([OgrenciID], [DersID], [HarfNotu]) VALUES (N'53716115100', 6, NULL)
INSERT [dbo].[OgrenciDers] ([OgrenciID], [DersID], [HarfNotu]) VALUES (N'53716115100', 7, NULL)
INSERT [dbo].[OgrenciDers] ([OgrenciID], [DersID], [HarfNotu]) VALUES (N'53716115100', 8, NULL)
INSERT [dbo].[OgrenciDers] ([OgrenciID], [DersID], [HarfNotu]) VALUES (N'53716115100', 9, NULL)
INSERT [dbo].[OgrenciDers] ([OgrenciID], [DersID], [HarfNotu]) VALUES (N'53716115100', 10, NULL)
INSERT [dbo].[OgrenciDers] ([OgrenciID], [DersID], [HarfNotu]) VALUES (N'53716115100', 11, NULL)
GO
INSERT [dbo].[Ogretmen] ([tcNo], [OgretmenID], [OgretmenAdi], [BolumID]) VALUES (N'1111111111', 1, N'Mete Yağanoğlu', 1)
INSERT [dbo].[Ogretmen] ([tcNo], [OgretmenID], [OgretmenAdi], [BolumID]) VALUES (N'11111111111', 1, N'Mete Yağanoğlu', 1)
INSERT [dbo].[Ogretmen] ([tcNo], [OgretmenID], [OgretmenAdi], [BolumID]) VALUES (N'11111111112', 2, N'Köksal Erentürk', 1)
GO
INSERT [dbo].[OgretmenDers] ([OgretmenID], [DersID]) VALUES (N'1111111111', 1)
GO
INSERT [dbo].[Siniflar] ([SinifID], [SinifAdi]) VALUES (1, N'TRS1')
INSERT [dbo].[Siniflar] ([SinifID], [SinifAdi]) VALUES (2, N'TRS2')
INSERT [dbo].[Siniflar] ([SinifID], [SinifAdi]) VALUES (3, N'E-3')
INSERT [dbo].[Siniflar] ([SinifID], [SinifAdi]) VALUES (4, N'E-4')
GO
INSERT [dbo].[Yoklama] ([YoklamaID], [OgrenciID], [DersID], [Tarih], [Durum]) VALUES (1, N'210707019', 1, CAST(N'2023-05-22' AS Date), N'Var')
INSERT [dbo].[Yoklama] ([YoklamaID], [OgrenciID], [DersID], [Tarih], [Durum]) VALUES (2, N'210707019', 1, CAST(N'2023-05-23' AS Date), N'Yok')
INSERT [dbo].[Yoklama] ([YoklamaID], [OgrenciID], [DersID], [Tarih], [Durum]) VALUES (3, N'210707019', 2, CAST(N'2023-05-23' AS Date), N'Yok')
INSERT [dbo].[Yoklama] ([YoklamaID], [OgrenciID], [DersID], [Tarih], [Durum]) VALUES (4, N'210707019', 3, CAST(N'2023-05-25' AS Date), N'Var')
INSERT [dbo].[Yoklama] ([YoklamaID], [OgrenciID], [DersID], [Tarih], [Durum]) VALUES (5, N'210707019', 14, CAST(N'2023-05-22' AS Date), N'Var')
INSERT [dbo].[Yoklama] ([YoklamaID], [OgrenciID], [DersID], [Tarih], [Durum]) VALUES (6, N'210707019', 15, CAST(N'2023-05-22' AS Date), N'Yok')
GO
SET ANSI_PADDING ON
GO
/****** Object:  Index [UQ__ogrenci__5919BBFFD31695F4]    Script Date: 7.01.2024 04:39:40 ******/
ALTER TABLE [dbo].[ogrenci] ADD UNIQUE NONCLUSTERED 
(
	[ogrNo] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, SORT_IN_TEMPDB = OFF, IGNORE_DUP_KEY = OFF, ONLINE = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
GO
ALTER TABLE [dbo].[Bolumler] ADD  DEFAULT ((0)) FOR [DönemSayisi]
GO
ALTER TABLE [dbo].[ogrenci] ADD  DEFAULT (getdate()) FOR [kayitTarihi]
GO
ALTER TABLE [dbo].[ogrenci] ADD  DEFAULT ((0.0)) FOR [agno]
GO
ALTER TABLE [dbo].[Bolumler]  WITH CHECK ADD FOREIGN KEY([FakulteID])
REFERENCES [dbo].[Fakulte] ([FakulteID])
GO
ALTER TABLE [dbo].[Dersler]  WITH CHECK ADD FOREIGN KEY([BolumID])
REFERENCES [dbo].[Bolumler] ([BolumID])
GO
ALTER TABLE [dbo].[Dersler]  WITH CHECK ADD FOREIGN KEY([DonemID])
REFERENCES [dbo].[Donemler] ([DonemID])
GO
ALTER TABLE [dbo].[DersProgrami]  WITH CHECK ADD FOREIGN KEY([DersID])
REFERENCES [dbo].[Dersler] ([DersID])
GO
ALTER TABLE [dbo].[DersProgrami]  WITH CHECK ADD FOREIGN KEY([OgretmenID])
REFERENCES [dbo].[Ogretmen] ([tcNo])
GO
ALTER TABLE [dbo].[DersProgrami]  WITH CHECK ADD FOREIGN KEY([SinifID])
REFERENCES [dbo].[Siniflar] ([SinifID])
GO
ALTER TABLE [dbo].[DersSecim]  WITH CHECK ADD FOREIGN KEY([DersID])
REFERENCES [dbo].[Dersler] ([DersID])
GO
ALTER TABLE [dbo].[DersSecim]  WITH CHECK ADD FOREIGN KEY([OgrenciID])
REFERENCES [dbo].[ogrenci] ([tcNo])
GO
ALTER TABLE [dbo].[DersSecim]  WITH CHECK ADD FOREIGN KEY([OgretmenID])
REFERENCES [dbo].[Ogretmen] ([tcNo])
GO
ALTER TABLE [dbo].[Mesajlar]  WITH CHECK ADD FOREIGN KEY([AliciOgrenciID])
REFERENCES [dbo].[ogrenci] ([tcNo])
GO
ALTER TABLE [dbo].[Mesajlar]  WITH CHECK ADD FOREIGN KEY([GonderenOgrenciID])
REFERENCES [dbo].[ogrenci] ([tcNo])
GO
ALTER TABLE [dbo].[Notlar]  WITH CHECK ADD FOREIGN KEY([OgrenciID])
REFERENCES [dbo].[ogrenci] ([tcNo])
GO
ALTER TABLE [dbo].[Notlar]  WITH CHECK ADD FOREIGN KEY([SinavID])
REFERENCES [dbo].[Sinavlar] ([SinavID])
GO
ALTER TABLE [dbo].[ogrenci]  WITH CHECK ADD  CONSTRAINT [FK_Ogrenci_Bolum] FOREIGN KEY([BolumID])
REFERENCES [dbo].[Bolumler] ([BolumID])
GO
ALTER TABLE [dbo].[ogrenci] CHECK CONSTRAINT [FK_Ogrenci_Bolum]
GO
ALTER TABLE [dbo].[OgrenciDers]  WITH CHECK ADD FOREIGN KEY([DersID])
REFERENCES [dbo].[Dersler] ([DersID])
GO
ALTER TABLE [dbo].[Ogretmen]  WITH CHECK ADD FOREIGN KEY([BolumID])
REFERENCES [dbo].[Bolumler] ([BolumID])
GO
ALTER TABLE [dbo].[OgretmenDers]  WITH CHECK ADD FOREIGN KEY([DersID])
REFERENCES [dbo].[Dersler] ([DersID])
GO
ALTER TABLE [dbo].[OgretmenDers]  WITH CHECK ADD FOREIGN KEY([OgretmenID])
REFERENCES [dbo].[Ogretmen] ([tcNo])
GO
ALTER TABLE [dbo].[Uyelik]  WITH CHECK ADD FOREIGN KEY([KulupID])
REFERENCES [dbo].[Klupler] ([KulupID])
GO
ALTER TABLE [dbo].[Uyelik]  WITH CHECK ADD FOREIGN KEY([OgrenciID])
REFERENCES [dbo].[ogrenci] ([tcNo])
GO
ALTER TABLE [dbo].[Yoklama]  WITH CHECK ADD FOREIGN KEY([DersID])
REFERENCES [dbo].[Dersler] ([DersID])
GO
ALTER TABLE [dbo].[Yoklama]  WITH CHECK ADD FOREIGN KEY([OgrenciID])
REFERENCES [dbo].[ogrenci] ([ogrNo])
GO
/****** Object:  StoredProcedure [dbo].[sp_BolumDersleri]    Script Date: 7.01.2024 04:39:40 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[sp_BolumDersleri]
    @BolumID INT
AS
BEGIN
    SELECT * FROM dersler WHERE BolumID = @BolumID;
END;
GO
/****** Object:  StoredProcedure [dbo].[sp_BolumOgretmenleri]    Script Date: 7.01.2024 04:39:40 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[sp_BolumOgretmenleri]
    @BolumID INT
AS
BEGIN
    SELECT * FROM Ogretmen WHERE BolumID = @BolumID;
END;
GO
/****** Object:  StoredProcedure [dbo].[sp_DonemDersleri]    Script Date: 7.01.2024 04:39:40 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[sp_DonemDersleri]
    @DonemID INT
AS
BEGIN
    SELECT * FROM dersler WHERE DonemID = @DonemID;
END;
GO
/****** Object:  StoredProcedure [dbo].[sp_EkleOgrenci]    Script Date: 7.01.2024 04:39:40 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[sp_EkleOgrenci]
    @tcNo NVARCHAR(11),
    @isim NVARCHAR(10),
	@soyad NVARCHAR(10),
	@ogrNo Nvarchar(10),
	@telNo nvarchar(13),
	@adress nvarchar(255),
	@email nvarchar(255),
	@statu nvarchar(50),
	@geldigiOkul nvarchar(100),
	@kayitTarihi datetime , 
	@mezuniyetTarihi datetime,
	@agno float ,
	@sube char(1),
	@okuduguDonem nvarchar(10),
	@akademikDonem nvarchar(10),
	@gelisSekli nvarchar(5),
	@gelisPuani nvarchar(5),
	@BolumID int , 
	@sifre nvarchar(50)


AS
BEGIN
    INSERT INTO ogrenci (tcNo, isim, soyad,ogrNo,telNo,adress,email,statu,geldigiOkul,kayitTarihi,mezuniyetTarihi,agno,sube,okuduguDonem,akademikDonem,gelisSekli,gelisPuani,BolumID,sifre) VALUES (@tcNo, @isim, @soyad,@ogrNo,@telNo,@adress,@email,@statu,@geldigiOkul,@kayitTarihi,@mezuniyetTarihi,@agno,@sube,@okuduguDonem,@akademikDonem,@gelisSekli,@gelisPuani,@BolumID,@sifre);
END;
GO
/****** Object:  StoredProcedure [dbo].[sp_OgrenciyeAitYoklama]    Script Date: 7.01.2024 04:39:40 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[sp_OgrenciyeAitYoklama]
    @OgrenciID nvarchar(10)
AS
BEGIN
    SELECT * FROM yoklama WHERE OgrenciID = @OgrenciID;
END;
GO
USE [master]
GO
ALTER DATABASE [obs] SET  READ_WRITE 
GO
