import React from 'react';
import { AlertTriangle, RefreshCw, Mail, Phone, MessageSquare } from 'lucide-react';

interface PaymentErrorRecoveryProps {
  errorType: 'initialization' | 'processing' | 'verification' | 'cancelled' | 'unknown';
  errorMessage?: string;
  onRetry: () => void;
}

const PaymentErrorRecovery: React.FC<PaymentErrorRecoveryProps> = ({
  errorType,
  errorMessage,
  onRetry,
}) => {
  // Define error details based on error type
  const errorDetails = {
    initialization: {
      title: 'Payment Initialization Failed',
      description: 'We were unable to initialize the payment process. This could be due to a network issue or a problem with our payment provider.',
      solution: 'Please try again or use a different payment method.',
      icon: <AlertTriangle className="h-12 w-12 text-amber-500" />,
    },
    processing: {
      title: 'Payment Processing Error',
      description: 'There was an error while processing your payment. Your card has not been charged.',
      solution: 'Please try again or use a different payment method.',
      icon: <AlertTriangle className="h-12 w-12 text-amber-500" />,
    },
    verification: {
      title: 'Payment Verification Failed',
      description: 'Your payment was processed, but we could not verify it. Please check your email for confirmation before trying again.',
      solution: 'If you were charged but don\'t see a confirmation, please contact our support team.',
      icon: <AlertTriangle className="h-12 w-12 text-amber-500" />,
    },
    cancelled: {
      title: 'Payment Cancelled',
      description: 'You cancelled the payment process. No charges have been made to your account.',
      solution: 'You can try again whenever you\'re ready.',
      icon: <AlertTriangle className="h-12 w-12 text-blue-500" />,
    },
    unknown: {
      title: 'Something Went Wrong',
      description: 'An unexpected error occurred during the payment process.',
      solution: 'Please try again or contact our support team for assistance.',
      icon: <AlertTriangle className="h-12 w-12 text-red-500" />,
    },
  };

  const details = errorDetails[errorType];

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex flex-col items-center text-center">
        {details.icon}
        <h3 className="mt-4 text-lg font-medium text-gray-900">{details.title}</h3>
        <p className="mt-2 text-sm text-gray-500">{details.description}</p>
        {errorMessage && (
          <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600 w-full">
            {errorMessage}
          </div>
        )}
        <p className="mt-4 text-sm font-medium text-gray-700">{details.solution}</p>
        
        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <button
            onClick={onRetry}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </button>
          
          <a
            href="mailto:support@hopecaretz.org"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Mail className="mr-2 h-4 w-4" />
            Email Support
          </a>
        </div>
        
        <div className="mt-6 border-t border-gray-200 pt-4 w-full">
          <h4 className="text-sm font-medium text-gray-700">Other ways to get help:</h4>
          <div className="mt-2 flex justify-center space-x-4">
            <a href="tel:+255123456789" className="text-blue-600 hover:text-blue-800 flex items-center">
              <Phone className="h-4 w-4 mr-1" />
              <span className="text-sm">Call Us</span>
            </a>
            <a href="#" className="text-blue-600 hover:text-blue-800 flex items-center">
              <MessageSquare className="h-4 w-4 mr-1" />
              <span className="text-sm">Live Chat</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentErrorRecovery; 