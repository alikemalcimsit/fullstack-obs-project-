import avatar from "../assets/avatar.png";
import logo from "../assets/logo.png"
import {
  Card,
  Typography,
  List,
  ListItem,
  ListItemPrefix,
 
  Accordion,
  AccordionHeader,
  AccordionBody,
} from "@material-tailwind/react";

import { GoHomeFill, GoPersonFill } from "react-icons/go";
import { IoMdMail } from "react-icons/io";


import { FaAngleDown, FaUser } from "react-icons/fa6";
import { FaChevronRight } from "react-icons/fa";

import { FaGraduationCap } from "react-icons/fa";
import { FaUsers } from "react-icons/fa";
import { IoMdHelp } from "react-icons/io";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

export default function Sidebar() {
  const [open, setOpen] = useState(0);
  const navigate = useNavigate();
  const [student, setStudent] = useState();
const [bolum,setBolum] = useState()
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

  useEffect(() => {
    getStudent();
  }, []);

  useEffect(() => {
    getDepartment();
  }, [student]); 


  const handleOpen = (value) => {
    setOpen(open === value ? 0 : value);
  };

  return (
    <Card className=" h-full min-h-screen rounded-none  bg-[#1C2534] w-full max-w-[20rem] p-4  ">
      <div className="mb-2 p-4   flex flex-col items-center justify-center">
        <img alt="avatar" className="rounded-full h-36 object-cover w-36" src={avatar}></img>
        <h4 className="text-white mt-6 text-2xl">{student?.isim + " "+student?.soyad}</h4>
        <span className="text-white text-sm mt-1 ">
         {bolum?.BolumAdi}
        </span>
      </div>

      <List>
        <Accordion           open={open === 1}
>
          <ListItem className="p-0" onClick={()=>navigate(`/${ogrNo}`)} selected={open === 1}>
            <AccordionHeader
              onClick={() => handleOpen(1)}
              className="border-b-0 p-3"
            >
              <ListItemPrefix>
                <GoHomeFill
                  className={`h-5 w-5  ${
                    open === 1 ? "text-white" : "text-white/50"
                  } `}
                />
              </ListItemPrefix>
              <Typography
                color="white"
                className={`mr-auto ml-2  ${
                  open === 1 ? "text-white" : "text-white/50"
                }  font-normal`}
              >
                Anasayfa
              </Typography>
            </AccordionHeader>
          </ListItem>
        </Accordion>
        <Accordion         open={open === 2}
>
          <ListItem  onClick={()=>navigate(`/${ogrNo}/personalinformation`)} className="p-0" selected={open === 2}>
            <AccordionHeader
              onClick={() => handleOpen(2)}
              className="border-b-0 p-3"
            >
              <ListItemPrefix>
                <GoPersonFill
                  className={`h-5 w-5  ${
                    open === 2 ? "text-white" : "text-white/50"
                  } `}
                />
              </ListItemPrefix>
              <Typography
                color="white"
                className={`mr-auto ml-2  ${
                  open === 2 ? "text-white" : "text-white/50"
                }  font-normal`}
              >
                Kişisel Bilgiler
              </Typography>
            </AccordionHeader>
          </ListItem>
        </Accordion>
         
 
        <Accordion
          open={open === 3}
          icon={
            <FaAngleDown
              className={`mx-auto h-4 w-4 transition-transform ${
                open === 3 ? "rotate-180 text-white" : "text-white/50"
              }`}
            />
          }
        >
          <ListItem className="p-0" selected={open === 3}>
            <AccordionHeader
              onClick={() => handleOpen(3)}
              className="border-b-0 p-3"
            >
              <ListItemPrefix>
                <FaGraduationCap
                  className={`h-5 w-5 ${
                    open === 3 ? "text-white" : "text-white/50"
                  } `}
                />
              </ListItemPrefix>
              <Typography
                className={`mr-auto ml-2  ${
                  open === 3 ? "text-white" : "text-white/50"
                }  font-normal`}
              >
                Öğrenim
              </Typography>
            </AccordionHeader>
          </ListItem>
          <AccordionBody className="py-1">
            <List  className={`p-0 ${open === 3 ? "visible" : "hidden"}`}>
             
           
              <ListItem  onClick={()=>navigate(`/${ogrNo}/derslist`)}>
                <ListItemPrefix>
                  <FaChevronRight color="white" className="h-3 w-5" />
                </ListItemPrefix>
                <Typography color="white" className="mr-auto ml-2 font-normal">
                  Ders Alma Listesi
                </Typography>
              </ListItem>{" "}
              <ListItem onClick={()=>navigate(`/${ogrNo}/dersprogram`)} >
                <ListItemPrefix>
                  <FaChevronRight color="white" className="h-3 w-5" />
                </ListItemPrefix>
                <Typography color="white" className="mr-auto ml-2 font-normal">
                  Ders Programı
                </Typography>
              </ListItem>{" "}
              <ListItem>
                <ListItemPrefix>
                  <FaChevronRight color="white" className="h-3 w-5" />
                </ListItemPrefix>
                <Typography color="white" className="mr-auto ml-2 font-normal">
                  Sınavlar
                </Typography>
              </ListItem>{" "}
              <ListItem onClick={()=>navigate(`/${ogrNo}/yoklama`)}>
                <ListItemPrefix>
                  <FaChevronRight color="white" className="h-3 w-5" />
                </ListItemPrefix>
                <Typography color="white" className="mr-auto ml-2 font-normal">
                  Yoklama Bilgisi
                </Typography>
              </ListItem>
            </List>
          </AccordionBody>
        </Accordion>
        <Accordion           open={open === 4}
>
<Accordion           open={open === 1}
>
          <ListItem onClick={()=>navigate(`/${ogrNo}/mesaj`)} className="p-0" selected={open === 4}>
            <AccordionHeader
              onClick={() => handleOpen(4)}
              className="border-b-0 p-3"
            >
              <ListItemPrefix>
                <IoMdMail
                  className={`h-5 w-5  ${
                    open === 4 ? "text-white" : "text-white/50"
                  } `}
                />
              </ListItemPrefix>
              <Typography
                color="white"
                className={`mr-auto ml-2  ${
                  open === 4 ? "text-white" : "text-white/50"
                }  font-normal`}
              >
                Mesaj
              </Typography>
            </AccordionHeader>
          </ListItem>
        </Accordion>
        </Accordion>
   
        
        <ListItem>
          <button onClick={()=>navigate("/")} className="bg-red-800 hover:bg-red-600 px-5 py-3 rounded-xl text-white w-full">
            Çıkış Yap
          </button>
        </ListItem>
        <ListItem>
          <img className="mt-96 w-40 m-auto items-center justify-center h-40 object-cover" src={logo}></img>
        </ListItem>
      </List>
    </Card>
  );
}