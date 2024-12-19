import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/auth/ProtectedRoute';

// Auth Pages
import Login from '../pages/auth/Login';
import AdminLogin from '../pages/admin/Login';
import Signup from '../pages/auth/Signup';
import ForgotPassword from '../pages/auth/ForgotPassword';

// Public Pages
import Home from '../pages/Home';
import About from '../pages/About';
import Contact from '../pages/Contact';
import Programs from '../pages/Programs';
import Blog from '../pages/Blog';
import Donate from '../pages/Donate';

// Program Pages
import Education from '../pages/programs/Education';
import Health from '../pages/programs/Health';
import EconomicEmpowerment from '../pages/programs/EconomicEmpowerment';

// Protected Pages
import AdminDashboard from '../pages/admin/Dashboard';
import DonorDashboard from '../pages/donor/Dashboard';
import VolunteerDashboard from '../pages/volunteer/Dashboard';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/programs" element={<Programs />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/donate" element={<Donate />} />
      
      {/* Program Routes */}
      <Route path="/programs/education" element={<Education />} />
      <Route path="/programs/health" element={<Health />} />
      <Route path="/programs/economic-empowerment" element={<EconomicEmpowerment />} />

      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Protected Dashboard Routes */}
      <Route 
        path="/admin/*" 
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/donor/*" 
        element={
          <ProtectedRoute allowedRoles={['donor']}>
            <DonorDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/volunteer/*" 
        element={
          <ProtectedRoute allowedRoles={['volunteer']}>
            <VolunteerDashboard />
          </ProtectedRoute>
        } 
      />

      {/* Catch-all route for 404 */}
      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  );
};

export default AppRoutes;
