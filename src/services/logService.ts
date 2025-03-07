import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export enum LogLevel {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  DEBUG = 'debug',
}

export enum LogCategory {
  PAYMENT = 'payment',
  AUTH = 'auth',
  API = 'api',
  SYSTEM = 'system',
}

interface LogEntry {
  level: LogLevel;
  category: LogCategory;
  message: string;
  details?: any;
  user_id?: string;
}

/**
 * Logs an entry to the database and console
 */
export const logEntry = async (entry: LogEntry): Promise<void> => {
  try {
    const logData = {
      ...entry,
      timestamp: serverTimestamp(),
      environment: import.meta.env.VITE_APP_ENVIRONMENT || 'development',
    };

    await addDoc(collection(db, 'logs'), logData);
  } catch (error) {
    console.error('Error logging to Firestore:', error);
    
    // Fallback to console logging in case of error
    console.log(`[${entry.level.toUpperCase()}][${entry.category}] ${entry.message}`, entry.details || '');
  }
};

/**
 * Logs a payment-related event
 */
export const logPayment = async (
  message: string,
  details: any,
  level: LogLevel = LogLevel.INFO,
  userId?: string
): Promise<void> => {
  await logEntry({
    level,
    category: LogCategory.PAYMENT,
    message,
    details,
    user_id: userId,
  });
};

/**
 * Logs a payment error
 */
export const logPaymentError = async (
  message: string,
  details: any,
  userId?: string
): Promise<void> => {
  await logPayment(message, details, LogLevel.ERROR, userId);
};

/**
 * Logs a payment success
 */
export const logPaymentSuccess = async (
  message: string,
  details: any,
  userId?: string
): Promise<void> => {
  await logPayment(message, details, LogLevel.INFO, userId);
}; 