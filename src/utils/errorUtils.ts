import { toast } from 'react-hot-toast';
import { logError } from './errorLogger';

/**
 * Utility functions for handling errors consistently across the application
 */

/**
 * Error types for categorizing errors
 */
export enum ErrorType {
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NETWORK = 'network',
  SERVER = 'server',
  DATABASE = 'database',
  STORAGE = 'storage',
  UNKNOWN = 'unknown'
}

/**
 * Interface for standardized error handling
 */
export interface ErrorHandlerOptions {
  showToast?: boolean;
  logToServer?: boolean;
  throwError?: boolean;
  context?: string;
  userMessage?: string;
}

/**
 * Default error handler options
 */
const defaultOptions: ErrorHandlerOptions = {
  showToast: true,
  logToServer: true,
  throwError: false,
  context: 'application'
};

/**
 * Handles errors consistently across the application
 * @param error - The error to handle
 * @param type - The type of error
 * @param options - Options for error handling
 * @returns The error message
 */
export const handleError = (
  error: any,
  type: ErrorType = ErrorType.UNKNOWN,
  options: ErrorHandlerOptions = {}
): string => {
  // Merge options with defaults
  const opts = { ...defaultOptions, ...options };
  
  // Extract error message
  let errorMessage = '';
  if (typeof error === 'string') {
    errorMessage = error;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (error && typeof error === 'object' && 'message' in error) {
    errorMessage = error.message;
  } else {
    errorMessage = 'An unknown error occurred';
  }
  
  // User-friendly message
  const userMessage = opts.userMessage || getUserFriendlyMessage(type, errorMessage);
  
  // Show toast if enabled
  if (opts.showToast) {
    toast.error(userMessage);
  }
  
  // Log to server if enabled
  if (opts.logToServer) {
    logError(type, {
      message: errorMessage,
      context: opts.context,
      originalError: error,
      timestamp: new Date().toISOString()
    });
  }
  
  // Log to console
  console.error(`[${type.toUpperCase()}][${opts.context}] ${errorMessage}`, error);
  
  // Throw error if enabled
  if (opts.throwError && error instanceof Error) {
    throw error;
  } else if (opts.throwError) {
    throw new Error(errorMessage);
  }
  
  return userMessage;
};

/**
 * Gets a user-friendly error message based on error type
 * @param type - The type of error
 * @param originalMessage - The original error message
 * @returns A user-friendly error message
 */
const getUserFriendlyMessage = (type: ErrorType, originalMessage: string): string => {
  switch (type) {
    case ErrorType.VALIDATION:
      return originalMessage || 'Please check your input and try again';
    case ErrorType.AUTHENTICATION:
      return 'Authentication failed. Please sign in again';
    case ErrorType.AUTHORIZATION:
      return 'You do not have permission to perform this action';
    case ErrorType.NETWORK:
      return 'Network error. Please check your connection and try again';
    case ErrorType.SERVER:
      return 'Server error. Please try again later';
    case ErrorType.DATABASE:
      return 'Database operation failed. Please try again';
    case ErrorType.STORAGE:
      return 'Storage operation failed. Please try again';
    case ErrorType.UNKNOWN:
    default:
      return 'An unexpected error occurred. Please try again';
  }
};

/**
 * Creates an error handler with predefined options
 * @param defaultType - The default error type
 * @param defaultOptions - The default options
 * @returns An error handler function
 */
export const createErrorHandler = (
  defaultType: ErrorType = ErrorType.UNKNOWN,
  defaultOptions: ErrorHandlerOptions = {}
) => {
  return (error: any, type?: ErrorType, options?: ErrorHandlerOptions) => {
    return handleError(error, type || defaultType, { ...defaultOptions, ...options });
  };
};

/**
 * Specialized error handlers for common error types
 */
export const handleValidationError = createErrorHandler(ErrorType.VALIDATION);
export const handleAuthError = createErrorHandler(ErrorType.AUTHENTICATION);
export const handleNetworkError = createErrorHandler(ErrorType.NETWORK);
export const handleServerError = createErrorHandler(ErrorType.SERVER);
export const handleDatabaseError = createErrorHandler(ErrorType.DATABASE);
export const handleStorageError = createErrorHandler(ErrorType.STORAGE);

export default {
  handleError,
  createErrorHandler,
  handleValidationError,
  handleAuthError,
  handleNetworkError,
  handleServerError,
  handleDatabaseError,
  handleStorageError,
  ErrorType
}; 