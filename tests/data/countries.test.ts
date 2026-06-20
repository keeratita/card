import { describe, it, expect } from 'vitest';
import { COUNTRIES, getCountryByCode, getAllCountryCodes, isValidCountryCode } from '../../src/data/countries';

describe('Countries Data Module', () => {
  describe('COUNTRIES constant', () => {
    it('should contain country data', () => {
      expect(COUNTRIES).toBeDefined();
      expect(Array.isArray(COUNTRIES)).toBe(true);
      expect(COUNTRIES.length).toBeGreaterThan(0);
    });

    it('should have valid country code format', () => {
      COUNTRIES.forEach(country => {
        expect(country.code).toMatch(/^[A-Z]{2}$/);
      });
    });

    it('should have non-empty country names', () => {
      COUNTRIES.forEach(country => {
        expect(country.name).toBeTruthy();
        expect(country.name.length).toBeGreaterThan(0);
      });
    });

    it('should contain 244 countries and territories', () => {
      expect(COUNTRIES.length).toBe(244);
    });

    // Spot-check countries across different regions
    const spotCheckCountries = [
      { code: 'US', name: 'United States' },
      { code: 'TH', name: 'Thailand' },
      { code: 'GB', name: 'United Kingdom' },
      { code: 'CA', name: 'Canada' },
      { code: 'AU', name: 'Australia' },
      { code: 'DE', name: 'Germany' },
      { code: 'FR', name: 'France' },
      { code: 'JP', name: 'Japan' },
      { code: 'CN', name: 'China' },
      { code: 'IN', name: 'India' },
      { code: 'BR', name: 'Brazil' },
      { code: 'MX', name: 'Mexico' },
      { code: 'SG', name: 'Singapore' },
      { code: 'HK', name: 'Hong Kong SAR' },
      { code: 'NZ', name: 'New Zealand' },
      { code: 'CH', name: 'Switzerland' },
      { code: 'KR', name: 'South Korea' },
      { code: 'ZA', name: 'South Africa' },
      { code: 'NG', name: 'Nigeria' },
      { code: 'EG', name: 'Egypt' },
    ];

    it.each(spotCheckCountries)('should contain $code country with name "$name"', ({ code, name }) => {
      const country = COUNTRIES.find(c => c.code === code);
      expect(country).toBeDefined();
      expect(country?.name).toBe(name);
    });

    it('should have flag emojis for all countries', () => {
      COUNTRIES.forEach(country => {
        expect(country.emoji.length).toBeGreaterThan(0);
      });
    });

    it('should have dial codes for most countries', () => {
      const countriesWithDialCode = COUNTRIES.filter(c => c.dialCode);
      // Antarctica and French Southern Territories don't have dial codes
      expect(countriesWithDialCode.length).toBeGreaterThan(190);
    });
  });

  describe('getCountryByCode function', () => {
    it('should return country for valid US code', () => {
      const country = getCountryByCode('US');
      expect(country).toBeDefined();
      expect(country?.code).toBe('US');
      expect(country?.name).toBe('United States');
    });

    it('should return country for valid TH code', () => {
      const country = getCountryByCode('TH');
      expect(country).toBeDefined();
      expect(country?.code).toBe('TH');
      expect(country?.name).toBe('Thailand');
    });

    it('should return undefined for invalid code', () => {
      const country = getCountryByCode('XX');
      expect(country).toBeUndefined();
    });

    it('should return undefined for empty code', () => {
      const country = getCountryByCode('');
      expect(country).toBeUndefined();
    });

    it('should return country for lowercase code (case-insensitive)', () => {
      const country = getCountryByCode('us');
      expect(country).toBeDefined();
      expect(country?.code).toBe('US');
    });
  });

  describe('getAllCountryCodes function', () => {
    it('should return array of country codes', () => {
      const codes = getAllCountryCodes();
      expect(Array.isArray(codes)).toBe(true);
      expect(codes.length).toBeGreaterThan(0);
    });

    it('should include US in codes', () => {
      const codes = getAllCountryCodes();
      expect(codes).toContain('US');
    });

    it('should include TH in codes', () => {
      const codes = getAllCountryCodes();
      expect(codes).toContain('TH');
    });
  });

  describe('isValidCountryCode function', () => {
    it('should return true for valid code', () => {
      expect(isValidCountryCode('US')).toBe(true);
    });

    it('should return false for invalid code', () => {
      expect(isValidCountryCode('XX')).toBe(false);
    });

    it('should be case-insensitive', () => {
      expect(isValidCountryCode('us')).toBe(true);
    });
  });
});