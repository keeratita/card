import { describe, it, expect } from 'vitest';
import {
  creditCardValidator,
  expiryValidator,
  cvcValidator,
  cardholderNameValidator,
  emailValidator,
  phoneValidator,
  postalCodeValidator,
  countryValidator,
} from '../../src/angular/validators';

// Mock AbstractControl for testing
interface MockAbstractControl {
  value: unknown;
  root: { get(path: string): MockAbstractControl | null } | null;
  get(path: string): MockAbstractControl | null;
}

describe('Angular Validators', () => {
  describe('creditCardValidator', () => {
    it('should accept valid credit card numbers', () => {
      const validator = creditCardValidator();
      const control: MockAbstractControl = {
        value: '4532015112830366',
        root: null,
        get: () => null,
      };

      const result = validator(control);
      expect(result).toBeNull();
    });

    it('should reject invalid credit card numbers', () => {
      const validator = creditCardValidator();
      const control: MockAbstractControl = {
        value: '1234567890123456',
        root: null,
        get: () => null,
      };

      const result = validator(control);
      expect(result).toEqual({ creditCard: { value: '1234567890123456' } });
    });

    it('should accept valid credit card with spaces', () => {
      const validator = creditCardValidator();
      const control: MockAbstractControl = {
        value: '4532 0151 1283 0366',
        root: null,
        get: () => null,
      };

      const result = validator(control);
      expect(result).toBeNull();
    });

    it('should return null for empty values', () => {
      const validator = creditCardValidator();
      const control: MockAbstractControl = {
        value: '',
        root: null,
        get: () => null,
      };

      const result = validator(control);
      expect(result).toBeNull();
    });
  });

  describe('expiryValidator', () => {
    it('should accept valid expiry dates', () => {
      const validator = expiryValidator();
      const control: MockAbstractControl = {
        value: '12/26',
        root: null,
        get: () => null,
      };

      const result = validator(control);
      expect(result).toBeNull();
    });

    it('should reject invalid expiry dates', () => {
      const validator = expiryValidator();
      const control: MockAbstractControl = {
        value: '13/25',
        root: null,
        get: () => null,
      };

      const result = validator(control);
      expect(result).toEqual({ expiryInvalid: { value: '13/25' } });
    });

    it('should reject past expiry dates', () => {
      const validator = expiryValidator();
      const control: MockAbstractControl = {
        value: '01/20',
        root: null,
        get: () => null,
      };

      const result = validator(control);
      expect(result).toEqual({ expiryInvalid: { value: '01/20' } });
    });

    it('should return null for empty values', () => {
      const validator = expiryValidator();
      const control: MockAbstractControl = {
        value: '',
        root: null,
        get: () => null,
      };

      const result = validator(control);
      expect(result).toBeNull();
    });

    it('should reject invalid slash format with wrong number of parts', () => {
      const validator = expiryValidator();
      const control: MockAbstractControl = {
        value: '12//25',
        root: null,
        get: () => null,
      };

      const result = validator(control);
      expect(result).toEqual({ expiryInvalid: { value: '12//25' } });
    });

    it('should reject invalid MMYY format with wrong length', () => {
      const validator = expiryValidator();
      const control: MockAbstractControl = {
        value: '12345',
        root: null,
        get: () => null,
      };

      const result = validator(control);
      expect(result).toEqual({ expiryInvalid: { value: '12345' } });
    });

    it('should accept valid MMYY format with 4 digits', () => {
      const validator = expiryValidator();
      const control: MockAbstractControl = {
        value: '1227',
        root: null,
        get: () => null,
      };

      const result = validator(control);
      expect(result).toBeNull();
    });

    it('should reject expired MMYY format', () => {
      const validator = expiryValidator();
      const control: MockAbstractControl = {
        value: '0120', // January 2020
        root: null,
        get: () => null,
      };

      const result = validator(control);
      expect(result).toEqual({ expiryInvalid: { value: '0120' } });
    });
  });

  describe('cvcValidator', () => {
    it('should accept valid CVC for Visa', () => {
      const validator = cvcValidator();
      const control: MockAbstractControl = {
        value: '123',
        root: null,
        get: () => null,
      };

      const result = validator(control);
      expect(result).toBeNull();
    });

    it('should accept valid CVC for Amex', () => {
      const validator = cvcValidator('cardNumber');
      const control: MockAbstractControl = {
        value: '1234',
        root: {
          get: (path: string) => {
            if (path === 'cardNumber') {
              return {
                value: '378282246310005', // Amex test number
                root: null,
                get: () => null,
              };
            }
            return null;
          },
        },
        get: () => null,
      };

      const result = validator(control);
      expect(result).toBeNull();
    });

    it('should reject invalid CVC length', () => {
      const validator = cvcValidator();
      const control: MockAbstractControl = {
        value: '12',
        root: null,
        get: () => null,
      };

      const result = validator(control);
      expect(result).toEqual({ cvcInvalid: { value: '12' } });
    });

    it('should return null for empty values', () => {
      const validator = cvcValidator();
      const control: MockAbstractControl = {
        value: '',
        root: null,
        get: () => null,
      };

      const result = validator(control);
      expect(result).toBeNull();
    });
  });

  describe('cardholderNameValidator', () => {
    it('should accept valid cardholder names', () => {
      const validator = cardholderNameValidator();
      const control: MockAbstractControl = {
        value: 'John Doe',
        root: null,
        get: () => null,
      };

      const result = validator(control);
      expect(result).toBeNull();
    });

    it('should only require a non-empty name (single names are valid)', () => {
      const validator = cardholderNameValidator();
      const control: MockAbstractControl = {
        value: 'John',
        root: null,
        get: () => null,
      };

      const result = validator(control);
      expect(result).toBeNull();
    });

    it('should return null for empty values', () => {
      const validator = cardholderNameValidator();
      const control: MockAbstractControl = {
        value: '',
        root: null,
        get: () => null,
      };

      const result = validator(control);
      expect(result).toBeNull();
    });
  });

  describe('emailValidator', () => {
    it('should accept valid emails', () => {
      const validator = emailValidator();
      const control: MockAbstractControl = {
        value: 'john@example.com',
        root: null,
        get: () => null,
      };

      const result = validator(control);
      expect(result).toBeNull();
    });

    it('should reject invalid emails', () => {
      const validator = emailValidator();
      const control: MockAbstractControl = {
        value: 'invalid-email',
        root: null,
        get: () => null,
      };

      const result = validator(control);
      expect(result).toEqual({ emailInvalid: { value: 'invalid-email' } });
    });

    it('should return null for empty values', () => {
      const validator = emailValidator();
      const control: MockAbstractControl = {
        value: '',
        root: null,
        get: () => null,
      };

      const result = validator(control);
      expect(result).toBeNull();
    });
  });

  describe('phoneValidator', () => {
    it('should accept valid phone numbers', () => {
      const validator = phoneValidator();
      const control: MockAbstractControl = {
        value: '1234567890',
        root: null,
        get: () => null,
      };

      const result = validator(control);
      expect(result).toBeNull();
    });

    it('should reject invalid phone numbers', () => {
      const validator = phoneValidator();
      const control: MockAbstractControl = {
        value: '123',
        root: null,
        get: () => null,
      };

      const result = validator(control);
      expect(result).toEqual({ phoneInvalid: { value: '123' } });
    });

    it('should return null for empty values', () => {
      const validator = phoneValidator();
      const control: MockAbstractControl = {
        value: '',
        root: null,
        get: () => null,
      };

      const result = validator(control);
      expect(result).toBeNull();
    });
  });

  describe('postalCodeValidator', () => {
    it('should accept valid postal codes', () => {
      const validator = postalCodeValidator();
      const control: MockAbstractControl = {
        value: '12345',
        root: null,
        get: () => null,
      };

      const result = validator(control);
      expect(result).toBeNull();
    });

    it('should reject invalid postal codes', () => {
      const validator = postalCodeValidator();
      const control: MockAbstractControl = {
        value: '123',
        root: null,
        get: () => null,
      };

      const result = validator(control);
      expect(result).toEqual({ postalCodeInvalid: { value: '123' } });
    });

    it('should return null for empty values', () => {
      const validator = postalCodeValidator();
      const control: MockAbstractControl = {
        value: '',
        root: null,
        get: () => null,
      };

      const result = validator(control);
      expect(result).toBeNull();
    });
  });

  describe('countryValidator', () => {
    it('should accept valid 2 or 3 letter country codes', () => {
      const validator = countryValidator();
      const control: MockAbstractControl = {
        value: 'US',
        root: null,
        get: () => null,
      };

      const result = validator(control);
      expect(result).toBeNull();
    });

    it('should accept 3 letter country codes', () => {
      const validator = countryValidator();
      const control: MockAbstractControl = {
        value: 'USA',
        root: null,
        get: () => null,
      };

      const result = validator(control);
      expect(result).toBeNull();
    });

    it('should return null for empty values', () => {
      const validator = countryValidator();
      const control: MockAbstractControl = {
        value: '',
        root: null,
        get: () => null,
      };

      const result = validator(control);
      expect(result).toBeNull();
    });
  });
});
