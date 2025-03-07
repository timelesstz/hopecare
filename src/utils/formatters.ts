/**
 * Format a number as currency
 * @param amount - The amount to format
 * @param currency - The currency code (default: USD)
 * @param locale - The locale to use for formatting (default: en-US)
 * @returns Formatted currency string
 */
export const formatCurrency = (
  amount: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format a date to a readable string
 * @param date - The date to format
 * @param format - The format to use (default: 'medium')
 * @param locale - The locale to use for formatting (default: en-US)
 * @returns Formatted date string
 */
export const formatDate = (
  date: Date | string,
  format: 'short' | 'medium' | 'long' = 'medium',
  locale: string = 'en-US'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: format === 'short' ? 'short' : format === 'medium' ? 'long' : 'long',
    day: 'numeric',
    hour: format === 'long' ? 'numeric' : undefined,
    minute: format === 'long' ? 'numeric' : undefined,
  };
  
  return new Intl.DateTimeFormat(locale, options).format(dateObj);
};

/**
 * Format a number with commas
 * @param num - The number to format
 * @returns Formatted number string
 */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat().format(num);
};

/**
 * Truncate a string to a specified length
 * @param str - The string to truncate
 * @param length - The maximum length
 * @param ending - The ending to append (default: '...')
 * @returns Truncated string
 */
export const truncateString = (
  str: string,
  length: number,
  ending: string = '...'
): string => {
  if (str.length <= length) {
    return str;
  }
  return str.substring(0, length - ending.length) + ending;
};

/**
 * Format a phone number to a readable format
 * @param phone - The phone number to format
 * @returns Formatted phone number
 */
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format based on length
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  } else if (cleaned.length > 10) {
    return `+${cleaned.slice(0, cleaned.length - 10)} ${cleaned.slice(-10, -7)} ${cleaned.slice(-7, -4)}-${cleaned.slice(-4)}`;
  }
  
  // Return original if we can't format it
  return phone;
}; 