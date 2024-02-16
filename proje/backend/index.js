const express = require("express")
const cors = require("cors") 
const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser")
const dotenv = require('dotenv')
const {getStudents, getDerslerById, getYoklamabyId, getYoklamaByLesson, getOgrenciDers, getDersProgram, getMesajlar, getOgretmen, postMesaj} = require("./config/db.js")
const {authenticateUser} = require('./config/db.js')
const {getStudentsbyOgrNo} = require('./config/db.js')
const {getBolumbyBolumId} = require('./config/db.js')
const {getDuyurular} = require('./config/db.js')




const app = express()

app.use(cors())
app.use(bodyParser.json({limit:"30mb" , extended:true}))
app.use(bodyParser.urlencoded({limit:"30mb" , extended:true}))
app.use(cookieParser())


const PORT = 5000

app.get('/students', async (req, res) => {
  try {
    const students = await getStudents();
    res.json(students);
  } catch (error) {
    console.error('Veri çekme hatası:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/login', async(req,res)=>{
  try{
    const {ogrNo,sifre} = req.body
    if(!ogrNo || !sifre){
      return res.status(400).json({error:"Öğrenci numarası veya Şifre Zorunludur"})
    }
    const user  = await authenticateUser(ogrNo,sifre)

    if(user){
      res.json({ message: 'Giriş başarılı', user });

    }
    else {
      res.status(401).json({ error: 'Kullanıcı adı veya şifre hatalı' });
    }
  }catch (error) {
    console.error('Giriş hatası:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

app.get('/ogrenci/:ogrNo', async(req,res)=>{
  try{
    const {ogrNo} = req.params
    if(!ogrNo ){
      return res.status(400).json({error:"Öğrenci numarası yok"})
    }
    const user  = await getStudentsbyOgrNo(ogrNo)

    if(user){
      res.json({ message: 'ogrenci bulunduı', user });

    }
    else {
      res.status(401).json({ error: 'ogrenci bulunamadı' });
    }
  }catch (error) {
    console.error('hata', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})


app.get('/bolumler/:bolumId', async(req,res)=>{
  try{
    const {bolumId} = req.params
    if(!bolumId ){
      return res.status(400).json({error:"bolum numarsı yok"})
    }
    console.log(bolumId)
    const bolum  = await getBolumbyBolumId(bolumId)

    if(bolum){
      res.json({ message: 'bolum bulundu', bolum });

    }
    else {
      res.status(401).json({ error: 'bolum bulunamadı' });
    }
  }catch (error) {
    console.error('hata', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

app.get('/duyurular', async (req, res) => {
  try {
    const duyurular = await getDuyurular();

    if (duyurular.length > 0) {
      res.json({ message: 'Duyurular bulundu', duyurular });
    } else {
      res.status(404).json({ error: 'Duyuru bulunamadı' });
    }
  } catch (error) {
    console.error('Hata:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/dersler/:bolumId', async (req, res) => {
  try {
    const { bolumId } = req.params; 
    console.log(bolumId);

    if (!bolumId) {
      return res.status(400).json({ error: "bolum numarası yok" });
    }

    const dersler = await getDerslerById(bolumId);

    if (dersler.length > 0) {
      res.json({ message: 'dersler bulundu', dersler });
    } else {
      res.status(401).json({ error: 'ders bulunamadı' });
    }
  } catch (error) {
    console.error('hata', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




app.get('/yoklama/:ogrNo', async(req,res)=>{
  try{
    const {ogrNo} = req.params
    if(!ogrNo ){
      return res.status(400).json({error:"Öğrenci numarası yok"})
    }
    const user  = await getYoklamabyId(ogrNo)

    if(user){
      res.json({ message: 'ogrenci bulunduı', user });

    }
    else {
      res.status(401).json({ error: 'ogrenci bulunamadı' });
    }
  }catch (error) {
    console.error('hata', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})


app.get('/yoklama/:ogrNo/:dersID', async(req,res)=>{
  try{
    const {ogrNo,dersID} = req.params
    if(!ogrNo ){
      return res.status(400).json({error:"Öğrenci numarası yok"})
    }
    const user  = await getYoklamaByLesson(ogrNo,dersID)

    if(user){
      res.json({ message: 'ogrenci bulunduı', user });

    }
    else {
      res.status(401).json({ error: 'ogrenci bulunamadı' });
    }
  }catch (error) {
    console.error('hata', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})
app.get('/ogrenciders/:tcNo', async(req,res)=>{
  try{
    const {tcNo} = req.params
    if(!tcNo ){
      return res.status(400).json({error:"Öğrenci numarası yok"})
    }
    const user  = await getOgrenciDers(tcNo)

    if(user){
      res.json({ message: 'ogrenci bulunduı', user });

    }
    else {
      res.status(401).json({ error: 'ogrenci bulunamadı' });
    }
  }catch (error) {
    console.error('hata', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

app.get('/dersprogrami/:dersID', async(req,res)=>{
  try{
    const {dersID} = req.params
    if(!dersID ){
      return res.status(400).json({error:"Öğrenci numarası yok"})
    }
    const user  = await getDersProgram(dersID)

    if(user){
      res.json({ message: 'ogrenci bulunduı', user });

    }
    else {
      res.status(401).json({ error: 'ogrenci bulunamadı' });
    }
  }catch (error) {
    console.error('hata', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

app.get('/mesajlar/:tcNo', async(req,res)=>{
  try{
    const {tcNo} = req.params
    if(!tcNo ){
      return res.status(400).json({error:"Öğrenci numarası yok"})
    }
    const user  = await getMesajlar(tcNo)

    if(user){
      res.json({ message: 'ogrenci bulunduı', user });

    }
    else {
      res.status(401).json({ error: 'ogrenci bulunamadı' });
    }
  }catch (error) {
    console.error('hata', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

app.get('/ogretmen/:tcNo', async(req,res)=>{
  try{
    const {tcNo} = req.params
    if(!tcNo ){
      return res.status(400).json({error:"Öğrenci numarası yok"})
    }
    const user  = await getOgretmen(tcNo)

    if(user){
      res.json({ message: 'ogrenci bulunduı', user });

    }
    else {
      res.status(401).json({ error: 'ogrenci bulunamadı' });
    }
  }catch (error) {
    console.error('hata', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

app.post('/mesajgonder', async (req, res) => {
  try {
    const { GonderenOgrenciID, GonderenOgretmenID,AliciOgrenciID,AliciOgretmenID,MesajMetni,Tarih} = req.body;

    // Veritabanına mesajı ekle
    await postMesaj(GonderenOgrenciID, GonderenOgretmenID,AliciOgrenciID,AliciOgretmenID,MesajMetni,Tarih);

    res.status(201).json({ message: 'Message saved successfully' });
  } catch (error) {
    console.error('Error handling POST request:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});












app.listen(PORT,() =>{
  console.log("server is running on port : " ,PORT)
})