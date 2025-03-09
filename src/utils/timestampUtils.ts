import { Timestamp } from 'firebase/firestore';

/**
 * Utility functions for handling timestamps consistently across the application
 */

/**
 * Converts any timestamp format to an ISO string
 * @param val - The timestamp value to convert (can be Firestore Timestamp, Date, string, or object with seconds/nanoseconds)
 * @returns ISO string representation of the timestamp or null if conversion fails
 */
export const toISOString = (val: any): string | null => {
  if (!val) return null;
  
  // Handle string timestamps
  if (typeof val === 'string') return val;
  
  // Handle Firestore Timestamp objects
  if (val instanceof Timestamp) {
    return val.toDate().toISOString();
  }
  
  // Handle objects with seconds and nanoseconds (Firestore Timestamp format)
  if (val && typeof val === 'object' && 'seconds' in val && 'nanoseconds' in val) {
    try {
      return new Date(val.seconds * 1000 + val.nanoseconds / 1000000).toISOString();
    } catch (error) {
      console.warn('Error converting timestamp with seconds/nanoseconds:', error);
      return null;
    }
  }
  
  // Handle Date objects
  if (val instanceof Date) {
    return val.toISOString();
  }
  
  // Handle objects with toDate method (Firestore Timestamp)
  if (val && typeof val === 'object' && typeof val.toDate === 'function') {
    try {
      return val.toDate().toISOString();
    } catch (error) {
      console.warn('Error converting timestamp with toDate():', error);
      return null;
    }
  }
  
  // Return null for unsupported formats
  console.warn('Unsupported timestamp format:', val);
  return null;
};

/**
 * Converts any timestamp format to a Date object
 * @param val - The timestamp value to convert
 * @returns Date object or null if conversion fails
 */
export const toDate = (val: any): Date | null => {
  if (!val) return null;
  
  // Handle Date objects
  if (val instanceof Date) return val;
  
  // Handle Firestore Timestamp objects
  if (val instanceof Timestamp) {
    return val.toDate();
  }
  
  // Handle objects with seconds and nanoseconds (Firestore Timestamp format)
  if (val && typeof val === 'object' && 'seconds' in val && 'nanoseconds' in val) {
    try {
      return new Date(val.seconds * 1000 + val.nanoseconds / 1000000);
    } catch (error) {
      console.warn('Error converting timestamp with seconds/nanoseconds to Date:', error);
      return null;
    }
  }
  
  // Handle string timestamps
  if (typeof val === 'string') {
    try {
      return new Date(val);
    } catch (error) {
      console.warn('Error converting string timestamp to Date:', error);
      return null;
    }
  }
  
  // Handle objects with toDate method (Firestore Timestamp)
  if (val && typeof val === 'object' && typeof val.toDate === 'function') {
    try {
      return val.toDate();
    } catch (error) {
      console.warn('Error converting timestamp with toDate() to Date:', error);
      return null;
    }
  }
  
  // Return null for unsupported formats
  console.warn('Unsupported timestamp format for Date conversion:', val);
  return null;
};

/**
 * Formats a timestamp for display
 * @param val - The timestamp value to format
 * @param format - The format to use (default: 'medium')
 * @returns Formatted date string or empty string if formatting fails
 */
export const formatTimestamp = (
  val: any, 
  format: 'short' | 'medium' | 'long' | 'full' = 'medium'
): string => {
  const date = toDate(val);
  if (!date) return '';
  
  try {
    switch (format) {
      case 'short':
        return date.toLocaleDateString();
      case 'medium':
        return date.toLocaleString();
      case 'long':
        return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
      case 'full':
        return date.toLocaleString(undefined, {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });
      default:
        return date.toLocaleString();
    }
  } catch (error) {
    console.warn('Error formatting timestamp:', error);
    return '';
  }
};

/**
 * Checks if a timestamp is valid
 * @param val - The timestamp value to check
 * @returns True if the timestamp is valid, false otherwise
 */
export const isValidTimestamp = (val: any): boolean => {
  return toDate(val) !== null;
};

/**
 * Gets the current timestamp as a Firestore Timestamp
 * @returns Firestore Timestamp representing the current time
 */
export const getCurrentTimestamp = (): Timestamp => {
  return Timestamp.now();
};

/**
 * Gets the current timestamp as an ISO string
 * @returns ISO string representing the current time
 */
export const getCurrentISOString = (): string => {
  return new Date().toISOString();
};

export default {
  toISOString,
  toDate,
  formatTimestamp,
  isValidTimestamp,
  getCurrentTimestamp,
  getCurrentISOString
}; 