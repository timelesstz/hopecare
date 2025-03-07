// Supabase client import removed - using Firebase instead
import { db, auth } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface ErrorLog {
  type: string;
  message: string;
  stack?: string;
  metadata?: Record<string, any>;
  user_id?: string;
  severity: 'error' | 'warning' | 'info';
  environment: string;
  timestamp: string;
}

interface ErrorInfo {
  error: Error;
  errorInfo?: {
    componentStack?: string;
  };
  location?: string;
  timestamp?: string;
  metadata?: Record<string, any>;
}

class ErrorLogger {
  private static instance: ErrorLogger;
  private readonly environment: string;

  private constructor() {
    this.environment = process.env.NODE_ENV || 'development';
  }

  public static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  public async logError(type: string, info: ErrorInfo): Promise<void> {
    const currentUser = auth.currentUser;
    
    const errorLog: ErrorLog = {
      type,
      message: info.error.message,
      stack: info.error.stack,
      metadata: {
        ...info.metadata,
        componentStack: info.errorInfo?.componentStack,
        location: info.location || window.location.href,
        userAgent: navigator.userAgent,
        timestamp: info.timestamp || new Date().toISOString(),
      },
      user_id: currentUser?.uid,
      severity: 'error',
      environment: this.environment,
      timestamp: new Date().toISOString(),
    };

    // Log to console in development
    if (this.environment === 'development') {
      console.error('Error logged:', errorLog);
    }

    try {
      // Store error in Firestore
      const errorLogsCollection = collection(db, 'error_logs');
      await addDoc(errorLogsCollection, {
        ...errorLog,
        created_at: serverTimestamp(),
      });

      // If in production, send to external error tracking service
      if (this.environment === 'production') {
        await this.sendToExternalService(errorLog);
      }
    } catch (err) {
      console.error('Error logging failed:', err);
    }
  }

  private async sendToExternalService(errorLog: ErrorLog): Promise<void> {
    // Implement integration with external error tracking service
    // Example: Sentry, LogRocket, etc.
    if (process.env.VITE_ERROR_TRACKING_SERVICE === 'sentry') {
      // Sentry.captureException(errorLog);
    }
  }

  public async logWarning(message: string, metadata?: Record<string, any>): Promise<void> {
    const currentUser = auth.currentUser;
    
    const warningLog: ErrorLog = {
      type: 'warning',
      message,
      metadata,
      user_id: currentUser?.uid,
      severity: 'warning',
      environment: this.environment,
      timestamp: new Date().toISOString(),
    };

    try {
      // Store warning in Firestore
      const errorLogsCollection = collection(db, 'error_logs');
      await addDoc(errorLogsCollection, {
        ...warningLog,
        created_at: serverTimestamp(),
      });
    } catch (err) {
      console.error('Warning logging failed:', err);
    }
  }
}

const errorLogger = ErrorLogger.getInstance();

export const logError = (type: string, info: ErrorInfo): void => {
  errorLogger.logError(type, info);
};

export const logWarning = (message: string, metadata?: Record<string, any>): void => {
  errorLogger.logWarning(message, metadata);
}; 