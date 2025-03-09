import React from 'react';
import './SkipLink.css';

interface SkipLinkProps {
  /**
   * The target ID to skip to (without the # symbol)
   */
  targetId: string;
  
  /**
   * The text to display in the skip link
   */
  text?: string;
  
  /**
   * Optional CSS class name
   */
  className?: string;
}

/**
 * SkipLink component that allows keyboard users to bypass navigation
 * and repetitive content by jumping directly to the main content.
 * 
 * This component is visually hidden until it receives focus,
 * making it available only to keyboard users.
 * 
 * Usage:
 * 1. Add this component at the top of your layout
 * 2. Ensure the target element has the specified ID
 * 
 * Example:
 * ```tsx
 * <SkipLink targetId="main-content" />
 * <Header />
 * <main id="main-content">
 *   {children}
 * </main>
 * ```
 */
const SkipLink: React.FC<SkipLinkProps> = ({
  targetId,
  text = 'Skip to main content',
  className = '',
}) => {
  return (
    <a 
      href={`#${targetId}`}
      className={`skip-link ${className}`}
    >
      {text}
    </a>
  );
};

export default SkipLink; 