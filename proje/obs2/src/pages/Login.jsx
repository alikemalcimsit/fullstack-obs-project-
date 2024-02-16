import React, { useState } from "react";
import bg from ".././assets/bg.webp";
import logo from ".././assets/logo.png";
import axios from "axios";
import { useNavigate } from "react-router-dom";
export default function Login() {
  const [ogrNo , setOgrNo] = useState('')
  const [sifre,setSifre] = useState('')

  const navigate = useNavigate();
  const handleLogin=async () =>{
try{
  const response = await axios.post('http://localhost:5000/login',{ogrNo:ogrNo , sifre:sifre})
  console.log("giriş Başarılı" , response.data)
  navigate(`/${response.data.user.ogrNo}`)
 
}

  
  catch (error) {
    // Giriş başarısız
    console.error('Giriş hatası:', error.response.data);
  }}
  return (
    <div>
      <div
        className=" bg-cover flex items-center  justify-center bg-center  h-screen w-screen "
        style={{ backgroundImage: `url(${bg})` }}
      >
        <div className="w-[570px] flex flex-col backdrop-blur-md items-center justify-center h-[543px] rounded-[70px]  bg-[#D9D9D9]/10">
          <img alt="logo" src={logo}></img>
          <h1 className="text-2xl font-semibold mt-3 text-w  text-white">Öğrenci Bilgi Sistemi Giriş</h1>
        
      
<div className="w-2/3 mt-6">
  
<input value={ogrNo} onChange={(e)=>setOgrNo(e.target.value)} type="text"  placeholder="Öğrenci Numarası"  className=" py-4 px-4 border-[1px] border-[#210F61] w-full  mb-4  bg-white rounded-xl"></input>
          <input value={sifre} onChange={(e)=>setSifre(e.target.value)} type="password"  placeholder="Şifre"  className=" py-4 px-4 border-[1px] border-[#210F61] w-full  mb-4  bg-white rounded-xl"></input>

</div>
          
          
          
          
            
<div className="mb-4">
<button onClick={handleLogin}  className='px-16 py-3 rounded-full   bg-[#210F61] text-white'>Giriş Yap</button>

</div>         

<div>
<button  className='px-16 py-3 rounded-full bg-[#E5B77C] text-black  '>Kayıt Ol</button>

</div>         
</div>
</div>

</div>

  );
}
