import React, { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import './AccessibleDialog.css';

interface AccessibleDialogProps {
  /**
   * Whether the dialog is open
   */
  isOpen: boolean;
  
  /**
   * Function to close the dialog
   */
  onClose: () => void;
  
  /**
   * Dialog title
   */
  title: string;
  
  /**
   * Dialog content
   */
  children: React.ReactNode;
  
  /**
   * Optional CSS class name
   */
  className?: string;
  
  /**
   * Optional dialog description for screen readers
   */
  description?: string;
  
  /**
   * Optional width of the dialog
   */
  width?: string;
  
  /**
   * Whether to close the dialog when clicking outside
   */
  closeOnOutsideClick?: boolean;
  
  /**
   * Whether to close the dialog when pressing Escape
   */
  closeOnEscape?: boolean;
  
  /**
   * Optional footer content
   */
  footer?: React.ReactNode;
}

/**
 * AccessibleDialog component that follows WAI-ARIA Dialog Pattern
 * 
 * Features:
 * - Proper focus management
 * - Keyboard navigation
 * - Screen reader announcements
 * - Focus trap within the dialog
 * - Escape key to close
 * - Click outside to close (optional)
 */
const AccessibleDialog: React.FC<AccessibleDialogProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className = '',
  description,
  width = '500px',
  closeOnOutsideClick = true,
  closeOnEscape = true,
  footer,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  
  // Store the active element when the dialog opens
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    }
  }, [isOpen]);
  
  // Focus the dialog when it opens
  useEffect(() => {
    if (isOpen && dialogRef.current) {
      // Find the first focusable element in the dialog
      const focusableElements = dialogRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements.length > 0) {
        (focusableElements[0] as HTMLElement).focus();
      } else {
        dialogRef.current.focus();
      }
    }
  }, [isOpen]);
  
  // Restore focus when the dialog closes
  useEffect(() => {
    return () => {
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, []);
  
  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (event.key === 'Escape' && closeOnEscape) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, closeOnEscape]);
  
  // Handle outside click
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOutsideClick && event.target === event.currentTarget) {
      onClose();
    }
  };
  
  // Focus trap
  const handleTabKey = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab' || !dialogRef.current) return;
    
    const focusableElements = dialogRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    if (event.shiftKey && document.activeElement === firstElement) {
      lastElement.focus();
      event.preventDefault();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      firstElement.focus();
      event.preventDefault();
    }
  };
  
  // Don't render anything if the dialog is closed
  if (!isOpen) return null;
  
  // Render the dialog in a portal
  return ReactDOM.createPortal(
    <div 
      className="dialog-backdrop"
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        ref={dialogRef}
        className={`dialog ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        aria-describedby={description ? "dialog-description" : undefined}
        tabIndex={-1}
        onKeyDown={handleTabKey}
        style={{ maxWidth: width }}
      >
        <div className="dialog-header">
          <h2 id="dialog-title" className="dialog-title">{title}</h2>
          <button 
            type="button"
            className="dialog-close"
            onClick={onClose}
            aria-label="Close dialog"
          >
            ×
          </button>
        </div>
        
        {description && (
          <div id="dialog-description" className="dialog-description sr-only">
            {description}
          </div>
        )}
        
        <div className="dialog-content">
          {children}
        </div>
        
        {footer && (
          <div className="dialog-footer">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default AccessibleDialog; 