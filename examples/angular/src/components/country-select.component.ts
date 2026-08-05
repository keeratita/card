import { Component, input, computed, signal, output, ElementRef, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CardFormPreset,
  OptionalCardField,
  COUNTRIES,
  Country,
} from '@keeratita/card';
import { getFieldDisplayText } from '../../../../src/core/domain/optional-fields';

/** Angular component for searchable country dropdown with flag emojis. */
@Component({
  selector: 'kg-country-select',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    :host {
      display: block;
    }

    .country-select-wrapper {
      position: relative;
    }

    .country-select-trigger {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 14px;
      border: 1.5px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      background-color: rgba(255, 255, 255, 0.05);
      cursor: pointer;
      transition: all 0.15s ease;
      font-size: 15px;
      box-sizing: border-box;
      height: 45px;
      color: #ffffff;
    }

    .country-select-trigger:hover {
      border-color: #0a84ff;
    }

    .country-select-trigger.open {
      border-color: #0a84ff;
      box-shadow: 0 0 0 3px rgba(10, 132, 255, 0.12);
    }

    .country-select-trigger.invalid {
      border-color: #ff453a;
      background-color: rgba(255, 69, 58, 0.08);
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
      color: #ffffff;
    }

    .country-select-placeholder {
      color: rgba(255, 255, 255, 0.2);
    }

    .country-select-arrow {
      color: rgba(255, 255, 255, 0.55);
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
      background: rgba(10, 11, 14, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      z-index: 1000;
      overflow: hidden;
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
    }

    .country-select-search {
      padding: 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .country-select-search-input {
      width: 100%;
      padding: 10px 12px;
      border: 1.5px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      font-size: 14px;
      transition: all 0.15s ease;
      box-sizing: border-box;
      background-color: rgba(255, 255, 255, 0.05);
      color: #ffffff;
      font-family: inherit;
    }

    .country-select-search-input:focus {
      outline: none;
      border-color: #0a84ff;
      box-shadow: 0 0 0 3px rgba(10, 132, 255, 0.12);
    }

    .country-select-search-input::placeholder {
      color: rgba(255, 255, 255, 0.2);
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
      background-color: rgba(255, 255, 255, 0.05);
    }

    .country-select-item.selected {
      background-color: rgba(10, 132, 255, 0.12);
      border-left: 3px solid #0a84ff;
    }

    .country-select-item-flag {
      font-size: 20px;
    }

    .country-select-item-name {
      flex: 1;
      color: #ffffff;
      font-size: 14px;
    }

    .country-select-item-code {
      color: rgba(255, 255, 255, 0.55);
      font-size: 12px;
    }

    .country-select-no-results {
      padding: 20px;
      text-align: center;
      color: rgba(255, 255, 255, 0.55);
      font-size: 14px;
    }

    .ios-input-row {
      margin-bottom: 16px;
    }

    .ios-label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: rgba(255, 255, 255, 0.55);
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
          tabindex="0"
          [attr.aria-expanded]="isOpen()"
          [attr.aria-haspopup]="true"
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
  controlName = input<string>('country');
  value = input<string>('');
  preset = input<CardFormPreset>('none');
  invalid = input<boolean>(false);
  required = input<boolean>(true);

  readonly countries = COUNTRIES;

  readonly label = computed(() => {
    const { label } = getFieldDisplayText('country', this.preset());
    return label;
  });

  readonly placeholder = computed(() => {
    const { placeholder } = getFieldDisplayText('country', this.preset());
    return placeholder;
  });

  isOpen = signal(false);
  searchQuery = signal('');
  highlightedIndex = signal(-1);
  
  selectedCountry = computed(() => {
    const value = this.value();
    if (!value) return null;
    return this.countries.find(c => c.code === value) || null;
  });

  filteredCountries = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.countries;
    return this.countries.filter(c =>
      c.name.toLowerCase().includes(query) ||
      c.code.toLowerCase().includes(query)
    );
  });

  searchInputRef = viewChild<ElementRef>('searchInput');

  readonly countryChange = output<{ name: string; value: string }>();

  toggleDropdown(): void {
    this.isOpen.update(v => !v);
    this.searchQuery.set('');
    this.highlightedIndex.set(-1);

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
        this.highlightedIndex.update(i => 
          i < this.filteredCountries().length - 1 ? i + 1 : i
        );
        break;
      }
      case 'ArrowUp': {
        event.preventDefault();
        this.highlightedIndex.update(i => (i > 0 ? i - 1 : i));
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

  onInputChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const customEvent = new CustomEvent('kgCountryChange', {
      detail: { name: this.controlName(), value: target.value },
    });
    (event.target as HTMLElement).dispatchEvent(customEvent);
  }
}
