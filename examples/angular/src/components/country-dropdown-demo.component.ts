/**
 * Country Dropdown Demo Example - Angular (Latest Syntax)
 *
 * This example demonstrates a searchable country dropdown with
 * flag icons and country code display using the library's COUNTRIES data.
 */

import { Component, signal, computed, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { COUNTRIES, type Country } from '@keeratita/card/angular';

@Component({
  selector: 'app-country-dropdown-demo',
  standalone: true,
  imports: [ReactiveFormsModule],
  host: {
    '(document:keydown)': 'onDocumentKeydown($event)',
    '(document:click)': 'onDocumentClick($event)',
  },
  styles: [
    `
      .container {
        max-width: 500px;
        margin: 0 auto;
      }
      h2 {
        font-size: 28px;
        font-weight: 600;
        color: #ffffff;
        margin: 0 0 8px 0;
      }
      .subtitle {
        color: rgba(255, 255, 255, 0.55);
        margin: 0 0 24px 0;
        font-size: 15px;
      }
      .info-box {
        background-color: rgba(255, 204, 0, 0.08);
        border: 1px solid rgba(255, 204, 0, 0.25);
        padding: 16px;
        border-radius: 12px;
        margin-bottom: 24px;
      }
      .info-box h4 {
        margin: 0 0 8px 0;
        color: #ffd60a;
        font-size: 14px;
      }
      .info-box p {
        margin: 0;
        color: rgba(255, 214, 10, 0.8);
        font-size: 13px;
        line-height: 1.5;
      }
      .info-box code {
        background-color: rgba(255, 255, 255, 0.08);
        padding: 2px 6px;
        border-radius: 4px;
        font-size: 12px;
      }
      .form-section {
        background-color: rgba(255, 255, 255, 0.03);
        padding: 24px;
        border-radius: 16px;
        margin-bottom: 24px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
      }
      .form-section h3 {
        margin: 0 0 16px 0;
        font-size: 16px;
        font-weight: 600;
        color: #ffffff;
      }
      .form-group {
        margin-bottom: 16px;
      }
      .form-group label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.55);
        font-size: 14px;
      }
      .form-input {
        width: 100%;
        padding: 12px 14px;
        border-radius: 8px;
        border: 1.5px solid rgba(255, 255, 255, 0.1);
        font-size: 15px;
        transition: all 0.15s ease;
        box-sizing: border-box;
        background-color: rgba(255, 255, 255, 0.05);
        color: #ffffff;
        font-family: inherit;
      }
      .form-input:focus {
        outline: none;
        border-color: #0a84ff;
        box-shadow: 0 0 0 3px rgba(10, 132, 255, 0.12);
      }
      .form-input::placeholder {
        color: rgba(255, 255, 255, 0.2);
      }
      .country-display {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
        background-color: rgba(10, 132, 255, 0.08);
        border: 1px solid rgba(10, 132, 255, 0.25);
        border-radius: 12px;
        margin-top: 16px;
      }
      .country-flag {
        font-size: 32px;
      }
      .country-info {
        flex: 1;
      }
      .country-name {
        font-weight: 600;
        color: #ffffff;
        font-size: 16px;
      }
      .country-code {
        color: rgba(255, 255, 255, 0.55);
        font-size: 13px;
      }
      .country-dial-code {
        background-color: #0a84ff;
        color: white;
        padding: 4px 12px;
        border-radius: 16px;
        font-size: 13px;
        font-weight: 500;
      }
      .search-box {
        margin-bottom: 16px;
      }
      .search-input {
        width: 100%;
        padding: 12px 14px;
        border-radius: 8px;
        border: 1.5px solid rgba(255, 255, 255, 0.1);
        font-size: 15px;
        transition: all 0.15s ease;
        box-sizing: border-box;
        background-color: rgba(255, 255, 255, 0.05);
        color: #ffffff;
        font-family: inherit;
      }
      .search-input:focus {
        outline: none;
        border-color: #0a84ff;
        box-shadow: 0 0 0 3px rgba(10, 132, 255, 0.12);
      }
      .search-input::placeholder {
        color: rgba(255, 255, 255, 0.2);
      }
      .country-list {
        max-height: 200px;
        overflow-y: auto;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.03);
      }
      .country-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 14px;
        cursor: pointer;
        transition: background-color 0.15s ease;
      }
      .country-item:hover {
        background-color: rgba(255, 255, 255, 0.05);
      }
      .country-item.selected {
        background-color: rgba(10, 132, 255, 0.12);
        border-left: 3px solid #0a84ff;
      }
      .country-item-flag {
        font-size: 20px;
      }
      .country-item-name {
        flex: 1;
        color: #ffffff;
        font-size: 14px;
      }
      .country-item-code {
        color: rgba(255, 255, 255, 0.55);
        font-size: 12px;
      }
      .code-example {
        background-color: rgba(255, 255, 255, 0.03);
        padding: 16px;
        border-radius: 12px;
        margin-top: 24px;
        border: 1px solid rgba(255, 255, 255, 0.08);
      }
      .code-example h4 {
        color: #ffffff;
        margin: 0 0 12px 0;
        font-size: 14px;
      }
      .code-example pre {
        color: rgba(255, 255, 255, 0.7);
        font-size: 12px;
        margin: 0;
        line-height: 1.6;
        font-family: 'SF Mono', Monaco, Consolas, monospace;
        white-space: pre-wrap;
      }
      .country-select {
        width: 100%;
        padding: 12px 14px;
        border-radius: 8px;
        border: 1.5px solid rgba(255, 255, 255, 0.1);
        font-size: 15px;
        transition: all 0.15s ease;
        box-sizing: border-box;
        background-color: rgba(255, 255, 255, 0.05);
        color: #ffffff;
        cursor: pointer;
      }
      .country-select:focus {
        outline: none;
        border-color: #0a84ff;
        box-shadow: 0 0 0 3px rgba(10, 132, 255, 0.12);
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
      .country-select-item:hover {
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
    `,
  ],
  template: `
    <div class="container">
      <h2>Country Dropdown Demo</h2>
      <p class="subtitle">
        Interactive country selection with flags and dial codes.
      </p>

      <!-- Info Box -->
      <div class="info-box">
        <h4>Using Library's Country Data</h4>
        <p>
          This demo uses the <code>COUNTRIES</code> array exported from
          <code>@keeratita/card/angular</code>. It includes 60+ countries with
          flags, ISO codes, and dial codes.
        </p>
      </div>

      <!-- Search Box -->
      <div class="form-section">
        <h3>Search Countries</h3>
        <div class="search-box">
          <input
            type="text"
            class="search-input"
            placeholder="Search by country name or code..."
            [value]="searchQuery()"
            (input)="searchQuery.set($event.target.value)"
          />
        </div>

        <!-- Filtered Country List -->
        @if (filteredCountries().length > 0) {
          <div class="country-list">
            @for (country of filteredCountries(); track country.code) {
              <div
                class="country-item"
                [class.selected]="selectedCountry()?.code === country.code"
                (click)="selectCountry(country)"
              >
                <span class="country-item-flag">{{ country.emoji }}</span>
                <span class="country-item-name">{{ country.name }}</span>
                <span class="country-item-code">{{ country.code }}</span>
              </div>
            }
          </div>
        } @else {
          <p style="color: rgba(255,255,255,0.55); text-align: center; padding: 20px;">
            No countries found matching "{{ searchQuery() }}"
          </p>
        }
      </div>

      <!-- Selected Country Display -->
      @if (selectedCountry()) {
        <div class="country-display">
          <span class="country-flag">{{ selectedCountry()?.emoji }}</span>
          <div class="country-info">
            <div class="country-name">{{ selectedCountry()?.name }}</div>
            <div class="country-code">
              ISO Code: {{ selectedCountry()?.code }}
            </div>
          </div>
          @if (selectedCountry()?.dialCode) {
            <span class="country-dial-code">{{
              selectedCountry()?.dialCode
            }}</span>
          }
        </div>
      }

      <!-- Card Form with Country Select -->
      <div class="form-section" style="margin-top: 24px;">
        <h3>Card Form with Country Select</h3>
        <form [formGroup]="form">
          <div class="form-group">
            <label>Card Number</label>
            <input
              type="text"
              formControlName="number"
              class="form-input"
              placeholder="4242 4242 4242 4242"
            />
          </div>

          <div class="form-group">
            <label>Cardholder Name</label>
            <input
              type="text"
              formControlName="name"
              class="form-input"
              placeholder="John Doe"
            />
          </div>

          <div class="form-group">
            <label>Country</label>
            <div
              class="country-select-wrapper"
              (click)="toggleCountryDropdown()"
            >
              <!-- Trigger -->
              <div
                class="country-select-trigger"
                [class.open]="isCountryDropdownOpen()"
                [class.invalid]="
                  form.get('country')?.invalid && form.get('country')?.touched
                "
              >
                <div class="country-select-display">
                  @if (selectedCountry()) {
                    <ng-container>
                      <span class="country-select-flag">{{
                        selectedCountry()?.emoji
                      }}</span>
                      <span class="country-select-name">{{
                        selectedCountry()?.name
                      }}</span>
                    </ng-container>
                  } @else {
                    <span class="country-select-placeholder"
                      >Select a country</span
                    >
                  }
                </div>
                <span
                  class="country-select-arrow"
                  [class.open]="isCountryDropdownOpen()"
                  >▼</span
                >
              </div>

              <!-- Dropdown -->
              @if (isCountryDropdownOpen()) {
                <div
                  class="country-select-dropdown"
                  (click)="$event.stopPropagation()"
                >
                  <!-- Search -->
                  <div class="country-select-search">
                    <input
                      type="text"
                      class="country-select-search-input"
                      placeholder="Search countries..."
                      [value]="countrySearchQuery()"
                      (input)="countrySearchQuery.set($event.target.value)"
                    />
                  </div>

                  <!-- Country List -->
                  <div class="country-select-list">
                    @if (filteredCountries().length > 0) {
                      @for (
                        country of filteredCountries();
                        track country.code
                      ) {
                        <div
                          class="country-select-item"
                          [class.selected]="
                            selectedCountry()?.code === country.code
                          "
                          (click)="selectCountry(country)"
                        >
                          <span class="country-select-item-flag">{{
                            country.emoji
                          }}</span>
                          <span class="country-select-item-name">{{
                            country.name
                          }}</span>
                          <span class="country-select-item-code">{{
                            country.code
                          }}</span>
                        </div>
                      }
                    } @else {
                      <div class="country-select-no-results">
                        No countries found matching "{{ countrySearchQuery() }}"
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          </div>

          <div class="form-group">
            <label>Postal Code</label>
            <input
              type="text"
              formControlName="postalCode"
              class="form-input"
              placeholder="10001"
            />
          </div>
        </form>
      </div>

      <!-- Code Example -->
      <div class="code-example">
        <h4>How to use in your app:</h4>
        <pre>{{ codeExample }}</pre>
      </div>
    </div>
  `,
})
export class CountryDropdownDemoComponent {
  fb = inject(FormBuilder);

  // All countries from the library
  readonly countries = COUNTRIES;

  // Search and selection state
  searchQuery = signal('');
  selectedCountry = signal<Country | null>(null);

  // Country dropdown state
  isCountryDropdownOpen = signal(false);
  countrySearchQuery = signal('');

  // Form with country and postal code
  form = this.fb.group({
    number: ['', Validators.required],
    name: ['', Validators.required],
    country: ['', Validators.required],
    postalCode: ['', Validators.required],
  });

  selectCountry(country: Country): void {
    this.selectedCountry.set(country);
    this.form.get('country')?.setValue(country.code);
    this.searchQuery.set('');
    this.countrySearchQuery.set('');
    this.isCountryDropdownOpen.set(false);
  }

  toggleCountryDropdown(): void {
    this.isCountryDropdownOpen.update((v) => !v);
    this.countrySearchQuery.set('');
  }

  // Close dropdown on ESC key
  onDocumentKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.isCountryDropdownOpen()) {
      this.isCountryDropdownOpen.set(false);
      this.countrySearchQuery.set('');
    }
  }

  // Close dropdown when clicking outside
  onDocumentClick(event: MouseEvent): void {
    // The dropdown is already handled with (click)="$event.stopPropagation()"
    // This handler is for clicks outside the component
    // Additional check: don't close if clicking inside the dropdown or the trigger
    const target = event.target as HTMLElement;
    if (
      target.closest('.country-select-dropdown') ||
      target.closest('.country-select-wrapper')
    ) {
      return;
    }
    if (this.isCountryDropdownOpen()) {
      this.isCountryDropdownOpen.set(false);
      this.countrySearchQuery.set('');
    }
  }

  onCountryChange(event: { name: string; value: string }): void {
    this.form.get(event.name)?.setValue(event.value);
    const country = COUNTRIES.find((c) => c.code === event.value);
    if (country) {
      this.selectedCountry.set(country);
    }
  }

  // Computed for filtered countries (used by both search sections)
  filteredCountries = computed(() => {
    // Use countrySearchQuery for the inline dropdown, searchQuery for the standalone section
    const query = (
      this.countrySearchQuery() || this.searchQuery()
    ).toLowerCase();
    if (!query) return this.countries;
    return this.countries.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.code.toLowerCase().includes(query),
    );
  });

  // Code example for using the library's COUNTRIES data
  get codeExample(): string {
    return `// Import country data from the library
import { COUNTRIES } from '@keeratita/card/angular';
import type { Country } from '@keeratita/card/angular';

// Use COUNTRIES array in your app
const allCountries = COUNTRIES; // 60+ countries with flags

// Get country by code
const us = COUNTRIES.find(c => c.code === 'US');
console.log(us?.emoji, us?.name); // 🇺🇸 United States

// In your component template:
<select formControlName="country">
  @for (country of COUNTRIES; track country.code) {
    <option [value]="country.code">
      {{ country.emoji }} {{ country.name }}
    </option>
  }
</select>`;
  }
}
