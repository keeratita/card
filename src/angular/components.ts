import { Component, input, computed, signal, output, ElementRef, viewChild, inject } from '@angular/core';
import {
  CardFormPreset,
  OptionalCardField,
} from '../core/domain/card';
import {
  FIELD_METADATA,
  getFieldDisplayText,
  ALWAYS_OPTIONAL_FIELDS,
} from '../core/domain/optional-fields';
import { COUNTRIES } from '../data/countries';
import type { Country } from '../data/countries';
import { escapeHtml } from '../core/security';
import { CARD_FORM_TEXT_EN } from '../lang/en';
import {
  filterCountries,
  findCountryByCode,
  comboboxReduce,
  comboboxKeyCommand,
  isComboboxKeyHandled,
  computeDropdownPlacement,
  INITIAL_COMBOBOX_STATE,
} from '../core/form';
import { DROPDOWN_DEFAULT_MAX_HEIGHT, DROPDOWN_Z_INDEX } from '../core/constants';
import type { ComboboxAction, ComboboxState } from '../core/form';

// Unique DOM-id namespace per instance, so multiple country selects on one
// page never collide on aria-controls / aria-activedescendant IDREFs.
let nextInstanceId = 0;

/** Angular component for searchable country dropdown with flag emojis. */
@Component({
  selector: 'kg-country-select',
  // Standalone is stated explicitly rather than inherited from the v19+
  // default: the published entry is ngtsc partial output (see
  // scripts/ship-angular-partial.js), and consumers compile that with their own
  // toolchain, so the metadata should not depend on a compiler default version.
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(window:resize)': 'onWindowResize()',
  },
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

    .country-select-item:hover {
      background-color: #f6f8fa;
    }

    .country-select-item.selected {
      background-color: #f1f8ff;
      border-left: 3px solid #0366d6;
    }

    /* Keyboard highlight must be unmistakable next to hover and selection:
       solid brand blue with white text (>= 4.5:1 against #0366d6). */
    .country-select-item.highlighted {
      background-color: #0366d6;
    }

    .country-select-item.highlighted .country-select-item-name,
    .country-select-item.highlighted .country-select-item-code {
      color: #fff;
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

    .ios-label .required-star {
      color: #cf222e;
    }

    .visually-hidden {
      position: absolute;
      width: 1px;
      height: 1px;
      margin: -1px;
      padding: 0;
      overflow: hidden;
      clip: rect(0 0 0 0);
      clip-path: inset(50%);
      white-space: nowrap;
      border: 0;
    }
  `],
  template: `
    <div class="ios-input-row row-country" [class.invalid]="invalid()">
      <label class="ios-label" [id]="labelId" [attr.for]="triggerId">
        {{ label() }}
        @if (required()) {
          <span class="required-star" aria-hidden="true">*</span>
        }
      </label>

      <div class="country-select-wrapper" (click)="toggleDropdown()" (keydown)="onKeydown($event)">
        <!--
          Trigger: always a plain disclosure button, in both states. While the
          list is open the focused search input is the single role=combobox
          (it owns aria-autocomplete / aria-controls / aria-activedescendant).
          Same contract as the React and vanilla bindings — a trigger that
          announced itself as a combobox while closed would make the three
          entry points behave differently for screen readers.
        -->
        <div
          #countryTrigger
          [id]="triggerId"
          class="country-select-trigger"
          [class.open]="isOpen()"
          [class.invalid]="invalid()"
          role="button"
          [attr.aria-expanded]="isOpen()"
          [attr.aria-haspopup]="'listbox'"
          [attr.aria-controls]="isOpen() ? listId : null"
          [attr.aria-invalid]="invalid() ? 'true' : null"
          [attr.aria-labelledby]="labelId"
          [attr.aria-required]="required()"
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
          <div
            class="country-select-dropdown"
            [style.zIndex]="dropdownZIndex"
            (click)="$event.stopPropagation()"
          >
            <!-- Search -->
            <div class="country-select-search">
              <input
                #searchInput
                type="text"
                class="country-select-search-input"
                role="combobox"
                [placeholder]="searchPlaceholder"
                [attr.aria-label]="searchPlaceholder"
                [attr.aria-expanded]="isOpen()"
                [attr.aria-haspopup]="'listbox'"
                [attr.aria-autocomplete]="'list'"
                [attr.aria-controls]="listId"
                [attr.aria-activedescendant]="activeOptionId()"
                [value]="searchQuery()"
                (input)="onSearchChange($event)"
              />
            </div>

            <!-- Country List -->
            <div
              class="country-select-list"
              role="listbox"
              [id]="listId"
              [attr.aria-labelledby]="triggerId"
              [style.max-height]="listMaxHeight() + 'px'"
              (mouseleave)="clearHoverHighlight()"
            >
              @if (filteredCountries().length > 0) {
                @for (country of filteredCountries(); track country.code; let i = $index) {
                  <div
                    class="country-select-item"
                    [id]="optionId(country.code)"
                    [attr.data-code]="country.code"
                    [class.selected]="selectedCountry()?.code === country.code"
                    [class.highlighted]="highlightedIndex() === i"
                    [attr.aria-setsize]="filteredCountries().length"
                    [attr.aria-posinset]="i + 1"
                    (mouseenter)="highlightItem(i)"
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
                <div
                  class="country-select-no-results"
                  role="option"
                  aria-disabled="true"
                >
                  {{ noResultsText() }}
                </div>
              }
            </div>

            <!-- Polite announcement of the filtered result count -->
            <div class="visually-hidden country-select-status" role="status" aria-live="polite">
              {{ listStatus() }}
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class CountrySelectComponent {
  /**
   * Signal-based inputs/outputs (`input()`/`output()`) — the modern Angular
   * API; components are standalone by default since Angular 19.
   */
  controlName = input<string>('country');
  value = input<string>('');
  preset = input<CardFormPreset>('none');
  invalid = input<boolean>(false);
  required = input<boolean>(true);

  readonly countries = COUNTRIES;

  /** Signal-derived label/placeholder (`computed()` instead of getters). */
  readonly label = computed(() => {
    const { label } = getFieldDisplayText('country', this.preset());
    return label;
  });

  readonly placeholder = computed(() => {
    const { placeholder } = getFieldDisplayText('country', this.preset());
    return placeholder;
  });

  readonly searchPlaceholder = CARD_FORM_TEXT_EN.searchCountries;

  /** Layout facts of the dropdown (kept in sync with the styles block). */
  private static readonly LIST_MAX_HEIGHT = DROPDOWN_DEFAULT_MAX_HEIGHT;
  /** Minimum usable list height before the dropdown is simply unusable. */
  private static readonly LIST_MIN_HEIGHT = 96;
  /** Distance from the trigger to the list top: dropdown offset + search row. */
  private static readonly SEARCH_ROW_OFFSET = 68;

  private readonly uid = `kg-country-${++nextInstanceId}`;
  /** Stable listbox id, referenced by both comboboxes' aria-controls. */
  readonly listId = `${this.uid}-list`;
  /** Stable trigger id, referenced by the label's `for`. */
  readonly triggerId = `${this.uid}-trigger`;
  /** Stable label id, referenced by the trigger's `aria-labelledby`. */
  readonly labelId = `${this.uid}-label`;

  /**
   * Single source of truth for open/query/highlight: every transition goes
   * through the shared combobox reducer, so the three bindings cannot drift
   * and no per-signal copies can disagree with the reducer's last word.
   */
  private readonly comboboxState = signal<ComboboxState>(INITIAL_COMBOBOX_STATE);
  readonly isOpen = computed(() => this.comboboxState().isOpen);
  readonly searchQuery = computed(() => this.comboboxState().query);
  readonly highlightedIndex = computed(
    () => this.comboboxState().highlightedIndex,
  );
  /** Max height of the list, clamped to the viewport on open. */
  listMaxHeight = signal(CountrySelectComponent.LIST_MAX_HEIGHT);

  /** Popover stacking, shared with the other two bindings through core. */
  readonly dropdownZIndex = DROPDOWN_Z_INDEX;

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

  private readonly hostElement = inject(ElementRef<HTMLElement>);

  /** Stable id of the option row for a country code. */
  optionId(code: string): string {
    return `${this.uid}-option-${code}`;
  }

  /**
   * id of the highlighted option, referenced by aria-activedescendant on
   * the active combobox — the search input while the dropdown is open.
   */
  readonly activeOptionId = computed(() => {
    const index = this.highlightedIndex();
    if (index < 0) return '';
    const country = this.filteredCountries()[index];
    return country ? this.optionId(country.code) : '';
  });

  /** No-results copy shared with the live-region announcement. */
  readonly noResultsText = computed(() =>
    CARD_FORM_TEXT_EN.noCountriesFound(this.searchQuery()),
  );

  /** Text for the polite live region (result count / no-results feedback). */
  readonly listStatus = computed(() => {
    if (!this.isOpen()) return '';
    const count = this.filteredCountries().length;
    return count === 0
      ? this.noResultsText()
      : CARD_FORM_TEXT_EN.countriesFound(count);
  });

  /**
   * Emits the selected ISO country code (mirrors React's `onChange` contract).
   */
  readonly countrySelected = output<string>();

  /**
   * @deprecated Prefer `countrySelected`. Kept for backward compatibility;
   * note that `name` here is the control name, not the country name.
   */
  readonly countryChange = output<{ name: string; value: string }>();

  toggleDropdown(): void {
    if (this.isOpen()) {
      this.dispatch({ type: 'close' });
      return;
    }
    this.openDropdown();
  }

  /** Opens (no-op when already open, so re-clicking never wipes the filter). */
  private openDropdown(): void {
    if (this.isOpen()) return;
    this.dispatch({ type: 'open' });

    // Clamp the list to the viewport below the trigger so it never
    // renders off-screen at the bottom of the page. Shared placement
    // math with `forceBelow` (this dropdown always renders below).
    this.updateListMaxHeight();

    // Focus search input when opening
    setTimeout(() => {
      this.searchInputRef()?.nativeElement?.focus();
    }, 0);
  }

  /** Re-clamps the list when the viewport resizes while open (rAF-coalesced). */
  private resizeQueued = false;
  onWindowResize(): void {
    if (!this.isOpen() || this.resizeQueued) return;
    this.resizeQueued = true;
    requestAnimationFrame(() => {
      this.resizeQueued = false;
      if (this.isOpen()) {
        this.updateListMaxHeight();
      }
    });
  }

  private updateListMaxHeight(): void {
    const rect = this.hostElement.nativeElement.getBoundingClientRect();
    // Ask the shared placement math for the height of the *whole* dropdown
    // (search row + list), then hand the remainder to the list. Clamping the
    // list alone would let the search row push it past the viewport bottom.
    const available = computeDropdownPlacement(
      rect,
      CountrySelectComponent.LIST_MAX_HEIGHT +
        CountrySelectComponent.SEARCH_ROW_OFFSET,
      window.innerHeight,
      { forceBelow: true },
    ).maxHeight;
    // Keep the list bottom inside the viewport (subtract the trigger→list
    // gap + search row height), but never collapse to an unusable height:
    // an invisible list is worse than one the user can scroll at the fold.
    this.listMaxHeight.set(
      Math.max(
        CountrySelectComponent.LIST_MIN_HEIGHT,
        Math.min(
          CountrySelectComponent.LIST_MAX_HEIGHT,
          available - CountrySelectComponent.SEARCH_ROW_OFFSET,
        ),
      ),
    );
  }

  /** Updates highlight on hover, skipping no-op writes (each still costs a CD pass). */
  highlightItem(index: number): void {
    this.comboboxState.update((s) =>
      s.highlightedIndex === index ? s : { ...s, highlightedIndex: index },
    );
  }

  /**
   * Pointer leaving the list returns the highlight to the current selection
   * so a stray hover never leaves a hovered row feeding activedescendant.
   */
  clearHoverHighlight(): void {
    if (!this.isOpen()) return;
    const selected = this.selectedCountry();
    const index = selected
      ? this.filteredCountries().findIndex((c) => c.code === selected.code)
      : -1;
    this.comboboxState.update((s) => ({ ...s, highlightedIndex: index }));
  }

  private scrollHighlightedIntoView(): void {
    // Resolve the target from state via its stable option id, so the scroll
    // happens even though the `highlighted` class is only applied on the
    // next change-detection pass (one render behind otherwise).
    const id = this.activeOptionId();
    if (!id) return;
    this.hostElement.nativeElement
      .querySelector(`#${id}`)
      ?.scrollIntoView({ block: 'nearest' });
  }

  private dispatch(action: ComboboxAction): void {
    this.comboboxState.update((s) => comboboxReduce(s, action));
  }

  /** Closes the dropdown when a click lands outside the component (host listener). */
  onDocumentClick(event: MouseEvent): void {
    if (!this.isOpen()) return;
    const host = this.hostElement.nativeElement as HTMLElement;
    if (!host.contains(event.target as Node)) {
      // Focus inside the list would be dropped to <body> when the list
      // unmounts, so return it to the trigger — the same rule the vanilla and
      // React bindings apply on every close path.
      const focusWasInside = host.contains(document.activeElement);
      this.dispatch({ type: 'close' });
      if (focusWasInside) this.focusTrigger();
    }
  }

  onSearchChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.dispatch({ type: 'setQuery', query: target.value });
  }

  selectCountry(country: Country): void {
    this.countrySelected.emit(country.code);
    this.countryChange.emit({
      name: this.controlName(),
      value: country.code,
    });
    this.dispatch({ type: 'close' });
    this.focusTrigger();
  }

  /** Returns focus to the trigger so keyboard users stay in the tab order. */
  private focusTrigger(): void {
    const trigger = this.hostElement.nativeElement.querySelector(
      `#${this.triggerId}`,
    ) as HTMLElement | null;
    trigger?.focus();
  }

  // Keyboard navigation
  onKeydown(event: KeyboardEvent): void {
    // The wrapper hosts keydown for both the trigger and the search input, so
    // the target is derived from what actually has focus. The key map itself
    // lives in core (`comboboxKeyCommand`) and is shared with the other two
    // bindings; this method only executes the returned command.
    const target = (event.target as HTMLElement | null)?.classList?.contains(
      'country-select-search-input',
    )
      ? 'search'
      : 'trigger';
    const command = comboboxKeyCommand(event.key, this.comboboxState(), target, {
      metaKey: event.metaKey,
      ctrlKey: event.ctrlKey,
      altKey: event.altKey,
    });
    if (!isComboboxKeyHandled(command)) return;
    event.preventDefault();

    if (command.type === 'open') {
      this.openDropdown();
      if (command.query !== undefined) {
        this.dispatch({ type: 'setQuery', query: command.query });
      }
      return;
    }
    if (command.type === 'close') {
      // Every keydown reaching this handler originates inside the component, so
      // the trigger always gets focus back. The "don't steal focus" rule belongs
      // to the outside-click path (`onDocumentClick`), which is the only close
      // that can originate elsewhere.
      this.dispatch({ type: 'close' });
      this.focusTrigger();
      return;
    }
    if (command.type === 'move') {
      this.dispatch({
        type: 'move',
        direction: command.direction,
        count: this.filteredCountries().length,
      });
      this.scrollHighlightedIntoView();
      return;
    }
    if (command.type === 'select') {
      const highlighted = this.filteredCountries()[this.highlightedIndex()];
      if (highlighted) this.selectCountry(highlighted);
    }
  }
}

/**
 * Render optional fields as HTML strings.
 * @deprecated Prefer using the Angular directives/components over raw HTML
 * injection; they escape values and integrate with reactive forms.
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
      .map((c) => `<option value="${escapeHtml(c.code)}" ${c.code === value ? 'selected' : ''}>${escapeHtml(c.emoji)} ${escapeHtml(c.name)}</option>`)
      .join('\n        ');

    return `<div class="ios-input-row row-${escapeHtml(field)}${invalidClass}">
      <label class="ios-label" for="${escapeHtml(controlName)}">${escapeHtml(label)}</label>
      <select id="${escapeHtml(controlName)}" name="${escapeHtml(controlName)}" class="ios-input card-country-input" autocomplete="country" required>
        <option value="" disabled>${escapeHtml(placeholder)}</option>
        ${options}
      </select>
    </div>`;
  }

  const required = ALWAYS_OPTIONAL_FIELDS.has(field) ? '' : 'required';

  return `<div class="ios-input-row row-${escapeHtml(field)}${invalidClass}">
    <label class="ios-label" for="${escapeHtml(controlName)}">${escapeHtml(label)}</label>
    <input type="${escapeHtml(meta.type)}" id="${escapeHtml(controlName)}" name="${escapeHtml(controlName)}" class="ios-input" placeholder="${escapeHtml(placeholder)}" value="${escapeHtml(value)}" autocomplete="${escapeHtml(meta.autocomplete)}" ${required} />
  </div>`;
}
