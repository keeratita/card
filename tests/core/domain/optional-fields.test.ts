import { describe, it, expect } from 'vitest';
import {
  FIELD_METADATA,
  PRESET_FIELDS,
  resolveActiveFields,
  getFieldDisplayText,
  type OptionalFieldMetadata
} from '@/core/domain/optional-fields';
import type { OptionalCardField, CardFormPreset } from '../../src/core/domain/card';

describe('Optional Fields Module', () => {
  describe('FIELD_METADATA', () => {
    it('should contain metadata for all optional fields', () => {
      const expectedFields: OptionalCardField[] = [
        'addressLine1',
        'addressLine2',
        'city',
        'state',
        'postalCode',
        'country',
        'phone',
        'email'
      ];

      expectedFields.forEach((field) => {
        expect(FIELD_METADATA[field]).toBeDefined();
        expect(FIELD_METADATA[field].label).toBeDefined();
        expect(FIELD_METADATA[field].placeholder).toBeDefined();
        expect(FIELD_METADATA[field].type).toBeDefined();
        expect(FIELD_METADATA[field].autocomplete).toBeDefined();
      });
    });

    it('should have correct metadata for addressLine1', () => {
      const meta: OptionalFieldMetadata = FIELD_METADATA.addressLine1;
      expect(meta.label).toBe('Address');
      expect(meta.placeholder).toBe('Street address');
      expect(meta.type).toBe('text');
      expect(meta.autocomplete).toBe('address-line1');
    });

    it('should have correct metadata for postalCode', () => {
      const meta: OptionalFieldMetadata = FIELD_METADATA.postalCode;
      expect(meta.label).toBe('Postal Code');
      expect(meta.placeholder).toBe('Postal/ZIP Code');
      expect(meta.type).toBe('text');
      expect(meta.autocomplete).toBe('postal-code');
    });

    it('should have correct metadata for country', () => {
      const meta: OptionalFieldMetadata = FIELD_METADATA.country;
      expect(meta.label).toBe('Country');
      expect(meta.placeholder).toBe('Country Code (e.g. US, TH)');
      expect(meta.type).toBe('select');
      expect(meta.autocomplete).toBe('country-name');
    });

    it('should have correct metadata for phone', () => {
      const meta: OptionalFieldMetadata = FIELD_METADATA.phone;
      expect(meta.label).toBe('Phone');
      expect(meta.placeholder).toBe('+668 1234 567');
      expect(meta.type).toBe('tel');
      expect(meta.autocomplete).toBe('tel');
    });

    it('should have correct metadata for email', () => {
      const meta: OptionalFieldMetadata = FIELD_METADATA.email;
      expect(meta.label).toBe('Email');
      expect(meta.placeholder).toBe('name@example.com');
      expect(meta.type).toBe('email');
      expect(meta.autocomplete).toBe('email');
    });
  });

  describe('PRESET_FIELDS', () => {
    it('should define fields for none preset', () => {
      expect(PRESET_FIELDS.none).toEqual([]);
    });

    it('should define fields for us preset', () => {
      expect(PRESET_FIELDS.us).toEqual(['postalCode']);
    });

    it('should define fields for billing preset', () => {
      expect(PRESET_FIELDS.billing).toEqual([
        'addressLine1',
        'city',
        'state',
        'postalCode',
        'country'
      ]);
    });

    it('should define fields for contact preset', () => {
      expect(PRESET_FIELDS.contact).toEqual(['email', 'phone']);
    });
  });

  describe('resolveActiveFields function', () => {
    it('should return empty array for none preset with no additional fields', () => {
      const result = resolveActiveFields('none', []);
      expect(result).toEqual([]);
    });

    it('should return us preset fields', () => {
      const result = resolveActiveFields('us', []);
      expect(result).toEqual(['postalCode']);
    });

    it('should return billing preset fields', () => {
      const result = resolveActiveFields('billing', []);
      expect(result).toEqual([
        'addressLine1',
        'city',
        'state',
        'postalCode',
        'country'
      ]);
    });

    it('should return contact preset fields', () => {
      const result = resolveActiveFields('contact', []);
      expect(result).toEqual(['email', 'phone']);
    });

    it('should merge preset fields with additional fields', () => {
      const result = resolveActiveFields('us', ['phone', 'email']);
      expect(result).toContain('postalCode');
      expect(result).toContain('phone');
      expect(result).toContain('email');
    });

    it('should deduplicate fields when preset and additional overlap', () => {
      const result = resolveActiveFields('us', ['postalCode']);
      expect(result).toEqual(['postalCode']);
      expect(result).toHaveLength(1);
    });

    it('should filter out invalid field names', () => {
      const result = resolveActiveFields('none', ['invalidField' as OptionalCardField, 'phone']);
      expect(result).toEqual(['phone']);
    });

    it('should handle undefined preset (defaults to none)', () => {
      const result = resolveActiveFields(undefined as CardFormPreset | undefined, ['phone']);
      expect(result).toEqual(['phone']);
    });

    it('should handle undefined fields array', () => {
      const result = resolveActiveFields('us', undefined as OptionalCardField[] | undefined);
      expect(result).toEqual(['postalCode']);
    });

    it('should return empty array when both preset and fields are empty', () => {
      const result = resolveActiveFields('none');
      expect(result).toEqual([]);
    });
  });

  describe('getFieldDisplayText function', () => {
    it('should return zipCode label for postalCode with us preset', () => {
      const result = getFieldDisplayText('postalCode', 'us');
      expect(result.label).toBe('ZIP Code');
      expect(result.placeholder).toBe('12345');
    });

    it('should return standard label for postalCode with billing preset', () => {
      const result = getFieldDisplayText('postalCode', 'billing');
      expect(result.label).toBe('Postal Code');
      expect(result.placeholder).toBe('Postal/ZIP Code');
    });

    it('should return standard label for addressLine1', () => {
      const result = getFieldDisplayText('addressLine1', 'billing');
      expect(result.label).toBe('Address');
      expect(result.placeholder).toBe('Street address');
    });

    it('should return standard label for city', () => {
      const result = getFieldDisplayText('city', 'billing');
      expect(result.label).toBe('City');
      expect(result.placeholder).toBe('City');
    });

    it('should return standard label for state', () => {
      const result = getFieldDisplayText('state', 'billing');
      expect(result.label).toBe('State');
      expect(result.placeholder).toBe('State or Province');
    });

    it('should return standard label for country', () => {
      const result = getFieldDisplayText('country', 'billing');
      expect(result.label).toBe('Country');
      expect(result.placeholder).toBe('Country Code (e.g. US, TH)');
    });

    it('should return standard label for phone', () => {
      const result = getFieldDisplayText('phone', 'contact');
      expect(result.label).toBe('Phone');
      expect(result.placeholder).toBe('+668 1234 567');
    });

    it('should return standard label for email', () => {
      const result = getFieldDisplayText('email', 'contact');
      expect(result.label).toBe('Email');
      expect(result.placeholder).toBe('name@example.com');
    });

    it('should return standard label for addressLine2', () => {
      const result = getFieldDisplayText('addressLine2', 'billing');
      expect(result.label).toBe('Apt, Suite');
      expect(result.placeholder).toBe('Apt, Suite, Unit (optional)');
    });

    it('should use default preset when not specified', () => {
      const result = getFieldDisplayText('postalCode');
      expect(result.label).toBe('Postal Code');
      expect(result.placeholder).toBe('Postal/ZIP Code');
    });
  });
});