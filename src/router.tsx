import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import PageLayout from './components/PageLayout';
import Home from './pages/Home';
import About from './pages/About';
import Donate from './pages/Donate';
import Events from './pages/Events';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Volunteer from './pages/Volunteer';
import Contact from './pages/Contact';
import DonationSuccess from './pages/donation/DonationSuccess';
import DonationCancel from './pages/donation/DonationCancel';
import DonorDashboard from './pages/DonorDashboard';
import DonorAuth from './pages/DonorAuth';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import Education from './pages/programs/Education';
import Health from './pages/programs/Health';
import EconomicEmpowerment from './pages/programs/EconomicEmpowerment';
import Projects from './pages/Projects';
import NotFound from './pages/NotFound';
import VolunteerDashboard from './pages/VolunteerDashboard';
import VolunteerAuth from './pages/VolunteerAuth';
import ResetPassword from './pages/ResetPassword';
import ForgotPassword from './pages/ForgotPassword';
import FirebaseAuthTest from './pages/FirebaseAuthTest';
import FirebaseProtectedRoute from './components/auth/FirebaseProtectedRoute';
import { useFirebaseAuth } from './context/FirebaseAuthContext';

// Login router component to redirect based on user role
const Login = () => {
  const { isAuthenticated, user } = useFirebaseAuth();
  
  if (isAuthenticated) {
    const role = user?.role;
    if (role === 'DONOR') {
      return <Navigate to="/donor/dashboard" replace />;
    } else if (role === 'VOLUNTEER') {
      return <Navigate to="/volunteer-dashboard" replace />;
    } else if (role === 'ADMIN') {
      return <Navigate to="/admin/dashboard" replace />;
    }
  }
  
  return <Navigate to="/donor-login" replace />;
};

const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PageLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/donate" element={<Donate />} />
        <Route path="/events" element={<Events />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:id" element={<BlogPost />} />
        <Route path="/volunteer" element={<Volunteer />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/programs/education" element={<Education />} />
        <Route path="/programs/health" element={<Health />} />
        <Route path="/programs/economic-empowerment" element={<EconomicEmpowerment />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/donation/success" element={<DonationSuccess />} />
        <Route path="/donation/cancel" element={<DonationCancel />} />
        <Route path="/firebase-auth-test" element={<FirebaseAuthTest />} />
      </Route>

      {/* Authentication routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/donor-login" element={<DonorAuth />} />
      <Route path="/volunteer-login" element={<VolunteerAuth />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Protected routes */}
      <Route path="/donor/dashboard" element={
        <FirebaseProtectedRoute requiredRole="DONOR">
          <PageLayout>
            <DonorDashboard />
          </PageLayout>
        </FirebaseProtectedRoute>
      } />
      
      <Route path="/volunteer-dashboard" element={
        <FirebaseProtectedRoute requiredRole="VOLUNTEER">
          <PageLayout>
            <VolunteerDashboard />
          </PageLayout>
        </FirebaseProtectedRoute>
      } />
      
      <Route path="/admin/dashboard" element={
        <FirebaseProtectedRoute requiredRole="ADMIN">
          <PageLayout>
            <AdminDashboard />
          </PageLayout>
        </FirebaseProtectedRoute>
      } />

      {/* Fallback route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRouter;
