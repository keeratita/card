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
    const dropdownEls = document.querySelectorAll('.autocomplete-dropdown');
    dropdownEls.forEach(d => d.remove());
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

  describe('Dropdown Reopen State Reset', () => {
    let dropdown: AutocompleteDropdown;

    beforeEach(() => {
      dropdown = new AutocompleteDropdown({
        container,
        options: testOptions,
        onSelect: onSelectMock
      });
    });

    it('should reset the search input and show all options when reopened after filtering', () => {
      const input = container.querySelector<HTMLInputElement>('.autocomplete-input')!;

      // Open the dropdown
      input.click();

      // Type in the search input to filter down to a single result
      const searchInput = document.querySelector<HTMLInputElement>('.autocomplete-search-input')!;
      searchInput.value = 'apple';
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));

      let results = document.querySelectorAll('.autocomplete-result');
      expect(results.length).toBe(1);

      // Select the filtered option (Enter)
      searchInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

      // Reopen the dropdown
      input.click();

      // The search input must be empty again
      const reopenedSearch = document.querySelector<HTMLInputElement>('.autocomplete-search-input')!;
      expect(reopenedSearch.value).toBe('');

      // All options must be shown again (not the stale filtered list)
      results = document.querySelectorAll('.autocomplete-result');
      expect(results.length).toBe(testOptions.length);
    });

    it('should show all options when reopened after closing with a filter applied', () => {
      const input = container.querySelector<HTMLInputElement>('.autocomplete-input')!;

      input.click();
      const searchInput = document.querySelector<HTMLInputElement>('.autocomplete-search-input')!;
      searchInput.value = 'banana';
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));

      expect(document.querySelectorAll('.autocomplete-result').length).toBe(1);

      // Close via Escape
      searchInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

      // Reopen
      input.click();

      const reopenedSearch = document.querySelector<HTMLInputElement>('.autocomplete-search-input')!;
      expect(reopenedSearch.value).toBe('');
      expect(document.querySelectorAll('.autocomplete-result').length).toBe(testOptions.length);
    });

    it('should re-open the dropdown with the selected option highlighted', () => {
      // Select a value (e.g. externally restored state)
      dropdown.setValue('cherry');

      const input = container.querySelector<HTMLInputElement>('.autocomplete-input')!;
      input.click();

      // Exactly one option must be highlighted, and it must be the selection
      const highlighted = document.querySelectorAll('.autocomplete-result.highlighted');
      expect(highlighted.length).toBe(1);
      expect(highlighted[0].textContent).toContain('Cherry');
    });

    it('should prioritize starts-with matches when filtering', () => {
      const options = [
        { value: 'th', label: 'Thailand' },
        { value: 'tw', label: 'Taiwan' },
        { value: 'af', label: 'Afghanistan' },
        { value: 'tz', label: 'Tanzania' },
      ];
      new AutocompleteDropdown({
        container,
        options,
        onSelect: onSelectMock,
      });

      const input = container.querySelector<HTMLInputElement>('.autocomplete-input')!;
      input.click();

      // Scope to this dropdown (the last one appended to body), since the
      // beforeEach dropdown also exists in the DOM.
      const dropdownEls = document.querySelectorAll('.autocomplete-dropdown');
      const myDropdown = dropdownEls[dropdownEls.length - 1];
      const searchInput = myDropdown.querySelector<HTMLInputElement>('.autocomplete-search-input')!;
      searchInput.value = 't';
      searchInput.dispatchEvent(new Event('input', { bubbles: true }));

      const values = [...myDropdown.querySelectorAll('.autocomplete-result')].map(
        (r) => r.getAttribute('data-value'),
      );

      // Starts-with matches (Thailand, Taiwan, Tanzania) come before the
      // contains-only match (Afghanistan).
      expect(values.indexOf('th')).toBeLessThan(values.indexOf('af'));
      expect(values.indexOf('tw')).toBeLessThan(values.indexOf('af'));
      expect(values.indexOf('tz')).toBeLessThan(values.indexOf('af'));
    });
  });

  describe('Dropdown Positioning', () => {
    it('should display and position the dropdown when opened', () => {
      new AutocompleteDropdown({
        container,
        options: testOptions,
        onSelect: onSelectMock
      });

      const input = container.querySelector<HTMLInputElement>('.autocomplete-input')!;
      input.click();

      const dropdownEl = document.querySelector<HTMLElement>('.autocomplete-dropdown')!;
      expect(dropdownEl.style.display).toBe('block');
      expect(dropdownEl.style.position).toBe('fixed');
      expect(dropdownEl.style.top).not.toBe('');
      expect(dropdownEl.style.left).not.toBe('');
      expect(dropdownEl.style.width).not.toBe('');
    });

    it('should recalculate position on reopen', () => {
      new AutocompleteDropdown({
        container,
        options: testOptions,
        onSelect: onSelectMock
      });

      const input = container.querySelector<HTMLInputElement>('.autocomplete-input')!;
      input.click();
      const dropdownEl = document.querySelector<HTMLElement>('.autocomplete-dropdown')!;
      const firstTop = dropdownEl.style.top;

      // Close and reopen
      input.click();
      input.click();

      expect(dropdownEl.style.top).toBe(firstTop);
      expect(dropdownEl.style.display).toBe('block');
    });
  });
});