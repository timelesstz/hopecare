import { FC } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { PageProvider } from './contexts/PageContext';
import { DonationProvider } from './contexts/DonationContext';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import AppRouter from './routes';

const App: FC = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthProvider>
          <ThemeProvider>
            <DonationProvider>
              <PageProvider>
                <AppRouter />
              </PageProvider>
            </DonationProvider>
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
};

export default App;