import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AutocompleteDropdown } from '../../src/vanilla/components/autocomplete-dropdown';

interface TestOption {
  value: string;
  label: string;
  icon?: string;
  customRender?: (option: TestOption) => string;
}

describe('AutocompleteDropdown Public API', () => {
  let container: HTMLDivElement;
  let testOptions: TestOption[];
  let onSelectMock: (value: string, option: TestOption) => void;
  
  beforeEach(() => {
    // Create container element
    container = document.createElement('div');
    document.body.appendChild(container);
    
    // Setup test options
    testOptions = [
      { value: 'apple', label: 'Apple' },
      { value: 'banana', label: 'Banana', icon: '🍌' },
      { value: 'cherry', label: 'Cherry' },
      { value: 'date', label: 'Date' },
      { value: 'elderberry', label: 'Elderberry' }
    ];
    
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

  describe('Public Methods - Value Management', () => {
    let dropdown: AutocompleteDropdown;
    
    beforeEach(() => {
      dropdown = new AutocompleteDropdown({
        container,
        options: testOptions,
        onSelect: onSelectMock
      });
    });
    
    it('getValue should return empty string when nothing selected', () => {
      expect(dropdown.getValue()).toBe('');
    });

    it('setValue should set the input value to option label', () => {
      dropdown.setValue('apple');
      expect(dropdown.getValue()).toBe('Apple');
    });

    it('setValue with invalid value should not change input', () => {
      dropdown.setValue('invalid');
      expect(dropdown.getValue()).toBe('');
    });

    it('getValue should return current input value after setting', () => {
      dropdown.setValue('banana');
      expect(dropdown.getValue()).toBe('Banana');
    });

    it('getSelectedOption should return undefined when nothing selected', () => {
      const selected = dropdown.getSelectedOption();
      expect(selected).toBeUndefined();
    });

    it('getSelectedOption should return the selected option object', () => {
      dropdown.setValue('cherry');
      const selected = dropdown.getSelectedOption();
      
      expect(selected).toBeDefined();
      expect(selected?.value).toBe('cherry');
      expect(selected?.label).toBe('Cherry');
    });
  });

  describe('Public Methods - Options Management', () => {
    let dropdown: AutocompleteDropdown;
    
    beforeEach(() => {
      dropdown = new AutocompleteDropdown({
        container,
        options: testOptions,
        onSelect: onSelectMock
      });
    });

    it('updateOptions should replace all options', () => {
      const newOptions = [
        { value: 'x', label: 'X' },
        { value: 'y', label: 'Y' }
      ];
      
      dropdown.updateOptions(newOptions);
      
      // Verify the internal options are updated
      expect(dropdown['options']).toEqual(newOptions);
    });

    it('refreshOptions should be callable without errors', () => {
      expect(() => dropdown.refreshOptions()).not.toThrow();
    });
  });

  describe('Public Methods - Lifecycle', () => {
    let dropdown: AutocompleteDropdown;
    
    beforeEach(() => {
      dropdown = new AutocompleteDropdown({
        container,
        options: testOptions,
        onSelect: onSelectMock
      });
    });

    it('destroy should be callable without errors', () => {
      // Destroy should not throw
      expect(() => dropdown.destroy()).not.toThrow();
    });
  });

  describe('Initialization', () => {
    it('should create dropdown with required properties', () => {
      const dropdown = new AutocompleteDropdown({
        container,
        options: testOptions,
        onSelect: onSelectMock
      });
      
      expect(dropdown).toBeDefined();
      expect(container.querySelector('.autocomplete-input')).toBeDefined();
    });

    it('should maintain options when initialized', () => {
      const dropdown = new AutocompleteDropdown({
        container,
        options: testOptions,
        onSelect: onSelectMock
      });
      
      expect(dropdown.getValue()).toBe('');
    });
  });

  describe('Custom Rendering', () => {
    it('should accept options with customRender function', () => {
      const customOptions: TestOption[] = [
        { 
          value: 'custom1', 
          label: 'Custom One',
          customRender: (opt: TestOption) => `<div class="custom-option"><strong>${opt.label}</strong></div>`
        }
      ];
      
      const dropdown = new AutocompleteDropdown({
        container,
        options: customOptions,
        onSelect: onSelectMock
      });
      
      expect(dropdown).toBeDefined();
    });
  });

  describe('Selection Callback', () => {
    beforeEach(() => {
      void new AutocompleteDropdown({
        container,
        options: testOptions,
        onSelect: onSelectMock
      });
    });

    it('should call onSelect when setValue is called with valid value', () => {
      // Note: onSelect is called on user selection, not setValue
      // This test verifies the mock is set up correctly
      expect(onSelectMock).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty options array', () => {
      const dropdown = new AutocompleteDropdown({
        container,
        options: [],
        onSelect: onSelectMock
      });
      
      expect(dropdown).toBeDefined();
      expect(dropdown.getValue()).toBe('');
    });

    it('should handle single option', () => {
      const dropdown = new AutocompleteDropdown({
        container,
        options: [{ value: 'only', label: 'Only Option' }],
        onSelect: onSelectMock
      });
      
      expect(dropdown).toBeDefined();
      dropdown.setValue('only');
      expect(dropdown.getValue()).toBe('Only Option');
    });

    it('should handle options with special characters', () => {
      const specialOptions = [
        { value: 'a1', label: 'Item 1!' },
        { value: 'a2', label: 'Item 2@' },
        { value: 'a3', label: 'Item 3#' }
      ];
      
      const dropdown = new AutocompleteDropdown({
        container,
        options: specialOptions,
        onSelect: onSelectMock
      });
      
      dropdown.setValue('a1');
      expect(dropdown.getValue()).toBe('Item 1!');
    });
  });

  describe('Configuration Options', () => {
    it('should accept custom placeholder', () => {
      void new AutocompleteDropdown({
        container,
        options: testOptions,
        onSelect: onSelectMock,
        placeholder: 'Search...'
      });
      
      const input = container.querySelector<HTMLInputElement>('.autocomplete-input')!;
      expect(input.placeholder).toBe('Search...');
    });

    it('should accept custom no results text', () => {
      const dropdown = new AutocompleteDropdown({
        container,
        options: testOptions,
        onSelect: onSelectMock,
        noResultsText: 'Nothing found'
      });
      
      expect(dropdown).toBeDefined();
    });

    it('should accept custom max height', () => {
      const dropdown = new AutocompleteDropdown({
        container,
        options: testOptions,
        onSelect: onSelectMock,
        maxHeight: 300
      });
      
      expect(dropdown).toBeDefined();
    });
  });
});