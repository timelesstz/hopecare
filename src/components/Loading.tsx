import React from 'react';
import './Loading.css';

interface LoadingProps {
  /**
   * Optional message to display
   */
  message?: string;
  
  /**
   * Optional size of the loading spinner
   */
  size?: 'small' | 'medium' | 'large';
  
  /**
   * Optional CSS class name
   */
  className?: string;
  
  /**
   * Whether to show a full-page loading overlay
   */
  fullPage?: boolean;
}

/**
 * Loading component that displays a spinner and optional message
 * 
 * Features:
 * - Accessible loading indicator with aria attributes
 * - Customizable size and message
 * - Option for full-page overlay
 */
const Loading: React.FC<LoadingProps> = ({
  message = 'Loading...',
  size = 'medium',
  className = '',
  fullPage = false,
}) => {
  const containerClass = `loading-container ${size} ${fullPage ? 'full-page' : ''} ${className}`;
  
  return (
    <div 
      className={containerClass}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="loading-spinner">
        <div className="spinner-circle"></div>
        <div className="spinner-circle"></div>
        <div className="spinner-circle"></div>
      </div>
      {message && <p className="loading-message">{message}</p>}
    </div>
  );
};

export default Loading; 