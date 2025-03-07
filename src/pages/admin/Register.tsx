import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Phone, ArrowLeft } from 'lucide-react';
import { FormField, Input, Button } from '../../components/ui';
import { PasswordStrength } from '../../components/ui/PasswordStrength';
import { SocialAuth } from '../../components/ui/SocialAuth';
import { useTheme } from '../../hooks/useTheme';
import { useFirebaseAuth } from '../../context/FirebaseAuthContext';
import { toast } from '../../components/ui/Toast';

interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

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
  const [step, setStep] = useState<'social' | 'form'>('social');
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { register, socialAuth } = useFirebaseAuth();

  const handleSocialAuth = async (provider: 'google' | 'microsoft') => {
    setIsLoading(true);
    try {
      await socialAuth(provider, 'ADMIN');
      navigate('/admin/dashboard');
    } catch (err) {
      setErrors({ email: `${provider} authentication failed` });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof RegisterForm]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Partial<RegisterForm> = {};
    
    // Name validation
    if (!form.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (!/^[a-zA-Z\s]{2,30}$/.test(form.firstName)) {
      newErrors.firstName = 'Invalid first name format';
    }

    if (!form.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (!/^[a-zA-Z\s]{2,30}$/.test(form.lastName)) {
      newErrors.lastName = 'Invalid last name format';
    }

    // Email validation
    if (!form.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(form.email)) {
      newErrors.email = 'Invalid email address';
    }

    // Phone validation
    if (!form.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-]{10,}$/.test(form.phone)) {
      newErrors.phone = 'Invalid phone number format';
    }

    // Password validation
    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/.test(form.password)) {
      newErrors.password = 'Password must include uppercase, lowercase, number, and special character';
    }

    if (form.password !== form.confirmPassword) {
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
      await register({
        email: form.email,
        name: `${form.firstName} ${form.lastName}`,
        role: 'ADMIN',
        status: 'INACTIVE',
        password: form.password
      });
      
      // Show success message and redirect
      toast({
        title: "Registration Successful",
        description: "Please check your email to verify your account.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      
      navigate('/admin/check-email');
    } catch (err) {
      setErrors({ 
        email: err instanceof Error ? err.message : 'Registration failed. Please try again.' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.4
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    }
  };

  return (
    <div className={`min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          className="sm:mx-auto sm:w-full sm:max-w-md"
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={containerVariants}
        >
          <motion.div 
            className="flex justify-center"
            variants={itemVariants}
          >
            <img
              src="/logo.png"
              alt="HopeCare Logo"
              className="h-12 w-auto"
            />
          </motion.div>
          <motion.h2 
            className={`mt-6 text-center text-3xl font-extrabold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}
            variants={itemVariants}
          >
            Create an Account
          </motion.h2>

          <div className={`mt-8 py-8 px-4 shadow sm:rounded-lg sm:px-10 ${
            isDarkMode ? 'bg-gray-800' : 'bg-white'
          }`}>
            {step === 'social' ? (
              <SocialAuth
                isLoading={isLoading}
                onGoogleClick={() => handleSocialAuth('google')}
                onMicrosoftClick={() => handleSocialAuth('microsoft')}
              />
            ) : (
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <motion.div variants={itemVariants}>
                    <FormField
                      label="First Name"
                      icon={User}
                      error={errors.firstName}
                      required
                    >
                      <Input
                        name="firstName"
                        value={form.firstName}
                        onChange={handleChange}
                        error={!!errors.firstName}
                        placeholder="John"
                      />
                    </FormField>
                  </motion.div>

                  <motion.div variants={itemVariants}>
                    <FormField
                      label="Last Name"
                      icon={User}
                      error={errors.lastName}
                      required
                    >
                      <Input
                        name="lastName"
                        value={form.lastName}
                        onChange={handleChange}
                        error={!!errors.lastName}
                        placeholder="Doe"
                      />
                    </FormField>
                  </motion.div>
                </div>

                <motion.div variants={itemVariants}>
                  <FormField
                    label="Email Address"
                    icon={Mail}
                    error={errors.email}
                    required
                  >
                    <Input
                      name="email"
                      type="email"
                      value={form.email}
                      onChange={handleChange}
                      error={!!errors.email}
                      placeholder="john@example.com"
                    />
                  </FormField>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <FormField
                    label="Phone Number"
                    icon={Phone}
                    error={errors.phone}
                    required
                  >
                    <Input
                      name="phone"
                      type="tel"
                      value={form.phone}
                      onChange={handleChange}
                      error={!!errors.phone}
                      placeholder="+1 (555) 000-0000"
                    />
                  </FormField>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <FormField
                    label="Password"
                    icon={Lock}
                    error={errors.password}
                    required
                  >
                    <Input
                      name="password"
                      type="password"
                      value={form.password}
                      onChange={handleChange}
                      error={!!errors.password}
                      placeholder="••••••••"
                    />
                  </FormField>
                  <div className="mt-2">
                    <PasswordStrength password={form.password} />
                  </div>
                </motion.div>

                <motion.div variants={itemVariants}>
                  <FormField
                    label="Confirm Password"
                    icon={Lock}
                    error={errors.confirmPassword}
                    required
                  >
                    <Input
                      name="confirmPassword"
                      type="password"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      error={!!errors.confirmPassword}
                      placeholder="••••••••"
                    />
                  </FormField>
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-4">
                  <Button
                    type="submit"
                    variant="primary"
                    loading={isLoading}
                    fullWidth
                  >
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
