import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useFirebaseAuth } from '../../context/FirebaseAuthContext';
import { Box, CircularProgress, Typography } from '@mui/material';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'ADMIN' | 'DONOR' | 'VOLUNTEER';
}

const FirebaseProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { isAuthenticated, user, loading } = useFirebaseAuth();
  const location = useLocation();

  // If still loading, show a loading spinner
  if (loading) {
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
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If role is required but user doesn't have it, redirect to appropriate page
  if (requiredRole && user?.role !== requiredRole) {
    if (user?.role === 'DONOR') {
      return <Navigate to="/donor/dashboard" replace />;
    } else if (user?.role === 'VOLUNTEER') {
      return <Navigate to="/volunteer-dashboard" replace />;
    } else if (user?.role === 'ADMIN') {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  // If authenticated and has required role (or no role required), render children
  return <>{children}</>;
};

export default FirebaseProtectedRoute; 