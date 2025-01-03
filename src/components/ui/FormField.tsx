import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import { motion, AnimatePresence } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface FormFieldProps {
  label: string;
  icon?: LucideIcon;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
  helpText?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  icon: Icon,
  error,
  required,
  children,
  helpText,
}) => {
  const { colors } = useTheme();

  return (
    <div className="space-y-1">
      <div className="flex items-center">
        {Icon && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mr-2"
          >
            <Icon className={`h-4 w-4 text-[${colors.primary.default}]`} />
          </motion.div>
        )}
        <label className={`block text-sm font-medium text-[${colors.primary.dark}]`}>
          {label}
          {required && <span className={`ml-1 text-[${colors.error.default}]`}>*</span>}
        </label>
      </div>

      <div className="mt-1">{children}</div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className={`text-sm text-[${colors.error.dark}]`}
            role="alert"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {helpText && (
        <p className={`text-sm text-[${colors.primary.default}]`}>
          {helpText}
        </p>
      )}
    </div>
  );
};

export default FormField;
