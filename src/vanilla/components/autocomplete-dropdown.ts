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
 *
 * All decision logic (open/close state, filtering, highlight navigation,
 * viewport placement) comes from the shared, framework-agnostic combobox
 * core in `src/core/form/combobox.ts`. This class is a thin DOM binder.
 */

import {
  comboboxFilter,
  comboboxReduce,
  computeDropdownPlacement,
  INITIAL_COMBOBOX_STATE,
} from '../../core/form';
import type {
  ComboboxAction,
  ComboboxState,
  DropdownPlacement,
} from '../../core/form';
import { CARD_FORM_TEXT_EN } from '../../lang/en';

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
  /**
   * When true (default), option `value`s also match on prefix/contains —
   * the widget's original generic behavior. Set false for short-code values
   * (e.g. ISO country codes) so a partial query does not surface unrelated
   * options whose code happens to start with the query; the country binding
   * does exactly this, matching the React/Angular bindings.
   */
  includeValuePrefixMatch?: boolean;
}

// Use a reasonable max z-index instead of the fragile Integer.MAX_VALUE
const AUTOCOMPLETE_Z_INDEX = 9999;
// Estimated search input height inside the dropdown
const SEARCH_INPUT_HEIGHT = 50;

// Unique DOM-id namespace per instance, so multiple dropdowns on one page
// never collide on aria-controls / aria-activedescendant IDREFs.
let instanceCounter = 0;

export class AutocompleteDropdown {
  private container: HTMLElement;
  private options: AutocompleteOption[];
  private onSelect: (value: string, option: AutocompleteOption) => void;
  private placeholder: string;
  private searchPlaceholder: string;
  private noResultsText: string;
  private maxHeight: number;
  private showIcons: boolean;
  private includeValuePrefixMatch: boolean;

  private readonly uid = `autocomplete-${++instanceCounter}`;
  private inputEl!: HTMLInputElement;
  private searchInputEl!: HTMLInputElement;
  private dropdownEl!: HTMLElement;
  private resultsEl!: HTMLElement;
  private statusEl!: HTMLElement;
  private state: ComboboxState = INITIAL_COMBOBOX_STATE;
  private filteredOptions: AutocompleteOption[] = [];

  // Track global listeners for cleanup
  private documentClickHandler: (e: MouseEvent) => void;
  private windowResizeHandler: () => void;
  private windowScrollHandler: () => void;
  private resultsClickHandler: (e: MouseEvent) => void;
  private resultsMouseMoveHandler: (e: MouseEvent) => void;
  private repositionQueued = false;

  private get isOpen(): boolean {
    return this.state.isOpen;
  }

  private get highlightedIndex(): number {
    return this.state.highlightedIndex;
  }

  constructor(config: AutocompleteDropdownConfig) {
    this.container = this.resolveContainer(config.container);
    this.options = [...config.options];
    this.onSelect = config.onSelect;
    this.placeholder = config.placeholder || 'Select...';
    this.searchPlaceholder = config.searchPlaceholder || 'Search...';
    this.noResultsText = config.noResultsText || 'No results found';
    this.maxHeight = config.maxHeight || 300;
    this.showIcons = config.showIcons !== false;
    this.includeValuePrefixMatch = config.includeValuePrefixMatch !== false;

    this.filteredOptions = [...this.options];

    // Bind handlers once for consistent reference in removeEventListener
    this.documentClickHandler = this._onDocumentClick.bind(this);
    this.windowResizeHandler = this._onWindowResize.bind(this);
    this.windowScrollHandler = this._onWindowScroll.bind(this);
    this.resultsClickHandler = this._onResultsClick.bind(this);
    this.resultsMouseMoveHandler = this._onResultsMouseMove.bind(this);

    this.render();
    this.bindEvents();
  }

  private dispatch(action: ComboboxAction): void {
    this.state = comboboxReduce(this.state, action);
  }

  private _onDocumentClick(e: MouseEvent): void {
    if (!this.isOpen) return;
    const target = e.target as Node;
    // Only close if clicking outside both container and dropdown
    if (
      !this.container.contains(target) &&
      !this.dropdownEl.contains(target)
    ) {
      this.close();
    }
  }

  private _onWindowResize(): void {
    this.scheduleReposition();
  }

  private _onWindowScroll(): void {
    // The dropdown is position:fixed; a page/list scroll detaches it from
    // the trigger, so reposition (rAF-coalesced, like the React binding).
    this.scheduleReposition();
  }

  private scheduleReposition(): void {
    if (!this.isOpen || this.repositionQueued) return;
    this.repositionQueued = true;
    requestAnimationFrame(() => {
      this.repositionQueued = false;
      this.repositionDropdown();
    });
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
        this.dispatch({ type: 'setHighlight', index });
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
    // Create wrapper — a plain container. The combobox semantics live on
    // the trigger input; a second role=combobox here would give ATs two
    // conflicting nodes to choose from.
    const wrapper = document.createElement('div');
    wrapper.className = 'autocomplete-dropdown-wrapper';

    // Trigger input: a disclosure button (readOnly, so typed characters can
    // never strand raw text in the field — they are forwarded into the
    // dropdown's search box instead, see keydown). The combobox semantics
    // live on the search input while open, in all three bindings.
    this.inputEl = document.createElement('input');
    this.inputEl.type = 'text';
    this.inputEl.className = 'autocomplete-input';
    this.inputEl.placeholder = this.placeholder;
    this.inputEl.autocomplete = 'off';
    this.inputEl.spellcheck = false;
    this.inputEl.readOnly = true;
    this.inputEl.setAttribute('role', 'button');
    this.inputEl.setAttribute('aria-haspopup', 'listbox');
    this.inputEl.setAttribute('aria-expanded', 'false');

    // Dropdown container - positioned fixed to avoid overflow: hidden clipping
    this.dropdownEl = document.createElement('div');
    this.dropdownEl.className = 'autocomplete-dropdown';
    this.dropdownEl.style.display = 'none';

    // Search input (inside dropdown): while open, the focused element is
    // the combobox, mirroring the React/Angular bindings.
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.className = 'autocomplete-search-input';
    searchInput.placeholder = this.searchPlaceholder;
    searchInput.autocomplete = 'off';
    searchInput.spellcheck = false;
    searchInput.setAttribute('role', 'combobox');
    searchInput.setAttribute('aria-expanded', 'true');
    searchInput.setAttribute('aria-haspopup', 'listbox');
    searchInput.setAttribute('aria-autocomplete', 'list');
    searchInput.setAttribute('aria-controls', `${this.uid}-list`);
    searchInput.setAttribute('aria-activedescendant', '');
    searchInput.setAttribute('aria-label', CARD_FORM_TEXT_EN.searchOptions);
    this.searchInputEl = searchInput;

    // Results container: the listbox referenced by both comboboxes'
    // aria-controls. Kept a sibling of the search input (not an ancestor)
    // so options are direct listbox children.
    this.resultsEl = document.createElement('div');
    this.resultsEl.className = 'autocomplete-results';
    this.resultsEl.style.maxHeight = `${this.maxHeight}px`;
    this.resultsEl.setAttribute('role', 'listbox');
    this.resultsEl.setAttribute('id', `${this.uid}-list`);
    this.resultsEl.setAttribute('aria-label', CARD_FORM_TEXT_EN.optionsList);

    // Polite live region announcing result counts (screen readers get no
    // feedback from a filtered list otherwise).
    this.statusEl = document.createElement('div');
    this.statusEl.className = 'autocomplete-status visually-hidden';
    this.statusEl.setAttribute('role', 'status');
    this.statusEl.setAttribute('aria-live', 'polite');

    // Assemble dropdown
    this.dropdownEl.appendChild(searchInput);
    this.dropdownEl.appendChild(this.resultsEl);
    this.dropdownEl.appendChild(this.statusEl);

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
    // Input click - open the dropdown (no-op while open, so clicking the
    // visible field to refocus never wipes an active filter).
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
    const searchInput = this.dropdownEl.querySelector(
      '.autocomplete-search-input',
    ) as HTMLInputElement;
    searchInput.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement;
      this.filterOptions(target.value);
    });

    // Search input keydown - handle navigation
    searchInput.addEventListener('keydown', (e) => {
      this.handleSearchKeydown(e);
    });

    // Click outside to close - use capture phase to check before other handlers
    document.addEventListener('click', this.documentClickHandler, true);

    // Keep the fixed-position dropdown attached to its trigger while the
    // window resizes or the page scrolls.
    window.addEventListener('resize', this.windowResizeHandler, {
      passive: true,
    });
    window.addEventListener('scroll', this.windowScrollHandler, {
      passive: true,
      capture: true,
    });

    // Handle result clicks
    this.resultsEl.addEventListener('click', this.resultsClickHandler);

    // Handle result hover for keyboard-like navigation; leaving the list
    // returns the highlight to the current selection so a stray pointer
    // pass never leaves the announced row hovering mid-list.
    this.resultsEl.addEventListener('mousemove', this.resultsMouseMoveHandler);
    this.resultsEl.addEventListener('mouseleave', () => {
      if (!this.isOpen) return;
      this.dispatch({
        type: 'setHighlight',
        index: this.getSelectedIndex(this.filteredOptions),
      });
      this.updateHighlight();
    });
  }

  private handleInputKeydown(e: KeyboardEvent): void {
    if (!this.isOpen) {
      // Closed: activation keys only open the dropdown. Navigating or
      // selecting from the closed list would commit a row the user never
      // saw (and desync from React/Angular, which open on these keys).
      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowUp':
        case 'Enter':
        case ' ':
          e.preventDefault();
          this.open();
          return;
        default:
          // Type-ahead: open with the typed character pre-applied to the
          // filter. The trigger is readOnly, so no text can strand in it.
          if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
            e.preventDefault();
            this.open(e.key);
          }
          return;
      }
    }

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
        } else {
          this.close();
        }
        break;
      case 'Escape':
        e.preventDefault();
        this.close();
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

  /**
   * Opens the dropdown, resetting the filter (the previous query must not
   * persist) and highlighting the current selection so reopening shows
   * where it sits in the list. `initialQuery` pre-filters (used by trigger
   * type-ahead). State is written in a single pass: the reducer's `open`
   * reset, then the selection-derived highlight.
   */
  private open(initialQuery = ''): void {
    if (this.isOpen) return;

    this.state = {
      ...comboboxReduce(this.state, { type: 'open' }),
      query: initialQuery,
      highlightedIndex: initialQuery
        ? -1
        : this.getSelectedIndex(),
    };

    // Reset the search box to match the (re)set query.
    this.searchInputEl.value = initialQuery;
    this.applyFilter(initialQuery);
    this.renderResults();

    // Position the dropdown using fixed positioning to escape all parent
    // overflow constraints. Use the configured maxHeight + search input
    // height as the initial height estimate.
    const inputRect = this.inputEl.getBoundingClientRect();
    const dropdownHeight = this.maxHeight + SEARCH_INPUT_HEIGHT;

    this.dropdownEl.style.position = 'fixed';
    this.dropdownEl.style.left = `${inputRect.left}px`;
    this.dropdownEl.style.width = `${inputRect.width}px`;
    this.dropdownEl.style.zIndex = String(AUTOCOMPLETE_Z_INDEX);
    this.dropdownEl.style.display = 'block';

    const placement = computeDropdownPlacement(
      inputRect,
      dropdownHeight,
      window.innerHeight,
    );
    this.applyPlacement(placement);
    this.setTriggerExpanded(true);

    // Recalculate the position now that the dropdown is displayed, so the
    // actual rendered height (which may differ from the estimate) is used to
    // decide whether to render above or below the input.
    this.repositionDropdown();

    // Bring the highlighted (selected) option into view. Without this a
    // mid-list selection (e.g. "Thailand") reopens with no visible highlight
    // because the highlighted row is scrolled out of the results viewport.
    this.scrollToHighlighted();

    // Focus search input
    setTimeout(() => {
      this.searchInputEl.focus();
      this.searchInputEl.select();
    }, 10);
  }

  private applyPlacement(placement: DropdownPlacement): void {
    this.dropdownEl.style.top = `${placement.top}px`;
    this.dropdownEl.style.maxHeight = `${placement.maxHeight}px`;
  }

  private repositionDropdown(): void {
    if (!this.isOpen) return;

    const inputRect = this.inputEl.getBoundingClientRect();
    // Use the actual rendered height of the dropdown if available, otherwise estimate
    const actualHeight = this.dropdownEl.offsetHeight;
    const dropdownHeight =
      actualHeight > 0 ? actualHeight : this.maxHeight + SEARCH_INPUT_HEIGHT;

    const placement = computeDropdownPlacement(
      inputRect,
      dropdownHeight,
      window.innerHeight,
    );
    this.applyPlacement(placement);
  }

  private close(): void {
    // Guard: the document-level capture listener fires this on every page
    // click; an already-closed dropdown must not re-run the reset work
    // (option copy, selection scan, reducer dispatches).
    if (!this.isOpen) return;

    this.dispatch({ type: 'close' });
    this.dropdownEl.style.display = 'none';
    this.setTriggerExpanded(false);

    // Clear the search input
    const searchInput = this.dropdownEl.querySelector(
      '.autocomplete-search-input',
    ) as HTMLInputElement;
    if (searchInput) {
      searchInput.value = '';
    }

    // Always reset to all options (don't keep filtered results)
    this.filteredOptions = [...this.options];

    // If focus is inside the dropdown (search box, clicked row), return it
    // to the trigger so keyboard users keep their place in the tab order —
    // clicking elsewhere leaves focus where the user put it.
    if (this.dropdownEl.contains(document.activeElement)) {
      this.inputEl.focus();
    }
  }

  /**
   * Trigger aria bookkeeping. The trigger is always a disclosure `button`;
   * the `combobox` role and `aria-activedescendant` live on the search input
   * while open. `aria-controls` is only advertised while the listbox is
   * actually visible, so the IDREF never points at a hidden subtree.
   */
  private setTriggerExpanded(open: boolean): void {
    this.inputEl.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      this.inputEl.setAttribute('aria-controls', `${this.uid}-list`);
    } else {
      this.inputEl.removeAttribute('aria-controls');
    }
  }

  /**
   * Index of the current selection (matched by visible label) within
   * `list` — the full options on open, the filtered rows on hover reset.
   */
  private getSelectedIndex(
    list: readonly AutocompleteOption[] = this.options,
  ): number {
    const currentValue = this.inputEl.value;
    if (!currentValue) return -1;
    return list.findIndex((o) => o.label === currentValue);
  }

  private filterOptions(query: string): void {
    this.dispatch({ type: 'setQuery', query });
    this.applyFilter(query);
    this.dispatch({
      type: 'setHighlight',
      index: this.filteredOptions.length > 0 ? 0 : -1,
    });
    this.renderResults();
  }

  /** Recomputes the filtered list from `query` (no state dispatch). */
  private applyFilter(query: string): void {
    // Options already satisfy the ComboboxItem shape ({ value, label }), so
    // no conversion or identity round-trip is needed. `includeValuePrefixMatch`
    // preserves the generic widget's original value-prefix/contains semantics;
    // the country binding opts out to match React/Angular exact-code matching.
    this.filteredOptions = comboboxFilter(this.options, query, {
      includeValuePrefixMatch: this.includeValuePrefixMatch,
    });
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
    } else {
      this.filteredOptions.forEach((option, index) => {
        const resultEl = this.createResultElement(option, index);
        this.resultsEl.appendChild(resultEl);
      });
    }

    this.updateStatus();
    this.updateHighlight();

    // Reposition dropdown after results are rendered (height may have changed)
    this.repositionDropdown();
  }

  /** Announce the result count (or the no-results copy) to screen readers. */
  private updateStatus(): void {
    if (!this.isOpen) return;
    this.statusEl.textContent =
      this.filteredOptions.length === 0
        ? this.noResultsText
        : CARD_FORM_TEXT_EN.optionsFound(this.filteredOptions.length);
  }

  private createResultElement(
    option: AutocompleteOption,
    index: number,
  ): HTMLElement {
    const resultEl = document.createElement('div');
    resultEl.className = 'autocomplete-result';
    resultEl.setAttribute('role', 'option');
    // Stable, per-instance id assigned up front so aria-activedescendant
    // can reference the row the moment it is highlighted.
    resultEl.id = `${this.uid}-option-${index}`;
    resultEl.setAttribute('data-index', index.toString());
    resultEl.setAttribute('aria-label', option.label);
    resultEl.setAttribute('data-value', option.value);
    // Position within the filtered set — same affordance the React and
    // Angular rows expose.
    resultEl.setAttribute('aria-setsize', String(this.filteredOptions.length));
    resultEl.setAttribute('aria-posinset', String(index + 1));

    if (option.customRender) {
      // customRender output is inserted as trusted HTML — integrators must
      // escape any user/API-controlled data themselves.
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

    this.dispatch({
      type: 'move',
      direction: 'down',
      count: this.filteredOptions.length,
    });
    this.updateHighlight();
    this.scrollToHighlighted();
  }

  private highlightPrevious(): void {
    if (this.filteredOptions.length === 0) return;

    this.dispatch({
      type: 'move',
      direction: 'up',
      count: this.filteredOptions.length,
    });
    this.updateHighlight();
    this.scrollToHighlighted();
  }

  private updateHighlight(): void {
    const selectedIndex = this.getSelectedIndex();
    const results = this.resultsEl.querySelectorAll('.autocomplete-result');
    results.forEach((el, index) => {
      if (index === this.highlightedIndex) {
        el.classList.add('highlighted');
      } else {
        el.classList.remove('highlighted');
      }
      // aria-selected stays reserved for the chosen option, matching the
      // React/Angular bindings; the highlight itself is announced through
      // aria-activedescendant below.
      el.setAttribute('aria-selected', String(index === selectedIndex));
    });
    // The active option is announced from the focused element — the search
    // input — so the IDREF lives there, not on the closed-trigger button.
    this.searchInputEl.setAttribute(
      'aria-activedescendant',
      this.highlightedIndex >= 0
        ? (results[this.highlightedIndex]?.id ?? '')
        : '',
    );
  }

  private scrollToHighlighted(): void {
    const highlighted = this.resultsEl.querySelector(
      '.autocomplete-result.highlighted',
    );
    if (highlighted) {
      highlighted.scrollIntoView({
        block: 'nearest',
        behavior: 'smooth',
      });
    }
  }

  private selectOption(index: number): void {
    if (index < 0 || index >= this.filteredOptions.length) return;

    const option = this.filteredOptions[index];
    this.inputEl.value = option.label;
    this.onSelect(option.value, option);
    this.close();
    // close() restores focus only when it was inside the dropdown; after a
    // mouse click on a row that was true, but guarantee it for every path
    // so keyboard users advance to the next field on Tab, not to <body>.
    this.inputEl.focus();
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
    this.filteredOptions = [...this.options];
    this.renderResults();
  }

  public refreshOptions(): void {
    this.filteredOptions = [...this.options];
    this.renderResults();
  }

  public destroy(): void {
    // Remove global event listeners to prevent memory leaks
    document.removeEventListener('click', this.documentClickHandler, true);
    window.removeEventListener('resize', this.windowResizeHandler);
    window.removeEventListener('scroll', this.windowScrollHandler, true);
    this.resultsEl.removeEventListener('click', this.resultsClickHandler);
    this.resultsEl.removeEventListener('mousemove', this.resultsMouseMoveHandler);

    // Remove the dropdown from body
    if (this.dropdownEl && this.dropdownEl.parentNode) {
      this.dropdownEl.remove();
    }
    // Remove the wrapper from container
    const wrapper = this.container.querySelector(
      '.autocomplete-dropdown-wrapper',
    );
    if (wrapper) {
      wrapper.remove();
    }
  }
}
