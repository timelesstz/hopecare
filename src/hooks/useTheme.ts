import { useState, useEffect } from 'react';
import { ColorPalette, defaultColors } from '../config/colors';

export const useTheme = () => {
  const [colors, setColors] = useState<ColorPalette>(defaultColors);

  const updateTheme = (newColors: Partial<ColorPalette>) => {
    setColors(prevColors => ({
      ...prevColors,
      ...newColors,
    }));
  };

  useEffect(() => {
    // You can load colors from CMS or API here
    const loadColorsFromCMS = async () => {
      try {
        // Example: const response = await fetch('/api/theme');
        // const cmsColors = await response.json();
        // updateTheme(cmsColors);
      } catch (error) {
        console.error('Failed to load theme colors:', error);
      }
    };

    loadColorsFromCMS();
  }, []);

  return { colors, updateTheme };
};

export default useTheme;
