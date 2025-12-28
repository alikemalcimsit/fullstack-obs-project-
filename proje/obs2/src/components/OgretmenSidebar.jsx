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
import { FaAngleDown, FaChevronRight, FaGraduationCap, FaClipboardList, FaUsers, FaCalendarAlt } from "react-icons/fa";
import { MdLogout } from "react-icons/md";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function OgretmenSidebar() {
  const [open, setOpen] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        setLoading(true);
        // localStorage'dan öğretmen bilgilerini al
        const currentTeacher = JSON.parse(localStorage.getItem('ogretmen'));
        if (currentTeacher) {
          setTeacher(currentTeacher);
        }
      } catch (error) {
        console.error('Öğretmen bilgileri alınamadı:', error);
        navigate('/ogretmen-login');
      } finally {
        setLoading(false);
      }
    };

    fetchTeacherData();
  }, [navigate]);

  useEffect(() => {
    const path = location.pathname;
    if (path.includes('/ogretmen-dashboard')) {
      setOpen(1);
    } else if (path.includes('/dersler')) {
      setOpen(2);
    } else if (path.includes('/program')) {
      setOpen(3);
    } else if (path.includes('/yoklama')) {
      setOpen(4);
    } else if (path.includes('/ogrenciler')) {
      setOpen(5);
    } else if (path.includes('/mesajlar')) {
      setOpen(6);
    }
  }, [location.pathname]);

  const handleOpen = (value) => {
    setOpen(open === value ? 0 : value);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('ogretmen');
    localStorage.removeItem('userType');
    navigate('/ogretmen-login');
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
          {teacher?.unvan} {teacher?.isim} {teacher?.soyad}
        </h4>
        <span className="text-white/70 text-sm mt-1 text-center">
          {teacher?.bolum?.bolumAdi || "Bölüm Bilgisi Yok"}
        </span>
        <span className="text-white/50 text-xs mt-1">
          {teacher?.email}
        </span>
      </div>

      <List>
        <Accordion open={open === 1}>
          <ListItem 
            className={`p-0 ${isActive('/ogretmen-dashboard') || location.pathname === '/ogretmen-dashboard' && !location.search ? 'bg-white/10' : ''}`} 
            onClick={() => navigate('/ogretmen-dashboard')} 
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

        <Accordion
          open={open === 2}
          icon={<FaAngleDown className={`mx-auto h-4 w-4 transition-transform ${open === 2 ? "rotate-180 text-white" : "text-white/50"}`} />}
        >
          <ListItem className="p-0" selected={open === 2}>
            <AccordionHeader onClick={() => handleOpen(2)} className="border-b-0 p-3">
              <ListItemPrefix>
                <FaGraduationCap className={`h-5 w-5 ${open === 2 ? "text-white" : "text-white/50"}`} />
              </ListItemPrefix>
              <Typography className={`mr-auto ml-2 ${open === 2 ? "text-white" : "text-white/50"} font-normal`}>
                Derslerim
              </Typography>
            </AccordionHeader>
          </ListItem>
          <AccordionBody className="py-1">
            <List className={`p-0 ${open === 2 ? "visible" : "hidden"}`}>
              <ListItem onClick={() => navigate('/ogretmen-dashboard?tab=dersler')} className={location.search.includes('tab=dersler') ? 'bg-white/10' : ''}>
                <ListItemPrefix><FaChevronRight color="white" className="h-3 w-5" /></ListItemPrefix>
                <Typography color="white" className="mr-auto ml-2 font-normal">Ders Listesi</Typography>
              </ListItem>
              <ListItem onClick={() => navigate('/ogretmen-dashboard?tab=notlar')} className={location.search.includes('tab=notlar') ? 'bg-white/10' : ''}>
                <ListItemPrefix><FaChevronRight color="white" className="h-3 w-5" /></ListItemPrefix>
                <Typography color="white" className="mr-auto ml-2 font-normal">Not Girişi</Typography>
              </ListItem>
              <ListItem onClick={() => navigate('/ogretmen-dashboard?tab=sinavlar')} className={location.search.includes('tab=sinavlar') ? 'bg-white/10' : ''}>
                <ListItemPrefix><FaChevronRight color="white" className="h-3 w-5" /></ListItemPrefix>
                <Typography color="white" className="mr-auto ml-2 font-normal">Sınavlar</Typography>
              </ListItem>
            </List>
          </AccordionBody>
        </Accordion>

        <Accordion open={open === 3}>
          <ListItem 
            onClick={() => navigate('/ogretmen-dashboard?tab=program')} 
            className={`p-0 ${location.search.includes('tab=program') ? 'bg-white/10' : ''}`} 
            selected={open === 3}
          >
            <AccordionHeader onClick={() => handleOpen(3)} className="border-b-0 p-3">
              <ListItemPrefix>
                <FaCalendarAlt className={`h-5 w-5 ${open === 3 ? "text-white" : "text-white/50"}`} />
              </ListItemPrefix>
              <Typography color="white" className={`mr-auto ml-2 ${open === 3 ? "text-white" : "text-white/50"} font-normal`}>
                Ders Programı
              </Typography>
            </AccordionHeader>
          </ListItem>
        </Accordion>

        <Accordion open={open === 4}>
          <ListItem 
            onClick={() => navigate('/ogretmen-dashboard?tab=yoklama')} 
            className={`p-0 ${location.search.includes('tab=yoklama') ? 'bg-white/10' : ''}`} 
            selected={open === 4}
          >
            <AccordionHeader onClick={() => handleOpen(4)} className="border-b-0 p-3">
              <ListItemPrefix>
                <FaClipboardList className={`h-5 w-5 ${open === 4 ? "text-white" : "text-white/50"}`} />
              </ListItemPrefix>
              <Typography color="white" className={`mr-auto ml-2 ${open === 4 ? "text-white" : "text-white/50"} font-normal`}>
                Yoklama
              </Typography>
            </AccordionHeader>
          </ListItem>
        </Accordion>

        <Accordion open={open === 5}>
          <ListItem 
            onClick={() => navigate('/ogretmen-dashboard?tab=ogrenciler')} 
            className={`p-0 ${location.search.includes('tab=ogrenciler') ? 'bg-white/10' : ''}`} 
            selected={open === 5}
          >
            <AccordionHeader onClick={() => handleOpen(5)} className="border-b-0 p-3">
              <ListItemPrefix>
                <FaUsers className={`h-5 w-5 ${open === 5 ? "text-white" : "text-white/50"}`} />
              </ListItemPrefix>
              <Typography color="white" className={`mr-auto ml-2 ${open === 5 ? "text-white" : "text-white/50"} font-normal`}>
                Öğrenciler
              </Typography>
            </AccordionHeader>
          </ListItem>
        </Accordion>

        <Accordion open={open === 6}>
          <ListItem 
            onClick={() => navigate('/ogretmen-dashboard?tab=mesajlar')} 
            className={`p-0 ${location.search.includes('tab=mesajlar') ? 'bg-white/10' : ''}`} 
            selected={open === 6}
          >
            <AccordionHeader onClick={() => handleOpen(6)} className="border-b-0 p-3">
              <ListItemPrefix>
                <IoMdMail className={`h-5 w-5 ${open === 6 ? "text-white" : "text-white/50"}`} />
              </ListItemPrefix>
              <Typography color="white" className={`mr-auto ml-2 ${open === 6 ? "text-white" : "text-white/50"} font-normal`}>
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
