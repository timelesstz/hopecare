export interface ColorPalette {
  primary: {
    light: string;
    default: string;
    dark: string;
  };
  secondary: {
    light: string;
    default: string;
    dark: string;
  };
  success: {
    light: string;
    default: string;
    dark: string;
  };
  error: {
    light: string;
    default: string;
    dark: string;
  };
}

export const defaultColors: ColorPalette = {
  primary: {
    light: '#4BA3E3',   // Blue Light
    default: '#2B8ACB', // Blue Default
    dark: '#1E6CA3',    // Blue Dark
  },
  secondary: {
    light: '#FFA94D',   // Orange Light
    default: '#F7941D', // Orange Default
    dark: '#D97B06',    // Orange Dark
  },
  success: {
    light: '#68D391',
    default: '#48BB78',
    dark: '#2F855A',
  },
  error: {
    light: '#FC8181',
    default: '#F56565',
    dark: '#C53030',
  },
};

export const getColor = (path: string): string => {
  const parts = path.split('.');
  let result: any = defaultColors;
  
  for (const part of parts) {
    if (result && typeof result === 'object' && part in result) {
      result = result[part];
    } else {
      console.warn(`Color path "${path}" not found in theme`);
      return '';
    }
  }
  
  return result;
};
