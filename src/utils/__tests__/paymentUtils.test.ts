```typescript
import { describe, it, expect } from 'vitest';
import {
  validateCardNumber,
  validateExpiryDate,
  formatCardNumber,
  formatExpiryDate,
  getCardType
} from '../paymentUtils';

describe('paymentUtils', () => {
  describe('validateCardNumber', () => {
    it('validates correct card numbers', () => {
      expect(validateCardNumber('4532015112830366')).toBe(true); // Valid Visa
      expect(validateCardNumber('5425233430109903')).toBe(true); // Valid Mastercard
    });

    it('invalidates incorrect card numbers', () => {
      expect(validateCardNumber('4532015112830367')).toBe(false);
      expect(validateCardNumber('1234567890123456')).toBe(false);
    });

    it('handles formatted card numbers', () => {
      expect(validateCardNumber('4532 0151 1283 0366')).toBe(true);
    });
  });

  describe('validateExpiryDate', () => {
    it('validates future dates', () => {
      const futureYear = new Date().getFullYear() % 100 + 1;
      expect(validateExpiryDate(`12/${futureYear}`)).toBe(true);
    });

    it('invalidates past dates', () => {
      expect(validateExpiryDate('12/20')).toBe(false);
    });

    it('invalidates invalid months', () => {
      const futureYear = new Date().getFullYear() % 100 + 1;
      expect(validateExpiryDate(`13/${futureYear}`)).toBe(false);
      expect(validateExpiryDate(`00/${futureYear}`)).toBe(false);
    });
  });

  describe('formatCardNumber', () => {
    it('formats card number with spaces', () => {
      expect(formatCardNumber('4111111111111111'))
        .toBe('4111 1111 1111 1111');
    });

    it('handles partial card numbers', () => {
      expect(formatCardNumber('411111')).toBe('4111 11');
    });
  });

  describe('formatExpiryDate', () => {
    it('formats expiry date with slash', () => {
      expect(formatExpiryDate('1224')).toBe('12/24');
    });

    it('handles partial input', () => {
      expect(formatExpiryDate('12')).toBe('12');
    });
  });

  describe('getCardType', () => {
    it('identifies Visa cards', () => {
      expect(getCardType('4111111111111111')).toBe('visa');
    });

    it('identifies Mastercard cards', () => {
      expect(getCardType('5425233430109903')).toBe('mastercard');
    });

    it('identifies American Express cards', () => {
      expect(getCardType('371449635398431')).toBe('amex');
    });

    it('identifies Discover cards', () => {
      expect(getCardType('6011111111111117')).toBe('discover');
    });

    it('returns unknown for unrecognized cards', () => {
      expect(getCardType('9999999999999999')).toBe('unknown');
    });
  });
});
```