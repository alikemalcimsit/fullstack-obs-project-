const sql = require('mssql/msnodesqlv8');

const config = {
  database: "obs",
  server: 'ALIKEMAL\\SQLEXPRESS',
  driver: "msnodesqlv8",
  options: {
    trustedConnection: true
  }
};

const getStudents = async () => {
  let pool;
  try {
    pool = await sql.connect(config);
    const result = await pool.request().query('SELECT * FROM ogrenci');
    return result.recordset;
  } catch (error) {
    console.error('Veri çekme hatası:', error);
    throw error;
  } finally {
    if (pool) {
      await sql.close();
    }
  }
};

const authenticateUser = async (ogrNo, sifre) => {
  let pool;
  try {
    pool = await sql.connect(config);
    const result = await pool.request()
      .input('ogrNo', sql.NVarChar, ogrNo)
      .input('sifre', sql.NVarChar, sifre)
      .query('Select * from ogrenci where ogrNo =@ogrNo  AND sifre=@sifre ');

    return result.recordset[0];
  } catch (error) {
    console.error('Kullanıcı bulunamadı', error);
    throw error;
  } finally {
    if (pool) {
      await sql.close();
    }
  }
};

const getStudentsbyOgrNo = async (ogrNo) => {
  let pool;
  try {
    pool = await sql.connect(config);
    const result = await pool.request()
      .input('ogrNo', sql.NVarChar, ogrNo)
      .query('Select * from ogrenci where ogrNo = @ogrNo');
    return result.recordset[0];
  } catch (error) {
    console.error('Kullanıcı bulunamadı', error);
    throw error;
  } finally {
    if (pool) {
      await sql.close();
    }
  }
};

const getBolumbyBolumId = async (bolumId) => {
  let pool;
  try {
    pool = await sql.connect(config);
    const result = await pool.request()
      .input('bolumId', sql.INT, bolumId)
      .query('Select * from bolumler where bolumId = @bolumId');
    return result.recordset[0];
  } catch (error) {
    console.error('bolum bulunamadı', error);
    throw error;
  } finally {
    if (pool) {
      await sql.close();
    }
  }
};

const getDuyurular = async () => {
  let pool;
  try {
    pool = await sql.connect(config);
    const result = await pool.request().query('SELECT * FROM duyurular ORDER BY Id DESC');
    return result.recordset;
  } catch (error) {
    console.error('Duyurular bulunamadı', error.message);
    throw error;
  } finally {
    if (pool) {
      await sql.close();
    }
  }
};

const getDerslerById = async (bolumId) => {
  let pool;
  try {
    pool = await sql.connect(config);
    const result = await pool.request()
      .input('bolumId', sql.INT, bolumId)
   
      .query('SELECT * FROM dersler WHERE bolumId = @bolumId');
    return result.recordset;
  } catch (error) {
    console.error('ders bulunamadı', error);
    throw error;
  } finally {
    if (pool) {
      await sql.close();
    }
  }
};
const getYoklamabyId = async (ogrNo) => {
  let pool;
  try {
    pool = await sql.connect(config);
    const result = await pool.request()
      .input('ogrNo', sql.NVarChar, ogrNo)
      .query('Select * from yoklama where ogrenciID = @ogrNo');
    return result.recordset;
  } catch (error) {
    console.error('Kullanıcı bulunamadı', error);
    throw error;
  } finally {
    if (pool) {
      await sql.close();
    }
  }
};

const getYoklamaByLesson = async (ogrNo, dersID) => {
  let pool;
  try {
    pool = await sql.connect(config);
    const result = await pool.request()
      .input('ogrNo', sql.NVarChar, ogrNo)
      .input('dersID', sql.INT, dersID)
      .query('Select * from yoklama where OgrenciID =@ogrNo  AND dersID=@dersID ');

    return result.recordset;
  } catch (error) {
    console.error('Kullanıcı bulunamadı', error);
    throw error;
  } 
};

const getOgrenciDers = async (tcNo) => {
  let pool;
  try {
    pool = await sql.connect(config);
    const result = await pool.request()
      .input('tcNo', sql.NVarChar, tcNo)
      .query('Select * from ogrenciders where OgrenciID =@tcNo ');

    return result.recordset;
  } catch (error) {
    console.error('Kullanıcı bulunamadı', error);
    throw error;
  } 
};



const getDersProgram = async (DersID) => {
  let pool;
  try {
    pool = await sql.connect(config);
    const result = await pool.request()
      .input('DersID', sql.Int, DersID)
      .query('Select * from dersprogrami where DersID =@DersID ');

    return result.recordset;
  } catch (error) {
    console.error('Kullanıcı bulunamadı', error);
    throw error;
  } 
};

const getMesajlar = async (tcNo) => {
  let pool;
  try {
    pool = await sql.connect(config);
    const result = await pool.request()
      .input('tcNo', sql.NVarChar, tcNo)
      .query('Select * from mesajlar where AliciOgrenciID =@tcNo ');

    return result.recordset;
  } catch (error) {
    console.error('Kullanıcı bulunamadı', error);
    throw error;
  } 
};
const getOgretmen = async (tcNo) => {
  let pool;
  try {
    pool = await sql.connect(config);
    const result = await pool.request()
      .input('tcNo', sql.NVarChar, tcNo)
      .query('Select * from ogretmen where tcNo =@tcNo ');

    return result.recordset;
  } catch (error) {
    console.error('Kullanıcı bulunamadı', error);
    throw error;
  } 
};

const postMesaj = async (GonderenOgrenciID, GonderenOgretmenID, AliciOgrenciID, AliciOgretmenID, MesajMetni, Tarih) => {
  try {
    
    const pool = await sql.connect(config);
    await pool
      .request()
      .input('GonderenOgrenciID', sql.NVarChar(11), GonderenOgrenciID)
      .input('GonderenOgretmenID', sql.NVarChar(11), GonderenOgretmenID)
      .input('AliciOgrenciID', sql.NVarChar(11), AliciOgrenciID)
      .input('AliciOgretmenID', sql.NVarChar(11), AliciOgretmenID)
      .input('MesajMetni', sql.NVarChar, MesajMetni)
      .input('Tarih', sql.Date, Tarih)
      .query('INSERT INTO Mesajlar (GonderenOgrenciID, GonderenOgretmenID, AliciOgrenciID, AliciOgretmenID, MesajMetni, Tarih) VALUES (@GonderenOgrenciID, @GonderenOgretmenID, @AliciOgrenciID, @AliciOgretmenID, @MesajMetni, @Tarih)');
  } finally {
    await sql.close();
  }
};


module.exports = {postMesaj, getOgretmen,getStudents,getDersProgram,getMesajlar, authenticateUser, getStudentsbyOgrNo, getBolumbyBolumId, getDuyurular ,getDerslerById,getYoklamabyId,getYoklamaByLesson,getOgrenciDers};
