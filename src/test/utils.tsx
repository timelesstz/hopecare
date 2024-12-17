import React from 'react';
import { render as rtlRender } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { DonationProvider } from '../context/DonationContext';
import userEvent from '@testing-library/user-event';

const theme = createTheme();

function render(
  ui: React.ReactElement,
  {
    route = '/',
    ...renderOptions
  } = {}
) {
  window.history.pushState({}, 'Test page', route);

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <DonationProvider>
            {children}
          </DonationProvider>
        </ThemeProvider>
      </BrowserRouter>
    );
  }

  return {
    user: userEvent.setup(),
    ...rtlRender(ui, {
      wrapper: Wrapper,
      ...renderOptions,
    }),
  };
}

export * from '@testing-library/react';
export { render };
