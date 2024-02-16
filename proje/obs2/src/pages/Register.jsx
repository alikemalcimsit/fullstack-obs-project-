import React from 'react'
import bg from ".././assets/bg.webp";
import logo from ".././assets/logo.png";


export default function Register() {
  return (
    <div>
           <div>
      <div
        className=" bg-cover flex items-center justify-center bg-center  h-screen w-screen "
        style={{ backgroundImage: `url(${bg})` }}
      >
        <div className="w-[570px] flex flex-col items-center justify-center h-[690px] rounded-[70px] backdrop-blur-sm bg-[#D9D9D9]/30  ">
          <img alt="logo" src={logo}></img>
          <div className="w-2/3 mt-6">
          <input type="text"  placeholder="akfksafaksfnsa" className=" py-4 px-4 border-[1px] border-[#210F61] w-full  mb-4  bg-white rounded-xl"></input></div>

          </div>
          <div className="w-2/3 mb-1">
          <input type="text"  placeholder="akfksafaksfnsa"   className=" py-4 px-4 border-[1px] border-[#210F61] w-full  mb-4  bg-white rounded-xl"></input></div>

          </div>
          <div className="w-2/3 mb-1">
          <input type="text" placeholder="akfksafaksfnsa"   className=" py-4 px-4 border-[1px] border-[#210F61] w-full  mb-4  bg-white rounded-xl"></input></div>
          </div>

          <div className="w-2/3 mb-1">
          <input type="text" placeholder="akfksafaksfnsa"  className=" py-4 px-4 border-[1px] border-[#210F61] w-full  mb-4  bg-white rounded-xl"></input></div>

          <div className="w-2/3 mb-1">
          <input type="text"  placeholder="akfksafaksfnsa"   className=" py-4 px-4 border-[1px] border-[#210F61] w-full  mb-4  bg-white rounded-xl"></input></div>

          <div className="mb-2">
          <input type="text"  placeholder="akfksafaksfnsa"   className=" py-4 px-4 border-[1px] border-[#210F61] w-full  mb-4  bg-white rounded-xl"></input></div>
          <div>
          <input type="text"  placeholder="akfksafaksfnsa"   className=" py-4 px-4 border-[1px] border-[#210F61] w-full  mb-4  bg-white rounded-xl"></input></div>
          </div>
        
    
  )
}
