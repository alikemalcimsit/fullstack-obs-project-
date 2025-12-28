import React from 'react'
import OgretmenSidebar from '../components/OgretmenSidebar'

export default function OgretmenPageLayout({children}) {

  return (
    <div className='flex'>
      <div className='w-1/5'>
        <OgretmenSidebar />
      </div>
      <div className='w-4/5 bg-[#F6FAFB]'>
        {children}
      </div>
    </div>
  )
}
