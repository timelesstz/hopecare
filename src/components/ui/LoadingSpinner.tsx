import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'white';
  fullScreen?: boolean;
  message?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = 'primary',
  fullScreen = false,
  message,
  className = ''
}) => {
  // Size mappings
  const sizeMap = {
    small: 'h-4 w-4 border-2',
    medium: 'h-8 w-8 border-2',
    large: 'h-12 w-12 border-3'
  };
  
  // Color mappings
  const colorMap = {
    primary: 'border-rose-500',
    secondary: 'border-blue-500',
    white: 'border-white'
  };
  
  const spinnerClasses = `
    animate-spin rounded-full 
    ${sizeMap[size]} 
    border-t-transparent border-b-transparent 
    ${colorMap[color]}
  `;
  
  const containerClasses = fullScreen 
    ? 'fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50' 
    : `flex items-center justify-center ${className}`;
  
  return (
    <div className={containerClasses} role="status" aria-live="polite">
      <div className="flex flex-col items-center">
        <div className={spinnerClasses} aria-hidden="true"></div>
        {message && (
          <p className={`mt-3 text-sm ${color === 'white' ? 'text-white' : 'text-gray-700'}`}>
            {message}
          </p>
        )}
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

export default LoadingSpinner; 