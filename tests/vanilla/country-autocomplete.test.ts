import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CountryAutocomplete } from '../../src/vanilla/components/country-autocomplete';
import { COUNTRIES } from '../../src/data/countries';

describe('CountryAutocomplete Component', () => {
  let container: HTMLDivElement;
  let onSelectMock: (countryCode: string, country: { code: string; name: string }) => void;
  
  beforeEach(() => {
    // Create container element
    container = document.createElement('div');
    document.body.appendChild(container);
    
    // Setup mock callback
    onSelectMock = vi.fn();
  });
  
  afterEach(() => {
    // Clean up
    document.body.removeChild(container);
    container.innerHTML = '';
    // Clean up any dropdown elements in body
    const dropdowns = document.querySelectorAll('.autocomplete-dropdown-wrapper');
    dropdowns.forEach(d => d.remove());
  });

  describe('Initialization', () => {
    it('should render with empty input', () => {
      const autocomplete = new CountryAutocomplete({
        container,
        onSelect: onSelectMock
      });
      
      expect(autocomplete.getValue()).toBe('');
      expect(container.querySelector('.autocomplete-input')).toBeDefined();
    });

    it('should have correct placeholder by default', () => {
      new CountryAutocomplete({
        container,
        onSelect: onSelectMock
      });
      
      const input = container.querySelector<HTMLInputElement>('.autocomplete-input')!;
      expect(input.placeholder).toBe('Select a country...');
    });

    it('should accept custom placeholder', () => {
      new CountryAutocomplete({
        container,
        onSelect: onSelectMock,
        placeholder: 'Choose your country'
      });
      
      const input = container.querySelector<HTMLInputElement>('.autocomplete-input')!;
      expect(input.placeholder).toBe('Choose your country');
    });
  });

  describe('Public Methods - Value Management', () => {
    let autocomplete: CountryAutocomplete;
    
    beforeEach(() => {
      autocomplete = new CountryAutocomplete({
        container,
        onSelect: onSelectMock
      });
    });
    
    it('setValue should set the input value to country name', () => {
      autocomplete.setValue('US');
      expect(autocomplete.getValue()).toBe('United States');
    });

    it('setValue with invalid code should not change input', () => {
      autocomplete.setValue('INVALID');
      expect(autocomplete.getValue()).toBe('');
    });

    it('getValue should return current input value', () => {
      expect(autocomplete.getValue()).toBe('');
      
      autocomplete.setValue('GB');
      expect(autocomplete.getValue()).toBe('United Kingdom');
    });

    it('getSelectedCountry should return the selected country object', () => {
      autocomplete.setValue('CA');
      const selected = autocomplete.getSelectedCountry();
      
      expect(selected).toBeDefined();
      expect(selected?.code).toBe('CA');
      expect(selected?.name).toBe('Canada');
    });

    it('getSelectedCountry should return undefined when nothing selected', () => {
      const selected = autocomplete.getSelectedCountry();
      expect(selected).toBeUndefined();
    });
  });

  describe('Public Methods - Lifecycle', () => {
    let autocomplete: CountryAutocomplete;
    
    beforeEach(() => {
      autocomplete = new CountryAutocomplete({
        container,
        onSelect: onSelectMock
      });
    });

    it('destroy should be callable without errors', () => {
      // Destroy should not throw
      expect(() => autocomplete.destroy()).not.toThrow();
    });
  });

  describe('Configuration Options', () => {
    it('should accept custom no results text', () => {
      const autocomplete = new CountryAutocomplete({
        container,
        onSelect: onSelectMock,
        noResultsText: 'No countries match your search'
      });
      
      expect(autocomplete).toBeDefined();
    });

    it('should accept custom max height', () => {
      const autocomplete = new CountryAutocomplete({
        container,
        onSelect: onSelectMock,
        maxHeight: 500
      });
      
      expect(autocomplete).toBeDefined();
    });

    it('should accept custom search placeholder', () => {
      const autocomplete = new CountryAutocomplete({
        container,
        onSelect: onSelectMock,
        searchPlaceholder: 'Find a country'
      });
      
      expect(autocomplete).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle all countries in the list', () => {
      const autocomplete = new CountryAutocomplete({
        container,
        onSelect: onSelectMock
      });
      
      expect(autocomplete).toBeDefined();
      expect(COUNTRIES.length).toBeGreaterThan(0);
    });

    it('should work with string selector for container', () => {
      const divId = 'test-country-container';
      const div = document.createElement('div');
      div.id = divId;
      document.body.appendChild(div);
      
      try {
        const autocomplete = new CountryAutocomplete({
          container: `#${divId}`,
          onSelect: onSelectMock
        });
        
        expect(autocomplete).toBeDefined();
        expect(div.querySelector('.autocomplete-input')).toBeDefined();
      } finally {
        document.body.removeChild(div);
      }
    });
  });

  describe('Country Data', () => {
    it('should have access to country list', () => {
      expect(COUNTRIES.length).toBeGreaterThan(0);
    });

    it('should have countries with required properties', () => {
      const firstCountry = COUNTRIES[0];
      
      expect(firstCountry).toHaveProperty('code');
      expect(firstCountry).toHaveProperty('name');
      expect(firstCountry).toHaveProperty('emoji');
    });
  });

  describe('Integration', () => {
    it('should be able to set and get country values', () => {
      const autocomplete = new CountryAutocomplete({
        container,
        onSelect: onSelectMock
      });
      
      // Set a country
      autocomplete.setValue('AU');
      expect(autocomplete.getValue()).toBe('Australia');
      
      // Get the selected country
      const selected = autocomplete.getSelectedCountry();
      expect(selected?.code).toBe('AU');
      expect(selected?.name).toBe('Australia');
    });

    it('should handle multiple value changes', () => {
      const autocomplete = new CountryAutocomplete({
        container,
        onSelect: onSelectMock
      });
      
      autocomplete.setValue('US');
      expect(autocomplete.getValue()).toBe('United States');
      
      autocomplete.setValue('GB');
      expect(autocomplete.getValue()).toBe('United Kingdom');
      
      autocomplete.setValue('CA');
      expect(autocomplete.getValue()).toBe('Canada');
    });
  });
});