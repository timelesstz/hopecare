import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  options: SelectOption[];
  error?: boolean;
  icon?: React.ReactNode;
  onChange?: (value: string) => void;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', options, error, icon, onChange, ...props }, ref) => {
    const { colors, isDarkMode } = useTheme();

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange?.(e.target.value);
    };

    const containerVariants = {
      focus: {
        scale: 1.01,
        transition: {
          type: 'spring',
          stiffness: 300,
          damping: 30
        }
      }
    };

    const iconVariants = {
      closed: { rotate: 0 },
      open: { rotate: 180 }
    };

    return (
      <motion.div
        className="relative"
        variants={containerVariants}
        whileFocus="focus"
      >
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            {icon}
          </div>
        )}
        <select
          ref={ref}
          onChange={handleChange}
          className={`
            block w-full px-3 py-2
            ${icon ? 'pl-10' : ''}
            appearance-none
            border rounded-md
            ${error
              ? `border-[${colors.error.default}] focus:ring-[${colors.error.light}] focus:border-[${colors.error.light}]`
              : `border-gray-300 focus:ring-[${colors.primary.default}] focus:border-[${colors.primary.default}]`
            }
            ${isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}
            shadow-sm
            focus:outline-none focus:ring-2
            disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors duration-200
            ${className}
          `}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <motion.div
            variants={iconVariants}
            initial="closed"
            animate={props.value ? "open" : "closed"}
          >
            <ChevronDown className={`h-4 w-4 text-[${colors.primary.default}]`} />
          </motion.div>
        </div>
      </motion.div>
    );
  }
);

Select.displayName = 'Select';

export default Select;
