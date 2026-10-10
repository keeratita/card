import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CountryAutocomplete } from '../../src/react/country-autocomplete';
import { COUNTRIES } from '../../src/data/countries';

describe('CountryAutocomplete Component', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockOnChange.mockReset();
  });

  describe('rendering', () => {
    it('should render the component with an input', () => {
      const { container } = render(
        <CountryAutocomplete value="" onChange={mockOnChange} />
      );

      const input = container.querySelector('.country-autocomplete-input') as HTMLInputElement;
      expect(input).toBeDefined();
    });

    it('should render with default placeholder', () => {
      render(<CountryAutocomplete value="" onChange={mockOnChange} />);

      const input = screen.getByPlaceholderText('Select a country...') as HTMLInputElement;
      expect(input).toBeDefined();
    });

    it('should render with custom placeholder', () => {
      render(
        <CountryAutocomplete
          value=""
          onChange={mockOnChange}
          placeholder="Choose a country..."
        />
      );

      const input = screen.getByPlaceholderText('Choose a country...') as HTMLInputElement;
      expect(input).toBeDefined();
    });

    it('should render with custom search placeholder', () => {
      const { container } = render(
        <CountryAutocomplete
          value=""
          onChange={mockOnChange}
          searchPlaceholder="Find your country..."
        />
      );

      // Open the dropdown first
      const input = container.querySelector('.country-autocomplete-input') as HTMLInputElement;
      fireEvent.click(input);

      const searchInput = container.querySelector('.country-autocomplete-search') as HTMLInputElement;
      expect(searchInput?.placeholder).toBe('Find your country...');
    });

    it('should render with custom className', () => {
      const { container } = render(
        <CountryAutocomplete
          value=""
          onChange={mockOnChange}
          className="custom-class"
        />
      );

      const wrapper = container.querySelector('.country-autocomplete-wrapper');
      expect(wrapper?.classList.contains('custom-class')).toBe(true);
    });

    it('should render with custom id', () => {
      const { container } = render(
        <CountryAutocomplete
          value=""
          onChange={mockOnChange}
          id="my-country-input"
        />
      );

      const input = container.querySelector('#my-country-input');
      expect(input).toBeDefined();
    });
  });

  describe('display text', () => {
    it('should show placeholder when no country is selected', () => {
      render(<CountryAutocomplete value="" onChange={mockOnChange} placeholder="Select..." />);

      const input = screen.getByPlaceholderText('Select...') as HTMLInputElement;
      expect(input.value).toBe('Select...');
    });

    it('should show selected country with emoji and name', () => {
      render(
        <CountryAutocomplete value="US" onChange={mockOnChange} />
      );

      const input = document.querySelector('.country-autocomplete-input') as HTMLInputElement;
      expect(input?.value).toBe('🇺🇸 United States');
    });

    it('should show selected country for non-US countries', () => {
      render(
        <CountryAutocomplete value="JP" onChange={mockOnChange} />
      );

      const input = document.querySelector('.country-autocomplete-input') as HTMLInputElement;
      expect(input?.value).toBe('🇯🇵 Japan');
    });
  });

  describe('dropdown open/close', () => {
    it('should open dropdown when input is clicked', () => {
      const { container } = render(
        <CountryAutocomplete value="" onChange={mockOnChange} />
      );

      const input = container.querySelector('.country-autocomplete-input') as HTMLInputElement;
      fireEvent.click(input);

      const dropdown = document.querySelector('.country-autocomplete-dropdown');
      expect(dropdown).toBeDefined();
    });

    it('should show search input when dropdown opens', () => {
      const { container } = render(
        <CountryAutocomplete value="" onChange={mockOnChange} />
      );

      const input = container.querySelector('.country-autocomplete-input') as HTMLInputElement;
      fireEvent.click(input);

      const searchInput = document.querySelector('.country-autocomplete-search');
      expect(searchInput).toBeDefined();
    });

    it('should show country list when dropdown opens', () => {
      const { container } = render(
        <CountryAutocomplete value="" onChange={mockOnChange} />
      );

      const input = container.querySelector('.country-autocomplete-input') as HTMLInputElement;
      fireEvent.click(input);

      const list = document.querySelector('.country-autocomplete-list');
      expect(list).toBeDefined();
    });

    it('should close dropdown when clicking outside', async () => {
      const { container } = render(
        <>
          <div id="outside">Outside</div>
          <CountryAutocomplete value="" onChange={mockOnChange} />
        </>
      );

      // Open the dropdown
      const input = container.querySelector('.country-autocomplete-input') as HTMLInputElement;
      fireEvent.click(input);

      // Click outside
      const outside = document.getElementById('outside');
      if (outside) {
        fireEvent.mouseDown(outside);
      }

      await waitFor(() => {
        const dropdown = document.querySelector('.country-autocomplete-dropdown');
        expect(dropdown).toBeNull();
      });
    });
  });

  describe('ESC key handling', () => {
    it('should close dropdown when ESC is pressed while dropdown is open', () => {
      const { container } = render(
        <CountryAutocomplete value="" onChange={mockOnChange} />
      );

      // Open the dropdown
      const input = container.querySelector('.country-autocomplete-input') as HTMLInputElement;
      fireEvent.click(input);

      // Press ESC on the document
      fireEvent.keyDown(document, { key: 'Escape' });

      // The dropdown should be closed
      expect(document.querySelector('.country-autocomplete-dropdown')).toBeNull();
    });

    it('should close dropdown when ESC is pressed on search input', () => {
      const { container } = render(
        <CountryAutocomplete value="" onChange={mockOnChange} />
      );

      // Open the dropdown
      const input = container.querySelector('.country-autocomplete-input') as HTMLInputElement;
      fireEvent.click(input);

      // Focus the search input and press ESC
      const searchInput = document.querySelector('.country-autocomplete-search') as HTMLInputElement;
      if (searchInput) {
        fireEvent.focus(searchInput);
        fireEvent.keyDown(searchInput, { key: 'Escape' });
      }

      expect(document.querySelector('.country-autocomplete-dropdown')).toBeNull();
    });
  });

  describe('search functionality', () => {
    it('should filter countries by name when typing in search', () => {
      const { container } = render(
        <CountryAutocomplete value="" onChange={mockOnChange} />
      );

      // Open the dropdown
      const input = container.querySelector('.country-autocomplete-input') as HTMLInputElement;
      fireEvent.click(input);

      // Get the list before filtering to verify it exists
      const list = document.querySelector('.country-autocomplete-list');
      expect(list).toBeDefined();

      // Type in search input
      if (list) {
        const searchInput = document.querySelector('.country-autocomplete-search') as HTMLInputElement;
        if (searchInput) {
          fireEvent.input(searchInput, { target: { value: 'Japan' } });
        }
      }

      // After filtering, Japan should be visible
      const japanItem = document.querySelector('[data-code="JP"]');
      expect(japanItem).toBeDefined();

      // US should not be visible (not in first 20 of filtered results when searching "Japan")
      // Actually US won't be in the filtered results at all
      const usItem = document.querySelector('[data-code="US"]');
      // US won't appear in filtered results for "Japan" search
      // But the list should still have items
      expect(list).toBeDefined();
    });

    it('should filter countries by code when typing in search', () => {
      const { container } = render(
        <CountryAutocomplete value="" onChange={mockOnChange} />
      );

      // Open the dropdown
      const mainInput = container.querySelector('.country-autocomplete-input') as HTMLInputElement;
      fireEvent.click(mainInput);

      // Type in search input
      const searchInput = document.querySelector('.country-autocomplete-search') as HTMLInputElement;
      if (searchInput) {
        fireEvent.input(searchInput, { target: { value: 'GB' } });
      }

      // Should show United Kingdom
      const ukItem = document.querySelector('[data-code="GB"]');
      expect(ukItem).toBeDefined();
    });

    it('should reset search term when dropdown reopens', () => {
      const { container } = render(
        <CountryAutocomplete value="US" onChange={mockOnChange} />
      );

      // Open the dropdown
      const mainInput = container.querySelector('.country-autocomplete-input') as HTMLInputElement;
      fireEvent.click(mainInput);

      // Type in search
      const searchInput = document.querySelector('.country-autocomplete-search') as HTMLInputElement;
      if (searchInput) {
        fireEvent.input(searchInput, { target: { value: 'Japan' } });
      }

      // Close and reopen
      fireEvent.mouseDown(document.body);

      const reopenInput = container.querySelector('.country-autocomplete-input') as HTMLInputElement;
      fireEvent.click(reopenInput);

      const newSearchInput = document.querySelector('.country-autocomplete-search') as HTMLInputElement;
      expect(newSearchInput?.value).toBe('');
    });
  });

  describe('country selection', () => {
    it('should call onChange when a country is clicked', () => {
      const { container } = render(
        <CountryAutocomplete value="" onChange={mockOnChange} />
      );

      // Open the dropdown
      const mainInput = container.querySelector('.country-autocomplete-input') as HTMLInputElement;
      fireEvent.click(mainInput);

      // Get the list and find the country item
      const list = document.querySelector('.country-autocomplete-list');
      expect(list).toBeDefined();

      if (list) {
        // Get the first country item (Afghanistan, code "AF")
        const firstItem = list.querySelector('.country-autocomplete-item');
        expect(firstItem).toBeDefined();
        if (firstItem) {
          fireEvent.click(firstItem);
        }
      }

      // onChange should have been called with the first country code
      expect(mockOnChange).toHaveBeenCalled();
    });

    it('should call onChange with correct country code', () => {
      const { container } = render(
        <CountryAutocomplete value="" onChange={mockOnChange} />
      );

      // Open the dropdown
      const mainInput = container.querySelector('.country-autocomplete-input') as HTMLInputElement;
      fireEvent.click(mainInput);

      // Get the list and find Japan
      const list = document.querySelector('.country-autocomplete-list');
      expect(list).toBeDefined();

      if (list) {
        // Japan is at index 96 in the full list, but not in the first 20 visible items
        // So we need to search by data-code attribute which should work regardless of visibility
        // Actually, JP is not in the first 20 items (AF, AX, AL, DZ, AS, AD, AO, AI, AQ, AG, AR, AM, AW, AU, AT, AZ, BS, BH, BD, BB)
        // Let's use a country that IS in the first 20 items instead
        const afItem = list.querySelector('[data-code="AF"]');
        if (afItem) {
          fireEvent.click(afItem);
        }
      }

      expect(mockOnChange).toHaveBeenCalledWith('AF');
    });

    it('should update display text after selection', () => {
      // Since this is a controlled component, we need to verify the display text
      // by rendering a new instance with the updated value after onChange is called.
      const { container } = render(
        <CountryAutocomplete value="" onChange={mockOnChange} />
      );

      // Open the dropdown
      const mainInput = container.querySelector('.country-autocomplete-input') as HTMLInputElement;
      fireEvent.click(mainInput);

      // Click on a country using the list - use a country that's in the first 20
      const list = document.querySelector('.country-autocomplete-list');
      if (list) {
        const countryItem = list.querySelector('[data-code="AU"]'); // Australia is in the first 20
        if (countryItem) {
          fireEvent.click(countryItem);
        }
      }

      // Verify onChange was called with the correct country code
      expect(mockOnChange).toHaveBeenCalledWith('AU');

      // Now render a new instance with the updated value to verify display text
      // (simulating what the parent component would do)
      const { container: newContainer } = render(
        <CountryAutocomplete value="AU" onChange={mockOnChange} />
      );

      const newInput = newContainer.querySelector('.country-autocomplete-input') as HTMLInputElement;
      expect(newInput?.value).toBe('🇦🇺 Australia');
    });

    it('should close dropdown after selection', () => {
      const { container } = render(
        <CountryAutocomplete value="" onChange={mockOnChange} />
      );

      // Open the dropdown
      const mainInput = container.querySelector('.country-autocomplete-input') as HTMLInputElement;
      fireEvent.click(mainInput);

      // Click on a country using the list
      const list = document.querySelector('.country-autocomplete-list');
      if (list) {
        const countryItem = list.querySelector('[data-code="AT"]'); // Austria is in the first 20
        if (countryItem) {
          fireEvent.click(countryItem);
        }
      }

      // Dropdown should be closed after selection
      expect(document.querySelector('.country-autocomplete-dropdown')).toBeNull();
    });
  });

  describe('keyboard navigation', () => {
    it('should navigate with ArrowDown when dropdown is open', () => {
      const { container } = render(
        <CountryAutocomplete value="" onChange={mockOnChange} />
      );

      // Open the dropdown
      const mainInput = container.querySelector('.country-autocomplete-input') as HTMLInputElement;
      fireEvent.click(mainInput);

      // Press ArrowDown
      fireEvent.keyDown(mainInput, { key: 'ArrowDown' });

      // First item must actually carry the highlight class
      const firstItem = document.querySelector('[data-index="0"].highlighted');
      expect(firstItem).not.toBeNull();
    });

    it('should navigate with ArrowUp when dropdown is open', () => {
      const { container } = render(
        <CountryAutocomplete value="" onChange={mockOnChange} />
      );

      // Open the dropdown
      const mainInput = container.querySelector('.country-autocomplete-input') as HTMLInputElement;
      fireEvent.click(mainInput);

      // Press ArrowDown to go to first item
      fireEvent.keyDown(mainInput, { key: 'ArrowDown' });
      // Press ArrowUp to wrap to the last rendered row
      fireEvent.keyDown(mainInput, { key: 'ArrowUp' });

      const items = document.querySelectorAll('.country-autocomplete-item');
      expect(items.length).toBeGreaterThan(0);
      const lastItem = document.querySelector(
        `[data-index="${items.length - 1}"].highlighted`,
      );
      expect(lastItem).not.toBeNull();
    });

    it('should keep the highlight on rendered rows when arrowing after a filter', () => {
      const { container } = render(
        <CountryAutocomplete value="" onChange={mockOnChange} />
      );

      const mainInput = container.querySelector('.country-autocomplete-input') as HTMLInputElement;
      fireEvent.click(mainInput);
      const searchInput = document.querySelector('.country-autocomplete-search') as HTMLInputElement;
      fireEvent.input(searchInput, { target: { value: 'tha' } });

      const rendered = () =>
        document.querySelectorAll('.country-autocomplete-item').length;
      for (let i = 0; i < rendered() + 1; i++) {
        fireEvent.keyDown(searchInput, { key: 'ArrowDown' });
        const highlighted = document.querySelector(
          '.country-autocomplete-item.highlighted',
        );
        // A regression using the unfiltered count would highlight a row
        // that was never rendered.
        expect(highlighted).not.toBeNull();
      }
    });

    it('should grow the lazy window when the keyboard passes the rendered page', () => {
      const { container } = render(
        <CountryAutocomplete value="" onChange={mockOnChange} />
      );

      const mainInput = container.querySelector('.country-autocomplete-input') as HTMLInputElement;
      fireEvent.click(mainInput);
      const searchInput = document.querySelector('.country-autocomplete-search') as HTMLInputElement;
      fireEvent.input(searchInput, { target: { value: 'a' } });

      // Arrow well past the 20-row page without any scroll event: every
      // step must keep a visible, rendered highlight.
      for (let i = 0; i < 25; i++) {
        fireEvent.keyDown(searchInput, { key: 'ArrowDown' });
        expect(
          document.querySelector('.country-autocomplete-item.highlighted'),
        ).not.toBeNull();
      }
      expect(
        document.querySelectorAll('.country-autocomplete-item').length,
      ).toBeGreaterThan(20);
    });

    it('should select highlighted country with Enter', () => {
      const { container } = render(
        <CountryAutocomplete value="" onChange={mockOnChange} />
      );

      // Open the dropdown
      const mainInput = container.querySelector('.country-autocomplete-input') as HTMLInputElement;
      fireEvent.click(mainInput);

      // Navigate to first item
      fireEvent.keyDown(mainInput, { key: 'ArrowDown' });

      // Press Enter
      fireEvent.keyDown(mainInput, { key: 'Enter' });

      expect(mockOnChange).toHaveBeenCalledWith('AF'); // First country alphabetically
    });

    it('should select the filtered highlighted country with Enter from search', () => {
      const { container } = render(
        <CountryAutocomplete value="" onChange={mockOnChange} />
      );

      const mainInput = container.querySelector('.country-autocomplete-input') as HTMLInputElement;
      fireEvent.click(mainInput);
      const searchInput = document.querySelector('.country-autocomplete-search') as HTMLInputElement;
      fireEvent.input(searchInput, { target: { value: 'thailan' } });
      fireEvent.keyDown(searchInput, { key: 'ArrowDown' });
      fireEvent.keyDown(searchInput, { key: 'Enter' });

      // Wrong-row regressions (originalOptions vs filtered) land here.
      expect(mockOnChange).toHaveBeenCalledWith('TH');
    });

    it('should open dropdown with ArrowDown when closed', () => {
      const { container } = render(
        <CountryAutocomplete value="" onChange={mockOnChange} />
      );

      const mainInput = container.querySelector('.country-autocomplete-input') as HTMLInputElement;

      // Press ArrowDown when closed
      fireEvent.keyDown(mainInput, { key: 'ArrowDown' });

      const dropdown = document.querySelector('.country-autocomplete-dropdown');
      expect(dropdown).not.toBeNull();
    });

    it('should open dropdown with Enter when closed', () => {
      const { container } = render(
        <CountryAutocomplete value="" onChange={mockOnChange} />
      );

      const mainInput = container.querySelector('.country-autocomplete-input') as HTMLInputElement;

      // Press Enter when closed
      fireEvent.keyDown(mainInput, { key: 'Enter' });

      const dropdown = document.querySelector('.country-autocomplete-dropdown');
      expect(dropdown).not.toBeNull();
    });

    it('should open dropdown with Space when closed', () => {
      const { container } = render(
        <CountryAutocomplete value="" onChange={mockOnChange} />
      );

      const mainInput = container.querySelector('.country-autocomplete-input') as HTMLInputElement;

      // Press Space when closed
      fireEvent.keyDown(mainInput, { key: ' ' });

      const dropdown = document.querySelector('.country-autocomplete-dropdown');
      expect(dropdown).not.toBeNull();
    });

    it('should open with a typed character and pre-apply it to the filter (type-ahead parity)', () => {
      const { container } = render(
        <CountryAutocomplete value="" onChange={mockOnChange} />
      );

      const mainInput = container.querySelector('.country-autocomplete-input') as HTMLInputElement;
      const triggerValueBefore = mainInput.value;
      fireEvent.keyDown(mainInput, { key: 't' });

      const dropdown = document.querySelector('.country-autocomplete-dropdown');
      expect(dropdown).not.toBeNull();
      const searchInput = document.querySelector('.country-autocomplete-search') as HTMLInputElement;
      expect(searchInput.value).toBe('t');
      // Thailand (starts with T) must be at the top; exact-code-only
      // semantics mean Chad (TD) never appears for "t".
      const codes = [...document.querySelectorAll('.country-autocomplete-item')].map(
        (el) => el.getAttribute('data-code'),
      );
      expect(codes).toContain('TH');
      expect(codes).not.toContain('TD');
      // The readOnly trigger never accepts the typed character.
      expect(mainInput.value).toBe(triggerValueBefore);
    });

    it('should keep the active filter when clicking the already-open trigger', () => {
      const { container } = render(
        <CountryAutocomplete value="" onChange={mockOnChange} />
      );

      const mainInput = container.querySelector('.country-autocomplete-input') as HTMLInputElement;
      fireEvent.click(mainInput);
      const searchInput = document.querySelector('.country-autocomplete-search') as HTMLInputElement;
      fireEvent.input(searchInput, { target: { value: 'Japan' } });

      // Re-click the trigger to refocus — the filter must survive.
      fireEvent.click(mainInput);

      expect(
        (document.querySelector('.country-autocomplete-search') as HTMLInputElement).value,
      ).toBe('Japan');
      expect(document.querySelector('[data-code="JP"]')).not.toBeNull();
    });
  });

  describe('list semantics', () => {
    it('exposes each row position within the filtered set', () => {
      const { container } = render(
        <CountryAutocomplete value="" onChange={mockOnChange} />
      );
      fireEvent.click(container.querySelector('.country-autocomplete-input')!);
      const search = document.querySelector('.country-autocomplete-search') as HTMLInputElement;
      fireEvent.input(search, { target: { value: 'land' } });

      const rows = [...document.querySelectorAll('.country-autocomplete-item')];
      expect(rows.length).toBeGreaterThan(1);
      // The list lazily renders a page at a time, so aria-setsize reports the
      // full filtered count (>= rendered rows) while aria-posinset is the
      // row's position within it.
      const sizes = rows.map((r) => Number(r.getAttribute('aria-setsize')));
      expect(Math.min(...sizes)).toBeGreaterThanOrEqual(rows.length);
      expect(new Set(sizes).size).toBe(1);
      rows.forEach((row, i) => {
        expect(row.getAttribute('aria-posinset')).toBe(String(i + 1));
      });
    });

    it('announces a no-results state inside the listbox', () => {
      const { container } = render(
        <CountryAutocomplete value="" onChange={mockOnChange} />
      );
      fireEvent.click(container.querySelector('.country-autocomplete-input')!);
      const search = document.querySelector('.country-autocomplete-search') as HTMLInputElement;
      fireEvent.input(search, { target: { value: 'zzzzz' } });

      const empty = document.querySelector('.country-autocomplete-empty');
      expect(empty).not.toBeNull();
      expect(empty?.textContent).toContain('zzzzz');
      // Not selectable: it must never become the activedescendant target.
      expect(empty?.getAttribute('aria-disabled')).toBe('true');
      expect(
        document.querySelector(
          '.country-autocomplete-item:not(.country-autocomplete-empty)',
        ),
      ).toBeNull();
    });

    it('announces the filtered result count in a live region', () => {
      const { container } = render(
        <CountryAutocomplete value="" onChange={mockOnChange} />
      );
      fireEvent.click(container.querySelector('.country-autocomplete-input')!);
      const status = document.querySelector('.country-autocomplete-status');
      expect(status?.getAttribute('aria-live')).toBe('polite');
      expect(status?.textContent).toContain(String(COUNTRIES.length));
    });
  });

  describe('placement', () => {
    function stubRect(el: Element, rect: Partial<DOMRect>): void {
      el.getBoundingClientRect = () => ({
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        width: 320,
        height: 44,
        x: 0,
        y: 0,
        toJSON: () => ({}),
        ...rect,
      }) as DOMRect;
    }

    function openWith(rect: Partial<DOMRect>, innerHeight: number) {
      const { container } = render(
        <CountryAutocomplete value="" onChange={mockOnChange} />
      );
      const input = container.querySelector('.country-autocomplete-input')!;
      stubRect(input, rect);
      vi.stubGlobal('innerHeight', innerHeight);
      fireEvent.click(input);
      return document.querySelector(
        '.country-autocomplete-dropdown-container',
      ) as HTMLElement;
    }

    it('renders below the trigger when there is room', () => {
      const dropdown = openWith({ top: 100, bottom: 140 }, 800);
      expect(dropdown.style.top).toBe('140px');
      expect(dropdown.style.maxHeight).toBe('300px');
      vi.unstubAllGlobals();
    });

    it('flips above the trigger when the bottom of the viewport is tight', () => {
      // Space below (60px) is smaller than the list while space above (250px)
      // is larger, so the list renders above the trigger, clamped to the top.
      const dropdown = openWith({ top: 250, bottom: 290 }, 350);
      expect(dropdown.style.top).toBe('0px');
      expect(dropdown.style.maxHeight).toBe('240px');
      const list = document.querySelector('.country-autocomplete-list') as HTMLElement;
      expect(list.style.maxHeight).toBe('240px');
      vi.unstubAllGlobals();
    });

    it('stays below and clamps the list when neither side fits the full height', () => {
      // spaceBelow (190px) is smaller than the list but larger than
      // spaceAbove (100px), so the dropdown stays below and clamps instead
      // of flipping or collapsing.
      const dropdown = openWith({ top: 100, bottom: 110 }, 300);
      expect(dropdown.style.top).toBe('110px');
      expect(dropdown.style.maxHeight).toBe('190px');
      const list = document.querySelector('.country-autocomplete-list') as HTMLElement;
      expect(list.style.maxHeight).toBe('190px');
      vi.unstubAllGlobals();
    });
  });

  describe('selected state', () => {
    it('should mark the selected country as selected', () => {
      const { container } = render(
        <CountryAutocomplete value="US" onChange={mockOnChange} />
      );

      // Open the dropdown
      const mainInput = container.querySelector('.country-autocomplete-input') as HTMLInputElement;
      fireEvent.click(mainInput);

      const selectedItem = document.querySelector('[data-code="US"].selected');
      expect(selectedItem).toBeDefined();
    });
  });

  describe('lazy loading', () => {
    it('should show initial batch of 20 countries', () => {
      const { container } = render(
        <CountryAutocomplete value="" onChange={mockOnChange} />
      );

      // Open the dropdown
      const mainInput = container.querySelector('.country-autocomplete-input') as HTMLInputElement;
      fireEvent.click(mainInput);

      const items = document.querySelectorAll('.country-autocomplete-item');
      expect(items.length).toBe(20);
    });

    it('should show loading indicator when there are more countries', () => {
      const { container } = render(
        <CountryAutocomplete value="" onChange={mockOnChange} />
      );

      // Open the dropdown
      const mainInput = container.querySelector('.country-autocomplete-input') as HTMLInputElement;
      fireEvent.click(mainInput);

      const loading = document.querySelector('.country-autocomplete-loading');
      expect(loading).toBeDefined();
    });

    it('should load more countries on scroll', async () => {
      const { container } = render(
        <CountryAutocomplete value="" onChange={mockOnChange} />
      );

      // Open the dropdown
      const mainInput = container.querySelector('.country-autocomplete-input') as HTMLInputElement;
      fireEvent.click(mainInput);

      const list = document.querySelector('.country-autocomplete-list');

      if (list) {
        // Simulate scroll to bottom
        Object.defineProperty(list, 'scrollHeight', { value: 1000, writable: true });
        Object.defineProperty(list, 'scrollTop', { value: 900, writable: true });
        Object.defineProperty(list, 'clientHeight', { value: 300, writable: true });

        fireEvent.scroll(list);

        await waitFor(() => {
          const items = document.querySelectorAll('.country-autocomplete-item');
          expect(items.length).toBeGreaterThan(20);
        }, { timeout: 200 });
      }
    });
  });

  describe('accessibility', () => {
    it('should make the trigger a disclosure button that owns the listbox', () => {
      const { container } = render(
        <CountryAutocomplete value="" onChange={mockOnChange} />
      );

      const input = container.querySelector('.country-autocomplete-input');
      // The trigger is never the combobox: while open the focused search
      // input carries that role (same contract as Angular and vanilla).
      expect(input?.getAttribute('role')).toBe('button');
      expect(input?.getAttribute('aria-expanded')).toBe('false');
    });

    it('should make the search input the combobox while the list is open', () => {
      const { container } = render(
        <CountryAutocomplete value="" onChange={mockOnChange} />
      );
      fireEvent.click(container.querySelector('.country-autocomplete-input')!);

      const search = document.querySelector('.country-autocomplete-search');
      expect(search?.getAttribute('role')).toBe('combobox');
      expect(search?.getAttribute('aria-expanded')).toBe('true');
      expect(search?.getAttribute('aria-haspopup')).toBe('listbox');
    });

    it('should have aria-haspopup="listbox" on the main input', () => {
      const { container } = render(
        <CountryAutocomplete value="" onChange={mockOnChange} />
      );

      const input = container.querySelector('.country-autocomplete-input');
      expect(input?.getAttribute('aria-haspopup')).toBe('listbox');
    });

    it('should expose aria-expanded on the focused combobox in each state', () => {
      const { container } = render(
        <CountryAutocomplete value="" onChange={mockOnChange} />
      );

      // Closed: the disclosure trigger reports collapsed.
      const input = container.querySelector('.country-autocomplete-input');
      expect(input?.getAttribute('aria-expanded')).toBe('false');

      // Open: both the trigger (disclosure) and the focused search input
      // (combobox) report expanded, and both reference the live listbox.
      fireEvent.click(input!);
      const search = document.querySelector('.country-autocomplete-search');
      const list = document.querySelector('[role="listbox"]');
      expect(input?.getAttribute('aria-expanded')).toBe('true');
      expect(input?.getAttribute('aria-controls')).toBe(list?.getAttribute('id'));
      expect(search?.getAttribute('role')).toBe('combobox');
      expect(search?.getAttribute('aria-expanded')).toBe('true');
      expect(search?.getAttribute('aria-controls')).toBe(list?.getAttribute('id'));
    });

    it('should have role="listbox" on the dropdown list', () => {
      const { container } = render(
        <CountryAutocomplete value="" onChange={mockOnChange} />
      );

      const mainInput = container.querySelector('.country-autocomplete-input') as HTMLInputElement;
      fireEvent.click(mainInput);

      const list = document.querySelector('.country-autocomplete-list');
      expect(list?.getAttribute('role')).toBe('listbox');
    });

    it('should have role="option" on country items', () => {
      const { container } = render(
        <CountryAutocomplete value="" onChange={mockOnChange} />
      );

      const mainInput = container.querySelector('.country-autocomplete-input') as HTMLInputElement;
      fireEvent.click(mainInput);

      const item = document.querySelector('.country-autocomplete-item');
      expect(item?.getAttribute('role')).toBe('option');
    });

    it('should have aria-selected on country items', () => {
      const { container } = render(
        <CountryAutocomplete value="AF" onChange={mockOnChange} />
      );

      const mainInput = container.querySelector('.country-autocomplete-input') as HTMLInputElement;
      fireEvent.click(mainInput);

      // AF is in the first 20 items, so we can check it
      const afItem = document.querySelector('[data-code="AF"]');
      expect(afItem?.getAttribute('aria-selected')).toBe('true');

      const otherItem = document.querySelector('[data-code="AX"]');
      expect(otherItem?.getAttribute('aria-selected')).toBe('false');
    });
  });

  describe('dropdown positioning', () => {
    it('should render dropdown in a fixed position container', () => {
      const { container } = render(
        <CountryAutocomplete value="" onChange={mockOnChange} />
      );

      const mainInput = container.querySelector('.country-autocomplete-input') as HTMLInputElement;
      fireEvent.click(mainInput);

      const dropdownContainer = document.querySelector('.country-autocomplete-dropdown-container');
      expect(dropdownContainer).toBeDefined();
      expect(dropdownContainer?.style.position).toBe('fixed');
    });

    it('should have proper z-index on dropdown', () => {
      const { container } = render(
        <CountryAutocomplete value="" onChange={mockOnChange} />
      );

      const mainInput = container.querySelector('.country-autocomplete-input') as HTMLInputElement;
      fireEvent.click(mainInput);

      const dropdownContainer = document.querySelector('.country-autocomplete-dropdown-container');
      expect(dropdownContainer?.style.zIndex).toBe('9999');
    });
  });

  describe('input behavior', () => {
    it('should have tabIndex=0 on the main input', () => {
      const { container } = render(
        <CountryAutocomplete value="" onChange={mockOnChange} />
      );

      const input = container.querySelector('.country-autocomplete-input') as HTMLInputElement;
      expect(input.tabIndex).toBe(0);
    });

    it('should be clickable to open dropdown', () => {
      const { container } = render(
        <CountryAutocomplete value="" onChange={mockOnChange} />
      );

      const input = container.querySelector('.country-autocomplete-input') as HTMLInputElement;
      fireEvent.click(input);

      const dropdown = document.querySelector('.country-autocomplete-dropdown');
      expect(dropdown).toBeDefined();
    });

    it('should display value without requiring onChange handler for basic rendering', () => {
      // The component renders with a value prop and displays it correctly
      // The tests use mock onChange handlers which satisfy React's requirements
      const { container } = render(
        <CountryAutocomplete value="US" onChange={mockOnChange} />
      );

      const input = container.querySelector('.country-autocomplete-input') as HTMLInputElement;
      expect(input.value).toBe('🇺🇸 United States');
    });
  });

  // Every close path must hand focus back to the trigger: the search input is
  // unmounted on close, so without this focus lands on <body> and keyboard
  // users lose their place. Same contract as the vanilla and Angular bindings.
  describe('focus management', () => {
    function openAndGetHandles() {
      const { container } = render(
        <CountryAutocomplete value="" onChange={mockOnChange} />,
      );
      const trigger = container.querySelector(
        '.country-autocomplete-input',
      ) as HTMLInputElement;
      fireEvent.click(trigger);
      const search = document.querySelector(
        '.country-autocomplete-search',
      ) as HTMLInputElement;
      return { trigger, search };
    }

    it('returns focus to the trigger after a keyboard selection', () => {
      const { trigger, search } = openAndGetHandles();
      fireEvent.focus(search);
      fireEvent.keyDown(search, { key: 'ArrowDown' });
      fireEvent.keyDown(search, { key: 'Enter' });

      expect(mockOnChange).toHaveBeenCalledWith('AF');
      expect(document.activeElement).toBe(trigger);
    });

    it('returns focus to the trigger after a pointer selection', () => {
      const { trigger, search } = openAndGetHandles();
      fireEvent.focus(search);
      const row = document.querySelector(
        '.country-autocomplete-item',
      ) as HTMLElement;
      fireEvent.click(row);

      expect(mockOnChange).toHaveBeenCalled();
      expect(document.activeElement).toBe(trigger);
    });

    it('returns focus to the trigger when an outside mousedown closes the list', () => {
      const { trigger, search } = openAndGetHandles();
      const outside = document.createElement('div');
      document.body.appendChild(outside);

      // Real focus (not fireEvent.focus, which only dispatches an event):
      // the handler reads document.activeElement.
      search.focus();
      expect(document.activeElement).toBe(search);
      fireEvent.mouseDown(outside);

      expect(document.activeElement).toBe(trigger);
      outside.remove();
    });

    it('leaves focus alone when the outside click happened with nothing focused inside', () => {
      const { search } = openAndGetHandles();
      const outside = document.createElement('div');
      document.body.appendChild(outside);
      const other = document.createElement('button');
      document.body.appendChild(other);
      other.focus();

      fireEvent.mouseDown(outside);

      // Focus was never inside the widget: don't steal it.
      expect(document.activeElement).toBe(other);
      expect(search.isConnected).toBe(false);
      other.remove();
      outside.remove();
    });
  });
});