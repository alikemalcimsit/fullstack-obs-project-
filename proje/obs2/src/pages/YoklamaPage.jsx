import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import YoklamaTable from '../components/YoklamaTable';

export default function YoklamaPage() {
  const [student, setStudent] = useState(null);
  const [bolum, setBolum] = useState(null);
  const [dersler, setDersler] = useState(null);
  const [yoklama, setYoklama] = useState(null);

  const { ogrNo } = useParams();

  const getStudent = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/ogrenci/${ogrNo}`);
      setStudent(response.data.user);
    } catch (error) {
      console.error('Error fetching student data:', error);
    }
  };

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

  const getLesson = async () => {
    if (student) {
      try {
        const response3 = await axios.get(`http://localhost:5000/dersler/${student.BolumID}`);
        console.log(student.akademikDonem);

        // Akademik dönemi sayıya dönüştür
        const numericAkademikDonem = parseInt(student.akademikDonem, 10);

        const donemDersleri = response3.data.dersler.filter((ders) => ders.DonemID === numericAkademikDonem);
        setDersler(donemDersleri);
        console.log("response3", dersler);
      } catch (error) {
        console.error('Error fetching lesson data:', error);
      }
    }
  };

  const getYoklamabyLesson = async () => {
    try {
      if (dersler) {  // dersler değişkeni null değilse işleme devam et
        const response = await axios.get(`http://localhost:5000/yoklama/${ogrNo}`);
        setYoklama(response.data.user);
        console.log("yoklama",yoklama)
      }
    } catch (error) {
      console.error('Error fetching student data:', error);
    }
  };
  

  useEffect(() => {
    getStudent();
  }, []);

  useEffect(() => {
    getDepartment();
  }, [student]);

  useEffect(() => {
    getLesson();
  }, [bolum, student]); // bolum ve student bağımlılıkları eklendi

  useEffect(() => {
    getYoklamabyLesson()
  }, [dersler,bolum, student]); // bolum ve student bağımlılıkları eklendi

  console.log('student:', student);
  console.log('bolum:', bolum);
  console.log('dersler:', dersler);

  return (
    <div className='space-y-8 mt-20'>
      <h1 className='text-center text-3xl font-bold'>{bolum && bolum.BolumAdi}</h1>

      <div>
        {dersler ? (
          <YoklamaTable yoklama={yoklama} dersler={dersler} />
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
}
