/**
 * CountryAutocomplete - A country-specific autocomplete dropdown
 * 
 * Extends the base AutocompleteDropdown component with country-specific
 * functionality and iOS-styled rendering with flag emojis.
 */

import { AutocompleteDropdown, AutocompleteOption } from './autocomplete-dropdown';
import { COUNTRIES } from '../../data/countries';
import { findCountryByCode } from '../../core/form';
import { escapeHtml } from '../../core/security';

export interface CountryAutocompleteConfig {
  container: HTMLElement | string;
  onSelect: (countryCode: string, country: typeof COUNTRIES[0]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  noResultsText?: string;
  maxHeight?: number;
}

/**
 * Custom render function for country options in the autocomplete dropdown.
 * Extracted to avoid creating a new closure per country.
 *
 * Country names/emojis come from the static COUNTRIES constant, but are
 * escaped anyway so the string is safe regardless of the option source.
 */
function renderCountryOption(option: AutocompleteOption): string {
  const countryData = findCountryByCode(option.value);
  const emoji = countryData?.emoji || '';
  const name = countryData?.name || option.label;
  return `
    <span class="country-flag">${escapeHtml(emoji)}</span>
    <span class="country-name">${escapeHtml(name)}</span>
  `;
}

export class CountryAutocomplete {
  private autocomplete: AutocompleteDropdown;

  constructor(config: CountryAutocompleteConfig) {
    // Convert COUNTRIES to AutocompleteOption format with custom rendering
    const options: AutocompleteOption[] = COUNTRIES.map((country) => ({
      value: country.code,
      label: country.name,
      icon: country.emoji,
      customRender: renderCountryOption
    }));

    // Create the base autocomplete with custom onSelect
    this.autocomplete = new AutocompleteDropdown({
      container: config.container,
      options,
      placeholder: config.placeholder || 'Select a country...',
      searchPlaceholder: config.searchPlaceholder || 'Search countries...',
      noResultsText: config.noResultsText || 'No countries found',
      maxHeight: config.maxHeight,
      showIcons: true,
      onSelect: (value: string, _option: AutocompleteOption) => {
        const country = findCountryByCode(value);
        if (country) {
          config.onSelect(country.code, country);
        }
      }
    });
  }

  // Public methods that delegate to the underlying autocomplete
  public setValue(countryCode: string): void {
    this.autocomplete.setValue(countryCode);
  }

  public getValue(): string {
    return this.autocomplete.getValue();
  }

  public getSelectedCountry(): typeof COUNTRIES[0] | undefined {
    const selected = this.autocomplete.getSelectedOption();
    if (selected) {
      return findCountryByCode(selected.value);
    }
    return undefined;
  }

  public refreshOptions(): void {
    this.autocomplete.refreshOptions();
  }

  public destroy(): void {
    this.autocomplete.destroy();
  }
}