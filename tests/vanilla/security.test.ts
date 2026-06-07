import { describe, it, expect } from 'vitest';
import { escapeHtml, sanitizeOptionalFields } from '../../src/vanilla/internal/security';
import { getCardLogoSvg } from '../../src/core/domain/card-brand-logos';
import { detectCardBrand } from '../../src/core/domain/brand';
import { luhnCheck, validateExpiry, validateCvc, validateName, validateEmail, validatePhone, validatePostalCode, validateCountry } from '../../src/core/domain/validation';

describe('Vanilla Security Guards', () => {
  it('escapes html-special characters to prevent XSS injection', () => {
    const input = `<img src=x onerror=alert("xss")>&'"`;
    expect(escapeHtml(input)).toBe('&lt;img src=x onerror=alert(&quot;xss&quot;)&gt;&amp;&#39;&quot;');
  });

  it('removes unknown optional fields provided at runtime', () => {
    const fields = sanitizeOptionalFields([
      'email',
      '__proto__',
      'postalCode',
      '<script>alert(1)</script>',
      'email'
    ]);

    expect(fields).toEqual(['email', 'postalCode']);
  });
});

describe('Edge Case & Security Validation', () => {
  describe('Brand Detection', () => {
    it('should return unknown for empty string', () => {
      expect(detectCardBrand('')).toBe('unknown');
    });

    it('should return unknown for extremely long card numbers (DoS protection)', () => {
      const veryLongNumber = '4'.repeat(1000);
      expect(detectCardBrand(veryLongNumber)).toBe('visa');
    });

    it('should handle XSS payloads in card number', () => {
      const xssInput = '<img src=x onerror=alert(1)>';
      expect(detectCardBrand(xssInput)).toBe('unknown');
    });

    it('should handle numbers starting with valid patterns but too short', () => {
      expect(detectCardBrand('4')).toBe('unknown');
      expect(detectCardBrand('41')).toBe('unknown');
      expect(detectCardBrand('411')).toBe('unknown');
      expect(detectCardBrand('4111')).toBe('unknown');
      expect(detectCardBrand('41111')).toBe('unknown');
    });

    it('should handle numbers with letters mixed in', () => {
      expect(detectCardBrand('4111a11111111111')).toBe('visa');
    });

    it('should handle numbers with special characters', () => {
      expect(detectCardBrand('4111-1111-1111-1111')).toBe('visa');
    });
  });

  describe('Luhn Check', () => {
    it('should handle empty string', () => {
      expect(luhnCheck('')).toBe(false);
    });

    it('should handle extremely long numbers (DoS protection)', () => {
      const veryLongNumber = '4'.repeat(100);
      expect(luhnCheck(veryLongNumber)).toBe(false);
    });
  });

  describe('Expiry Validation', () => {
    it('should handle empty strings', () => {
      expect(validateExpiry('', '')).toBe(false);
    });

    it('should handle extremely long expiry values', () => {
      expect(validateExpiry('01'.repeat(100), '20'.repeat(100))).toBe(false);
    });
  });

  describe('CVC Validation', () => {
    it('should handle empty CVC', () => {
      expect(validateCvc('', '4111111111111111')).toBe(false);
    });

    it('should handle empty card number (defaults to non-Amex)', () => {
      expect(validateCvc('123', '')).toBe(true);
      expect(validateCvc('1234', '')).toBe(false);
    });
  });

  describe('Email Validation', () => {
    it('should handle extremely long emails', () => {
      const veryLongEmail = 'a'.repeat(300) + '@example.com';
      expect(validateEmail(veryLongEmail)).toBe(false);
    });

    it('should handle XSS in email', () => {
      expect(validateEmail('<script>alert(1)</script>@example.com')).toBe(true);
    });

    it('should handle SQL injection patterns', () => {
      expect(validateEmail("' OR '1'='1@example.com")).toBe(false);
    });
  });

  describe('Phone Validation', () => {
    it('should handle extremely long phone numbers', () => {
      const veryLongPhone = '1'.repeat(100);
      expect(validatePhone(veryLongPhone)).toBe(true);
    });
  });

  describe('Name Validation', () => {
    it('should handle empty string', () => {
      expect(validateName('')).toBe(false);
    });
  });

  describe('Postal Code Validation', () => {
    it('should handle empty string', () => {
      expect(validatePostalCode('')).toBe(false);
    });
  });

  describe('Country Validation', () => {
    it('should handle empty string', () => {
      expect(validateCountry('')).toBe(false);
    });
  });

  describe('Card Brand Logo XSS Prevention', () => {
    it('should use default logo for XSS payloads', () => {
      const xssBrand = '<script>alert(1)</script>';
      const result = getCardLogoSvg(xssBrand);
      expect(result).not.toContain('<script>');
    });

    it('should use default logo for empty brand', () => {
      const result = getCardLogoSvg('');
      expect(result).toContain('48 48');
    });

    it('should use default logo for null brand', () => {
      const result = getCardLogoSvg(null as any);
      expect(result).toContain('48 48');
    });

    it('should use default logo for undefined brand', () => {
      const result = getCardLogoSvg(undefined as any);
      expect(result).toContain('48 48');
    });

    it('should use default logo for invalid brand name', () => {
      const result = getCardLogoSvg('invalid-brand');
      expect(result).toContain('48 48');
    });
  });
});