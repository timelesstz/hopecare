import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Phone, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { 
  TextField, 
  Paper, 
  Typography, 
  Box, 
  Alert, 
  InputAdornment, 
  Button, 
  Container, 
  CircularProgress, 
  Divider, 
  Grid,
  LinearProgress,
  Avatar
} from '@mui/material';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

// Password strength component
const PasswordStrength = ({ password }: { password: string }) => {
  const getStrength = (password: string): number => {
    let score = 0;
    if (!password) return score;
    
    // Length check
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    
    // Complexity checks
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    
    return Math.min(score, 5);
  };
  
  const strength = getStrength(password);
  const getColor = () => {
    if (strength < 2) return 'error';
    if (strength < 4) return 'warning';
    return 'success';
  };
  
  const getLabel = () => {
    if (strength < 2) return 'Weak';
    if (strength < 4) return 'Moderate';
    return 'Strong';
  };
  
  return (
    <Box sx={{ width: '100%', mt: 1 }}>
      <LinearProgress 
        variant="determinate" 
        value={(strength / 5) * 100} 
        color={getColor() as 'error' | 'warning' | 'success'}
        sx={{ height: 8, borderRadius: 4 }}
      />
      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
        {strength >= 4 ? (
          <CheckCircle size={16} className="text-green-500 mr-1" />
        ) : (
          <AlertCircle size={16} className="text-amber-500 mr-1" />
        )}
        <Typography variant="caption" color={getColor()}>
          {getLabel()} Password
        </Typography>
      </Box>
    </Box>
  );
};

const Register = () => {
  const [form, setForm] = useState<RegisterForm>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<Partial<RegisterForm>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { register } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (errors[name as keyof RegisterForm]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<RegisterForm> = {};
    
    // Required fields
    if (!form.firstName) newErrors.firstName = 'First name is required';
    if (!form.lastName) newErrors.lastName = 'Last name is required';
    if (!form.email) newErrors.email = 'Email is required';
    if (!form.phone) newErrors.phone = 'Phone number is required';
    if (!form.password) newErrors.password = 'Password is required';
    if (!form.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    
    // Email validation
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Phone validation
    if (form.phone && !/^\+?[0-9\s\-\(\)]{10,15}$/.test(form.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }
    
    // Password validation
    if (form.password && form.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    // Password match validation
    if (form.password && form.confirmPassword && form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      // Call the register function from AuthContext
      await register(form.email, form.password, {
        role: 'admin',
        display_name: `${form.firstName} ${form.lastName}`,
        phone: form.phone
      });
      
      toast.success('Registration successful!');
      setSuccess(true);
      
      // Redirect to login after a short delay
      setTimeout(() => {
        navigate('/admin/login');
      }, 2000);
      
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.message || 'Failed to register. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          borderRadius: 2,
          bgcolor: isDarkMode ? 'background.paper' : 'background.paper',
          boxShadow: isDarkMode ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.1)'
        }}
      >
        <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar sx={{ m: 1, bgcolor: 'primary.main', width: 56, height: 56 }}>
            <User size={32} />
          </Avatar>
          <Typography component="h1" variant="h5" sx={{ mt: 2 }}>
            Admin Registration
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
            Create a new administrator account for HopeCare
          </Typography>
        </Box>
        
        {success ? (
          <Alert 
            severity="success" 
            sx={{ mb: 3 }}
          >
            Registration successful! Redirecting to login...
          </Alert>
        ) : (
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="First Name"
                  name="firstName"
                  autoComplete="given-name"
                  value={form.firstName}
                  onChange={handleChange}
                  error={!!errors.firstName}
                  helperText={errors.firstName}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <User size={18} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  autoComplete="family-name"
                  value={form.lastName}
                  onChange={handleChange}
                  error={!!errors.lastName}
                  helperText={errors.lastName}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <User size={18} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  error={!!errors.email}
                  helperText={errors.email}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Mail size={18} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  autoComplete="tel"
                  value={form.phone}
                  onChange={handleChange}
                  error={!!errors.phone}
                  helperText={errors.phone}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Phone size={18} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  value={form.password}
                  onChange={handleChange}
                  error={!!errors.password}
                  helperText={errors.password}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock size={18} />
                      </InputAdornment>
                    ),
                  }}
                />
                <PasswordStrength password={form.password} />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock size={18} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{ mt: 3, mb: 2, py: 1.5 }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Register'
              )}
            </Button>
            
            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                OR
              </Typography>
            </Divider>
            
            <Box sx={{ mt: 1, textAlign: 'center' }}>
              <Link to="/admin/login" style={{ textDecoration: 'none' }}>
                <Button
                  startIcon={<ArrowLeft size={16} />}
                  color="primary"
                  sx={{ textTransform: 'none' }}
                >
                  Back to Login
                </Button>
              </Link>
            </Box>
          </Box>
        )}
      </Paper>
    </Container>
                    Create Account
                  </Button>

                  <div className="flex items-center justify-between">
                    <Link to="/admin/login">
                      <Button
                        type="button"
                        variant="ghost"
                        icon={<ArrowLeft className="w-4 h-4" />}
                      >
                        Back to Login
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              </form>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Register;
