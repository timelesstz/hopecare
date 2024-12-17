import React, { createContext, useContext, useState, useMemo } from 'react';
import { ThemeProvider as MUIThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

interface ThemeContextType {
  colors: ColorPalette;
  isDarkMode: boolean;
  mode: 'light' | 'dark';
  toggleDarkMode: () => void;
  updateTheme: (newColors: Partial<ColorPalette>) => void;
}

const defaultColors: ColorPalette = {
  primary: '#E11D48',
  secondary: '#4F46E5',
  accent: '#10B981',
  background: '#FFFFFF',
  text: '#1F2937'
};

const darkColors: ColorPalette = {
  primary: '#F43F5E',
  secondary: '#6366F1',
  accent: '#34D399',
  background: '#1F2937',
  text: '#F9FAFB'
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [colors, setColors] = useState<ColorPalette>(defaultColors);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const mode: 'light' | 'dark' = isDarkMode ? 'dark' : 'light';

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: colors.primary,
          },
          secondary: {
            main: colors.secondary,
          },
          background: {
            default: colors.background,
            paper: isDarkMode ? '#2D3748' : '#FFFFFF',
          },
          text: {
            primary: colors.text,
          },
        },
      }),
    [colors, isDarkMode]
  );

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const newMode = !prev;
      setColors(newMode ? darkColors : defaultColors);
      return newMode;
    });
  };

  const updateTheme = (newColors: Partial<ColorPalette>) => {
    setColors(prev => ({ ...prev, ...newColors }));
  };

  const value: ThemeContextType = {
    colors,
    isDarkMode,
    mode,
    toggleDarkMode,
    updateTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      <MUIThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MUIThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
