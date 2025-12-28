const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function exec(stmt) {
    console.log(stmt.split('\n')[0]);
    await prisma.$executeRawUnsafe(stmt);
}

async function execDynamic(createStmt) {
    const wrapped = `EXEC('${createStmt.replace(/'/g, "''")}')`;
    console.log(createStmt.split('\n')[0]);
    await prisma.$executeRawUnsafe(wrapped);
}

async function main() {
  try {
    // Functions
    await exec("IF OBJECT_ID('dbo.BolumdekiOgrenciSayisi','FN') IS NOT NULL DROP FUNCTION dbo.BolumdekiOgrenciSayisi;");
    await execDynamic(`CREATE FUNCTION dbo.BolumdekiOgrenciSayisi(@BolumID INT)
RETURNS INT
AS
BEGIN
    DECLARE @OgrenciSayisi INT;
    SELECT @OgrenciSayisi = COUNT(*) FROM ogrenciler WHERE bolumId = @BolumID;
    RETURN @OgrenciSayisi;
END;`);

    await exec("IF OBJECT_ID('dbo.DonemdekiDersSayisi','FN') IS NOT NULL DROP FUNCTION dbo.DonemdekiDersSayisi;");
    await execDynamic(`CREATE FUNCTION dbo.DonemdekiDersSayisi(@DonemID INT)
RETURNS INT
AS
BEGIN
    DECLARE @DersSayisi INT;
    SELECT @DersSayisi = COUNT(*) FROM dersler WHERE donemId = @DonemID;
    RETURN @DersSayisi;
END;`);

    await exec("IF OBJECT_ID('dbo.OrtalamaAGNOBolum','FN') IS NOT NULL DROP FUNCTION dbo.OrtalamaAGNOBolum;");
    await execDynamic(`CREATE FUNCTION dbo.OrtalamaAGNOBolum(@BolumID INT)
RETURNS DECIMAL(5,2)
AS
BEGIN
    DECLARE @OrtalamaAGNO DECIMAL(5,2);
    SELECT @OrtalamaAGNO = AVG(agno) FROM ogrenciler WHERE bolumId = @BolumID;
    RETURN @OrtalamaAGNO;
END;`);

    // View
    await exec("IF OBJECT_ID('dbo.BolumdekiOgrenciler','V') IS NOT NULL DROP VIEW dbo.BolumdekiOgrenciler;");
    await execDynamic(`CREATE VIEW dbo.BolumdekiOgrenciler AS
SELECT tcNo, isim, soyad, bolumId AS BolumID FROM ogrenciler;`);

    // Log tables
    await exec(`IF OBJECT_ID('dbo.NotlarLog','U') IS NULL
BEGIN
    CREATE TABLE dbo.NotlarLog(
        LogID INT IDENTITY(1,1) PRIMARY KEY,
        OgrenciID INT NULL,
        SinavID INT NULL,
        Puan FLOAT NULL,
        Islem NVARCHAR(20) NOT NULL,
        Tarih DATETIME NOT NULL DEFAULT(getdate())
    );
END;`);

    await exec(`IF OBJECT_ID('dbo.YoklamaLog','U') IS NULL
BEGIN
    CREATE TABLE dbo.YoklamaLog(
        LogID INT IDENTITY(1,1) PRIMARY KEY,
        YoklamaID INT NULL,
        OgrenciID INT NULL,
        DersID INT NULL,
        Durum NVARCHAR(20) NULL,
        Islem NVARCHAR(20) NOT NULL,
        Tarih DATETIME NOT NULL DEFAULT(getdate())
    );
END;`);

    // Triggers
    await exec("IF OBJECT_ID('dbo.trg_Notlar_InsertLog','TR') IS NOT NULL DROP TRIGGER dbo.trg_Notlar_InsertLog;");
    await execDynamic(`CREATE TRIGGER dbo.trg_Notlar_InsertLog ON dbo.notlar
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO NotlarLog (OgrenciID, SinavID, Puan, Islem)
    SELECT i.ogrenciId, i.sinavId, i.puan, 'INSERT' FROM inserted i;
END;`);

    await exec("IF OBJECT_ID('dbo.trg_Notlar_UpdateLog','TR') IS NOT NULL DROP TRIGGER dbo.trg_Notlar_UpdateLog;");
    await execDynamic(`CREATE TRIGGER dbo.trg_Notlar_UpdateLog ON dbo.notlar
AFTER UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO NotlarLog (OgrenciID, SinavID, Puan, Islem)
    SELECT i.ogrenciId, i.sinavId, i.puan, 'UPDATE' FROM inserted i;
END;`);

    await exec("IF OBJECT_ID('dbo.trg_Yoklama_StatusLog','TR') IS NOT NULL DROP TRIGGER dbo.trg_Yoklama_StatusLog;");
    await execDynamic(`CREATE TRIGGER dbo.trg_Yoklama_StatusLog ON dbo.yoklamalar
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO YoklamaLog (YoklamaID, OgrenciID, DersID, Durum, Islem)
    SELECT COALESCE(i.id, d.id), COALESCE(i.ogrenciId, d.ogrenciId), COALESCE(i.dersId, d.dersId), COALESCE(i.durum, d.durum),
           CASE WHEN EXISTS (SELECT 1 FROM inserted) AND NOT EXISTS (SELECT 1 FROM deleted) THEN 'INSERT'
                WHEN EXISTS (SELECT 1 FROM inserted) AND EXISTS (SELECT 1 FROM deleted) THEN 'UPDATE'
                ELSE 'UNKNOWN' END
    FROM inserted i
    FULL OUTER JOIN deleted d ON i.id = d.id;
END;`);

    await exec("IF OBJECT_ID('dbo.trg_Duyuru_InsertLog','TR') IS NOT NULL DROP TRIGGER dbo.trg_Duyuru_InsertLog;");
    await execDynamic(`CREATE TRIGGER dbo.trg_Duyuru_InsertLog ON dbo.duyurular
AFTER INSERT
AS
BEGIN
    SET NOCOUNT ON;
    PRINT 'Yeni duyuru eklendi.';
END;`);

    console.log('SQL artifacts ensured successfully.');
  } catch (err) {
    console.error('Error ensuring SQL artifacts:', err);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
