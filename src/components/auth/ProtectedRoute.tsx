import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    // Redirect to login page but save the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // If user is logged in but doesn't have the required role,
    // redirect to their appropriate dashboard based on their role
    const dashboardRoutes = {
      admin: '/admin',
      donor: '/donor',
      volunteer: '/volunteer'
    };
    
    return <Navigate to={dashboardRoutes[user.role]} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
