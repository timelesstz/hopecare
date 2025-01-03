import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className = '',
    variant = 'primary',
    size = 'md',
    loading = false,
    icon,
    fullWidth = false,
    children,
    ...props
  }, ref) => {
    const { colors, isDarkMode } = useTheme();

    const baseStyles = `
      inline-flex items-center justify-center
      font-medium rounded-md
      focus:outline-none focus:ring-2 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
      transition-all duration-200
      ${fullWidth ? 'w-full' : ''}
    `;

    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    const variantStyles = {
      primary: `
        bg-[${colors.primary.default}]
        text-white
        hover:bg-[${colors.primary.light}]
        active:bg-[${colors.primary.dark}]
        focus:ring-[${colors.primary.light}]
        ${isDarkMode ? 'hover:bg-opacity-90' : ''}
      `,
      secondary: `
        bg-[${colors.secondary.default}]
        text-white
        hover:bg-[${colors.secondary.light}]
        active:bg-[${colors.secondary.dark}]
        focus:ring-[${colors.secondary.light}]
        ${isDarkMode ? 'hover:bg-opacity-90' : ''}
      `,
      outline: `
        border-2
        border-[${colors.primary.default}]
        text-[${colors.primary.default}]
        hover:bg-[${colors.primary.default}]
        hover:text-white
        focus:ring-[${colors.primary.light}]
        ${isDarkMode ? 'hover:bg-opacity-90' : ''}
      `,
      ghost: `
        text-[${colors.primary.default}]
        hover:bg-[${colors.primary.default}]
        hover:bg-opacity-10
        focus:ring-[${colors.primary.light}]
      `,
    };

    const buttonVariants = {
      initial: { scale: 1 },
      hover: { scale: 1.02 },
      tap: { scale: 0.98 },
      disabled: { opacity: 0.5 },
    };

    return (
      <motion.button
        ref={ref}
        className={`
          ${baseStyles}
          ${sizeStyles[size]}
          ${variantStyles[variant]}
          ${className}
        `}
        initial="initial"
        whileHover={!loading && !props.disabled ? "hover" : "disabled"}
        whileTap={!loading && !props.disabled ? "tap" : "disabled"}
        variants={buttonVariants}
        {...props}
        disabled={loading || props.disabled}
      >
        {loading && (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        )}
        {!loading && icon && (
          <span className="mr-2">{icon}</span>
        )}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
