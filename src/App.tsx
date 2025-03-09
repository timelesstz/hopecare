import { FC } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { PageProvider } from './context/PageContext';
import { DonationProvider } from './context/DonationContext';
import { FirebaseAuthProvider } from './context/FirebaseAuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ErrorBoundary from './components/ErrorBoundary';
import FirebaseErrorBoundary from './components/FirebaseErrorBoundary';
import AppRouter from './router';

const App: FC = () => {
  return (
    <ErrorBoundary>
      <FirebaseErrorBoundary>
        <FirebaseAuthProvider>
          <ThemeProvider>
            <DonationProvider>
              <PageProvider>
                <BrowserRouter>
                  <AppRouter />
                  {/* Toast notifications for errors and messages */}
                  <Toaster
                    position="top-right"
                    toastOptions={{
                      duration: 5000,
                      style: {
                        background: '#fff',
                        color: '#333',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        borderRadius: '0.375rem',
                        padding: '0.75rem 1rem',
                      },
                      success: {
                        style: {
                          borderLeft: '4px solid #10B981',
                        },
                      },
                      error: {
                        style: {
                          borderLeft: '4px solid #EF4444',
                        },
                        duration: 6000,
                      },
                      loading: {
                        style: {
                          borderLeft: '4px solid #3B82F6',
                        },
                      },
                    }}
                  />
                </BrowserRouter>
              </PageProvider>
            </DonationProvider>
          </ThemeProvider>
        </FirebaseAuthProvider>
      </FirebaseErrorBoundary>
    </ErrorBoundary>
  );
};

export default App;