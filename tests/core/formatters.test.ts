import { describe, it, expect } from 'vitest';
import { generateExpiryDate, formatCardNumber, formatExpiry, formatCvc } from '../../src/core/formatters/card-formatter';

describe('Core Formatters', () => {
  describe('generateExpiryDate', () => {
    it('should generate a valid future expiry date', () => {
      const expiry = generateExpiryDate();
      
      // Should be in MM/YY format
      expect(expiry).toMatch(/^\d{2}\/\d{2}$/);
      
      // Should be a future date (at least 1 year ahead)
      const [month, year] = expiry.split('/').map(Number);
      const now = new Date();
      const currentYear = now.getFullYear() % 100;
      const currentMonth = now.getMonth() + 1;
      
      // Year should be greater than current year, or equal to current year + 1
      if (year > currentYear) {
        // Valid
      } else if (year === currentYear) {
        // Month should be greater than current month
        expect(month).toBeGreaterThan(currentMonth);
      } else {
        // Year should be at least 1 year in the future
        expect(year).toBeGreaterThan(currentYear);
      }
    });
    
    it('should generate a date at least 1 year in the future', () => {
      const expiry = generateExpiryDate();
      const [month, year] = expiry.split('/').map(Number);
      
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth() + 1;
      
      const expiryYear = 2000 + year; // Convert 2-digit year to 4-digit
      const expiryMonth = month;
      
      // The generated date should be at least 1 year in the future
      expect(expiryYear).toBeGreaterThanOrEqual(currentYear + 1);
      
      // If it's the same year, the month should be in the future
      if (expiryYear === currentYear + 1) {
        expect(expiryMonth).toBeGreaterThanOrEqual(currentMonth);
      }
    });
  });

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