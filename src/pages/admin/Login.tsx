import { useState, ChangeEvent, FormEvent, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Button, TextField, Paper, Typography, Box, Alert, InputAdornment, IconButton } from '@mui/material';
import { Lock, Mail, Eye, EyeOff, Shield, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminLogin = () => {
  const { login, error: authError, loading } = useAuth();
  const { mode } = useTheme();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const formRef = useRef<HTMLFormElement>(null);

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

    try {
      await login(email, password, 'ADMIN');
      navigate('/admin/dashboard');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid login credentials';
      setError(errorMessage);
      
      // Shake animation trigger
      if (formRef.current) {
        formRef.current.classList.add('shake');
        setTimeout(() => formRef.current?.classList.remove('shake'), 500);
      }
    }
  };

  const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setError(null);
    validateEmail(value);
  };

  const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    setError(null);
    validatePassword(value);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: mode === 'dark' ? 'background.default' : 'grey.50',
        px: 3,
        backgroundImage: 'url(/admin-bg-pattern.svg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <Paper
        component="form"
        ref={formRef}
        onSubmit={handleSubmit}
        elevation={mode === 'dark' ? 2 : 1}
        sx={{
          p: 4,
          width: '100%',
          maxWidth: 400,
          bgcolor: mode === 'dark' ? 'background.paper' : 'common.white',
          borderRadius: 3,
          position: 'relative',
          overflow: 'hidden',
          transform: 'scale(0.95)',
          '&:hover': {
            transform: 'scale(1)',
            transition: 'transform 0.3s ease-in-out'
          }
        }}
      >
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                mb: 2
              }}
            >
              <motion.div
                initial={{ rotate: -180 }}
                animate={{ rotate: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Shield className="h-12 w-12 text-rose-600" />
              </motion.div>
            </Box>
            <Typography
              variant="h5"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 600,
                color: mode === 'dark' ? 'common.white' : 'grey.900'
              }}
            >
              Admin Portal
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: mode === 'dark' ? 'grey.400' : 'grey.600',
                maxWidth: 300,
                mx: 'auto'
              }}
            >
              Secure access to HopeCare administrative dashboard
            </Typography>
          </Box>
        </motion.div>

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
                icon={<AlertCircle className="h-5 w-5" />}
                sx={{
                  mb: 3,
                  borderRadius: 2,
                  bgcolor: 'error.light',
                  color: 'error.dark',
                  '& .MuiAlert-icon': {
                    color: 'error.main'
                  }
                }}
              >
                {error || authError}
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        <form className="space-y-4">
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
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Mail className={`h-5 w-5 ${emailError ? 'text-error' : 'text-gray-400'}`} />
                </InputAdornment>
              )
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: mode === 'dark' ? 'grey.700' : 'grey.400'
                }
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
            disabled={loading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Lock className={`h-5 w-5 ${passwordError ? 'text-error' : 'text-gray-400'}`} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={togglePasswordVisibility}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </IconButton>
                </InputAdornment>
              )
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: mode === 'dark' ? 'grey.700' : 'grey.400'
                }
              }
            }}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={loading}
            sx={{
              mt: 3,
              mb: 2,
              bgcolor: 'rose.600',
              '&:hover': {
                bgcolor: 'rose.700'
              }
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default AdminLogin;
