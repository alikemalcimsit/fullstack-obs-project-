import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import LessonTable from '../components/LessonTable';

export default function LessonList() {
  const [student, setStudent] = useState();
  const [bolum, setBolum] = useState(null);
  const [dersler, setDersler] = useState();
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
        setDersler(response3.data.dersler);
      } catch (error) {
        console.error('Error fetching lesson data:', error);
      }
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
  }, [bolum]);

  console.log(student);

  return (
    <div className=' space-y-8 mt-20'>
<h1 className='text-center text-3xl font-bold'>{bolum && bolum.BolumAdi}</h1>
      {bolum &&
        Array.from({ length: bolum.DönemSayisi }, (_, index) => (
          <div key={index}>
            <LessonTable index={index+1} dersler={dersler ? dersler.filter(lesson => lesson.DonemID === index + 1) : []} />
          </div>
        ))}
    </div>
  );
}
