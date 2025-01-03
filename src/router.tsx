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
import { useAuth } from './context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: 'ADMIN' | 'DONOR' | 'VOLUNTEER';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    // Redirect to appropriate auth page based on role
    switch (requiredRole) {
      case 'ADMIN':
        return <Navigate to="/admin/login" state={{ from: location }} replace />;
      case 'DONOR':
        return <Navigate to="/donor-auth" state={{ from: location }} replace />;
      case 'VOLUNTEER':
        return <Navigate to="/volunteer" state={{ from: location }} replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  // Check if user has the required role
  if (user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AppRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<PageLayout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="donate" element={<Donate />} />
        <Route path="events" element={<Events />} />
        <Route path="blog" element={<Blog />} />
        <Route path="blog/:id" element={<BlogPost />} />
        <Route path="volunteer" element={<Volunteer />} />
        <Route path="contact" element={<Contact />} />
        <Route path="donation-success" element={<DonationSuccess />} />
        <Route path="donation-cancel" element={<DonationCancel />} />
        <Route path="donor-dashboard" element={
          <ProtectedRoute requiredRole="DONOR">
            <DonorDashboard />
          </ProtectedRoute>
        } />
        <Route path="donor-auth" element={<DonorAuth />} />
        <Route path="admin/login" element={<AdminLogin />} />
        <Route path="admin/dashboard" element={
          <ProtectedRoute requiredRole="ADMIN">
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="programs">
          <Route path="education" element={<Education />} />
          <Route path="health" element={<Health />} />
          <Route path="economic-empowerment" element={<EconomicEmpowerment />} />
        </Route>
        <Route path="projects" element={<Projects />} />
        <Route path="volunteer-dashboard" element={
          <ProtectedRoute requiredRole="VOLUNTEER">
            <VolunteerDashboard />
          </ProtectedRoute>
        } />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
};

export default AppRouter;
