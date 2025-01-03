import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: boolean;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = '', label, error, ...props }, ref) => {
    const { colors } = useTheme();
    const [checked, setChecked] = React.useState(props.checked || false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setChecked(e.target.checked);
      props.onChange?.(e);
    };

    return (
      <label className="inline-flex items-center">
        <div className="relative">
          <motion.input
            ref={ref}
            type="checkbox"
            className={`
              form-checkbox h-4 w-4 rounded
              ${error
                ? `border-[${colors.error.default}] text-[${colors.error.default}]`
                : `border-gray-300 text-[${colors.primary.default}]`
              }
              focus:ring-[${colors.primary.default}]
              transition-colors duration-200
              ${className}
            `}
            {...props}
            onChange={handleChange}
          />
          <AnimatePresence>
            {checked && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <Check className="h-3 w-3 text-white" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <span className={`ml-2 text-sm ${error ? `text-[${colors.error.dark}]` : 'text-gray-600'}`}>
          {label}
        </span>
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;
