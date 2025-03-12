import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useFirebaseAuth } from '../../context/FirebaseAuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'ADMIN' | 'DONOR' | 'VOLUNTEER';
  redirectPath?: string;
  isAuthenticated?: boolean;
}

const FirebaseProtectedRoute = ({ children, requiredRole, redirectPath = "/login", isAuthenticated: propIsAuthenticated }: ProtectedRouteProps) => {
  const { user, loading } = useFirebaseAuth();
  const location = useLocation();
  
  // Use the isAuthenticated prop if provided, otherwise check if user exists
  const isAuthenticated = propIsAuthenticated !== undefined ? propIsAuthenticated : !!user;

  // Check if user is admin
  const isAdmin = user && (
    user.role === 'ADMIN' || 
    (user.customClaims && (
      user.customClaims.role === 'ADMIN' || 
      user.customClaims.isAdmin === true
    )) ||
    user.email === 'admin@hopecaretz.org'
  );

  // Debug information
  useEffect(() => {
    console.log('Protected Route:', location.pathname);
    console.log('Is Authenticated:', isAuthenticated);
    console.log('User:', user);
    console.log('Is Admin:', isAdmin);
    console.log('Required Role:', requiredRole);
    console.log('Loading:', loading);
    console.log('Redirect Path:', redirectPath);
  }, [isAuthenticated, user, isAdmin, loading, location.pathname, redirectPath, requiredRole]);

  // If still loading, show a loading spinner
  if (loading) {
    console.log('Still loading authentication state...');
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading...
        </Typography>
      </Box>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to:', redirectPath);
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // If role is required but user doesn't have the required role, redirect to appropriate page
  if (requiredRole && user) {
    console.log('Required role:', requiredRole);
    
    if (requiredRole === 'ADMIN' && !isAdmin) {
      console.log('User is not an admin, redirecting to:', redirectPath);
      return <Navigate to={redirectPath} state={{ from: location }} replace />;
    }
  }

  // If authenticated and has required role (or no role required), render children
  console.log('Authentication successful, rendering protected content');
  return <>{children}</>;
};

export default FirebaseProtectedRoute; 