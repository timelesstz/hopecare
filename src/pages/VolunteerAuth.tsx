import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Box, Paper, Typography, Alert, Button } from '@mui/material';
import { useTheme } from '../context/ThemeContext';
import { Handshake } from '@mui/icons-material';
import VolunteerLoginForm from '../components/auth/VolunteerLoginForm';
import VolunteerRegistrationForm from '../components/auth/VolunteerRegistrationForm';

const VolunteerAuth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const { mode } = useTheme();

  const handleLogin = async (data: any) => {
    setIsLoading(true);
    setError(null);
    try {
      await login(data.email, data.password, 'VOLUNTEER');
      navigate('/volunteer-dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (data: any) => {
    setIsLoading(true);
    setError(null);
    try {
      await register({
        ...data,
        role: 'VOLUNTEER',
        interests: data.interests || [],
        preferredCommunication: data.preferredCommunication || 'email'
      });
      navigate('/volunteer-dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: mode === 'dark' ? 'background.default' : 'grey.100',
        px: 3
      }}
    >
      <Paper
        elevation={3}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: isLogin ? 400 : 600,
          bgcolor: mode === 'dark' ? 'background.paper' : 'common.white'
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Handshake sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
          <Typography variant="h5" component="h1" gutterBottom>
            {isLogin ? 'Volunteer Sign In' : 'Become a Volunteer'}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {isLogin ? (
          <VolunteerLoginForm onSubmit={handleLogin} isLoading={isLoading} />
        ) : (
          <VolunteerRegistrationForm onSubmit={handleRegister} isLoading={isLoading} />
        )}

        <Box sx={{ mt: 3, textAlign: 'center' }}>
          <Button
            onClick={() => {
              setIsLogin(!isLogin);
              setError(null);
            }}
            color="primary"
          >
            {isLogin ? 'Need to create an account?' : 'Already have an account?'}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default VolunteerAuth;