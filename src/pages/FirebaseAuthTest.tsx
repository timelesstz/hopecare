import React from 'react';
import { Container, Typography, Box, Button, Paper, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import FirebaseLoginForm from '../components/FirebaseLoginForm';
import FirestoreExample from '../components/FirestoreExample';
import { FirebaseAuthProvider, useFirebaseAuth } from '../context/FirebaseAuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Component to display user info when logged in
const UserInfo = () => {
  const { user, logout } = useFirebaseAuth();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Logged in as Firebase User
      </Typography>
      <Box sx={{ mb: 2 }}>
        <Typography variant="body1"><strong>Name:</strong> {user.name}</Typography>
        <Typography variant="body1"><strong>Email:</strong> {user.email}</Typography>
        <Typography variant="body1"><strong>Role:</strong> {user.role}</Typography>
        <Typography variant="body1"><strong>Status:</strong> {user.status}</Typography>
      </Box>
      <Button 
        variant="contained" 
        color="primary" 
        onClick={logout}
      >
        Logout
      </Button>
    </Paper>
  );
};

// Main content of the test page
const TestPageContent = () => {
  const { isAuthenticated } = useFirebaseAuth();
  const navigate = useNavigate();

  return (
    <>
      <Navbar />
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Firebase Authentication Test
        </Typography>
        <Typography variant="body1" paragraph>
          This page demonstrates the Firebase authentication functionality. You can use it to test the login process
          and verify that user data is correctly stored and retrieved from Firebase.
        </Typography>

        <Divider sx={{ my: 4 }} />

        {isAuthenticated ? (
          <>
            <UserInfo />
            <Divider sx={{ my: 4 }} />
            <FirestoreExample />
          </>
        ) : (
          <>
            <Typography variant="h5" gutterBottom>
              Sign in with Firebase
            </Typography>
            <FirebaseLoginForm 
              role="DONOR" 
              onSuccess={() => console.log('Login successful')} 
            />
          </>
        )}

        <Box sx={{ mt: 4 }}>
          <Button 
            variant="outlined" 
            color="primary" 
            onClick={() => navigate('/')}
          >
            Back to Home
          </Button>
        </Box>
      </Container>
      <Footer />
    </>
  );
};

// Wrapper component that provides the Firebase auth context
const FirebaseAuthTest = () => {
  return (
    <FirebaseAuthProvider>
      <TestPageContent />
    </FirebaseAuthProvider>
  );
};

export default FirebaseAuthTest; 