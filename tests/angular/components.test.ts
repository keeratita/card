import { describe, it, expect } from 'vitest';
import { renderOptionalFieldHtml } from '../../src/angular/components';
import type { OptionalCardField } from '../../src/core/domain/card';

describe('Angular Components - renderOptionalFieldHtml', () => {
  describe('Country field rendering', () => {
    it('should render country select with flags', () => {
      const html = renderOptionalFieldHtml('country', 'billing', 'country', 'US', false);
      
      expect(html).toContain('class="ios-input-row row-country"');
      expect(html).toContain('for="country"');
      expect(html).toContain('class="ios-input card-country-input"');
      expect(html).toContain('autocomplete="country"');
      expect(html).toContain('required');
      expect(html).toContain('United States');
    });

    it('should render country field with invalid class when invalid is true', () => {
      const html = renderOptionalFieldHtml('country', 'billing', 'country', '', true);
      
      expect(html).toContain('class="ios-input-row row-country invalid"');
    });

    it('should render country field with selected value', () => {
      const html = renderOptionalFieldHtml('country', 'billing', 'country', 'TH', false);
      
      expect(html).toContain('value="TH"');
      expect(html).toContain('Thailand');
    });

    it('should render country placeholder from preset', () => {
      const html = renderOptionalFieldHtml('country', 'billing', 'country');
      
      expect(html).toContain('Country Code (e.g. US, TH)');
    });

    it('should render country with us preset', () => {
      const html = renderOptionalFieldHtml('country', 'us', 'country');
      
      expect(html).toContain('Country');
    });
  });

  describe('Address line 1 field rendering', () => {
    it('should render addressLine1 input', () => {
      const html = renderOptionalFieldHtml('addressLine1', 'billing', 'addressLine1');
      
      expect(html).toContain('class="ios-input-row row-addressLine1"');
      expect(html).toContain('for="addressLine1"');
      expect(html).toContain('type="text"');
      expect(html).toContain('autocomplete="address-line1"');
      expect(html).toContain('Address');
      expect(html).toContain('Street address');
    });

    it('should render addressLine1 with invalid class', () => {
      const html = renderOptionalFieldHtml('addressLine1', 'billing', 'addressLine1', '', true);
      
      expect(html).toContain('class="ios-input-row row-addressLine1 invalid"');
    });

    it('should render addressLine1 with value', () => {
      const html = renderOptionalFieldHtml('addressLine1', 'billing', 'addressLine1', '123 Main St');
      
      expect(html).toContain('value="123 Main St"');
    });
  });

  describe('Address line 2 field rendering', () => {
    it('should render addressLine2 input', () => {
      const html = renderOptionalFieldHtml('addressLine2', 'billing', 'addressLine2');
      
      expect(html).toContain('class="ios-input-row row-addressLine2"');
      expect(html).toContain('type="text"');
      expect(html).toContain('autocomplete="address-line2"');
      expect(html).toContain('Apt, Suite');
    });

    it('should render addressLine2 without required attribute', () => {
      const html = renderOptionalFieldHtml('addressLine2', 'billing', 'addressLine2');
      
      // addressLine2 should not have required="true"
      expect(html).not.toContain('required="true"');
    });
  });

  describe('City field rendering', () => {
    it('should render city input', () => {
      const html = renderOptionalFieldHtml('city', 'billing', 'city');
      
      expect(html).toContain('class="ios-input-row row-city"');
      expect(html).toContain('type="text"');
      expect(html).toContain('autocomplete="address-level2"');
      expect(html).toContain('City');
    });
  });

  describe('State field rendering', () => {
    it('should render state input', () => {
      const html = renderOptionalFieldHtml('state', 'billing', 'state');
      
      expect(html).toContain('class="ios-input-row row-state"');
      expect(html).toContain('type="text"');
      expect(html).toContain('autocomplete="address-level1"');
      expect(html).toContain('State');
      expect(html).toContain('State or Province');
    });
  });

  describe('Postal code field rendering', () => {
    it('should render postalCode input', () => {
      const html = renderOptionalFieldHtml('postalCode', 'billing', 'postalCode');
      
      expect(html).toContain('class="ios-input-row row-postalCode"');
      expect(html).toContain('type="text"');
      expect(html).toContain('autocomplete="postal-code"');
      expect(html).toContain('Postal Code');
    });

    it('should render postalCode with us preset showing ZIP Code', () => {
      const html = renderOptionalFieldHtml('postalCode', 'us', 'postalCode');
      
      expect(html).toContain('ZIP Code');
      expect(html).toContain('12345');
    });
  });

  describe('Phone field rendering', () => {
    it('should render phone input', () => {
      const html = renderOptionalFieldHtml('phone', 'contact', 'phone');
      
      expect(html).toContain('class="ios-input-row row-phone"');
      expect(html).toContain('type="tel"');
      expect(html).toContain('autocomplete="tel"');
      expect(html).toContain('Phone');
      expect(html).toContain('+668 1234 567');
    });
  });

  describe('Email field rendering', () => {
    it('should render email input', () => {
      const html = renderOptionalFieldHtml('email', 'contact', 'email');
      
      expect(html).toContain('class="ios-input-row row-email"');
      expect(html).toContain('type="email"');
      expect(html).toContain('autocomplete="email"');
      expect(html).toContain('Email');
      expect(html).toContain('name@example.com');
    });
  });

  describe('Different presets', () => {
    it('should render with none preset', () => {
      const html = renderOptionalFieldHtml('email', 'none', 'email');
      
      expect(html).toContain('Email');
    });

    it('should render with billing preset', () => {
      const html = renderOptionalFieldHtml('postalCode', 'billing', 'postalCode');
      
      expect(html).toContain('Postal Code');
    });

    it('should render with contact preset', () => {
      const html = renderOptionalFieldHtml('phone', 'contact', 'phone');
      
      expect(html).toContain('Phone');
    });

    it('should render with us preset', () => {
      const html = renderOptionalFieldHtml('postalCode', 'us', 'postalCode');
      
      expect(html).toContain('ZIP Code');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty value', () => {
      const html = renderOptionalFieldHtml('email', 'contact', 'email', '');
      
      expect(html).toContain('value=""');
    });

    it('should handle special characters in value', () => {
      const html = renderOptionalFieldHtml('addressLine1', 'billing', 'addressLine1', '123 Main St & Co');
      
      expect(html).toContain('value="123 Main St &amp; Co"');
    });

    it('should render all field types', () => {
      const fields: OptionalCardField[] = [
        'addressLine1',
        'addressLine2',
        'city',
        'state',
        'postalCode',
        'country',
        'phone',
        'email'
      ];

      fields.forEach((field) => {
        const html = renderOptionalFieldHtml(field, 'billing', field);
        expect(html).toBeTruthy();
        expect(html.length).toBeGreaterThan(0);
      });
    });
  });
});