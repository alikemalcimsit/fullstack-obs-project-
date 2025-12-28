import React, { useEffect, useState } from 'react'
import avatar from "../assets/avatar.png"
import { IoMail } from "react-icons/io5";
import { FaPhoneAlt } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { PiStudentFill } from "react-icons/pi";
import ChangePassword from './ChangePassword';
import { useParams, useNavigate } from 'react-router-dom';
import { ogrenciService, authService } from '../services/api';


export default function PersonalInformation() {

    const { ogrNo } = useParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showPasswordChange, setShowPasswordChange] = useState(false);

    useEffect(() => {
      const fetchStudent = async () => {
        try {
          setLoading(true);
          // Önce localStorage'dan kullanıcıyı al
          const currentUser = authService.getCurrentUser();
          if (currentUser) {
            setStudent(currentUser);
          } else if (ogrNo) {
            // Eğer localStorage'da yoksa API'den al
            const response = await ogrenciService.getByOgrNo(ogrNo);
            setStudent(response);
          }
        } catch (error) {
          console.error('Öğrenci bilgileri alınamadı:', error);
          if (error.response?.status === 401) {
            authService.logout();
            navigate('/');
          }
        } finally {
          setLoading(false);
        }
      };

      fetchStudent();
    }, [ogrNo, navigate]);

    const formatDate = (dateString) => {
      if (!dateString) return '-';
      return new Date(dateString).toLocaleDateString('tr-TR');
    };

    if (loading) {
      return (
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (!student) {
      return (
        <div className="text-center text-gray-500 py-8">
          <p>Öğrenci bilgileri bulunamadı.</p>
        </div>
      );
    } 
    

  return (
    <div className=' pb-12 mb-8 '>
    <div className='flex items-center justify-center gap-x-12  pt-10'>
      <img alt='avatar' className='h-32 w-32 rounded-full object-cover object-center' src={student?.fotograf || avatar}></img>
           
       <div>
       <h1 className='text-2xl mb-1 font-semibold'>{student?.isim + " " + student?.soyad}</h1>
      <h2>{student?.bolum?.bolumAdi || 'Bölüm Bilgisi Yok'}</h2>
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
    <span>{student?.ogrNo || '-'}</span>
        </div>
        <div className='w-1/3  bg-[#545454] text-white py-2 px-4 rounded-xl flex items-center justify-start gap-x-5'>
           <FaPhoneAlt className='ml-2' size={25}></FaPhoneAlt>
    <span>{student?.telNo || '-'}</span>
        </div>
      </div>
        <div className='w-2/3 m-auto bg-[#545454] text-white py-2 px-4 rounded-xl flex items-center justify-start gap-x-5'>
           <FaLocationDot className='ml-2' size={25}></FaLocationDot>
            <span>{student?.adres || '-'}</span>
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
      <span>{student?.statu || 'Aktif'}</span>
        </div>
        <div className='w-2/5  bg-[#545454] text-white py-2 px-4 rounded-xl flex items-center justify-start gap-x-5'>
    <span>Şube : </span>
      <span>{student?.sube || '-'}</span>
        </div>
     </div>
       <div className='flex items-center justify-center m-auto gap-x-3'>
       <div className='w-2/5  bg-[#545454] text-white py-2 px-4 rounded-xl flex items-center justify-start gap-x-5'>
           <span>Dönem : </span>
      <span>{student?.okuduguDonem ? `${student.okuduguDonem}. Dönem` : '-'}</span>
        </div>
        <div className='w-2/5  bg-[#545454] text-white py-2 px-4 rounded-xl flex items-center justify-start gap-x-5'>
        <span>Fakülte : </span>
            <span>{student?.bolum?.fakulte?.fakulteAdi || '-'}</span>
        </div>
       </div>
      <div className='flex items-center justify-center m-auto gap-x-3'>
      <div className='w-2/5 bg-[#545454] text-white py-2 px-4 rounded-xl flex items-center justify-start gap-x-5'>
        <span>Mezuniyet Tarihi : </span>
            <span>{formatDate(student?.mezuniyetTarihi)}</span>
        </div>
        <div className='w-2/5  bg-[#545454] text-white py-2 px-4 rounded-xl flex items-center justify-start gap-x-5'>
        <span>Kayıt Tarihi : </span>
            <span>{formatDate(student?.kayitTarihi)}</span>
        </div>
      </div>
       <div className='flex items-center justify-center m-auto gap-x-3'>
       <div className='w-2/5  bg-[#545454] text-white py-2 px-4 rounded-xl flex items-center justify-start gap-x-5'>
        <span>AGNO : </span>
      <span>{student?.agno != null ? student.agno.toFixed(2) : '-'}</span>
        </div>
        <div className='w-2/5  bg-[#545454] text-white py-2 px-4 rounded-xl flex items-center justify-start gap-x-5'>
        <span>TC Kimlik No : </span>
            <span>{student?.tcNo || '-'}</span>
        </div>
       </div>
      <div className='flex items-center justify-center gap-x-3  '>
      <div className='w-2/5  bg-[#545454] text-white py-2 px-4 rounded-xl flex items-center justify-start gap-x-5'>
        <span>Doğum Tarihi : </span>
            <span>{formatDate(student?.dogumTarihi)}</span>
        </div>
        <div className='w-2/5  bg-[#545454] text-white py-2 px-4 rounded-xl flex items-center justify-start gap-x-5 '>
        <span>Cinsiyet : </span>
            <span>{student?.cinsiyet || '-'}</span>
        </div>
      </div>
      <div className='flex items-center justify-center gap-x-3'>
        <div className='w-2/5  bg-[#545454] text-white py-2 px-4 rounded-xl flex items-center justify-start gap-x-5'>
          <span>Akademik Yıl : </span>
          <span>{student?.akademikYil || '-'}</span>
        </div>
        <div className='w-2/5  bg-[#545454] text-white py-2 px-4 rounded-xl flex items-center justify-start gap-x-5 '>
          <span>Geliş Şekli / Puan : </span>
          <span>{student?.gelisSekli ? `${student.gelisSekli} / ${student.gelisPuani ?? '-'}` : '-'}</span>
        </div>
      </div>
      <div className='w-2/3 m-auto bg-[#545454] text-white py-2 px-4 rounded-xl flex items-center justify-start gap-x-5 mt-3'>
        <span>Geldiği Okul : </span>
        <span>{student?.geldigiOkul || '-'}</span>
      </div>
       </div>

       {/* Şifre Değiştir Butonu */}
       <div className='flex justify-center mt-8'>
         <button
           onClick={() => setShowPasswordChange(!showPasswordChange)}
           className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl transition-colors'
         >
           {showPasswordChange ? 'Kapat' : 'Şifre Değiştir'}
         </button>
       </div>

       {showPasswordChange && (
         <div className='w-2/3 m-auto mt-6'>
           <ChangePassword />
         </div>
       )}
    </div>
  )
}
