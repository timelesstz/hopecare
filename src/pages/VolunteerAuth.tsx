import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirebaseAuth } from '../context/FirebaseAuthContext';
import { Box, Paper, Typography, Alert, Button, Container, Grid, AlertTitle } from '@mui/material';
import VolunteerLoginForm from '../components/auth/VolunteerLoginForm';
import VolunteerRegistrationForm from '../components/auth/VolunteerRegistrationForm';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const VolunteerAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { isAuthenticated, login, register, clearError } = useFirebaseAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/volunteer-dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (data: any) => {
    setLoading(true);
    setError("");
    try {
      await login(data.email, data.password, "VOLUNTEER");
      // The login function updates the auth state, which will trigger the useEffect above
      // to redirect to the dashboard if successful
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (data: any) => {
    setLoading(true);
    setError("");
    try {
      const userData = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        role: 'volunteer',
        skills: data.skills,
        availability: data.availability,
        interests: data.interests
      };
      
      await register(data.email, data.password, userData);
      // If successful, the user will be automatically logged in and redirected
    } catch (err: any) {
      setError(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-16">
        <Container maxWidth="lg" sx={{ py: 8 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Box sx={{ maxWidth: 500, mx: 'auto' }}>
                <Typography variant="h4" component="h1" gutterBottom>
                  Volunteer Portal
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  {isLogin 
                    ? "Sign in to access your volunteer dashboard and manage your activities." 
                    : "Join our volunteer community and make a difference in people's lives."}
                </Typography>

                {error && (
                  <Alert severity="error" sx={{ mb: 3 }}>
                    <AlertTitle>Error</AlertTitle>
                    {error}
                  </Alert>
                )}

                <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
                  {isLogin ? (
                    <>
                      <VolunteerLoginForm onSubmit={handleLogin} isLoading={loading} />
                      <Box sx={{ mt: 3, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          Don't have an account?
                        </Typography>
                        <Button 
                          onClick={() => setIsLogin(false)}
                          sx={{ mt: 1 }}
                        >
                          Register as a volunteer
                        </Button>
                      </Box>
                    </>
                  ) : (
                    <>
                      <VolunteerRegistrationForm onSubmit={handleRegister} isLoading={loading} />
                      <Box sx={{ mt: 3, textAlign: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          Already have an account?
                        </Typography>
                        <Button 
                          onClick={() => setIsLogin(true)}
                          sx={{ mt: 1 }}
                        >
                          Sign in
                        </Button>
                      </Box>
                    </>
                  )}
                </Paper>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Box
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  bgcolor: 'primary.main',
                  color: 'primary.contrastText',
                  borderRadius: 2,
                  p: 6,
                }}
              >
                <Typography variant="h3" component="h2" gutterBottom align="center">
                  Make an Impact
                </Typography>
                <Typography variant="h6" paragraph align="center">
                  Join our community of dedicated volunteers who are making a difference every day.
                </Typography>
                <Box sx={{ mt: 4 }}>
                  <Typography variant="body1" paragraph align="center">
                    • Lead community programs and events
                  </Typography>
                  <Typography variant="body1" paragraph align="center">
                    • Share your skills and expertise
                  </Typography>
                  <Typography variant="body1" paragraph align="center">
                    • Connect with like-minded individuals
                  </Typography>
                  <Typography variant="body1" paragraph align="center">
                    • Create meaningful change in your community
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </main>
      <Footer />
    </div>
  );
};

export default VolunteerAuth;