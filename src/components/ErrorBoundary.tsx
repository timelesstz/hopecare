import React, { Component, ErrorInfo, ReactNode } from 'react';
import { handleError, ErrorType } from '../utils/errorUtils';

interface Props {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error, resetError: () => void) => ReactNode);
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * A component that catches JavaScript errors anywhere in its child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log the error to our error handling system
    handleError(error, ErrorType.UNKNOWN, {
      context: 'error-boundary',
      userMessage: 'An unexpected error occurred in the application',
      showToast: true,
      logToServer: true
    });
    
    console.error('Error caught by ErrorBoundary:', error);
    console.error('Component stack:', errorInfo.componentStack);
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null
    });
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback } = this.props;

    if (hasError && error) {
      // If a custom fallback is provided, use it
      if (fallback) {
        if (typeof fallback === 'function') {
          return fallback(error, this.resetError);
        }
        return fallback;
      }

      // Default fallback UI
      return (
        <div className="error-boundary p-6 bg-red-50 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-red-700 mb-4">Something went wrong</h2>
          <p className="text-gray-700 mb-4">
            We're sorry, but an error occurred while rendering this component.
          </p>
          <details className="mb-4">
            <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
              Error details
            </summary>
            <pre className="mt-2 p-4 bg-gray-100 rounded overflow-auto text-sm">
              {error.toString()}
            </pre>
          </details>
          <button
            onClick={this.resetError}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Try again
          </button>
        </div>
      );
    }

    // When there's no error, render children normally
    return children;
  }
}

export default ErrorBoundary;
