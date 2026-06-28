/**
 * Basic Card Form Example - Angular (Latest Syntax)
 *
 * This example demonstrates the simplest way to integrate the card form
 * using the createCardFormGroup helper function with different preset options.
 */

import {
  Component,
  signal,
  inject,
  computed,
  ChangeDetectorRef,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  formatCardNumber,
  formatExpiry,
  createCardFormGroup,
  updateCardFormGroup,
  CardFormGroupValue,
} from '@keeratita/card/angular';
import { CountrySelectComponent } from './country-select.component';
import { stripeAdapter, omiseAdapter } from '../shared/adapters';
import { StripeAdapter, OmiseAdapter } from '@keeratita/card';

// Local type definition for preset options
type CardFormPreset = 'none' | 'us' | 'billing' | 'contact';

@Component({
  selector: 'app-basic-card-form',
  standalone: true,
  imports: [ReactiveFormsModule, CountrySelectComponent],
  host: {
    '(window:keydown.Control.S)': 'onSaveCodeExample($event)',
  },
  styles: [
    `
      .container {
        max-width: 600px;
        margin: 0 auto;
      }
      h2 {
        font-size: 28px;
        font-weight: 600;
        color: #24292e;
        margin: 0 0 8px 0;
      }
      .subtitle {
        color: #586069;
        margin: 0 0 24px 0;
        font-size: 15px;
      }
      .config-section {
        background-color: #f6f8fa;
        padding: 20px;
        border-radius: 8px;
        margin-bottom: 24px;
      }
      .config-section h3 {
        margin: 0 0 16px 0;
        font-size: 16px;
        font-weight: 600;
        color: #24292e;
      }
      .gateway-label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
        color: #24292e;
        font-size: 14px;
      }
      .gateway-buttons {
        display: flex;
        gap: 8px;
      }
      .gateway-btn {
        flex: 1;
        padding: 10px 16px;
        border: 1px solid #e1e4e8;
        border-radius: 6px;
        background-color: #fff;
        cursor: pointer;
        font-weight: 500;
        font-size: 14px;
        color: #24292e;
        transition: all 0.15s ease;
      }
      .gateway-btn.active {
        border-color: #0366d6;
        background-color: #f1f8ff;
        color: #0366d6;
      }
      .success-msg {
        padding: 16px;
        background-color: #f0fdf4;
        border-radius: 8px;
        margin-bottom: 20px;
        border: 1px solid #bbf7d0;
        color: #166534;
      }
      .error-msg {
        padding: 16px;
        background-color: #fef2f2;
        border-radius: 8px;
        margin-bottom: 20px;
        border: 1px solid #fecaca;
        color: #991b1b;
      }
      form {
        display: flex;
        flex-direction: column;
      }
      .form-group {
        margin-bottom: 16px;
      }
      label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
        color: #24292e;
        font-size: 14px;
      }
      input {
        width: 100%;
        padding: 12px 14px;
        border-radius: 6px;
        border: 1px solid #d0d7de;
        font-size: 15px;
        transition: all 0.15s ease;
        box-sizing: border-box;
      }
      input:focus {
        outline: none;
        border-color: #0366d6;
        box-shadow: 0 0 0 3px rgba(3, 102, 214, 0.1);
      }
      input.invalid {
        border-color: #cf222e;
      }
      input::placeholder {
        color: #6e7781;
      }
      .input-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        margin-bottom: 16px;
      }
      .error-text {
        color: #cf222e;
        font-size: 13px;
        margin-top: 4px;
      }
      .submit-btn {
        width: 100%;
        padding: 14px;
        background-color: #2da44e;
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .submit-btn:hover:not(:disabled) {
        background-color: #2c974b;
      }
      .submit-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      .code-section {
        margin-top: 32px;
        padding: 20px;
        background-color: #161b22;
        border-radius: 8px;
        overflow-x: auto;
      }
      .code-section h4 {
        color: #fff;
        margin: 0 0 12px 0;
        font-size: 14px;
        font-weight: 600;
      }
      .code-section pre {
        color: #c9d1d9;
        font-size: 12px;
        margin: 0;
        line-height: 1.6;
        font-family: 'SF Mono', Monaco, Consolas, monospace;
      }
    `,
  ],
  template: `
    <div class="container">
      <h2>Basic Card Form</h2>
      <p class="subtitle">Simple integration with pre-built form group.</p>

      <!-- Configuration -->
      <div class="config-section">
        <h3>Configuration</h3>

        <!-- Payment Gateway -->
        <div class="gateway-label">Payment Gateway</div>
        <div class="gateway-buttons">
          <button
            class="gateway-btn"
            [class.active]="selectedAdapter() === 'stripe'"
            (click)="selectedAdapter.set('stripe')"
          >
            Stripe
          </button>
          <button
            class="gateway-btn"
            [class.active]="selectedAdapter() === 'omise'"
            (click)="selectedAdapter.set('omise')"
          >
            Omise
          </button>
        </div>

        <!-- Form Preset -->
        <div class="gateway-label" style="margin-top: 16px;">
          Form Preset (createCardFormGroup configuration)
        </div>
        <div class="gateway-buttons">
          <button
            class="gateway-btn"
            [class.active]="selectedPreset() === 'none'"
            (click)="setPreset('none')"
            title="Basic form with only core fields (number, expiry, cvc, name)"
          >
            none
          </button>
          <button
            class="gateway-btn"
            [class.active]="selectedPreset() === 'us'"
            (click)="setPreset('us')"
            title="US preset: adds country and postalCode fields"
          >
            us
          </button>
          <button
            class="gateway-btn"
            [class.active]="selectedPreset() === 'billing'"
            (click)="setPreset('billing')"
            title="Billing preset: adds addressLine1, addressLine2, city, state, postalCode, country"
          >
            billing
          </button>
          <button
            class="gateway-btn"
            [class.active]="selectedPreset() === 'contact'"
            (click)="setPreset('contact')"
            title="Contact preset: adds email and phone fields"
          >
            contact
          </button>
        </div>
      </div>

      <!-- Preset Info -->
      @if (presetInfo()) {
        <div
          class="config-section"
          style="background-color: #fff8c5; border: 1px solid #f1c40f;"
        >
          <h3 style="color: #856404;">
            Current Preset: {{ selectedPreset() }}
          </h3>
          <p style="margin: 0; color: #856404; font-size: 14px;">
            {{ presetInfo() }}
          </p>
        </div>
      }

      <!-- Success Message -->
      @if (token()) {
        <div class="success-msg">
          <strong>✓ Success!</strong> Token: {{ token()?.id }}
        </div>
      }

      <!-- Error Message -->
      @if (error()) {
        <div class="error-msg"><strong>⚠ Error:</strong> {{ error() }}</div>
      }

      <!-- Card Form -->
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <!-- Card Number -->
        <div class="form-group">
          <label>Card Number</label>
          <input
            type="text"
            formControlName="number"
            placeholder="4242 4242 4242 4242"
            (input)="onCardNumberInput($event)"
            [class.invalid]="
              form.get('number')?.invalid && form.get('number')?.touched
            "
          />
          @if (form.get('number')?.invalid && form.get('number')?.touched) {
            <small class="error-text">Please enter a valid card number</small>
          }
        </div>

        <!-- Expiry and CVC -->
        <div class="input-grid">
          <div class="form-group">
            <label>Expiry Date</label>
            <input
              type="text"
              formControlName="expiry"
              placeholder="MM/YY"
              (input)="onExpiryInput($event)"
              [class.invalid]="
                form.get('expiry')?.invalid && form.get('expiry')?.touched
              "
            />
          </div>
          <div class="form-group">
            <label>CVC</label>
            <input
              type="text"
              formControlName="cvc"
              placeholder="123"
              [class.invalid]="
                form.get('cvc')?.invalid && form.get('cvc')?.touched
              "
            />
          </div>
        </div>

        <!-- Cardholder Name -->
        <div class="form-group">
          <label>Cardholder Name</label>
          <input
            type="text"
            formControlName="name"
            placeholder="John Doe"
            [class.invalid]="
              form.get('name')?.invalid && form.get('name')?.touched
            "
          />
        </div>

        <!-- Country (US preset) -->
        @if (selectedPreset() === 'us') {
            <kg-country-select
              controlName="country"
              [value]="form.get('country')?.value || ''"
              [preset]="selectedPreset()"
              [invalid]="!!form.get('country')?.invalid && !!form.get('country')?.touched"
              (countryChange)="onCountryChange($event)"
            />
        }

        <!-- Postal Code (US preset) -->
        @if (selectedPreset() === 'us') {
          <div class="form-group">
            <label>Postal Code</label>
            <input
              type="text"
              formControlName="postalCode"
              placeholder="10001"
              [class.invalid]="
                form.get('postalCode')?.invalid &&
                form.get('postalCode')?.touched
              "
            />
          </div>
        }

        <!-- Billing Address Fields -->
        @if (selectedPreset() === 'billing') {
          <div class="form-group">
            <label>Address Line 1</label>
            <input
              type="text"
              formControlName="addressLine1"
              placeholder="123 Main St"
              [class.invalid]="
                form.get('addressLine1')?.invalid &&
                form.get('addressLine1')?.touched
              "
            />
          </div>
        }

        @if (selectedPreset() === 'billing') {
          <div class="form-group">
            <label>Address Line 2 (Optional)</label>
            <input
              type="text"
              formControlName="addressLine2"
              placeholder="Apt, suite, etc."
            />
          </div>
        }

        @if (selectedPreset() === 'billing') {
          <div class="input-grid">
            <div class="form-group">
              <label>City</label>
              <input
                type="text"
                formControlName="city"
                placeholder="New York"
                [class.invalid]="
                  form.get('city')?.invalid && form.get('city')?.touched
                "
              />
            </div>
            <div class="form-group">
              <label>State</label>
              <input
                type="text"
                formControlName="state"
                placeholder="NY"
                [class.invalid]="
                  form.get('state')?.invalid && form.get('state')?.touched
                "
              />
            </div>
          </div>
        }

        @if (selectedPreset() === 'billing') {
          <div class="input-grid">
            <div class="form-group">
              <label>Postal Code</label>
              <input
                type="text"
                formControlName="postalCode"
                placeholder="10001"
                [class.invalid]="
                  form.get('postalCode')?.invalid &&
                  form.get('postalCode')?.touched
                "
              />
            </div>
            <kg-country-select
              controlName="country"
              [value]="form.get('country')?.value || ''"
              [preset]="selectedPreset()"
              [invalid]="!!form.get('country')?.invalid && !!form.get('country')?.touched"
              (countryChange)="onCountryChange($event)"
            />
          </div>
        }

        <!-- Contact Fields -->
        @if (selectedPreset() === 'contact') {
          <div class="form-group">
            <label>Email</label>
            <input
              type="email"
              formControlName="email"
              placeholder="john@example.com"
              [class.invalid]="
                form.get('email')?.invalid && form.get('email')?.touched
              "
            />
          </div>
        }

        @if (selectedPreset() === 'contact') {
          <div class="form-group">
            <label>Phone</label>
            <input
              type="tel"
              formControlName="phone"
              placeholder="+1 (555) 123-4567"
              [class.invalid]="
                form.get('phone')?.invalid && form.get('phone')?.touched
              "
            />
          </div>
        }

        <button
          type="submit"
          [disabled]="form.invalid || processing()"
          class="submit-btn"
        >
          {{ processing() ? 'Processing...' : 'Pay Now' }}
        </button>
      </form>

      <!-- Code Example -->
      <div class="code-section">
        <h4>Code Example - Using createCardFormGroup</h4>
        <pre>{{ codeExample }}</pre>
      </div>

      <!-- Manual Implementation Note -->
      <div
        class="code-section"
        style="background-color: #2d333b; margin-top: 16px;"
      >
        <h4 style="color: #8b949e;">Why use createCardFormGroup?</h4>
        <p style="color: #8b949e; margin: 0 0 12px 0;">
          Recommended approach:
          <code
            style="display: block; background: #161b22; padding: 8px; border-radius: 4px; margin-top: 8px;"
            >const form = createCardFormGroup({{ '{' }} preset: 'billing'
            {{ '}' }});</code
          >
        </p>
        <p style="color: #8b949e; margin: 0;">
          Manual approach requires importing and applying all validators
          yourself.
        </p>
      </div>
    </div>
  `,
})
export class BasicCardFormComponent {
  // Signals for configuration
  selectedAdapter = signal<'stripe' | 'omise'>('stripe');
  selectedPreset = signal<CardFormPreset>('none');

  // Token, error, and processing signals
  token = signal<{ id: string } | null>(null);
  error = signal<string | null>(null);
  processing = signal(false);

  // Stripe and Omise adapters
  stripeAdapter = stripeAdapter;
  omiseAdapter = omiseAdapter;

  cdr = inject(ChangeDetectorRef);

  // Form is created at field-declaration time so it exists before the first
  // template render / change-detection pass. Initialising in ngOnInit() is too
  // late: Angular resolves formControlName bindings on the very first tick,
  // before ngOnInit runs, causing "Cannot find control" errors.
  form: any = createCardFormGroup({ preset: 'none' });

  // Recreate form with the selected preset when it changes
  private recreateFormWithPreset(preset: CardFormPreset): void {
    // Update validators in-place rather than replacing this.form.
    // Replacing the FormGroup reference causes Angular's FormGroupDirective to
    // teardown/rebuild all formControlName bindings in the same CD pass that
    // signal-driven @if blocks use — producing "Cannot find control" errors.
    updateCardFormGroup(this.form, { preset, resetValues: true });
  }

  // Helper to get form value as CardFormGroupValue type
  getFormValue(): CardFormGroupValue {
    return this.form.value as unknown as CardFormGroupValue;
  }

  // Preset descriptions for UI
  presetDescriptions: Record<CardFormPreset, string> = {
    none: 'Basic form with only core fields (card number, expiry, CVC, cardholder name)',
    us: 'US preset: adds country and postalCode fields for US-specific forms',
    billing:
      'Billing preset: adds full address fields (addressLine1, addressLine2, city, state, postalCode, country)',
    contact:
      'Contact preset: adds email and phone fields for customer contact information',
  };

  // Computed preset info display
  presetInfo = computed(() => this.presetDescriptions[this.selectedPreset()]);

  // Get active fields for code example
  getPresetFields(): string {
    const preset = this.selectedPreset();

    // Core fields are always included
    const coreFields = [
      '- number (required, with credit card validation)',
      '- expiry (required, with MM/YY format validation)',
      '- cvc (required, with numeric validation)',
      '- name (required, cardholder name)',
    ];

    // Add preset-specific fields
    const presetFields: string[] = (() => {
      if (preset === 'us') {
        return [
          '- country (required, with country code validation)',
          '- postalCode (required, with postal code validation)',
        ];
      }
      if (preset === 'billing') {
        return [
          '- addressLine1 (required, billing address line 1)',
          '- addressLine2 (optional, apartment/suite)',
          '- city (required, billing city)',
          '- state (required, billing state)',
          '- postalCode (required, billing postal code)',
          '- country (required, billing country)',
        ];
      }
      if (preset === 'contact') {
        return [
          '- email (required, with email validation)',
          '- phone (required, with phone validation)',
        ];
      }
      return [];
    })();

    return [...coreFields, ...presetFields].join('\n');
  }

  // Code example showing createCardFormGroup usage
  get codeExample(): string {
    return `// Import the helper function
import { createCardFormGroup } from '@keeratita/card/angular';

// Create form group with preset
// The form will automatically include the correct fields
// and validators based on the preset you choose
const form = createCardFormGroup({ preset: '${this.selectedPreset()}' });

// The form includes these fields:
${this.getPresetFields()}`;
  }

  // Set preset and recreate form with new preset
  setPreset(preset: CardFormPreset): void {
    this.selectedPreset.set(preset);
    this.recreateFormWithPreset(preset);
    this.token.set(null);
    this.error.set(null);
  }

  // Handle country selection from kg-country-select
  onCountryChange(event: { name: string; value: string }): void {
    this.form.get(event.name)?.setValue(event.value);
    this.form.get(event.name)?.markAsTouched();
  }

  // Card number input handler - formats with spacing based on card type
  onCardNumberInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = formatCardNumber(input.value);
  }

  // Expiry input handler - formats as MM / YY
  onExpiryInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    input.value = formatExpiry(input.value);
  }

  // Save code example shortcut
  onSaveCodeExample(event: Event): void {
    event.preventDefault();
    navigator.clipboard.writeText(this.codeExample);
    alert('Code example copied to clipboard!');
  }

  getActiveAdapter(): StripeAdapter | OmiseAdapter {
    return this.selectedAdapter() === 'stripe'
      ? this.stripeAdapter
      : this.omiseAdapter;
  }

  async onSubmit(): Promise<void> {
    const formValue = this.getFormValue();

    // Check if form is valid
    if (this.form.invalid) {
      this.error.set('Please fill in all required fields.');
      return;
    }

    this.processing.set(true);
    this.error.set(null);
    this.token.set(null);

    try {
      // Extract card data from form
      const card = {
        number: formValue.number || '',
        expMonth: formValue.expiry?.split('/')?.[0]?.trim() || '',
        expYear: formValue.expiry?.split('/')?.[1]?.trim() || '',
        cvc: formValue.cvc || '',
        name: formValue.name || '',
        // Include optional fields (always available)
        ...(formValue.country && { country: formValue.country }),
        ...(formValue.postalCode && { postalCode: formValue.postalCode }),
        ...(formValue.email && { email: formValue.email }),
        ...(formValue.phone && { phone: formValue.phone }),
        ...(formValue.addressLine1 && { addressLine1: formValue.addressLine1 }),
        ...(formValue.addressLine2 && { addressLine2: formValue.addressLine2 }),
        ...(formValue.city && { city: formValue.city }),
        ...(formValue.state && { state: formValue.state }),
      };

      // Tokenize with the selected adapter
      const adapter = this.getActiveAdapter();
      const result = await adapter.tokenize(card);
      this.token.set(result);
    } catch (err) {
      this.error.set(
        err instanceof Error ? err.message : 'An unexpected error occurred.',
      );
    } finally {
      this.processing.set(false);
    }
  }
}
