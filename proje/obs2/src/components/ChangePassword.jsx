import React from 'react'

export default function ChangePassword() {
  return (
    <div className='bg-[#1C2534] rounded-2xl p-4 py-10'>
<h1 className='text-white text-center text-2xl mb-3'>Şifre Değiştir</h1>
<div className='border-b-2 border-[#BFBFBF] mb-5'></div>
<div className='flex flex-col justify-center items-center mt-10 '>
<div className='flex items-center  gap-x-12 mb-5 text-white'>
<span>Eski Şifre</span>
<input type='password' className='py-2 px-2 rounded-lg text-black' placeholder='Password'></input>
</div>
<div className='flex items-center  gap-x-12 mb-5 text-white'>
<span>Yeni Şifre</span>
<input type='password' className='py-2 px-2 rounded-lg text-black' placeholder='Password'></input>
</div>

<div className='flex items-center justify-center  w-full gap-x-12 mb-5 text-white'>
<span>Şifre değiştirme işlemini onaylıyorum</span>
<input type='checkbox' style={{height:"20px" , width:"20px"}}></input>
</div>
</div>
<button className='text-white w-1/2 m-auto flex items-center justify-center hover:bg-[#ff9155] bg-[#FF7227] py-4 px-2 rounded-2xl'>Şifreyi Değiştir</button>

    </div>
  )
}
