import { Timeline } from '@material-tailwind/react'
import React, { useEffect, useState } from 'react'
import TimelineCard from '../components/TimelineCard'
import AttentionCard from '../components/AttentionCard'
import AnnouncementsCard from '../components/AnnouncementsCard'
import MessagesCard from '../components/MessagesCard'
import axios from 'axios'
import { useParams } from 'react-router-dom'

export default function HomePage() {
  const [student, setStudent] = useState();
const [duyurular,setDuyurular] = useState([])
  const { ogrNo } = useParams();


  const getDuyurular = async () => {
    try {
      const response = await axios.get('http://localhost:5000/duyurular');
      setDuyurular(response.data.duyurular);
    } catch (error) {
      console.error('Duyurular alınamadı:', error);
    }
  };

  const getStudent = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/ogrenci/${ogrNo}`);

      setStudent(response.data.user);


      console.log(response.data.user);

    } catch (error) {
      console.error('Error fetching student data:', error);
    }
  };

  useEffect(() => {
    getStudent();
    getDuyurular()
  }, [ogrNo]);

  return (
    <div className='mb-10'>
        <div className=' flex w-full items-center px-4 gap-x-2  mt-10'>
        <div className='w-2/3'>
        <TimelineCard></TimelineCard>
        </div>
<div className='w-1/3'>
<AttentionCard></AttentionCard>
</div>

        </div>
        <h6 className='font-semibold  text-xl ml-10 mt-4'>Duyurular</h6>
        <div className='flex items-start justify-around w-full px-4 gap-x-2   mt-2'>
        
<div className='w-8/12 space-y-5'>
  {
    console.log(duyurular,"duyurular")
  }
{duyurular.map((duyuru)=>(
  <AnnouncementsCard key={duyuru?.Id} title={duyuru?.Duyuru_basligi} content={duyuru?.Duyuru_aciklamasi}></AnnouncementsCard>

))}


</div>

<div className='w-3/12'>
<div className='flex items-center justify-between mb-3 mx-4'>
<h6 className='font-semibold  text-xl '>Mesajlar</h6>
<h6 className='font-semibold text-sm  '>Tümünü Gör</h6>
</div>
  <MessagesCard></MessagesCard>
</div>
        </div>
    </div>
  )
}
