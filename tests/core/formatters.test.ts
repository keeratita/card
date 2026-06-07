import { describe, it, expect } from 'vitest';
import {
  cleanDigits,
  formatCardNumber,
  formatExpiry,
  formatCvc,
  formatCountryCode,
  formatPhone
} from '../../src/core/formatters/card-formatter';

describe('Input Formatters', () => {
  describe('Digit Cleanup', () => {
    it('should remove all non-digit characters', () => {
      expect(cleanDigits('12-34 ab.56')).toBe('123456');
    });
  });

  describe('Card Number Formatter', () => {
    it('should format standard cards with 4-4-4-4 spacing', () => {
      expect(formatCardNumber('4111111111111111')).toBe('4111 1111 1111 1111');
      expect(formatCardNumber('41112')).toBe('4111 2');
    });

    it('should format Amex cards with 4-6-5 spacing', () => {
      expect(formatCardNumber('371111111111111')).toBe('3711 111111 11111');
      expect(formatCardNumber('341112222')).toBe('3411 12222');
    });

    it('should strip non-digits and limit standard cards to 16 digits', () => {
      expect(formatCardNumber('4111-1111-1111-1111-9999')).toBe('4111 1111 1111 1111');
    });

    it('should limit Amex cards to 15 digits', () => {
      expect(formatCardNumber('371111111111111999')).toBe('3711 111111 11111');
    });
  });

  describe('Expiry Date Formatter', () => {
    it('should format exp date as MM / YY', () => {
      expect(formatExpiry('1228')).toBe('12 / 28');
      expect(formatExpiry('05')).toBe('05');
      expect(formatExpiry('052')).toBe('05 / 2');
    });

    it('should constrain month between 01 and 12', () => {
      expect(formatExpiry('13')).toBe('12'); // Month corrected to 12
      expect(formatExpiry('00')).toBe('01'); // Month corrected to 01
    });

    it('should ignore non-digits and keep at most 4 digits', () => {
      expect(formatExpiry('12/2899')).toBe('12 / 28');
      expect(formatExpiry('ab')).toBe('');
    });
  });

  describe('CVC Formatter', () => {
    it('should restrict to 4 digits for Amex', () => {
      expect(formatCvc('12345', '371111111111111')).toBe('1234');
    });

    it('should restrict to 3 digits for non-Amex', () => {
      expect(formatCvc('12345', '4111111111111111')).toBe('123');
    });

    it('should strip non-digit characters from CVC input', () => {
      expect(formatCvc('12-3x', '4111111111111111')).toBe('123');
    });
  });

  describe('Country and Phone Formatters', () => {
    it('should limit country code to 2 uppercase alphabetic chars', () => {
      expect(formatCountryCode('th123')).toBe('TH');
      expect(formatCountryCode('usa')).toBe('US');
    });

    it('should format phone number preserving leading plus sign', () => {
      expect(formatPhone('+66-81-234-5678')).toBe('+66812345678');
      expect(formatPhone('081-234-5678')).toBe('0812345678');
    });

    it('should only preserve a plus sign when it is the first character', () => {
      expect(formatPhone('66+81+234+5678')).toBe('66812345678');
    });
  });
});
