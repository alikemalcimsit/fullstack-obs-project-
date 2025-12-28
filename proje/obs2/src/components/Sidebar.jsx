import avatar from "../assets/avatar.png";
import logo from "../assets/logo.png";
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
import { FaAngleDown } from "react-icons/fa6";
import { FaChevronRight, FaGraduationCap, FaClipboardList } from "react-icons/fa";
import { MdLogout } from "react-icons/md";
import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ogrenciService, authService } from "../services/api";

export default function Sidebar() {
  const [open, setOpen] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const { ogrNo } = useParams();

  useEffect(() => {
    const fetchStudentData = async () => {
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

    fetchStudentData();
  }, [ogrNo, navigate]);

  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/personalinformation')) {
      setOpen(2);
    } else if (path.includes('/derslist') || path.includes('/dersprogram') || 
               path.includes('/yoklama') || path.includes('/derssecimi')) {
      setOpen(3);
    } else if (path.includes('/notlar') || path.includes('/transkript')) {
      setOpen(5);
    } else if (path.includes('/mesaj')) {
      setOpen(4);
    } else if (path === `/${ogrNo}`) {
      setOpen(1);
    }
  }, [location.pathname, ogrNo]);

  const handleOpen = (value) => {
    setOpen(open === value ? 0 : value);
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  if (loading) {
    return (
      <Card className="h-full min-h-screen rounded-none bg-[#1C2534] w-full max-w-[20rem] p-4">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full min-h-screen rounded-none bg-[#1C2534] w-full max-w-[20rem] p-4">
      <div className="mb-2 p-4 flex flex-col items-center justify-center">
        <img 
          alt="avatar" 
          className="rounded-full h-36 object-cover w-36 border-4 border-white/20" 
          src={avatar}
        />
        <h4 className="text-white mt-6 text-2xl font-semibold text-center">
          {student?.isim} {student?.soyad}
        </h4>
        <span className="text-white/70 text-sm mt-1 text-center">
          {student?.bolum?.bolumAdi || "Bölüm Bilgisi Yok"}
        </span>
        <span className="text-white/50 text-xs mt-1">
          {student?.ogrenciNo}
        </span>
      </div>

      <List>
        <Accordion open={open === 1}>
          <ListItem 
            className={`p-0 ${isActive(`/${ogrNo}`) ? 'bg-white/10' : ''}`} 
            onClick={() => navigate(`/${ogrNo}`)} 
            selected={open === 1}
          >
            <AccordionHeader onClick={() => handleOpen(1)} className="border-b-0 p-3">
              <ListItemPrefix>
                <GoHomeFill className={`h-5 w-5 ${open === 1 ? "text-white" : "text-white/50"}`} />
              </ListItemPrefix>
              <Typography color="white" className={`mr-auto ml-2 ${open === 1 ? "text-white" : "text-white/50"} font-normal`}>
                Anasayfa
              </Typography>
            </AccordionHeader>
          </ListItem>
        </Accordion>

        <Accordion open={open === 2}>
          <ListItem 
            onClick={() => navigate(`/${ogrNo}/personalinformation`)} 
            className={`p-0 ${isActive(`/${ogrNo}/personalinformation`) ? 'bg-white/10' : ''}`} 
            selected={open === 2}
          >
            <AccordionHeader onClick={() => handleOpen(2)} className="border-b-0 p-3">
              <ListItemPrefix>
                <GoPersonFill className={`h-5 w-5 ${open === 2 ? "text-white" : "text-white/50"}`} />
              </ListItemPrefix>
              <Typography color="white" className={`mr-auto ml-2 ${open === 2 ? "text-white" : "text-white/50"} font-normal`}>
                Kişisel Bilgiler
              </Typography>
            </AccordionHeader>
          </ListItem>
        </Accordion>

        <Accordion
          open={open === 3}
          icon={<FaAngleDown className={`mx-auto h-4 w-4 transition-transform ${open === 3 ? "rotate-180 text-white" : "text-white/50"}`} />}
        >
          <ListItem className="p-0" selected={open === 3}>
            <AccordionHeader onClick={() => handleOpen(3)} className="border-b-0 p-3">
              <ListItemPrefix>
                <FaGraduationCap className={`h-5 w-5 ${open === 3 ? "text-white" : "text-white/50"}`} />
              </ListItemPrefix>
              <Typography className={`mr-auto ml-2 ${open === 3 ? "text-white" : "text-white/50"} font-normal`}>
                Öğrenim
              </Typography>
            </AccordionHeader>
          </ListItem>
          <AccordionBody className="py-1">
            <List className={`p-0 ${open === 3 ? "visible" : "hidden"}`}>
              <ListItem onClick={() => navigate(`/${ogrNo}/derssecimi`)} className={isActive(`/${ogrNo}/derssecimi`) ? 'bg-white/10' : ''}>
                <ListItemPrefix><FaChevronRight color="white" className="h-3 w-5" /></ListItemPrefix>
                <Typography color="white" className="mr-auto ml-2 font-normal">Ders Seçimi</Typography>
              </ListItem>
              <ListItem onClick={() => navigate(`/${ogrNo}/derslist`)} className={isActive(`/${ogrNo}/derslist`) ? 'bg-white/10' : ''}>
                <ListItemPrefix><FaChevronRight color="white" className="h-3 w-5" /></ListItemPrefix>
                <Typography color="white" className="mr-auto ml-2 font-normal">Ders Listesi</Typography>
              </ListItem>
              <ListItem onClick={() => navigate(`/${ogrNo}/dersprogram`)} className={isActive(`/${ogrNo}/dersprogram`) ? 'bg-white/10' : ''}>
                <ListItemPrefix><FaChevronRight color="white" className="h-3 w-5" /></ListItemPrefix>
                <Typography color="white" className="mr-auto ml-2 font-normal">Ders Programı</Typography>
              </ListItem>
              <ListItem onClick={() => navigate(`/${ogrNo}/yoklama`)} className={isActive(`/${ogrNo}/yoklama`) ? 'bg-white/10' : ''}>
                <ListItemPrefix><FaChevronRight color="white" className="h-3 w-5" /></ListItemPrefix>
                <Typography color="white" className="mr-auto ml-2 font-normal">Yoklama Bilgisi</Typography>
              </ListItem>
            </List>
          </AccordionBody>
        </Accordion>

        <Accordion
          open={open === 5}
          icon={<FaAngleDown className={`mx-auto h-4 w-4 transition-transform ${open === 5 ? "rotate-180 text-white" : "text-white/50"}`} />}
        >
          <ListItem className="p-0" selected={open === 5}>
            <AccordionHeader onClick={() => handleOpen(5)} className="border-b-0 p-3">
              <ListItemPrefix>
                <FaClipboardList className={`h-5 w-5 ${open === 5 ? "text-white" : "text-white/50"}`} />
              </ListItemPrefix>
              <Typography className={`mr-auto ml-2 ${open === 5 ? "text-white" : "text-white/50"} font-normal`}>
                Notlar
              </Typography>
            </AccordionHeader>
          </ListItem>
          <AccordionBody className="py-1">
            <List className={`p-0 ${open === 5 ? "visible" : "hidden"}`}>
              <ListItem onClick={() => navigate(`/${ogrNo}/notlar`)} className={isActive(`/${ogrNo}/notlar`) ? 'bg-white/10' : ''}>
                <ListItemPrefix><FaChevronRight color="white" className="h-3 w-5" /></ListItemPrefix>
                <Typography color="white" className="mr-auto ml-2 font-normal">Not Görüntüleme</Typography>
              </ListItem>
              <ListItem onClick={() => navigate(`/${ogrNo}/transkript`)} className={isActive(`/${ogrNo}/transkript`) ? 'bg-white/10' : ''}>
                <ListItemPrefix><FaChevronRight color="white" className="h-3 w-5" /></ListItemPrefix>
                <Typography color="white" className="mr-auto ml-2 font-normal">Transkript</Typography>
              </ListItem>
              <ListItem onClick={() => navigate(`/${ogrNo}/agno`)} className={isActive(`/${ogrNo}/agno`) ? 'bg-white/10' : ''}>
                <ListItemPrefix><FaChevronRight color="white" className="h-3 w-5" /></ListItemPrefix>
                <Typography color="white" className="mr-auto ml-2 font-normal">AGNO Hesaplama</Typography>
              </ListItem>
            </List>
          </AccordionBody>
        </Accordion>

        <Accordion open={open === 4}>
          <ListItem 
            onClick={() => navigate(`/${ogrNo}/mesaj`)} 
            className={`p-0 ${isActive(`/${ogrNo}/mesaj`) ? 'bg-white/10' : ''}`} 
            selected={open === 4}
          >
            <AccordionHeader onClick={() => handleOpen(4)} className="border-b-0 p-3">
              <ListItemPrefix>
                <IoMdMail className={`h-5 w-5 ${open === 4 ? "text-white" : "text-white/50"}`} />
              </ListItemPrefix>
              <Typography color="white" className={`mr-auto ml-2 ${open === 4 ? "text-white" : "text-white/50"} font-normal`}>
                Mesajlar
              </Typography>
            </AccordionHeader>
          </ListItem>
        </Accordion>

        <ListItem className="mt-4">
          <button 
            onClick={handleLogout} 
            className="bg-red-800 hover:bg-red-600 px-5 py-3 rounded-xl text-white w-full flex items-center justify-center gap-2 transition-colors"
          >
            <MdLogout className="h-5 w-5" />
            Çıkış Yap
          </button>
        </ListItem>

        <ListItem className="mt-auto">
          <img className="w-32 m-auto items-center justify-center h-32 object-contain opacity-50" src={logo} alt="Logo" />
        </ListItem>
      </List>
    </Card>
  );
}