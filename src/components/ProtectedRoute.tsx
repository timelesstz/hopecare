import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useFirebaseAuth } from '../context/FirebaseAuthContext';
import LoadingSpinner from './ui/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

/**
 * A component that protects routes by checking if the user is authenticated
 * and optionally if they have the required role.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const { isAuthenticated, user, loading, checkUserRole } = useFirebaseAuth();
  const location = useLocation();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    // Wait for authentication to complete
    if (!loading) {
      if (!isAuthenticated) {
        setAuthorized(false);
        return;
      }

      // If no specific role is required, just being authenticated is enough
      if (!requiredRole) {
        setAuthorized(true);
        return;
      }

      // Use the checkUserRole function from FirebaseAuthContext
      const hasRequiredRole = checkUserRole(requiredRole);
      setAuthorized(hasRequiredRole);
    }
  }, [isAuthenticated, user, loading, requiredRole, checkUserRole]);

  // Show loading spinner while checking authentication
  if (loading || authorized === null) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner size="large" color="primary" message="Checking authorization..." />
      </div>
    );
  }

  // Redirect to the appropriate login page based on the required role
  if (!isAuthenticated) {
    if (requiredRole === 'ADMIN') {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    } else if (requiredRole === 'DONOR') {
      return <Navigate to="/donor-login" state={{ from: location }} replace />;
    } else if (requiredRole === 'VOLUNTEER') {
      return <Navigate to="/volunteer-login" state={{ from: location }} replace />;
    } else {
      // Default to admin login if no specific role is required
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
  }

  // Redirect to unauthorized page if not authorized for this role
  if (!authorized) {
    return <Navigate to="/unauthorized" state={{ from: location, requiredRole }} replace />;
  }

  // Render the protected content
  return <>{children}</>;
};

export default ProtectedRoute; 