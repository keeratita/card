/**
 * AutocompleteDropdown - A reusable, iOS-styled autocomplete dropdown component
 *
 * Features:
 * - Searchable/filterable dropdown list
 * - iOS glassmorphism styling
 * - Keyboard navigation (↑ ↓ Enter Escape)
 * - Icon/emoji support per option
 * - Click outside to close
 * - Extensible for custom rendering
 */

export interface AutocompleteOption {
  value: string;
  label: string;
  icon?: string; // emoji or icon identifier
  customRender?: (option: AutocompleteOption) => string; // custom HTML rendering
}

export interface AutocompleteDropdownConfig {
  container: HTMLElement | string;
  options: AutocompleteOption[];
  onSelect: (value: string, option: AutocompleteOption) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  noResultsText?: string;
  maxHeight?: number;
  showIcons?: boolean;
}

// Use a reasonable max z-index instead of the fragile Integer.MAX_VALUE
const AUTOCOMPLETE_Z_INDEX = 9999;
// Estimated search input height inside the dropdown
const SEARCH_INPUT_HEIGHT = 50;

export class AutocompleteDropdown {
  private container: HTMLElement;
  private options: AutocompleteOption[];
  private onSelect: (value: string, option: AutocompleteOption) => void;
  private placeholder: string;
  private searchPlaceholder: string;
  private noResultsText: string;
  private maxHeight: number;
  private showIcons: boolean;

  private inputEl!: HTMLInputElement;
  private dropdownEl!: HTMLElement;
  private resultsEl!: HTMLElement;
  private isOpen: boolean = false;
  private filteredOptions: AutocompleteOption[] = [];
  private originalOptions: AutocompleteOption[] = [];

  // Track global listeners for cleanup
  private documentClickHandler: (e: MouseEvent) => void;
  private windowResizeHandler: () => void;
  private resultsClickHandler: (e: MouseEvent) => void;
  private resultsMouseMoveHandler: (e: MouseEvent) => void;
  private highlightedIndex: number = -1;

  constructor(config: AutocompleteDropdownConfig) {
    this.container = this.resolveContainer(config.container);
    this.options = [...config.options];
    this.originalOptions = [...config.options];
    this.onSelect = config.onSelect;
    this.placeholder = config.placeholder || 'Select...';
    this.searchPlaceholder = config.searchPlaceholder || 'Search...';
    this.noResultsText = config.noResultsText || 'No results found';
    this.maxHeight = config.maxHeight || 300;
    this.showIcons = config.showIcons !== false;

    this.filteredOptions = [...this.options];

    // Bind handlers once for consistent reference in removeEventListener
    this.documentClickHandler = this._onDocumentClick.bind(this);
    this.windowResizeHandler = this._onWindowResize.bind(this);
    this.resultsClickHandler = this._onResultsClick.bind(this);
    this.resultsMouseMoveHandler = this._onResultsMouseMove.bind(this);

    this.render();
    this.bindEvents();
  }

  private _onDocumentClick(e: MouseEvent): void {
    const target = e.target as Node;
    // Only close if clicking outside both container and dropdown
    if (!this.container.contains(target) &&
        !this.dropdownEl.contains(target)) {
      this.close();
    }
  }

  private _onWindowResize(): void {
    this.repositionDropdown();
  }

  private _onResultsClick(e: MouseEvent): void {
    const optionEl = (e.target as HTMLElement).closest('.autocomplete-result');
    if (optionEl) {
      const index = parseInt(optionEl.getAttribute('data-index') || '-1', 10);
      if (index >= 0 && index < this.filteredOptions.length) {
        this.selectOption(index);
      }
    }
  }

  private _onResultsMouseMove(e: MouseEvent): void {
    const optionEl = (e.target as HTMLElement).closest('.autocomplete-result');
    if (optionEl) {
      const index = parseInt(optionEl.getAttribute('data-index') || '-1', 10);
      if (index >= 0 && index < this.filteredOptions.length) {
        this.highlightedIndex = index;
        this.updateHighlight();
      }
    }
  }

  private resolveContainer(container: HTMLElement | string): HTMLElement {
    if (typeof container === 'string') {
      const el = document.querySelector(container);
      if (!el) {
        throw new Error(`Container element not found: ${container}`);
      }
      return el as HTMLElement;
    }
    return container;
  }

  private render(): void {
    // Create wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'autocomplete-dropdown-wrapper';
    wrapper.setAttribute('role', 'combobox');
    wrapper.setAttribute('aria-expanded', 'false');

    // Input field
    this.inputEl = document.createElement('input');
    this.inputEl.type = 'text';
    this.inputEl.className = 'autocomplete-input';
    this.inputEl.placeholder = this.placeholder;
    this.inputEl.autocomplete = 'off';
    this.inputEl.spellcheck = false;
    this.inputEl.setAttribute('aria-autocomplete', 'list');
    this.inputEl.setAttribute('aria-controls', 'autocomplete-results-list');
    this.inputEl.setAttribute('aria-activedescendant', '');

    // Dropdown container - positioned fixed to avoid overflow: hidden clipping
    this.dropdownEl = document.createElement('div');
    this.dropdownEl.className = 'autocomplete-dropdown';
    this.dropdownEl.style.display = 'none';
    this.dropdownEl.setAttribute('role', 'listbox');
    this.dropdownEl.setAttribute('aria-label', 'Select an option');

    // Search input (inside dropdown)
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.className = 'autocomplete-search-input';
    searchInput.placeholder = this.searchPlaceholder;
    searchInput.autocomplete = 'off';
    searchInput.spellcheck = false;
    searchInput.setAttribute('aria-label', 'Search options');

    // Results container
    this.resultsEl = document.createElement('div');
    this.resultsEl.className = 'autocomplete-results';
    this.resultsEl.style.maxHeight = `${this.maxHeight}px`;
    this.resultsEl.setAttribute('role', 'list');
    this.resultsEl.setAttribute('id', 'autocomplete-results-list');
    
    // Assemble dropdown
    this.dropdownEl.appendChild(searchInput);
    this.dropdownEl.appendChild(this.resultsEl);
    
    // Assemble wrapper
    wrapper.appendChild(this.inputEl);
    
    // Append to container
    this.container.appendChild(wrapper);
    
    // Append dropdown to body to escape all parent overflow constraints
    document.body.appendChild(this.dropdownEl);
    
    // Initial render of results
    this.renderResults();
  }

  private bindEvents(): void {
    // Input click - always open dropdown
    this.inputEl.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.open();
    });

    // Input keydown - handle navigation
    this.inputEl.addEventListener('keydown', (e) => {
      this.handleInputKeydown(e);
    });

    // Search input - filter results
    const searchInput = this.dropdownEl.querySelector('.autocomplete-search-input') as HTMLInputElement;
    searchInput.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      this.filterOptions(target.value);
      // Reposition dropdown after filtering (height may have changed)
      this.repositionDropdown();
    });

    // Search input keydown - handle navigation
    searchInput.addEventListener('keydown', (e) => {
      this.handleSearchKeydown(e);
    });

    // Click outside to close - use capture phase to check before other handlers
    document.addEventListener('click', this.documentClickHandler, true);

    // Reposition dropdown on window resize
    window.addEventListener('resize', this.windowResizeHandler);

    // Handle result clicks
    this.resultsEl.addEventListener('click', this.resultsClickHandler);

    // Handle result hover for keyboard-like navigation
    this.resultsEl.addEventListener('mousemove', this.resultsMouseMoveHandler);
  }

  private handleInputKeydown(e: KeyboardEvent): void {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (!this.isOpen) {
          this.open();
        } else {
          this.highlightNext();
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.highlightPrevious();
        break;
      case 'Enter':
        e.preventDefault();
        if (this.highlightedIndex >= 0) {
          this.selectOption(this.highlightedIndex);
        } else {
          this.close();
        }
        break;
      case 'Escape':
        e.preventDefault();
        this.close();
        break;
      default:
        // Open dropdown on any character input
        if (e.key.length === 1) {
          if (!this.isOpen) {
            this.open();
          }
        }
        break;
    }
  }

  private handleSearchKeydown(e: KeyboardEvent): void {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.highlightNext();
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.highlightPrevious();
        break;
      case 'Enter':
        e.preventDefault();
        if (this.highlightedIndex >= 0) {
          this.selectOption(this.highlightedIndex);
        }
        break;
      case 'Escape':
        e.preventDefault();
        this.close();
        this.inputEl.focus();
        break;
    }
  }

  private toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  private open(): void {
    this.isOpen = true;

    // Reset search state so reopening always shows the full list with an
    // empty search box (the previous filter must not persist).
    const searchInput = this.dropdownEl.querySelector(
      '.autocomplete-search-input',
    ) as HTMLInputElement;
    if (searchInput) {
      searchInput.value = '';
    }
    this.filteredOptions = [...this.originalOptions];
    this.renderResults();

    // Position the dropdown using fixed positioning to escape all parent overflow constraints
    // Get the actual input element's position (not the wrapper)
    const inputRect = this.inputEl.getBoundingClientRect();
    // Use configured maxHeight + search input height for a more accurate estimate
    const dropdownHeight = this.maxHeight + SEARCH_INPUT_HEIGHT;
    const viewportHeight = window.innerHeight;
    
    this.dropdownEl.style.position = 'fixed';
    this.dropdownEl.style.left = `${inputRect.left}px`;
    this.dropdownEl.style.width = `${inputRect.width}px`;
    this.dropdownEl.style.zIndex = String(AUTOCOMPLETE_Z_INDEX);
    this.dropdownEl.style.display = 'block';
    
    // Check if dropdown would overflow the bottom of the viewport
    const spaceBelow = viewportHeight - inputRect.bottom;
    const spaceAbove = inputRect.top;
    
    if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
      // Render above the input
      this.dropdownEl.style.top = `${inputRect.top - dropdownHeight}px`;
      this.dropdownEl.style.maxHeight = `${inputRect.top - 10}px`;
    } else {
      // Render below the input (default)
      this.dropdownEl.style.top = `${inputRect.bottom}px`;
      this.dropdownEl.style.maxHeight = `${dropdownHeight}px`;
    }
    
    this.inputEl.setAttribute('aria-expanded', 'true');

    // Recalculate the position now that the dropdown is displayed, so the
    // actual rendered height (which may differ from the estimate) is used to
    // decide whether to render above or below the input.
    this.repositionDropdown();

    // Focus search input
    setTimeout(() => {
      searchInput.focus();
      searchInput.select();
    }, 10);
  }

  private repositionDropdown(): void {
    if (!this.isOpen) return;

    // Get the actual input element's position (not the wrapper)
    const inputRect = this.inputEl.getBoundingClientRect();
    // Use the actual rendered height of the dropdown if available, otherwise estimate
    const actualHeight = this.dropdownEl.offsetHeight;
    const dropdownHeight = actualHeight > 0 ? actualHeight : this.maxHeight + SEARCH_INPUT_HEIGHT;
    const viewportHeight = window.innerHeight;
    
    // Check if dropdown would overflow the bottom of the viewport
    const spaceBelow = viewportHeight - inputRect.bottom;
    const spaceAbove = inputRect.top;
    
    if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
      // Render above the input
      this.dropdownEl.style.top = `${inputRect.top - dropdownHeight}px`;
      this.dropdownEl.style.maxHeight = `${inputRect.top - 10}px`;
    } else {
      // Render below the input (default)
      this.dropdownEl.style.top = `${inputRect.bottom}px`;
      this.dropdownEl.style.maxHeight = `${dropdownHeight}px`;
    }
  }

  private close(): void {
    this.isOpen = false;
    this.dropdownEl.style.display = 'none';
    this.inputEl.setAttribute('aria-expanded', 'false');
    this.highlightedIndex = -1;
    
    // Clear the search input
    const searchInput = this.dropdownEl.querySelector('.autocomplete-search-input') as HTMLInputElement;
    if (searchInput) {
      searchInput.value = '';
    }
    
    // Always reset to all options (don't keep filtered results)
    this.filteredOptions = [...this.originalOptions];
    
    // If there's a selected value, find and highlight it
    const currentValue = this.inputEl.value;
    if (currentValue) {
      const selectedIndex = this.originalOptions.findIndex((o) => o.label === currentValue);
      if (selectedIndex >= 0) {
        this.highlightedIndex = selectedIndex;
      }
    }
  }

  private filterOptions(query: string): void {
    const searchQuery = query.toLowerCase().trim();

    if (!searchQuery) {
      this.filteredOptions = [...this.options];
    } else {
      // Prioritize options that start with the query, then those that merely
      // contain it. This keeps the list relevant when typing a single letter
      // (e.g. "T" surfaces Thailand/Taiwan before Afghanistan).
      const startsWith: AutocompleteOption[] = [];
      const contains: AutocompleteOption[] = [];

      for (const option of this.options) {
        const label = option.label.toLowerCase();
        const value = option.value.toLowerCase();
        if (label.startsWith(searchQuery) || value.startsWith(searchQuery)) {
          startsWith.push(option);
        } else if (label.includes(searchQuery) || value.includes(searchQuery)) {
          contains.push(option);
        }
      }

      this.filteredOptions = [...startsWith, ...contains];
    }

    this.highlightedIndex = this.filteredOptions.length > 0 ? 0 : -1;
    this.renderResults();
  }

  private renderResults(): void {
    this.resultsEl.innerHTML = '';

    if (this.filteredOptions.length === 0) {
      const noResults = document.createElement('div');
      noResults.className = 'autocomplete-no-results';
      noResults.textContent = this.noResultsText;
      noResults.setAttribute('role', 'option');
      noResults.setAttribute('aria-disabled', 'true');
      this.resultsEl.appendChild(noResults);
      return;
    }

    this.filteredOptions.forEach((option, index) => {
      const resultEl = this.createResultElement(option, index);
      this.resultsEl.appendChild(resultEl);
    });
    
    this.updateHighlight();
    
    // Reposition dropdown after results are rendered (height may have changed)
    this.repositionDropdown();
  }

  private createResultElement(option: AutocompleteOption, index: number): HTMLElement {
    const resultEl = document.createElement('div');
    resultEl.className = 'autocomplete-result';
    resultEl.setAttribute('role', 'option');
    resultEl.setAttribute('data-index', index.toString());
    resultEl.setAttribute('aria-selected', 'false');
    resultEl.setAttribute('aria-label', option.label);
    resultEl.setAttribute('data-value', option.value);
    
    if (option.customRender) {
      resultEl.innerHTML = option.customRender(option);
    } else {
      const iconSpan = document.createElement('span');
      iconSpan.className = 'autocomplete-icon';
      
      if (this.showIcons && option.icon) {
        iconSpan.textContent = option.icon;
      } else {
        iconSpan.style.display = 'none';
      }
      
      const labelSpan = document.createElement('span');
      labelSpan.className = 'autocomplete-label';
      labelSpan.textContent = option.label;
      
      resultEl.appendChild(iconSpan);
      resultEl.appendChild(labelSpan);
    }
    
    return resultEl;
  }

  private highlightNext(): void {
    if (this.filteredOptions.length === 0) return;
    
    this.highlightedIndex = Math.min(
      this.highlightedIndex + 1,
      this.filteredOptions.length - 1
    );
    this.updateHighlight();
    this.scrollToHighlighted();
  }

  private highlightPrevious(): void {
    if (this.filteredOptions.length === 0) return;
    
    this.highlightedIndex = Math.max(this.highlightedIndex - 1, 0);
    this.updateHighlight();
    this.scrollToHighlighted();
  }

  private updateHighlight(): void {
    const results = this.resultsEl.querySelectorAll('.autocomplete-result');
    results.forEach((el, index) => {
      if (index === this.highlightedIndex) {
        el.classList.add('highlighted');
        el.setAttribute('aria-selected', 'true');
        this.inputEl.setAttribute('aria-activedescendant', el.id || '');
        if (!el.id) {
          el.id = `autocomplete-option-${index}`;
        }
      } else {
        el.classList.remove('highlighted');
        el.setAttribute('aria-selected', 'false');
      }
    });
  }

  private scrollToHighlighted(): void {
    const highlighted = this.resultsEl.querySelector('.autocomplete-result.highlighted');
    if (highlighted) {
      highlighted.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth'
      });
    }
  }

  private selectOption(index: number): void {
    if (index < 0 || index >= this.filteredOptions.length) return;
    
    const option = this.filteredOptions[index];
    this.inputEl.value = option.label;
    this.onSelect(option.value, option);
    this.close();
  }

  // Public methods for external control
  public setValue(value: string): void {
    const option = this.options.find((o) => o.value === value);
    if (option) {
      this.inputEl.value = option.label;
    }
  }

  public getValue(): string {
    return this.inputEl.value;
  }

  public getSelectedOption(): AutocompleteOption | undefined {
    return this.options.find((o) => o.label === this.inputEl.value);
  }

  public updateOptions(newOptions: AutocompleteOption[]): void {
    this.options = [...newOptions];
    this.originalOptions = [...newOptions];
    this.filteredOptions = [...this.options];
    this.renderResults();
  }

  public refreshOptions(): void {
    this.options = [...this.originalOptions];
    this.filteredOptions = [...this.options];
    this.renderResults();
  }

  public destroy(): void {
    // Remove global event listeners to prevent memory leaks
    document.removeEventListener('click', this.documentClickHandler, true);
    window.removeEventListener('resize', this.windowResizeHandler);
    this.resultsEl.removeEventListener('click', this.resultsClickHandler);
    this.resultsEl.removeEventListener('mousemove', this.resultsMouseMoveHandler);

    // Remove the dropdown from body
    if (this.dropdownEl && this.dropdownEl.parentNode) {
      this.dropdownEl.remove();
    }
    // Remove the wrapper from container
    const wrapper = this.container.querySelector('.autocomplete-dropdown-wrapper');
    if (wrapper) {
      wrapper.remove();
    }
  }
}