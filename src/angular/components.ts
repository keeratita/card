import { Component, input, computed, signal, output, ElementRef, viewChild } from '@angular/core';
import {
  CardFormPreset,
  OptionalCardField,
} from '../core/domain/card';
import {
  FIELD_METADATA,
  getFieldDisplayText,
} from '../core/domain/optional-fields';
import { COUNTRIES } from '../data/countries';
import type { Country } from '../data/countries';
import { escapeHtml } from '../core/security';
import {
  filterCountries,
  moveHighlight,
  findCountryByCode,
} from '../core/form';

/** Angular component for searchable country dropdown with flag emojis. */
@Component({
  selector: 'kg-country-select',
  standalone: true,
  imports: [],
  styles: [`
    .country-select-wrapper {
      position: relative;
    }

    .country-select-trigger {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 14px;
      border: 1px solid #d0d7de;
      border-radius: 6px;
      background-color: #fff;
      cursor: pointer;
      transition: all 0.15s ease;
      font-size: 15px;
    }

    .country-select-trigger:hover {
      border-color: #0366d6;
    }

    .country-select-trigger.open {
      border-color: #0366d6;
      box-shadow: 0 0 0 3px rgba(3, 102, 214, 0.1);
    }

    .country-select-trigger.invalid {
      border-color: #cf222e;
    }

    .country-select-display {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .country-select-flag {
      font-size: 20px;
    }

    .country-select-name {
      color: #24292e;
    }

    .country-select-placeholder {
      color: #6e7781;
    }

    .country-select-arrow {
      color: #586069;
      transition: transform 0.2s ease;
    }

    .country-select-arrow.open {
      transform: rotate(180deg);
    }

    .country-select-dropdown {
      position: absolute;
      top: calc(100% + 4px);
      left: 0;
      right: 0;
      background: #fff;
      border: 1px solid #d0d7de;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      overflow: hidden;
    }

    .country-select-search {
      padding: 12px;
      border-bottom: 1px solid #e1e4e8;
    }

    .country-select-search-input {
      width: 100%;
      padding: 10px 12px;
      border: 1px solid #d0d7de;
      border-radius: 6px;
      font-size: 14px;
      transition: all 0.15s ease;
      box-sizing: border-box;
    }

    .country-select-search-input:focus {
      outline: none;
      border-color: #0366d6;
      box-shadow: 0 0 0 3px rgba(3, 102, 214, 0.1);
    }

    .country-select-list {
      max-height: 240px;
      overflow-y: auto;
    }

    .country-select-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 10px 14px;
      cursor: pointer;
      transition: background-color 0.15s ease;
    }

    .country-select-item:hover,
    .country-select-item.highlighted {
      background-color: #f6f8fa;
    }

    .country-select-item.selected {
      background-color: #f1f8ff;
      border-left: 3px solid #0366d6;
    }

    .country-select-item-flag {
      font-size: 20px;
    }

    .country-select-item-name {
      flex: 1;
      color: #24292e;
      font-size: 14px;
    }

    .country-select-item-code {
      color: #586069;
      font-size: 12px;
    }

    .country-select-no-results {
      padding: 20px;
      text-align: center;
      color: #586069;
      font-size: 14px;
    }

    .ios-input-row {
      margin-bottom: 16px;
    }

    .ios-label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #24292e;
      font-size: 14px;
    }
  `],
  template: `
    <div class="ios-input-row row-country" [class.invalid]="invalid()">
      <label class="ios-label" [for]="controlName()">
        {{ label() }}
      </label>
      
      <div class="country-select-wrapper" (click)="toggleDropdown()" (keydown)="onKeydown($event)">
        <!-- Trigger -->
        <div
          class="country-select-trigger"
          [class.open]="isOpen()"
          [class.invalid]="invalid()"
          role="button"
          [attr.aria-expanded]="isOpen()"
          [attr.aria-haspopup]="true"
          tabindex="0"
        >
          <div class="country-select-display">
            @if (selectedCountry()) {
              <ng-container>
                <span class="country-select-flag">{{ selectedCountry()?.emoji }}</span>
                <span class="country-select-name">{{ selectedCountry()?.name }}</span>
              </ng-container>
            } @else {
              <span class="country-select-placeholder">{{ placeholder() }}</span>
            }
          </div>
          <span class="country-select-arrow" [class.open]="isOpen()">▼</span>
        </div>

        <!-- Dropdown -->
        @if (isOpen()) {
          <div class="country-select-dropdown" (click)="$event.stopPropagation()">
            <!-- Search -->
            <div class="country-select-search">
              <input
                #searchInput
                type="text"
                class="country-select-search-input"
                placeholder="Search countries..."
                [value]="searchQuery()"
                (input)="onSearchChange($event)"
              />
            </div>

            <!-- Country List -->
            <div class="country-select-list">
              @if (filteredCountries().length > 0) {
                @for (country of filteredCountries(); track country.code; let i = $index) {
                  <div
                    class="country-select-item"
                    [class.selected]="selectedCountry()?.code === country.code"
                    [class.highlighted]="highlightedIndex() === i"
                    (mouseenter)="highlightedIndex.set(i)"
                    (click)="selectCountry(country)"
                    role="option"
                    [attr.aria-selected]="selectedCountry()?.code === country.code"
                  >
                    <span class="country-select-item-flag">{{ country.emoji }}</span>
                    <span class="country-select-item-name">{{ country.name }}</span>
                    <span class="country-select-item-code">{{ country.code }}</span>
                  </div>
                }
              } @else {
                <div class="country-select-no-results">
                  No countries found matching "{{ searchQuery() }}"
                </div>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class CountrySelectComponent {
  /**
   * Using Angular v20+ input() signal API instead of @Input decorator.
   */
  controlName = input<string>('country');
  value = input<string>('');
  preset = input<CardFormPreset>('none');
  invalid = input<boolean>(false);
  required = input<boolean>(true);

  readonly countries = COUNTRIES;

  /**
   * Using Angular v20+ computed() for derived state instead of getter.
   */
  readonly label = computed(() => {
    const { label } = getFieldDisplayText('country', this.preset());
    return label;
  });

  readonly placeholder = computed(() => {
    const { placeholder } = getFieldDisplayText('country', this.preset());
    return placeholder;
  });

  // Local state signals
  isOpen = signal(false);
  searchQuery = signal('');
  highlightedIndex = signal(-1);
  
  // Selected country computed from value input
  selectedCountry = computed(() => {
    const value = this.value();
    if (!value) return null;
    return findCountryByCode(value) || null;
  });

  // Filtered countries based on search query
  filteredCountries = computed(() => {
    return filterCountries(this.searchQuery());
  });

  // Reference to search input for focus management
  searchInputRef = viewChild<ElementRef>('searchInput');

  /**
   * Output event for Angular forms integration
   */
  readonly countryChange = output<{ name: string; value: string }>();

  toggleDropdown(): void {
    this.isOpen.update(v => !v);
    this.searchQuery.set('');
    this.highlightedIndex.set(-1);

    // Focus search input when opening
    if (this.isOpen()) {
      setTimeout(() => {
        this.searchInputRef()?.nativeElement?.focus();
      }, 0);
    }
  }

  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
    this.highlightedIndex.set(-1);
  }

  selectCountry(country: Country): void {
    this.countryChange.emit({ 
      name: this.controlName(), 
      value: country.code 
    });
    this.isOpen.set(false);
    this.searchQuery.set('');
    this.highlightedIndex.set(-1);
  }

  // Keyboard navigation
  onKeydown(event: KeyboardEvent): void {
    if (!this.isOpen()) {
      if (event.key === 'Enter' || event.key === ' ' || event.key === 'ArrowDown') {
        event.preventDefault();
        this.toggleDropdown();
      }
      return;
    }

    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault();
        this.highlightedIndex.update((i) =>
          moveHighlight(i, 'down', this.filteredCountries().length),
        );
        break;
      }
      case 'ArrowUp': {
        event.preventDefault();
        this.highlightedIndex.update((i) =>
          moveHighlight(i, 'up', this.filteredCountries().length),
        );
        break;
      }
      case 'Enter': {
        event.preventDefault();
        const highlighted = this.filteredCountries()[this.highlightedIndex()];
        if (highlighted) {
          this.selectCountry(highlighted);
        }
        break;
      }
      case 'Escape': {
        event.preventDefault();
        this.isOpen.set(false);
        break;
      }
    }
  }
}

/**
 * Render optional fields as HTML strings.
 * @deprecated Prefer using Angular directives/pipe over raw HTML injection.
 * Use `renderOptionalFieldSafe` for safer HTML output with escaped attributes.
 */
export function renderOptionalFieldHtml(
  field: OptionalCardField,
  preset: CardFormPreset,
  controlName: string,
  value: string = '',
  invalid: boolean = false,
): string {
  const meta = FIELD_METADATA[field];
  if (!meta) return '';

  const { label, placeholder } = getFieldDisplayText(field, preset);
  const invalidClass = invalid ? ' invalid' : '';

  if (field === 'country') {
    const options = COUNTRIES
      .map((c) => `<option value="${escapeHtml(c.code)}" ${c.code === value ? 'selected' : ''}>${c.emoji} ${escapeHtml(c.name)}</option>`)
      .join('\n        ');

    return `<div class="ios-input-row row-${escapeHtml(field)}${invalidClass}">
      <label class="ios-label" for="${escapeHtml(controlName)}">${escapeHtml(label)}</label>
      <select id="${escapeHtml(controlName)}" name="${escapeHtml(controlName)}" class="ios-input card-country-input" autocomplete="country" required>
        <option value="" disabled>${escapeHtml(placeholder)}</option>
        ${options}
      </select>
    </div>`;
  }

  const required = field !== 'addressLine2' ? 'required' : '';

  return `<div class="ios-input-row row-${escapeHtml(field)}${invalidClass}">
    <label class="ios-label" for="${escapeHtml(controlName)}">${escapeHtml(label)}</label>
    <input type="${escapeHtml(meta.type)}" id="${escapeHtml(controlName)}" name="${escapeHtml(controlName)}" class="ios-input" placeholder="${escapeHtml(placeholder)}" value="${escapeHtml(value)}" autocomplete="${escapeHtml(meta.autocomplete)}" ${required} />
  </div>`;
}