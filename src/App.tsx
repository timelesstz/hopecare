import { FC } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { PageProvider } from './context/PageContext';
import { DonationProvider } from './context/DonationContext';
import { FirebaseAuthProvider } from './context/FirebaseAuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import AppRouter from './router';

const App: FC = () => {
  return (
    <ErrorBoundary>
      <FirebaseAuthProvider>
        <ThemeProvider>
          <DonationProvider>
            <PageProvider>
              <BrowserRouter>
                <AppRouter />
              </BrowserRouter>
            </PageProvider>
          </DonationProvider>
        </ThemeProvider>
      </FirebaseAuthProvider>
    </ErrorBoundary>
  );
};

export default App;