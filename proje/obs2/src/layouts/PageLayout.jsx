import React, { useEffect, useState } from 'react'
import  Sidebar  from '../components/Sidebar'
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function PageLayout({children}) {

  return (
    <div className='flex '>
<div className='w-1/5 '>
<Sidebar></Sidebar>

</div>
<div className='w-4/5 bg-[#F6FAFB]'>
{children}
</div>
    </div>
  )
}
