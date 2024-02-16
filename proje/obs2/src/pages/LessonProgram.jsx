import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function LessonProgram() {
  const [student, setStudent] = useState();
  const [ders, setDers] = useState([]);
  const [dersprogram, setDersProgram] = useState([]);

  const { ogrNo } = useParams();

  const getStudent = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/ogrenci/${ogrNo}`
      );
      setStudent(response.data.user);
      console.log("Student data:", response.data.user);
    } catch (error) {
      console.error("Error fetching student data:", error);
    }
  };

  const getStudentLesson = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/ogrenciders/${student.tcNo}`
      );
      setDers(response.data.user);
      console.log("Student lesson data:", response.data.user);
    } catch (error) {
      console.error("Error fetching student lesson data:", error);
    }
  };

  const getDersProgrami = async () => {
    try {
      const promises = ders.map(async (d) => {
        console.log("DersID:", d.DersID);
        const response = await axios.get(
          `http://localhost:5000/dersprogrami/${d.DersID}`
        );
        return response.data.user; // Assuming response.data is the actual data you need
      });
  
      const resolvedData = await Promise.all(promises);
  
  

  
      setDersProgram(resolvedData);
      console.log(dersprogram,"ders program")

    } catch (error) {
      console.error("Error fetching dersprogrami data:", error);
    }
  };
  useEffect(() => {
    getStudent();
  }, [ogrNo]);

  useEffect(() => {
    if (student) {
      getStudentLesson();
    }
  }, [student]);

  useEffect(() => {
    if (ders.length > 0) {
      getDersProgrami();
    }
  }, [ders]);

  useEffect(() => {
    console.log(dersprogram, "ders program");
  }, [dersprogram]);

  return (
    <div>
      <h1 className="text-center font-bold text-3xl  mt-20">Ders Programı</h1>
      {dersprogram.length > 0 && (
        <table className="w-11/12 bg-gray-300 mt-10 m-auto text-center text-black bg-white border border-gray-300">
               <thead>
            <tr>
              <th className="py-2 px-4 border-b">DersID</th>
              <th className="py-2 px-4 border-b">Gun</th>
              <th className="py-2 px-4 border-b">Saat</th>
              <th className="py-2 px-4 border-b">OgretmenID</th>
              <th className="py-2 px-4 border-b">SinifID</th>
            </tr>
          </thead>
          <tbody>
            {dersprogram.map((d) => (
              <tr key={d?.DersID}>
                <td className="py-2 px-4 border-b">{d[0]?.DersID}</td>
                <td className="py-2 px-4 border-b">{d[0]?.Gun}</td>
                <td className="py-2 px-4 border-b">{d[0]?.Saat}</td>
                <td className="py-2 px-4 border-b">{d[0]?.OgretmenID}</td>
                <td className="py-2 px-4 border-b">{d[0]?.SinifID}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}