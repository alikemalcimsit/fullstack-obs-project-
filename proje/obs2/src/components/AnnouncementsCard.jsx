import React from 'react'

export default function AnnouncementsCard({title,content}) {
  
  return (
    <div className='border-2 rounded-xl bg-white px-5 shadow-xl py-5 border-[#1C2534]' >
<h1 className='text-center text-xl font-semibold'>{title}</h1>
<p className='text-center text-base'>
{content}
</p>

    </div>
  )
}
