import { FC } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { PageProvider } from './context/PageContext';
import { DonationProvider } from './context/DonationContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
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