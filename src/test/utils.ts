import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { DonationProvider } from '../context/DonationContext';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../theme';

const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        <DonationProvider>
          {children}
        </DonationProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export const customRender = (ui: React.ReactElement, options = {}) => 
  render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';
