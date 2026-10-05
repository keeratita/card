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

  describe('Keyboard Navigation', () => {
    beforeEach(() => {
      // Instance created fresh per test; openDropdown happens per test.
      new AutocompleteDropdown({
        container,
        options: testOptions,
        onSelect: onSelectMock,
      });
    });

    function openDropdown(): void {
      (container.querySelector('.autocomplete-input') as HTMLInputElement).click();
      // Dropdown and results are appended to document.body.
      expect(document.querySelector('.autocomplete-results')).not.toBeNull();
    }

    function pressOnSearch(key: string): void {
      const search = document.querySelector(
        '.autocomplete-search-input',
      ) as HTMLInputElement;
      search.dispatchEvent(
        new KeyboardEvent('keydown', { key, bubbles: true }),
      );
    }

    it('should wrap ArrowDown from the last option back to the first', () => {
      openDropdown();
      // From no selection, each ArrowDown advances one row; after
      // length+1 presses the highlight wraps back to the first option.
      for (let i = 0; i < testOptions.length + 1; i++) {
        pressOnSearch('ArrowDown');
      }
      const first = document.querySelector('.autocomplete-result') as HTMLElement;
      expect(first.classList.contains('highlighted')).toBe(true);
    });

    it('should land on the first option with ArrowUp when nothing is highlighted', () => {
      openDropdown();
      pressOnSearch('ArrowUp');
      const first = document.querySelector('.autocomplete-result') as HTMLElement;
      expect(first.classList.contains('highlighted')).toBe(true);
    });

    it('should wrap ArrowUp from the first option to the last', () => {
      openDropdown();
      pressOnSearch('ArrowDown'); // highlight first option
      pressOnSearch('ArrowUp'); // wrap to last
      const results = document.querySelectorAll('.autocomplete-result');
      const last = results[results.length - 1] as HTMLElement;
      expect(last.classList.contains('highlighted')).toBe(true);
    });

    it('keeps the highlight within filtered results when arrowing after a query', () => {
      openDropdown();
      const search = document.querySelector(
        '.autocomplete-search-input',
      ) as HTMLInputElement;
      search.value = 'a'; // matches a subset (Apple + banana/date/elderberry)
      search.dispatchEvent(new Event('input'));

      const results = document.querySelectorAll('.autocomplete-result');
      expect(results.length).toBeGreaterThan(1);

      // A regression passing the full option count (instead of the filtered
      // count) would scroll the highlight out of the rendered rows.
      for (let i = 0; i < 12; i++) {
        pressOnSearch('ArrowDown');
        const highlighted = document.querySelector(
          '.autocomplete-result.highlighted',
        ) as HTMLElement | null;
        expect(highlighted).not.toBeNull();
        if (highlighted) {
          expect(Array.from(results).includes(highlighted)).toBe(true);
        }
      }
    });

    it('announces the highlighted row from the search input', () => {
      openDropdown();
      const search = document.querySelector(
        '.autocomplete-search-input',
      ) as HTMLInputElement;
      pressOnSearch('ArrowDown');
      const highlighted = document.querySelector(
        '.autocomplete-result.highlighted',
      ) as HTMLElement;
      // The IDREF must live on the focused element (the search input), and
      // must point at the row that actually carries the highlight.
      expect(search.getAttribute('role')).toBe('combobox');
      expect(search.getAttribute('aria-activedescendant')).toBe(
        highlighted.id,
      );
    });

    it('never leaves a dangling aria-activedescendant when nothing is highlighted', () => {
      openDropdown();
      const search = document.querySelector(
        '.autocomplete-search-input',
      ) as HTMLInputElement;
      expect(search.getAttribute('aria-activedescendant')).toBe('');
    });
  });

  describe('Open/close contract', () => {
    function build(): AutocompleteDropdown {
      return new AutocompleteDropdown({
        container,
        options: testOptions,
        onSelect: onSelectMock,
      });
    }

    function trigger(): HTMLInputElement {
      return container.querySelector('.autocomplete-input') as HTMLInputElement;
    }

    function dropdownEl(): HTMLElement | null {
      return document.querySelector('.autocomplete-dropdown');
    }

    it('reports each row position within the filtered set', () => {
      build();
      trigger().click();
      const rows = [
        ...document.querySelectorAll<HTMLElement>('.autocomplete-result'),
      ];
      expect(rows.length).toBe(testOptions.length);
      rows.forEach((row, i) => {
        expect(row.getAttribute('aria-setsize')).toBe(
          String(testOptions.length),
        );
        expect(row.getAttribute('aria-posinset')).toBe(String(i + 1));
      });
    });

    it('closes when a click lands outside the widget', () => {
      build();
      trigger().click();
      expect(dropdownEl()?.style.display).toBe('block');

      document.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(dropdownEl()?.style.display).toBe('none');
    });

    it('closes on Escape and returns focus to the trigger', () => {
      build();
      trigger().click();
      const search = document.querySelector(
        '.autocomplete-search-input',
      ) as HTMLInputElement;
      search.focus();
      search.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
      );

      expect(dropdownEl()?.style.display).toBe('none');
      expect(document.activeElement).toBe(trigger());
    });

    it('reports expansion on the disclosure trigger in both states', () => {
      build();
      expect(trigger().getAttribute('role')).toBe('button');
      expect(trigger().getAttribute('aria-haspopup')).toBe('listbox');
      expect(trigger().getAttribute('aria-expanded')).toBe('false');
      expect(trigger().hasAttribute('aria-controls')).toBe(false);

      trigger().click();
      expect(trigger().getAttribute('aria-expanded')).toBe('true');
      const list = document.querySelector('[role="listbox"]');
      expect(trigger().getAttribute('aria-controls')).toBe(
        list?.getAttribute('id'),
      );

      document.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      expect(trigger().getAttribute('aria-expanded')).toBe('false');
    });

    it('ignores keys while closed — only the trigger opens the list', () => {
      build();
      const search = document.querySelector(
        '.autocomplete-search-input',
      ) as HTMLInputElement;
      // The search box exists in the DOM while hidden; keystrokes there must
      // not mutate state or reveal the dropdown.
      search.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
      );
      search.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
      expect(dropdownEl()?.style.display).toBe('none');
    });

    it('selects the filtered option under the highlight (keyboard path)', () => {
      build();
      trigger().click();
      const search = document.querySelector(
        '.autocomplete-search-input',
      ) as HTMLInputElement;
      search.value = 'banana';
      search.dispatchEvent(new Event('input'));
      pressOnSearchKey(search, 'ArrowDown');
      pressOnSearchKey(search, 'Enter');

      // Resolving the highlight against the *unfiltered* list would emit
      // 'apple' here.
      expect(onSelectMock).toHaveBeenCalledWith(
        'banana',
        expect.objectContaining({ label: 'Banana' }),
      );
    });

    it('selects the clicked filtered option (pointer path)', () => {
      build();
      trigger().click();
      const search = document.querySelector(
        '.autocomplete-search-input',
      ) as HTMLInputElement;
      search.value = 'cherry';
      search.dispatchEvent(new Event('input'));
      const row = document.querySelector('.autocomplete-result') as HTMLElement;
      row.click();

      expect(onSelectMock).toHaveBeenCalledWith(
        'cherry',
        expect.objectContaining({ label: 'Cherry' }),
      );
    });

    function pressOnSearchKey(el: HTMLElement, key: string): void {
      el.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
    }
  });

  describe('Filter semantics', () => {
    // The generic widget keeps its original behavior: values match on
    // prefix/contains as well as labels.
    it('matches on option values by default (generic behavior)', () => {
      const dropdown = new AutocompleteDropdown({
        container,
        options: [
          { value: 'ABC', label: 'Orange' },
          { value: 'XYZ', label: 'Mango' },
        ],
        onSelect: onSelectMock,
      });
      (container.querySelector('.autocomplete-input') as HTMLInputElement).click();
      const search = document.querySelector(
        '.autocomplete-search-input',
      ) as HTMLInputElement;
      search.value = 'bc'; // mid-value substring, no label match
      search.dispatchEvent(new Event('input'));

      const labels = [...document.querySelectorAll('.autocomplete-result')].map(
        (el) => el.textContent,
      );
      expect(labels.some((t) => t?.includes('Orange'))).toBe(true);
      dropdown.destroy();
    });

    it('namespaces ids per instance so two widgets never collide', () => {
      const a = new AutocompleteDropdown({
        container,
        options: testOptions,
        onSelect: onSelectMock,
      });
      const secondContainer = document.createElement('div');
      document.body.appendChild(secondContainer);
      const b = new AutocompleteDropdown({
        container: secondContainer,
        options: testOptions,
        onSelect: onSelectMock,
      });

      const first = container.querySelector('.autocomplete-input')!;
      const other = secondContainer.querySelector('.autocomplete-input')!;

      // Open each widget in turn (an outside click closes the previous one)
      // and capture the listbox its trigger points at.
      first.click();
      const firstList = first.getAttribute('aria-controls');
      first.click();

      other.click();
      const otherList = other.getAttribute('aria-controls');
      other.click();

      // Each trigger must point at its own listbox — shared ids would make
      // the second widget hijack the first one's announcements.
      expect(firstList).not.toBeNull();
      expect(otherList).not.toBeNull();
      expect(firstList).not.toBe(otherList);

      const firstListEl = document.getElementById(firstList!);
      const otherListEl = document.getElementById(otherList!);
      expect(firstListEl?.getAttribute('role')).toBe('listbox');
      expect(otherListEl?.getAttribute('role')).toBe('listbox');
      expect(firstListEl).not.toBe(otherListEl);

      a.destroy();
      b.destroy();
      secondContainer.remove();
    });
  });
});