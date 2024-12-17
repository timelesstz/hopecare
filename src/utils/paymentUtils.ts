export const validateCardNumber = (number: string): boolean => {
  const cleaned = number.replace(/\s/g, '');
  if (!/^\d{16}$/.test(cleaned)) return false;
  
  // Luhn algorithm implementation
  let sum = 0;
  let isEven = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i]);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

export const validateExpiryDate = (date: string): boolean => {
  const [month, year] = date.split('/').map(num => parseInt(num));
  if (!month || !year) return false;
  
  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;
  
  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;
  if (month < 1 || month > 12) return false;
  
  return true;
};

export const formatCardNumber = (value: string): string => {
  return value.replace(/\s/g, '').match(/.{1,4}/g)?.join(' ') || value;
};

export const formatExpiryDate = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length >= 2) {
    return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
  }
  return cleaned;
};

export const getCardType = (number: string): string => {
  const patterns = {
    visa: /^4/,
    mastercard: /^5[1-5]/,
    amex: /^3[47]/,
    discover: /^6(?:011|5)/
  };
  
  const cleaned = number.replace(/\s/g, '');
  for (const [type, pattern] of Object.entries(patterns)) {
    if (pattern.test(cleaned)) return type;
  }
  
  return 'unknown';
};