import React, {
  useReducer,
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  type CSSProperties,
} from 'react';
import {
  filterCountries,
  findCountryByCode,
  comboboxReduce,
  computeDropdownPlacement,
  INITIAL_COMBOBOX_STATE,
} from '../core/form';
import { CARD_FORM_TEXT_EN } from '../lang/en';

export interface CountryAutocompleteProps {
  value: string;
  onChange: (countryCode: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
  id?: string;
  /** Marks the trigger as invalid (pair with `describedBy`). */
  invalid?: boolean;
  /** Id of the error element to associate with the trigger input. */
  describedBy?: string;
}

// Layout / paging constants (single source of truth for this binding;
// mirrors the naming in the vanilla AutocompleteDropdown).
const DROPDOWN_MAX_HEIGHT = 300;
const DROPDOWN_Z_INDEX = 9999;
const PAGE_SIZE = 20;
const SCROLL_LOAD_THRESHOLD_PX = 50;

/**
 * Screen-reader-only helper, inlined because the React entry ships no
 * stylesheet of its own: the shared `.visually-hidden` class lives in
 * `@keeratita/card/vanilla/styles.css`, and a consumer that does not import
 * it would otherwise see the live-region text rendered on the page.
 */
const SR_ONLY_STYLE: CSSProperties = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  margin: '-1px',
  padding: 0,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  whiteSpace: 'nowrap',
  border: 0,
};

// Unique DOM-id namespace per instance, so two country selects on one page
// never collide on aria-controls / aria-activedescendant IDREFs.
let instanceCounter = 0;

/**
 * Combobox state is driven by the shared, framework-agnostic reducer
 * (`comboboxReduce`) so open/close/query/highlight semantics match the
 * vanilla and Angular bindings exactly. This component is a thin view:
 * it adds the popover sync, click-outside handling, lazy rendering, and
 * entry-point rendering.
 */
export function CountryAutocomplete({
  value,
  onChange,
  placeholder = 'Select a country...',
  searchPlaceholder = 'Search countries...',
  className = '',
  id,
  invalid = false,
  describedBy,
}: Readonly<CountryAutocompleteProps>) {
  const [state, dispatch] = useReducer(
    comboboxReduce,
    INITIAL_COMBOBOX_STATE,
  );
  const { isOpen, query, highlightedIndex } = state;
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
    width: number;
    maxHeight: number;
  } | null>(null);
  const [uid] = useState(() => `country-autocomplete-${++instanceCounter}`);
  const listId = `${uid}-list`;
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  // Filter countries based on search term
  const filteredCountries = useMemo(
    () => filterCountries(query),
    [query],
  );

  // Get selected country display
  const selectedCountry = findCountryByCode(value);
  const displayText = selectedCountry
    ? `${selectedCountry.emoji} ${selectedCountry.name}`
    : placeholder;

  // Sync isOpen state with popover show/hide. Feature-detect the popover
  // API and only swallow the known DOMExceptions, so genuine programming
  // errors (state/DOM desync) reach the integrator's error boundary
  // instead of being silently erased.
  useEffect(() => {
    const popover = popoverRef.current;
    if (!popover) return;

    try {
      if (isOpen) {
        if (
          document.activeElement !== popover &&
          !popover.matches(':popover-open')
        ) {
          if (typeof popover.showPopover === 'function') {
            popover.showPopover();
          }
        }
      } else if (popover.matches(':popover-open')) {
        if (typeof popover.hidePopover === 'function') {
          popover.hidePopover();
        }
      }
    } catch (error) {
      const known =
        error instanceof DOMException &&
        (error.name === 'InvalidStateError' ||
          error.name === 'NotSupportedError');
      if (!known) throw error;
    }
  }, [isOpen]);

  // Listen to popover toggle events to sync state back to React (e.g. on click-outside or Escape)
  useEffect(() => {
    const popover = popoverRef.current;
    if (!popover) return;

    const handleToggle = (e: Event) => {
      const toggleEvent = e as ToggleEvent;
      const open = toggleEvent.newState === 'open';
      if (open !== isOpen) {
        dispatch(open ? { type: 'open' } : { type: 'close' });
      }
    };

    popover.addEventListener('toggle', handleToggle);
    return () => popover.removeEventListener('toggle', handleToggle);
  }, [isOpen]);

  // Handle click outside to close dropdown (Fallback for jsdom/older browsers)
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        // Same rule as the other bindings: if focus was inside the list, it
        // must land back on the trigger instead of <body>.
        const focusWasInside = containerRef.current.contains(
          document.activeElement,
        );
        dispatch({ type: 'close' });
        if (focusWasInside) inputRef.current?.focus();
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Handle ESC key to close dropdown (Fallback for jsdom/older browsers)
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        dispatch({ type: 'close' });
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Reset the lazy-load window when the dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setVisibleCount(PAGE_SIZE);
    }
  }, [isOpen]);

  // Calculate and set dropdown position when it opens
  const updatePosition = useCallback(() => {
    if (!inputRef.current) return;

    const rect = inputRef.current.getBoundingClientRect();
    const placement = computeDropdownPlacement(
      rect,
      DROPDOWN_MAX_HEIGHT,
      window.innerHeight,
    );

    setDropdownPosition({
      top: placement.top,
      left: rect.left,
      width: rect.width,
      maxHeight: placement.maxHeight,
    });
  }, []);

  // Use CSS transform for positioning to prevent layout thrashing and blinking
  const getDropdownStyle = useCallback(() => {
    if (!dropdownPosition) return {};
    return {
      position: 'fixed' as const,
      top: `${dropdownPosition.top}px`,
      left: `${dropdownPosition.left}px`,
      width: `${dropdownPosition.width}px`,
      maxHeight: `${dropdownPosition.maxHeight}px`,
      zIndex: DROPDOWN_Z_INDEX,
      // Prevent layout thrashing and blinking during scroll
      willChange: 'transform',
      contain: 'layout style',
      // Reset popover defaults
      margin: 0,
      border: 'none',
      padding: 0,
      background: 'transparent',
      overflow: 'visible',
    };
  }, [dropdownPosition]);

  // Open dropdown
  const openDropdown = useCallback(() => {
    if (isOpen) return; // re-clicking an already-open trigger keeps the filter
    updatePosition();
    dispatch({ type: 'open' });
  }, [isOpen, updatePosition]);

  // Reposition on scroll/resize - use passive listeners and throttle position updates
  useEffect(() => {
    if (!isOpen) return;

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          updatePosition();
          ticking = false;
        });
        ticking = true;
      }
    };
    const handleResize = () => updatePosition();

    window.addEventListener('scroll', handleScroll, {
      passive: true,
      capture: true,
    });
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen, updatePosition]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      // Use requestAnimationFrame to ensure DOM is ready
      requestAnimationFrame(() => {
        searchInputRef.current?.focus();
      });
    }
  }, [isOpen]);

  // Reset visible count when search term changes
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [query]);

  // Keyboard navigation must never outrun the lazy-rendered window: grow
  // it (rather than relying solely on a scroll event that never fires for
  // unrendered rows) so the highlighted row is always in the DOM.
  useEffect(() => {
    if (isOpen && highlightedIndex >= visibleCount) {
      setVisibleCount(highlightedIndex + 1);
    }
  }, [isOpen, highlightedIndex, visibleCount]);

  // Handle list scroll for lazy loading
  const handleListScroll = useCallback(() => {
    if (!listRef.current) return;

    const list = listRef.current;
    // Trigger when within 50px of bottom
    if (
      list.scrollTop + list.clientHeight >=
      list.scrollHeight - SCROLL_LOAD_THRESHOLD_PX
    ) {
      setVisibleCount((prev) =>
        Math.min(prev + PAGE_SIZE, filteredCountries.length),
      );
    }
  }, [filteredCountries.length]);

  // Scroll highlighted item into view (re-runs when the lazy window grows,
  // so a highlight that just forced new rows to render still gets scrolled)
  useEffect(() => {
    if (highlightedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll(
        '.country-autocomplete-item',
      );
      const item = items[highlightedIndex] as HTMLElement;
      if (item) {
        item.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, visibleCount]);

  const handleSelect = useCallback(
    (countryCode: string) => {
      onChange(countryCode);
      dispatch({ type: 'close' });
      // Selection closes the list while the search input still has focus; the
      // unmounted input would drop focus to <body>, so hand it back to the
      // trigger — matching the vanilla and Angular bindings and a native
      // <select>, and keeping keyboard users in the tab order.
      inputRef.current?.focus();
    },
    [onChange],
  );

  const moveHighlight = useCallback(
    (direction: 'up' | 'down') => {
      dispatch({ type: 'move', direction, count: filteredCountries.length });
    },
    [filteredCountries.length],
  );

  const selectHighlighted = useCallback(() => {
    if (highlightedIndex >= 0 && highlightedIndex < filteredCountries.length) {
      handleSelect(filteredCountries[highlightedIndex].code);
    }
  }, [filteredCountries, highlightedIndex, handleSelect]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      dispatch({ type: 'setQuery', query: e.target.value });
    },
    [],
  );

  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        dispatch({ type: 'close' });
        if (inputRef.current) inputRef.current.focus();
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        e.stopPropagation();
        moveHighlight('down');
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        e.stopPropagation();
        moveHighlight('up');
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        selectHighlighted();
      }
    },
    [moveHighlight, selectHighlighted],
  );

  const handleMainInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        dispatch({ type: 'close' });
        return;
      }

      if (!isOpen) {
        if (
          e.key === 'Enter' ||
          e.key === ' ' ||
          e.key === 'ArrowDown' ||
          e.key === 'ArrowUp'
        ) {
          e.preventDefault();
          openDropdown();
          return;
        }
        // Type-ahead: typing a character opens the dropdown with that
        // character pre-applied to the filter (the trigger is readOnly, so
        // no text can strand in it). Matches the vanilla binding.
        if (e.key.length === 1 && !e.metaKey && !e.ctrlKey && !e.altKey) {
          e.preventDefault();
          openDropdown();
          dispatch({ type: 'setQuery', query: e.key });
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          moveHighlight('down');
          break;
        case 'ArrowUp':
          e.preventDefault();
          moveHighlight('up');
          break;
        case 'Enter':
          e.preventDefault();
          selectHighlighted();
          break;
      }
    },
    [isOpen, moveHighlight, selectHighlighted, openDropdown],
  );

  // Lazy loading indicator
  const hasMore = visibleCount < filteredCountries.length;
  const displayedCountries = filteredCountries.slice(0, visibleCount);
  const highlightedCountry =
    highlightedIndex >= 0 ? filteredCountries[highlightedIndex] : undefined;
  const activeOptionId = highlightedCountry
    ? `${uid}-option-${highlightedCountry.code}`
    : undefined;
  const statusText =
    filteredCountries.length === 0
      ? CARD_FORM_TEXT_EN.noCountriesFound(query)
      : CARD_FORM_TEXT_EN.countriesFound(filteredCountries.length);

  return (
    <div
      ref={containerRef}
      className={`country-autocomplete-wrapper ${className}`}
    >
      <input
        ref={inputRef}
        id={id}
        type='text'
        className='country-autocomplete-input'
        value={displayText}
        readOnly
        onClick={() => {
          openDropdown();
        }}
        onKeyDown={handleMainInputKeyDown}
        placeholder={placeholder}
        aria-haspopup='listbox'
        // The trigger is a disclosure button that always reports expansion;
        // while open, the focused search input carries the combobox role and
        // owns aria-activedescendant (same contract in the Angular binding).
        // aria-controls is only set while the listbox exists in the DOM, so
        // the IDREF never dangles while collapsed.
        role='button'
        aria-expanded={isOpen}
        aria-controls={isOpen ? listId : undefined}
        aria-label={placeholder}
        aria-invalid={invalid}
        aria-describedby={invalid && describedBy ? describedBy : undefined}
        tabIndex={0}
      />
      <div
        ref={(el) => {
          popoverRef.current = el;
          if (el) el.setAttribute('popover', 'auto');
        }}
        id={`${uid}-popover`}
        className='country-autocomplete-dropdown-container'
        style={getDropdownStyle()}
      >
        {isOpen && (
          <div className='country-autocomplete-dropdown'>
            <input
              ref={searchInputRef}
              type='text'
              className='country-autocomplete-search'
              placeholder={searchPlaceholder}
              value={query}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
              autoComplete='off'
              role='combobox'
              aria-expanded={true}
              aria-haspopup='listbox'
              aria-autocomplete='list'
              aria-controls={listId}
              aria-activedescendant={activeOptionId}
              aria-label={searchPlaceholder || CARD_FORM_TEXT_EN.searchCountriesAria}
            />
            <ul
              ref={listRef}
              id={listId}
              className='country-autocomplete-list'
              role='listbox'
              aria-label={CARD_FORM_TEXT_EN.countryList}
              onScroll={handleListScroll}
              style={
                dropdownPosition
                  ? {
                      maxHeight: `${Math.min(DROPDOWN_MAX_HEIGHT, dropdownPosition.maxHeight)}px`,
                    }
                  : undefined
              }
            >
              {displayedCountries.length === 0 && (
                <li
                  className='country-autocomplete-item country-autocomplete-empty'
                  role='option'
                  aria-disabled={true}
                >
                  {CARD_FORM_TEXT_EN.noCountriesFound(query)}
                </li>
              )}
              {displayedCountries.map((country, index) => (
                <li
                  key={country.code}
                  id={`${uid}-option-${country.code}`}
                  className={`country-autocomplete-item ${country.code === value ? 'selected' : ''} ${index === highlightedIndex ? 'highlighted' : ''}`}
                  role='option'
                  aria-selected={country.code === value}
                  aria-setsize={filteredCountries.length}
                  aria-posinset={index + 1}
                  data-code={country.code}
                  data-index={index}
                  onClick={() => handleSelect(country.code)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelect(country.code);
                    }
                  }}
                  tabIndex={index === highlightedIndex ? 0 : -1}
                >
                  <span className='country-autocomplete-flag'>
                    {country.emoji}
                  </span>
                  <span className='country-autocomplete-name'>
                    {country.name}
                  </span>
                  <span className='country-autocomplete-code'>
                    {country.code}
                  </span>
                </li>
              ))}
            </ul>
            {/* Announce filter results; the no-results state would otherwise
                give screen-reader users no feedback at all. */}
            <div
              role='status'
              aria-live='polite'
              className='visually-hidden country-autocomplete-status'
              style={SR_ONLY_STYLE}
            >
              {statusText}
            </div>
            {hasMore && (
              <div
                role='status'
                aria-live='polite'
                className='country-autocomplete-loading'
              >
                {`Scroll or type to find more (${filteredCountries.length - visibleCount} more)`}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
