import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <div className="text-center max-w-md">
            <h1 className="text-2xl font-bold mb-4 text-gray-800">Oops!</h1>
            <p className="text-gray-600 mb-6">
              {this.state.error?.message || 'Something went wrong. Please try again later.'}
            </p>
            <div className="space-y-4">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-2 px-4 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
              >
                Try Again
              </button>
              <a
                href="/"
                className="block w-full py-2 px-4 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors"
              >
                Return to Home Page
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
