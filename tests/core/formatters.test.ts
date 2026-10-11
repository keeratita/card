import { describe, it, expect } from 'vitest';
import {
  formatCardNumber,
  formatCvc,
  formatExpiry,
  formatPhone,
  isCardLengthValid,
  reformatExpiryDate,
  validateCardNumberLength,
} from '../../src/core/formatters/card-formatter';

describe('Core Formatters', () => {
  describe('Card Number Formatting', () => {
    it('should format Visa numbers with 4-4-4-4 spacing', () => {
      expect(formatCardNumber('4111111111111111')).toBe('4111 1111 1111 1111');
    });

    it('should format Amex numbers with 4-6-5 spacing', () => {
      expect(formatCardNumber('371111111111111')).toBe('3711 111111 11111');
    });

    it('should truncate very long card numbers to 19 digits', () => {
      const veryLong = '4'.repeat(100);
      expect(formatCardNumber(veryLong)).toBe('4444 4444 4444 4444 444');
    });

    it('should preserve all digits of a 19-digit card number', () => {
      const nineteen = '4111111111111111111';
      expect(formatCardNumber(nineteen)).toBe('4111 1111 1111 1111 111');
    });

    it('should preserve 17-digit Mastercard/JCB/Discover numbers', () => {
      expect(formatCardNumber('55555555555555555')).toBe(
        '5555 5555 5555 5555 5',
      );
      expect(formatCardNumber('35281111111111117')).toBe(
        '3528 1111 1111 1111 7',
      );
    });

    it('should not truncate 16-digit Diners Club International numbers', () => {
      expect(formatCardNumber('3611111111111111')).toBe(
        '3611 1111 1111 1111',
      );
    });

    it('should handle empty string', () => {
      expect(formatCardNumber('')).toBe('');
    });

    it('should ignore non-digit characters', () => {
      expect(formatCardNumber('4111-1111-1111-1111')).toBe('4111 1111 1111 1111');
    });
  });

  describe('Expiry Formatting', () => {
    it('should format MM/YY correctly', () => {
      expect(formatExpiry('1228')).toBe('12 / 28');
    });

    it('should handle empty string', () => {
      expect(formatExpiry('')).toBe('');
    });

    it('should truncate very long expiry values to 2 digits', () => {
      const veryLong = '12'.repeat(100);
      expect(formatExpiry(veryLong)).toBe('12 / 12'); // Only 2 digits for each part
    });

    it('should handle partial input', () => {
      expect(formatExpiry('1')).toBe('1');
    });

    it('should keep a single leading 0 as an intermediate state', () => {
      expect(formatExpiry('0')).toBe('0');
    });

    it('should pass through valid single-digit months 1-9', () => {
      expect(formatExpiry('2')).toBe('2');
      expect(formatExpiry('9')).toBe('9');
    });

    it('should interpret a tens-prefixed month as a leading-zero month', () => {
      // "2" then "0" then "2" then "5" = February 2025, never December
      expect(formatExpiry('2025')).toBe('02 / 25');
      expect(formatExpiry('202')).toBe('02 / 2');
      expect(formatExpiry('20')).toBe('02');
      expect(formatExpiry('0912')).toBe('09 / 12');
    });

    it('should clamp months 13-19 to 12', () => {
      expect(formatExpiry('13')).toBe('12');
      expect(formatExpiry('1325')).toBe('12 / 25');
      expect(formatExpiry('19')).toBe('12');
    });

    it('should not rewrite 00 so validation can reject it', () => {
      expect(formatExpiry('00')).toBe('00');
    });
  });

  describe('CVC Formatting', () => {
    it('should format 3-digit CVC for Visa', () => {
      expect(formatCvc('1234', '4111111111111111')).toBe('123');
    });

    it('should format 4-digit CVC for Amex', () => {
      expect(formatCvc('1234', '371111111111111')).toBe('1234');
    });

    it('should truncate very long CVC to 3 digits for Visa', () => {
      // For Visa, CVC is limited to 3 digits
      expect(formatCvc('12345678', '4111111111111111')).toBe('123');
    });
  });
});

describe('Additional Public Formatters', () => {
  describe('formatPhone', () => {
    it('preserves a leading plus only', () => {
      expect(formatPhone('+668 1234 567')).toBe('+6681234567');
      expect(formatPhone('068 123 4567')).toBe('0681234567');
      expect(formatPhone('')).toBe('');
    });
  });

  describe('reformatExpiryDate', () => {
    it('normalizes separators to MM / YY', () => {
      expect(reformatExpiryDate('1225')).toBe('12 / 25');
      expect(reformatExpiryDate('12-25')).toBe('12 / 25');
      // A 4-digit year is reduced to its last two digits, so backend-stored
      // MM/YYYY normalizes to the same MM/YY the formatters use.
      expect(reformatExpiryDate('12/2025')).toBe('12 / 25');
      expect(reformatExpiryDate('1 / 2030')).toBe('01 / 30');
    });
  });

  describe('isCardLengthValid', () => {
    it('respects brand length ranges', () => {
      expect(isCardLengthValid('4242424242424242')).toBe(true); // Visa 16
      expect(isCardLengthValid('340000000000009')).toBe(true); // Amex 15
      expect(isCardLengthValid('3400000000000000')).toBe(false); // Amex 16 invalid
      expect(isCardLengthValid('4242')).toBe(false); // too short for any brand
    });
  });

  describe('validateCardNumberLength', () => {
    it('returns the brand, brand length range and actual length', () => {
      expect(validateCardNumberLength('4242424242424242')).toEqual({
        isValid: true,
        brand: 'visa',
        minLength: 13,
        maxLength: 16,
        actualLength: 16,
      });
      expect(validateCardNumberLength('340000000000009')).toEqual({
        isValid: true,
        brand: 'amex',
        minLength: 15,
        maxLength: 15,
        actualLength: 15,
      });
    });

    it('reports the detected brand for unrecognized BINs (unknown-brand fallback)', () => {
      const result = validateCardNumberLength('999999999999999');
      expect(result.brand).toBe('unknown');
      expect(result.minLength).toBe(13);
      expect(result.maxLength).toBe(19);
      // An unrecognized brand has no brand-specific range, so the generic
      // 13-19 bounds apply — a 15-digit number satisfies them. The result
      // must agree with `isCardLengthValid`, which uses the same fallback.
      expect(result.isValid).toBe(true);
      expect(result.isValid).toBe(isCardLengthValid('999999999999999'));
      expect(result.actualLength).toBe(15);
    });

    it('flags an unknown-brand number outside the generic bounds', () => {
      const result = validateCardNumberLength('999999999999');
      expect(result.brand).toBe('unknown');
      expect(result.isValid).toBe(false);
      expect(result.actualLength).toBe(12);
    });
  });
});

describe('Formatter Security Edge Cases', () => {
  describe('Card Number Formatting', () => {
    it('should handle XSS in card number', () => {
      // The XSS string contains the digit '1' from the closing tag
      const result = formatCardNumber('<img src=x onerror=alert(1)>');
      // Only digit in the string is '1', so result is '1'
      expect(result).toBe('1');
    });

    it('should handle control characters', () => {
      const result = formatCardNumber('4111\x001111111111111');
      expect(result).toBe('4111 1111 1111 1111 1'); // Control chars removed, all 17 digits preserved
    });
  });

  describe('Expiry Formatting', () => {
    it('should handle SQL injection in expiry', () => {
      // Non-digits are removed, leaving "11" which has only 2 digits
      // With 2 digits, formatExpiry returns just the month without year separator
      expect(formatExpiry("' OR '1'='1")).toBe('11');
    });
  });
});


describe('all-brands length window', () => {
  // Unrecognized brands fall back to MIN/MAX_CARD_NUMBER_LENGTH, which is the
  // only thing standing between a truncated PAN and an accepted one.
  it('bounds an unknown brand at 13-19 digits', () => {
    const unknown = validateCardNumberLength('9876543210123');
    expect(unknown.brand).toBe('unknown');
    expect(unknown.minLength).toBe(13);
    expect(unknown.maxLength).toBe(19);
  });

  it('truncates a CVC to the length its brand actually prints', () => {
    expect(formatCvc('1234', '378282246310005')).toBe('1234'); // amex keeps 4
    expect(formatCvc('1234', '4111111111111111')).toBe('123'); // visa keeps 3
  });
});
