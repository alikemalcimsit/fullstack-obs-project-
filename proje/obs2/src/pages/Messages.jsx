// ... (other imports and component definition)

import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AnnouncementsCard from "../components/AnnouncementsCard";

export default function Messages() {
    const { ogrNo } = useParams();
  
    const [mesajlar, setMesajlar] = useState([]);

    const [ogretmen, setOgretmen] = useState([]);
    const [student, setStudent] = useState();
    const [aliciogrenciID, setaliciogrenciID] = useState(null);

    const [aliciogretmenID, setaliciogretmenID] = useState(null);

    const [metin, setmetin] = useState();

  
    const getStudent = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/ogrenci/${ogrNo}`);

        setStudent(response.data.user);
        console.log(response.data.user);
      } catch (error) {
        console.error('Error fetching student data:', error);
      }
    };
  
    const getMesajlar = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/mesajlar/${student.tcNo}`);
        setMesajlar(response.data.user);
        console.log(response.data.user);
      } catch (error) {
        console.error('Error fetching messages data:', error);
      }
    };
  
    const getOgretmen = async () => {
        try {
          const currentOgretmenData = [...ogretmen]; // Copy the current state
          const newOgretmenData = [];
      
          for (const m of mesajlar) {
            const response = await axios.get(`http://localhost:5000/ogretmen/${m.GonderenOgretmenID}`);
            newOgretmenData.push(response.data.user);
          }
      
          const updatedOgretmenData = [...currentOgretmenData, ...newOgretmenData];
      
          setOgretmen(updatedOgretmenData);
          console.log(updatedOgretmenData);
        } catch (error) {
          console.error('Error fetching teacher data:', error);
        }
      };
      


      const postData = async () => {
        try {
          console.log("aliciogrenciID:", aliciogrenciID);
          console.log("aliciogretmenID:", aliciogretmenID);
          console.log("metin:", metin);
          console.log("gonderenOgrenciID:", student?.tcNo || "11111111111");
      
          const response = await axios.post('http://localhost:5000/mesajgonder', {
            "AliciOgrenciID": aliciogrenciID,
            "AliciOgretmenID": aliciogretmenID,
            "MesajMetni": metin,
            "GonderenOgretmenID": null,
            "GonderenOgrenciID": student?.tcNo || "11111111111"
          });
          await window.location.reload();
          console.log(response.data);
        } catch (error) {
          console.error('Error during POST request:', error);
        }
      };
      
  
    useEffect(() => {
      getStudent();
    }, [ogrNo]);
  
    useEffect(() => {
      if (student) {
        getMesajlar();
      }
    }, [student]);
  
    useEffect(() => {
      if (mesajlar.length > 0) {
        getOgretmen();
      }
    }, [mesajlar]);
  
    return (
        <div className="mx-20">
        <h1 className="text-center text-3xl  font-bold mt-10"> Mesaj Gönder</h1>
        <div className="">
          <div className="flex items-center  mb-10  mt-10 gap-x-10 justify-evenly w-full">
            <input
            onChange={(e)=>setaliciogrenciID(e.target.value)}
              type="text"
              className="p-3 w-10/12 border-2 shadow-xl border-black rounded-xl"
              placeholder="Alıcı Öğrenci ID"
            ></input>
            <input
              onChange={(e)=>setaliciogretmenID(e.target.value)}
              type="text"
              className="p-3 w-10/12 border-2 shadow-xl border-black rounded-xl"
              placeholder="Alıcı Öğretmen ID"
            ></input>
          </div>
          <textarea
          onChange={(e)=>setmetin(e.target.value)}
            type=" text"
            className="p-3 w-full border-2 h-40 shadow-xl border-black rounded-xl"
            placeholder="Mesaj Metni"
          ></textarea>
          <button onClick={postData} className="py-3 px-20 bg-red-400 flex items-center text-white hover:bg-red-700 m-auto mt-5 rounded-xl ">Gönder</button>
        </div>
  
        <h1 className="text-center text-3xl  mb-10 font-bold mt-10"> Mesajlar</h1>
        <div className="">
        {mesajlar.map((m, i) => (
  <div className="mt-5 mb-5" key={i}>
    <AnnouncementsCard
      title={ogretmen[i]?.[0]?.OgretmenAdi || ""} // Added nullish coalescing
      content={m.MesajMetni}
    />
  </div>
))}


        </div>
      </div>
    );
  }
  