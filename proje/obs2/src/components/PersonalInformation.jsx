import React, { useEffect, useState } from 'react'
import avatar from "../assets/avatar.png"
import { IoMail } from "react-icons/io5";
import { FaPhoneAlt } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { PiStudentFill } from "react-icons/pi";
import ChangePassword from './ChangePassword';
import { useParams } from 'react-router-dom';
import axios from 'axios';


export default function PersonalInformation() {

    const { ogrNo } = useParams();
    const [student, setStudent] = useState();
    const [bolum,setBolum] = useState()

    const getStudent = async () => {
        try {
          const response = await axios.get(`http://localhost:5000/ogrenci/${ogrNo}`);
    
          setStudent(response.data.user);
    
    
        } catch (error) {
          console.error('Error fetching student data:', error);
        }
      };
      useEffect(() => {
        getStudent();
  
      }, [ogrNo]);

      const getDepartment = async () => {
        if (student) {
          try {
            const response2 = await axios.get(`http://localhost:5000/bolumler/${student.BolumID}`);
            setBolum(response2.data.bolum);
          } catch (error) {
            console.error('Error fetching department data:', error);
          }
        }
      };
    

      useEffect(() => {
        getDepartment();
      }, [student]); 
    

  return (
    <div className=' pb-12 mb-8 '>
        <div className='flex items-center justify-center gap-x-12  pt-10'>
            <img alt='avatar' className='h-32 object-cover object-center' src={avatar}></img>
           
           <div>
           <h1 className='text-2xl mb-1 font-semibold'>{student?.isim + " " + student?.soyad}</h1>
            <h2>{bolum?.BolumAdi}</h2>
           </div>
        </div>
        <div className='w-1/2 m-auto mt-4  flex items-center'>
            <div className='bg-[#1C2534] px-2 text-base text-center rounded-xl text-white w-1/2'>
                Kişisel Bilgiler
            </div>
            <div className='border-b-2 border-[#1C2534] w-1/2'></div>
        </div>
       <div className='space-y-3 mt-6'>
      <div className='flex items-center justify-center gap-x-2'>
      <div className='w-1/3  bg-[#545454] text-white py-2 px-4 rounded-xl flex items-center justify-start gap-x-5'>
      <PiStudentFill className='ml-2' size={25}></PiStudentFill>
            <span>{student?.ogrNo}</span>
        </div>
        <div className='w-1/3  bg-[#545454] text-white py-2 px-4 rounded-xl flex items-center justify-start gap-x-5'>
           <FaPhoneAlt className='ml-2' size={25}></FaPhoneAlt>
            <span>{student?.telNo}</span>
        </div>
      </div>
        <div className='w-2/3 m-auto bg-[#545454] text-white py-2 px-4 rounded-xl flex items-center justify-start gap-x-5'>
           <FaLocationDot className='ml-2' size={25}></FaLocationDot>
            <span>{student?.adress}</span>
        </div>
        <div className='w-2/3 m-auto bg-[#545454] text-white py-2 px-4 rounded-xl flex items-center justify-start gap-x-5'>
           
            <IoMail className='ml-2' size={25}></IoMail>
            <span>{student?.email}</span>
        </div>
       </div>
       <div className='w-1/2 m-auto mt-6  flex items-center'>
            <div className='bg-[#1C2534] px-2 text-base text-center rounded-xl text-white w-1/2'>
                Okul Bilgileri
            </div>
            <div className='border-b-2 border-[#1C2534] w-1/2'></div>
        </div>
       <div className='space-y-3 mt-6 '>
     <div className='flex items-center justify-center m-auto gap-x-3'>
     <div className='w-2/5  bg-[#545454] text-white py-2 px-4 rounded-xl flex items-center justify-start gap-x-5'>
          <span>Statü : </span>
            <span>{student?.statu}</span>
        </div>
        <div className='w-2/5  bg-[#545454] text-white py-2 px-4 rounded-xl flex items-center justify-start gap-x-5'>
        <span>Okuduğu Dönem : </span>
            <span>{student?.okuduguDonem}</span>
        </div>
     </div>
       <div className='flex items-center justify-center m-auto gap-x-3'>
       <div className='w-2/5  bg-[#545454] text-white py-2 px-4 rounded-xl flex items-center justify-start gap-x-5'>
           <span>Geldiği Okul : </span>
            <span>{student?.geldigiOkul}</span>
        </div>
        <div className='w-2/5  bg-[#545454] text-white py-2 px-4 rounded-xl flex items-center justify-start gap-x-5'>
        <span>Akademik Dönem : </span>
            <span>{student?.akademikDonem}</span>
        </div>
       </div>
      <div className='flex items-center justify-center m-auto gap-x-3'>
      <div className='w-2/5 bg-[#545454] text-white py-2 px-4 rounded-xl flex items-center justify-start gap-x-5'>
        <span>Mezuniyet Tarihi : </span>
            <span>{student?.mezuniyetTarihi === null  ? "-"  : student?.mezuniyetTarihi}</span>
        </div>
        <div className='w-2/5  bg-[#545454] text-white py-2 px-4 rounded-xl flex items-center justify-start gap-x-5'>
        <span>Kayıt Tarihi : </span>
            <span>{student?.kayitTarihi}</span>
        </div>
      </div>
       <div className='flex items-center justify-center m-auto gap-x-3'>
       <div className='w-2/5  bg-[#545454] text-white py-2 px-4 rounded-xl flex items-center justify-start gap-x-5'>
        <span>Akademik Ortalaması : </span>
            <span>{student?.agno}</span>
        </div>
        <div className='w-2/5  bg-[#545454] text-white py-2 px-4 rounded-xl flex items-center justify-start gap-x-5'>
        <span>Geliş Şekli : </span>
            <span>{student?.gelisSekli}</span>
        </div>
       </div>
      <div className='flex items-center justify-center gap-x-3  '>
      <div className='w-2/5  bg-[#545454] text-white py-2 px-4 rounded-xl flex items-center justify-start gap-x-5'>
        <span>Şube : </span>
            <span>{student?.sube}</span>
        </div>
        <div className='w-2/5  bg-[#545454] text-white py-2 px-4 rounded-xl flex items-center justify-start gap-x-5 '>
        <span>Giriş Puanı : </span>
            <span>{student?.gelisPuani}</span>
        </div>
      </div>
       </div>

    </div>
  )
}
