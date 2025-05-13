import { useState, ChangeEvent, FormEvent, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from "../../contexts/AuthContext";
import { Button } from '../../components/ui/Button';
import { TextField, Paper, Typography, Box, Alert, InputAdornment, IconButton, Container, CircularProgress, Divider, Chip } from '@mui/material';
import { Lock, Mail, Eye, EyeOff, Shield, AlertCircle, HelpCircle, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';

const AdminLogin = () => {
  const { login, logout, error: authError, loading, user, clearError } = useAuth();
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
    const checkAdminStatus = async () => {
      if (user) {
        console.log('User already logged in:', user);
        try {
          // Get user data from Supabase
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('role')
            .eq('id', user.id)
            .single();
          
          if (userError) throw userError;
          
          if (userData) {
            console.log('User role from Supabase:', userData.role);
            
            // Check if user is admin (case insensitive check)
            const isAdmin = userData.role?.toLowerCase() === 'admin';
            
            console.log('Is admin?', isAdmin);
            
            if (isAdmin) {
              const from = location.state?.from?.pathname || '/admin/dashboard';
              console.log('Redirecting admin to:', from);
              navigate(from);
            } else {
              console.log('User is not an admin, showing error');
              setError('You do not have admin privileges');
              toast.error('You do not have admin privileges');
              // Log out the non-admin user
              await logout();
            }
          } else {
            console.log('User document not found in Supabase');
            setError('User profile not found');
            toast.error('User profile not found');
          }
        } catch (err) {
          console.error('Error checking admin status:', err);
          setError('Error verifying admin privileges');
          toast.error('Error verifying admin privileges');
        }
      }
    };
    
    checkAdminStatus();
  }, [user, navigate, location, logout]);

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
    clearError();
    setError(null);
    
    // Validate form fields
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    
    if (!isEmailValid || !isPasswordValid) {
      return;
    }
    
    setIsSubmitting(true);
    console.log('Attempting login with:', email);
    
    try {
      // Direct Supabase login to bypass any potential issues in the AuthContext
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        throw error;
      }
      
      if (data && data.user) {
        console.log('Login successful, user:', data.user);
        toast.success('Login successful!');
        
        // Store role in localStorage
        const role = data.user.user_metadata?.role || 'admin';
        localStorage.setItem('userRole', role.toLowerCase());
        
        // Create and store basic user details
        const userDetails = {
          id: data.user.id,
          email: data.user.email || '',
          role: role.toLowerCase(),
          display_name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || ''
        };
        localStorage.setItem('userData', JSON.stringify(userDetails));
        
        // Navigate to admin dashboard
        navigate('/admin/dashboard');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      const errorMsg = err.message || 'Login failed. Please check your credentials.';
      setError(errorMsg);
      toast.error(errorMsg);
      
      // Handle too many login attempts
      setLoginAttempts(prev => prev + 1);
      if (loginAttempts >= 2) {
        setError('Too many failed login attempts. Please try again later or reset your password.');
        toast.error('Too many failed login attempts');
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
      <Container maxWidth="sm" className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative">
        <div className="absolute top-6 left-6">
          <Link to="/" className="flex items-center text-gray-600 hover:text-rose-600 transition-colors">
            <ArrowLeft className="h-5 w-5 mr-1" />
            <span>Back to Home</span>
          </Link>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full"
        >
          <Paper
            elevation={3}
            className="p-8 rounded-xl overflow-hidden"
            sx={{
              bgcolor: mode === 'dark' ? 'rgb(17, 24, 39)' : 'white',
              color: mode === 'dark' ? 'white' : 'inherit',
              boxShadow: mode === 'dark' ? '0 4px 20px rgba(0, 0, 0, 0.5)' : '0 4px 20px rgba(0, 0, 0, 0.1)',
              border: mode === 'dark' ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
              position: 'relative',
            }}
          >
            {/* Decorative top bar */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-rose-500 to-rose-700"></div>
            
            <div className="flex flex-col items-center mb-6 mt-4">
              <Shield className="h-12 w-12 text-rose-600 mb-2" />
              <Typography variant="h4" component="h1" align="center" gutterBottom>
                Admin Portal
              </Typography>
              <Typography variant="body2" color={mode === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'textSecondary'} align="center">
                Secure access to the HopeCare administration dashboard
              </Typography>
            </div>

            <AnimatePresence>
              {(error || authError) && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Alert 
                    severity="error" 
                    className="mb-6"
                    icon={<AlertCircle className="h-5 w-5" />}
                    sx={{
                      borderRadius: '8px',
                      '& .MuiAlert-icon': {
                        color: '#f43f5e',
                      },
                    }}
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
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <label className="flex items-center cursor-pointer">
                  <input type="checkbox" className="form-checkbox h-4 w-4 text-rose-600 rounded focus:ring-rose-500" />
                  <span className={`ml-2 text-sm ${mode === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Remember me</span>
                </label>
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
                className="py-2 bg-rose-600 hover:bg-rose-700 text-white font-medium text-base rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
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
              
              <div className="mt-6 mb-2">
                <Divider>
                  <Chip 
                    label="Need Help?" 
                    size="small" 
                    sx={{ 
                      bgcolor: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
                      color: mode === 'dark' ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.7)',
                    }} 
                  />
                </Divider>
              </div>
              
              <div className="flex justify-center space-x-4 mt-2">
                <Link
                  to="/contact"
                  className={`text-sm flex items-center ${mode === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  <HelpCircle className="h-4 w-4 mr-1" />
                  Contact Support
                </Link>
                <Link
                  to="/admin/register"
                  className={`text-sm flex items-center ${mode === 'dark' ? 'text-rose-400 hover:text-rose-300' : 'text-rose-600 hover:text-rose-800'}`}
                >
                  <Shield className="h-4 w-4 mr-1" />
                  Request Admin Access
                </Link>
              </div>
            </form>
          </Paper>
        </motion.div>
      </Container>
    </div>
  );
};

export default AdminLogin;
