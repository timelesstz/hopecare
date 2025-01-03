import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowLeft, Check } from 'lucide-react';
import { FormField, Input, Button } from '../../components/ui';
import { useTheme } from '../../hooks/useTheme';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // TODO: Implement password reset logic
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulated API call
      setIsSuccess(true);
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
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
        ease: "easeOut"
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

  const successVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    }
  };

  return (
    <div className={`min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 ${
      isDarkMode ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <motion.div
            key="form"
            className="sm:mx-auto sm:w-full sm:max-w-md"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={containerVariants}
          >
            <div className="flex justify-center">
              <img
                src="/logo.png"
                alt="HopeCare Logo"
                className="h-12 w-auto"
              />
            </div>
            <h2 className={`mt-6 text-center text-3xl font-extrabold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Reset Password
            </h2>
            <p className={`mt-2 text-center text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Enter your email address and we'll send you a link to reset your password.
            </p>

            <div className={`mt-8 py-8 px-4 shadow sm:rounded-lg sm:px-10 ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <FormField
                  label="Email Address"
                  icon={Mail}
                  error={error}
                  required
                >
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@hopecare.org"
                    error={!!error}
                    autoComplete="email"
                  />
                </FormField>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                <div className="space-y-4">
                  <Button
                    type="submit"
                    variant="primary"
                    loading={isLoading}
                    fullWidth
                  >
                    Send Reset Link
                  </Button>
                  
                  <Link to="/admin/login">
                    <Button
                      type="button"
                      variant="ghost"
                      fullWidth
                      icon={<ArrowLeft className="w-4 h-4" />}
                    >
                      Back to Login
                    </Button>
                  </Link>
                </div>
              </form>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="success"
            className="sm:mx-auto sm:w-full sm:max-w-md text-center"
            initial="hidden"
            animate="visible"
            variants={successVariants}
          >
            <div className={`p-8 shadow sm:rounded-lg ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <Check className="h-6 w-6 text-green-600" />
              </div>
              <h3 className={`mt-4 text-lg font-medium ${
                isDarkMode ? 'text-white' : 'text-gray-900'
              }`}>
                Check your email
              </h3>
              <p className={`mt-2 text-sm ${
                isDarkMode ? 'text-gray-400' : 'text-gray-600'
              }`}>
                We've sent a password reset link to {email}
              </p>
              <div className="mt-6">
                <Link to="/admin/login">
                  <Button
                    type="button"
                    variant="ghost"
                    fullWidth
                    icon={<ArrowLeft className="w-4 h-4" />}
                  >
                    Back to Login
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ForgotPassword;
