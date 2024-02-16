import React from 'react';
import DoughnutChart from './DoughnutChart';
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";



export default function AttentionCard() {
  
    
  return (
   <div className='bg-white h-[350px] shadow-lg rounded-3xl'>
<div className='w-full flex flex-col items-center h-full'>
<div className='flex items-baseline justify-center'>
<FaAngleLeft size={20}></FaAngleLeft>
<h1  className='mt-6 mb-5 text-xl mx-2 -translate-y-1 font-semibold'>Anayasa</h1>
<FaAngleRight size={20}></FaAngleRight>
</div>
<div className=''>
<DoughnutChart></DoughnutChart>

</div>
</div>
   </div>
  );
}
