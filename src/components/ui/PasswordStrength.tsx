import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';

interface PasswordStrengthProps {
  password: string;
}

interface Requirement {
  label: string;
  test: (password: string) => boolean;
}

const requirements: Requirement[] = [
  {
    label: 'At least 8 characters',
    test: (password) => password.length >= 8,
  },
  {
    label: 'Contains uppercase letter',
    test: (password) => /[A-Z]/.test(password),
  },
  {
    label: 'Contains lowercase letter',
    test: (password) => /[a-z]/.test(password),
  },
  {
    label: 'Contains number',
    test: (password) => /\d/.test(password),
  },
  {
    label: 'Contains special character',
    test: (password) => /[!@#$%^&*(),.?":{}|<>]/.test(password),
  },
];

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password }) => {
  const { isDarkMode } = useTheme();
  const passedRequirements = requirements.filter(req => req.test(password));
  const strength = (passedRequirements.length / requirements.length) * 100;

  const getStrengthColor = (strength: number) => {
    if (strength <= 20) return 'bg-red-500';
    if (strength <= 40) return 'bg-orange-500';
    if (strength <= 60) return 'bg-yellow-500';
    if (strength <= 80) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const getStrengthLabel = (strength: number) => {
    if (strength <= 20) return 'Very Weak';
    if (strength <= 40) return 'Weak';
    if (strength <= 60) return 'Medium';
    if (strength <= 80) return 'Strong';
    return 'Very Strong';
  };

  const barVariants = {
    initial: { width: 0 },
    animate: { 
      width: `${strength}%`,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 20
      }
    }
  };

  const requirementVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { 
      opacity: 1, 
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className={`text-sm font-medium ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Password Strength
          </span>
          <span className={`text-sm ${getStrengthColor(strength).replace('bg-', 'text-')}`}>
            {getStrengthLabel(strength)}
          </span>
        </div>
        <div className={`h-2 rounded-full ${
          isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
        }`}>
          <motion.div
            className={`h-full rounded-full ${getStrengthColor(strength)}`}
            variants={barVariants}
            initial="initial"
            animate="animate"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {requirements.map((req, index) => {
          const passed = req.test(password);
          return (
            <motion.div
              key={req.label}
              className="flex items-center space-x-2"
              variants={requirementVariants}
              initial="initial"
              animate="animate"
              transition={{ delay: index * 0.1 }}
            >
              <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                passed
                  ? 'bg-green-500'
                  : isDarkMode
                    ? 'bg-gray-700'
                    : 'bg-gray-200'
              }`}>
                {passed && (
                  <motion.svg
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-3 h-3 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </motion.svg>
                )}
              </div>
              <span className={`text-sm ${
                passed
                  ? isDarkMode ? 'text-green-400' : 'text-green-600'
                  : isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {req.label}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default PasswordStrength;
