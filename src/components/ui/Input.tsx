import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import { motion } from 'framer-motion';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, icon, ...props }, ref) => {
    const { colors } = useTheme();

    return (
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            {icon}
          </div>
        )}
        <motion.input
          ref={ref}
          whileFocus={{ scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className={`
            block w-full px-3 py-2
            ${icon ? 'pl-10' : ''}
            border rounded-md shadow-sm
            ${error 
              ? `border-[${colors.error.default}] focus:ring-[${colors.error.light}] focus:border-[${colors.error.light}]`
              : `border-gray-300 focus:ring-[${colors.primary.default}] focus:border-[${colors.primary.default}]`
            }
            transition-colors duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
