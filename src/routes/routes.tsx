import React from 'react';
import PageLayout from '../components/PageLayout';
import Home from '../pages/Home';
import About from '../pages/About';
import Projects from '../pages/Projects';
import Events from '../pages/Events';
import Blog from '../pages/Blog';
import BlogPost from '../pages/BlogPost';
import Donate from '../pages/Donate';
import DonationSuccess from '../pages/donation/DonationSuccess';
import DonationCancel from '../pages/donation/DonationCancel';
import Volunteer from '../pages/Volunteer';
import VolunteerDashboard from '../pages/VolunteerDashboard';
import DonorDashboard from '../pages/DonorDashboard';
import DonorAuth from '../pages/DonorAuth';
import AdminLogin from '../pages/admin/Login';
import AdminDashboard from '../pages/admin/Dashboard';
import ContentEditor from '../components/admin/ContentEditor';
import MediaLibrary from '../components/admin/MediaLibrary';
import UserManagement from '../components/admin/UserManagement';
import Analytics from '../components/admin/Analytics';
import Education from '../pages/programs/Education';
import Health from '../pages/programs/Health';
import EconomicEmpowerment from '../pages/programs/EconomicEmpowerment';
import NotFound from '../pages/NotFound';
import Contact from '../pages/Contact';
import VerifyEmail from '../pages/admin/VerifyEmail';
import CheckEmail from '../pages/admin/CheckEmail';

export const routes = [
  {
    path: '/',
    element: <PageLayout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/about', element: <About /> },
      { path: '/projects', element: <Projects /> },
      { path: '/events', element: <Events /> },
      { path: '/blog', element: <Blog /> },
      { path: '/blog/:id', element: <BlogPost /> },
      { path: '/donate', element: <Donate /> },
      { path: '/donation-success', element: <DonationSuccess /> },
      { path: '/donation-cancel', element: <DonationCancel /> },
      { path: '/volunteer', element: <Volunteer /> },
      { path: '/volunteer-dashboard', element: <VolunteerDashboard /> },
      { path: '/donor-dashboard', element: <DonorDashboard /> },
      { path: '/donor-auth', element: <DonorAuth /> },
      { path: '/contact', element: <Contact /> },
      
      // Program routes
      { path: '/programs/economic-empowerment', element: <EconomicEmpowerment /> },
      { path: '/programs/education', element: <Education /> },
      { path: '/programs/health', element: <Health /> },
      
      // Admin routes
      { path: '/admin', element: <AdminDashboard /> },
      { path: '/admin/login', element: <AdminLogin /> },
      { path: '/admin/register', element: <Register /> },
      { path: '/admin/verify-email', element: <VerifyEmail /> },
      { path: '/admin/check-email', element: <CheckEmail /> },
      { path: '/admin/content', element: <ContentEditor /> },
      { path: '/admin/media', element: <MediaLibrary /> },
      { path: '/admin/users', element: <UserManagement /> },
      { path: '/admin/analytics', element: <Analytics /> },
      
      // 404 route
      { path: '*', element: <NotFound /> }
    ]
  }
];
