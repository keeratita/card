import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  luhnCheck,
  validateExpiry,
  validateCvc,
  validateName,
  validateEmail,
  validatePhone,
  validatePostalCode,
  validateCountry,
  validateGeneric,
} from '../../src/core/domain/validation';

describe('Domain Validations', () => {
  describe('Luhn Check', () => {
    it('should validate valid card numbers', () => {
      // Standard Luhn-valid numbers
      expect(luhnCheck('4242 4242 4242 4242')).toBe(true);
      expect(luhnCheck('4111 1111 1111 1111')).toBe(true);
    });

    it('should reject invalid card numbers', () => {
      expect(luhnCheck('49927398717')).toBe(false);
      expect(luhnCheck('12345')).toBe(false); // too short
    });

    it('should ignore non-digit separators in card numbers', () => {
      expect(luhnCheck('4242-4242-4242-4242')).toBe(true);
    });
  });

  describe('Expiry Validation', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      // Mock system time to June 7, 2026
      vi.setSystemTime(new Date(2026, 5, 7));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should accept future expiry dates', () => {
      expect(validateExpiry('06', '26')).toBe(true); // Current month/year is valid
      expect(validateExpiry('12', '2028')).toBe(true);
      expect(validateExpiry('01', '30')).toBe(true);
    });

    it('should reject past expiry dates', () => {
      expect(validateExpiry('05', '26')).toBe(false); // Past month, current year
      expect(validateExpiry('12', '2025')).toBe(false); // Past year
    });

    it('should reject invalid values', () => {
      expect(validateExpiry('13', '26')).toBe(false); // Invalid month
      expect(validateExpiry('00', '26')).toBe(false);
      expect(validateExpiry('06', '2')).toBe(false); // Invalid year length
    });

    it('should normalize non-digit characters in month and year', () => {
      expect(validateExpiry('06/', '26x')).toBe(true);
    });
  });

  describe('CVC Validation', () => {
    it('should validate standard 3-digit CVC for non-Amex cards', () => {
      expect(validateCvc('123', '4111111111111111')).toBe(true); // Visa
      expect(validateCvc('1234', '4111111111111111')).toBe(false);
    });

    it('should validate 4-digit CVC for Amex cards', () => {
      expect(validateCvc('1234', '371111111111111')).toBe(true); // Amex
      expect(validateCvc('123', '371111111111111')).toBe(false);
    });

    it('should ignore non-digits in CVC input', () => {
      expect(validateCvc('12-3', '4111111111111111')).toBe(true);
    });
  });

  describe('Cardholder Name Validation', () => {
    it('should accept first and last name separated by space', () => {
      expect(validateName('John Doe')).toBe(true);
      expect(validateName('  Jane   Smith  ')).toBe(true);
    });

    it('should reject single names or empty input', () => {
      expect(validateName('SingleName')).toBe(false);
      expect(validateName(' ')).toBe(false);
    });
  });

  describe('Email & Phone Validation', () => {
    it('should validate standard email formats', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('invalid-email')).toBe(false);
    });

    it('should validate phone numbers with at least 8 digits', () => {
      expect(validatePhone('+6681234567')).toBe(true);
      expect(validatePhone('1234567')).toBe(false); // too short
    });
  });

  describe('Address Validations', () => {
    it('should validate postal code length >= 4', () => {
      expect(validatePostalCode('10110')).toBe(true);
      expect(validatePostalCode('123')).toBe(false);
    });

    it('should validate 2-letter ISO country code', () => {
      expect(validateCountry('US')).toBe(true);
      expect(validateCountry('THA')).toBe(false);
    });

    it('should trim country code input before validation', () => {
      expect(validateCountry(' TH ')).toBe(true);
    });
  });

  describe('Generic Validation', () => {
    it('should validate non-empty trimmed values', () => {
      expect(validateGeneric(' value ')).toBe(true);
      expect(validateGeneric('   ')).toBe(false);
    });
  });
});
