import React, { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import PageLayout from './components/PageLayout';
import { useAuth } from './contexts/AuthContext';

import AdminLayout from './components/layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/ui/LoadingSpinner';

// Loading component
const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <LoadingSpinner size="large" color="primary" message="Loading..." />
  </div>
);

// Lazy-loaded components
const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Donate = lazy(() => import('./pages/Donate'));
const Events = lazy(() => import('./pages/Events'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const Volunteer = lazy(() => import('./pages/Volunteer'));
const Contact = lazy(() => import('./pages/Contact'));
const DonationSuccess = lazy(() => import('./pages/donation/success'));
const DonationCancel = lazy(() => import('./pages/donation/DonationCancel'));
const DonorDashboard = lazy(() => import('./pages/DonorDashboard'));
const DonorAuth = lazy(() => import('./pages/DonorAuth'));
const AdminLogin = lazy(() => import('./pages/admin/Login'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const Education = lazy(() => import('./pages/programs/Education'));
const Health = lazy(() => import('./pages/programs/Health'));
const EconomicEmpowerment = lazy(() => import('./pages/programs/EconomicEmpowerment'));
const Projects = lazy(() => import('./pages/Projects'));
const NotFound = lazy(() => import('./pages/NotFound'));
const VolunteerDashboard = lazy(() => import('./pages/VolunteerDashboard'));
const VolunteerAuth = lazy(() => import('./pages/VolunteerAuth'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));

const Unauthorized = lazy(() => import('./pages/Unauthorized'));

// Admin components
const AdminContentEditor = lazy(() => import('./components/admin/ContentEditor'));
const AdminMediaLibrary = lazy(() => import('./components/admin/MediaLibrary'));
const AdminUserManagement = lazy(() => import('./components/admin/UserManagement'));
const AdminAnalytics = lazy(() => import('./components/admin/Analytics'));
const AdminDonationsManagement = lazy(() => import('./components/admin/DonationsManagement'));
const AdminEventsManagement = lazy(() => import('./components/admin/EventsManagement'));
const AdminVolunteersManagement = lazy(() => import('./components/admin/VolunteersManagement'));

// New Admin Pages
const AdminEvents = lazy(() => import('./pages/admin/Events'));
const AdminSettings = lazy(() => import('./pages/admin/Settings'));
const AdminAdmins = lazy(() => import('./pages/admin/users/Admins'));
const AdminVolunteers = lazy(() => import('./pages/admin/users/Volunteers'));
const AdminDonors = lazy(() => import('./pages/admin/users/Donors'));

const AppRouter = () => {
  const { user, loading, getUserData } = useAuth();
  const location = useLocation();
  const isAuthenticated = !!user;
  
  // Helper functions for role-based routing
  const isAdmin = () => {
    const userData = getUserData();
    return userData?.role === 'admin';
  };

  // Debug user info - removed console logs for production

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Main public routes */}
        <Route path="/" element={<PageLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="donate" element={<Donate />} />
          <Route path="events" element={<Events />} />
          <Route path="blog" element={<Blog />} />
          <Route path="blog/:id" element={<BlogPost />} />
          <Route path="volunteer" element={<Volunteer />} />
          <Route path="contact" element={<Contact />} />
          <Route path="donation/success" element={<DonationSuccess />} />
          <Route path="donation/cancel" element={<DonationCancel />} />
          <Route path="programs/education" element={<Education />} />
          <Route path="programs/health" element={<Health />} />
          <Route path="programs/economic-empowerment" element={<EconomicEmpowerment />} />
          <Route path="projects" element={<Projects />} />
          <Route path="donor-login" element={<DonorAuth />} />
          <Route path="volunteer-login" element={<VolunteerAuth />} />
          <Route path="reset-password" element={<ResetPassword />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          
          <Route path="unauthorized" element={<Unauthorized />} />
          
          {/* Protected routes */}
          <Route 
            path="donor-dashboard/*" 
            element={
              <ProtectedRoute requiredRole="DONOR">
                <DonorDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="volunteer-dashboard/*" 
            element={
              <ProtectedRoute requiredRole="VOLUNTEER">
                <VolunteerDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route path="*" element={<NotFound />} />
        </Route>
        
        {/* Admin login route */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="admin-login" element={<Navigate to="/admin/login" replace />} />
        
        {/* Admin routes with AdminLayout */}
        <Route 
          path="/admin/*" 
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="content" element={<AdminContentEditor />} />
          <Route path="media" element={<AdminMediaLibrary />} />
          
          {/* User Management Routes */}
          <Route path="users" element={<AdminUserManagement />} />
          <Route path="users/admins" element={<AdminAdmins />} />
          <Route path="users/volunteers" element={<AdminVolunteers />} />
          <Route path="users/donors" element={<AdminDonors />} />
          
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="donations" element={<AdminDonationsManagement />} />
          
          {/* New Routes */}
          <Route path="events" element={<AdminEvents />} />
          <Route path="settings" element={<AdminSettings />} />
          
          <Route path="" element={<Navigate to="/admin/dashboard" replace />} />
        </Route>

        {/* Admin dashboard direct route */}
        <Route 
          path="/admin-dashboard" 
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <Navigate to="/admin/dashboard" replace />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Suspense>
  );
};

export default AppRouter;
