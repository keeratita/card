import { describe, it, expect } from 'vitest';
import {
  formatCardNumber,
  formatExpiry,
  formatCvc,
  formatCountryCode,
  formatPhone
} from '../../src/core/formatters/card-formatter';

describe('Input Formatters', () => {
  describe('Card Number Formatter', () => {
    it('should format standard cards with 4-4-4-4 spacing', () => {
      expect(formatCardNumber('4111111111111111')).toBe('4111 1111 1111 1111');
      expect(formatCardNumber('41112')).toBe('4111 2');
    });

    it('should format Amex cards with 4-6-5 spacing', () => {
      expect(formatCardNumber('371111111111111')).toBe('3711 111111 11111');
      expect(formatCardNumber('341112222')).toBe('3411 12222');
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
  });

  describe('CVC Formatter', () => {
    it('should restrict to 4 digits for Amex', () => {
      expect(formatCvc('12345', '371111111111111')).toBe('1234');
    });

    it('should restrict to 3 digits for non-Amex', () => {
      expect(formatCvc('12345', '4111111111111111')).toBe('123');
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
  });
});
