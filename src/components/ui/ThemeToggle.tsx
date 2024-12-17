import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

export const ThemeToggle: React.FC = () => {
  const { colors, isDarkMode, toggleTheme } = useTheme();

  const toggleVariants = {
    light: { rotate: 0 },
    dark: { rotate: 180 },
  };

  const springTransition = {
    type: 'spring',
    stiffness: 300,
    damping: 30,
  };

  return (
    <motion.button
      onClick={toggleTheme}
      className={`
        p-2 rounded-full
        ${isDarkMode ? 'bg-gray-800' : 'bg-white'}
        hover:bg-opacity-90
        focus:outline-none focus:ring-2
        focus:ring-[${colors.primary.light}]
        transition-colors duration-200
      `}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <motion.div
        variants={toggleVariants}
        initial={isDarkMode ? 'dark' : 'light'}
        animate={isDarkMode ? 'dark' : 'light'}
        transition={springTransition}
      >
        {isDarkMode ? (
          <Moon className={`w-5 h-5 text-[${colors.primary.light}]`} />
        ) : (
          <Sun className={`w-5 h-5 text-[${colors.primary.default}]`} />
        )}
      </motion.div>
    </motion.button>
  );
};

export default ThemeToggle;
