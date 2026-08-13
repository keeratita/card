import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import {
  filterCountries,
  moveHighlight,
  findCountryByCode,
} from '../core/form';

export interface CountryAutocompleteProps {
  value: string;
  onChange: (countryCode: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
  id?: string;
}

export function CountryAutocomplete({
  value,
  onChange,
  placeholder = 'Select a country...',
  searchPlaceholder = 'Search countries...',
  className = '',
  id,
}: Readonly<CountryAutocompleteProps>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [visibleCount, setVisibleCount] = useState(20);
  const [dropdownPosition, setDropdownPosition] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);
  const positionRef = useRef(dropdownPosition);
  positionRef.current = dropdownPosition;
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  // Filter countries based on search term
  const filteredCountries = useMemo(() => filterCountries(searchTerm), [searchTerm]);

  // Get selected country display
  const selectedCountry = findCountryByCode(value);
  const displayText = selectedCountry
    ? `${selectedCountry.emoji} ${selectedCountry.name}`
    : placeholder;

  // Sync isOpen state with popover show/hide
  useEffect(() => {
    const popover = popoverRef.current;
    if (!popover) return;

    if (isOpen) {
      try {
        if (
          document.activeElement !== popover &&
          !popover.matches(':popover-open')
        ) {
          popover.showPopover();
        }
      } catch {
        // Fallback for environments without full Popover support
      }
    } else {
      try {
        if (popover.matches(':popover-open')) {
          popover.hidePopover();
        }
      } catch {
        // Fallback
      }
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
        setIsOpen(open);
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
        setIsOpen(false);
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
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Reset search state when dropdown closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
      setHighlightedIndex(-1);
      setVisibleCount(20);
    }
  }, [isOpen]);

  // Calculate and set dropdown position when it opens
  const updatePosition = useCallback(() => {
    if (!inputRef.current) return;

    const rect = inputRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const dropdownHeight = 300;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    let top = rect.bottom;
    // If not enough space below, show above
    if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
      top = rect.top - dropdownHeight;
    }

    setDropdownPosition({
      top,
      left: rect.left,
      width: rect.width,
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
      zIndex: 9999,
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
    updatePosition();
    setIsOpen(true);
  }, [updatePosition]);

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
      setSearchTerm('');
      setHighlightedIndex(-1);
    }
  }, [isOpen]);

  // Reset visible count when search term changes
  useEffect(() => {
    setVisibleCount(20);
  }, [searchTerm]);

  // Handle list scroll for lazy loading
  const handleListScroll = useCallback(() => {
    if (!listRef.current) return;

    const list = listRef.current;
    // Trigger when within 50px of bottom
    if (list.scrollTop + list.clientHeight >= list.scrollHeight - 50) {
      setVisibleCount((prev) => Math.min(prev + 20, filteredCountries.length));
    }
  }, [filteredCountries.length]);

  // Scroll highlighted item into view
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
  }, [highlightedIndex]);

  const handleSelect = useCallback(
    (countryCode: string) => {
      onChange(countryCode);
      setIsOpen(false);
    },
    [onChange],
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
    },
    [],
  );

  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(false);
        if (inputRef.current) inputRef.current.focus();
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        e.stopPropagation();
        setHighlightedIndex((prev) =>
          moveHighlight(prev, 'down', filteredCountries.length),
        );
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        e.stopPropagation();
        setHighlightedIndex((prev) =>
          moveHighlight(prev, 'up', filteredCountries.length),
        );
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        e.stopPropagation();
        if (
          highlightedIndex >= 0 &&
          highlightedIndex < filteredCountries.length
        ) {
          handleSelect(filteredCountries[highlightedIndex].code);
        }
      }
    },
    [filteredCountries, highlightedIndex, handleSelect],
  );

  const handleMainInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(false);
        return;
      }

      if (!isOpen) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
          e.preventDefault();
          openDropdown();
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex((prev) =>
            moveHighlight(prev, 'down', filteredCountries.length),
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex((prev) =>
            moveHighlight(prev, 'up', filteredCountries.length),
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (
            highlightedIndex >= 0 &&
            highlightedIndex < filteredCountries.length
          ) {
            handleSelect(filteredCountries[highlightedIndex].code);
          }
          break;
      }
    },
    [isOpen, filteredCountries, highlightedIndex, handleSelect, openDropdown],
  );

  // Lazy loading indicator
  const hasMore = visibleCount < filteredCountries.length;
  const displayedCountries = filteredCountries.slice(0, visibleCount);

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
        aria-expanded={isOpen}
        aria-controls={`country-popover-${id}`}
        aria-label={placeholder}
        role='combobox'
        tabIndex={0}
      />
      <div
        ref={(el) => {
          popoverRef.current = el;
          if (el) el.setAttribute('popover', 'auto');
        }}
        id={`country-popover-${id}`}
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
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyDown={handleSearchKeyDown}
              autoComplete='off'
              aria-label='Search countries'
            />
            <ul
              ref={listRef}
              className='country-autocomplete-list'
              role='listbox'
              aria-label='Country list'
              onScroll={handleListScroll}
            >
              {displayedCountries.map((country, index) => (
                <li
                  key={country.code}
                  className={`country-autocomplete-item ${country.code === value ? 'selected' : ''} ${index === highlightedIndex ? 'highlighted' : ''}`}
                  role='option'
                  aria-selected={country.code === value}
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
              {hasMore && (
                <li className='country-autocomplete-loading' role='status'>
                  {`Scroll or type to find more (${filteredCountries.length - visibleCount} more)`}
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
