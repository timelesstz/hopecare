import { useState, ChangeEvent, FormEvent, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useFirebaseAuth } from '../../context/FirebaseAuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Button } from '../../components/ui/Button';
import { TextField, Paper, Typography, Box, Alert, InputAdornment, IconButton, Container, CircularProgress } from '@mui/material';
import { Lock, Mail, Eye, EyeOff, Shield, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { toast } from 'react-hot-toast';

const AdminLogin = () => {
  const { login, error: authError, loading, user } = useFirebaseAuth();
  const { mode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);

  // Check if user is already logged in
  useEffect(() => {
    if (user) {
      console.log('User already logged in:', user);
      console.log('User role:', user.role);
      
      // Check if user is admin
      const isAdmin = user.role === 'ADMIN' || 
                     (user.customClaims && (
                       user.customClaims.role === 'ADMIN' || 
                       user.customClaims.isAdmin === true
                     ));
      
      console.log('Is admin?', isAdmin);
      
      if (isAdmin) {
        const from = location.state?.from?.pathname || '/admin/dashboard';
        console.log('Redirecting admin to:', from);
        navigate(from);
      } else {
        console.log('User is not an admin, showing error');
        setError('You do not have admin privileges');
        toast.error('You do not have admin privileges');
      }
    }
  }, [user, navigate, location]);

  // Set default values for admin login in development mode
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      setEmail('admin@hopecaretz.org');
      setPassword('Hope@admin2');
    }
  }, []);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError(null);
    return true;
  };

  const validatePassword = (password: string): boolean => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    }
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    setPasswordError(null);
    return true;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    
    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    console.log(`Attempting login (attempt #${loginAttempts + 1}) with:`, email);
    setError(null);
    setLoginAttempts(prev => prev + 1);
    setIsSubmitting(true);
    
    try {
      await login(email, password, 'ADMIN');
      
      // Note: Successful login will trigger the useEffect above
      // which will redirect to the dashboard if the user is an admin
    } catch (err) {
      console.error('Login error:', err);
      
      // Handle specific error cases
      if (err instanceof Error) {
        if (err.message.includes('auth/user-not-found') || err.message.includes('auth/wrong-password')) {
          setError('Invalid email or password');
          toast.error('Invalid email or password');
        } else if (err.message.includes('auth/too-many-requests')) {
          setError('Too many failed login attempts. Please try again later.');
          toast.error('Too many failed login attempts. Please try again later.');
        } else {
          setError(err.message);
          toast.error(err.message);
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
        toast.error('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (emailError) validateEmail(e.target.value);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (passwordError) validatePassword(e.target.value);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={`min-h-screen flex flex-col ${mode === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-50'}`}>
      <Navbar />
      
      <Container maxWidth="sm" className="flex-grow flex items-center justify-center py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full"
        >
          <Paper 
            elevation={3} 
            className={`p-8 rounded-lg ${mode === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
            sx={{ 
              p: 4, 
              borderRadius: 2,
              bgcolor: mode === 'dark' ? 'rgba(30, 41, 59, 0.8)' : 'background.paper',
              boxShadow: mode === 'dark' ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.1)'
            }}
          >
            <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Shield size={40} className="text-rose-600 mb-2" />
              <Typography 
                component="h1" 
                variant="h5" 
                sx={{ 
                  fontWeight: 'bold',
                  color: mode === 'dark' ? 'white' : 'text.primary'
                }}
              >
                Admin Login
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  mt: 1, 
                  textAlign: 'center',
                  color: mode === 'dark' ? 'gray.400' : 'text.secondary'
                }}
              >
                Sign in to access the HopeCare admin dashboard
              </Typography>
            </Box>

            <AnimatePresence>
              {(error || authError) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <Alert 
                    severity="error" 
                    sx={{ mb: 3 }}
                    icon={<AlertCircle size={20} />}
                  >
                    {error || authError}
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            <form ref={formRef} onSubmit={handleSubmit}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={handleEmailChange}
                error={!!emailError}
                helperText={emailError}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Mail size={20} className={mode === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
                    },
                    '&:hover fieldset': {
                      borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.25)',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : undefined,
                  },
                  '& .MuiInputBase-input': {
                    color: mode === 'dark' ? 'white' : undefined,
                  }
                }}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={handlePasswordChange}
                error={!!passwordError}
                helperText={passwordError}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock size={20} className={mode === 'dark' ? 'text-gray-400' : 'text-gray-500'} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={togglePasswordVisibility}
                        edge="end"
                        size="small"
                        sx={{ color: mode === 'dark' ? 'gray.400' : 'gray.500' }}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 3,
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
                    },
                    '&:hover fieldset': {
                      borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.25)' : 'rgba(0, 0, 0, 0.25)',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : undefined,
                  },
                  '& .MuiInputBase-input': {
                    color: mode === 'dark' ? 'white' : undefined,
                  }
                }}
              />
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Link 
                  to="/admin/forgot-password"
                  className={`text-sm ${mode === 'dark' ? 'text-rose-400 hover:text-rose-300' : 'text-rose-600 hover:text-rose-800'}`}
                >
                  Forgot password?
                </Link>
              </Box>
              
              <Button
                type="submit"
                fullWidth
                variant="primary"
                disabled={loading || isSubmitting}
                className="py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-medium text-base rounded-lg"
              >
                {loading || isSubmitting ? (
                  <>
                    <CircularProgress size={24} className="text-white mr-2" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </Button>
            </form>
          </Paper>
        </motion.div>
      </Container>
      
      <Footer />
    </div>
  );
};

export default AdminLogin;
