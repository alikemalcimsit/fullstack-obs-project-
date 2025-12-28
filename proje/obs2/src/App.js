import Login from "./pages/Login";
import Register from "./pages/Register";
import PageLayout from "./layouts/PageLayout";
import HomePage from "./pages/HomePage";
import PersonalPage from "./pages/PersonalPage";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LessonList from "./pages/LessonList";
import LessonProgram from "./pages/LessonProgram";
import YoklamaPage from "./pages/YoklamaPage";
import Messages from "./pages/Messages";
import NotlarPage from "./pages/NotlarPage";
import TranskriptPage from "./pages/TranskriptPage";
import DersSecimPage from "./pages/DersSecimPage";
import AgnoCalculator from "./pages/AgnoCalculator";
import OgretmenLogin from "./pages/OgretmenLogin";
import OgretmenDashboard from "./pages/OgretmenDashboard";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import { authService } from "./services/api";

// Protected Route Component - Öğrenci
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// Protected Route Component - Öğretmen
const ProtectedOgretmenRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const userType = localStorage.getItem('userType');
  
  if (!token || userType !== 'ogretmen') {
    return <Navigate to="/ogretmen-login" replace />;
  }
  
  return children;
};

// Protected Route Component - Admin
const ProtectedAdminRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const userType = localStorage.getItem('userType');
  
  if (!token || userType !== 'admin') {
    return <Navigate to="/admin-login" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route exact path='/' element={<Login />} />
        <Route exact path='/login' element={<Login />} />
        <Route exact path='/register' element={<Register />} />
        <Route exact path='/ogretmen-login' element={<OgretmenLogin />} />
        <Route exact path='/admin-login' element={<AdminLogin />} />

        {/* Öğretmen Routes */}
        <Route exact path='/ogretmen-dashboard' element={
          <ProtectedOgretmenRoute>
            <OgretmenDashboard />
          </ProtectedOgretmenRoute>
        } />

        {/* Admin Routes */}
        <Route exact path='/admin-dashboard' element={
          <ProtectedAdminRoute>
            <AdminDashboard />
          </ProtectedAdminRoute>
        } />
        
        {/* Protected Öğrenci Routes */}
        <Route exact path='/:ogrNo' element={
          <ProtectedRoute>
            <PageLayout><HomePage /></PageLayout>
          </ProtectedRoute>
        } />
        <Route exact path='/:ogrNo/personalinformation' element={
          <ProtectedRoute>
            <PageLayout><PersonalPage /></PageLayout>
          </ProtectedRoute>
        } />
        <Route exact path='/:ogrNo/derslist' element={
          <ProtectedRoute>
            <PageLayout><LessonList /></PageLayout>
          </ProtectedRoute>
        } />
        <Route exact path='/:ogrNo/dersprogram' element={
          <ProtectedRoute>
            <PageLayout><LessonProgram /></PageLayout>
          </ProtectedRoute>
        } />
        <Route exact path='/:ogrNo/yoklama' element={
          <ProtectedRoute>
            <PageLayout><YoklamaPage /></PageLayout>
          </ProtectedRoute>
        } />
        <Route exact path='/:ogrNo/mesaj' element={
          <ProtectedRoute>
            <PageLayout><Messages /></PageLayout>
          </ProtectedRoute>
        } />
        <Route exact path='/:ogrNo/notlar' element={
          <ProtectedRoute>
            <PageLayout><NotlarPage /></PageLayout>
          </ProtectedRoute>
        } />
        <Route exact path='/:ogrNo/agno' element={
          <ProtectedRoute>
            <PageLayout><AgnoCalculator /></PageLayout>
          </ProtectedRoute>
        } />
        <Route exact path='/:ogrNo/transkript' element={
          <ProtectedRoute>
            <PageLayout><TranskriptPage /></PageLayout>
          </ProtectedRoute>
        } />
        <Route exact path='/:ogrNo/derssecimi' element={
          <ProtectedRoute>
            <PageLayout><DersSecimPage /></PageLayout>
          </ProtectedRoute>
        } />
        
        {/* 404 Route */}
        <Route path='*' element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
