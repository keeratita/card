/**
 * Form with Presets Example - Angular (Latest Syntax)
 *
 * This example demonstrates how to use different form presets and
 * customize the form fields based on your requirements.
 */

import {
  Component,
  signal,
  inject,
  computed,
  ChangeDetectorRef,
} from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import {
  createCardFormGroup,
  updateCardFormGroup,
  formatCardNumber,
  formatExpiry,
} from '@keeratita/card/angular';
import { CountrySelectComponent } from './country-select.component';
import {
  StripeAdapter,
  OmiseAdapter,
  type CardFormPreset,
} from '@keeratita/card';
import { stripeAdapter, omiseAdapter } from '../shared/adapters';

@Component({
  selector: 'app-form-with-presets',
  standalone: true,
  imports: [ReactiveFormsModule, CountrySelectComponent],
  styles: [
    `
      .container {
        max-width: 800px;
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
      .config-section {
        background-color: rgba(255, 255, 255, 0.03);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        padding: 20px;
        border-radius: 12px;
        margin-bottom: 24px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
      }
      .config-section h3 {
        margin: 0 0 16px 0;
        font-size: 16px;
        font-weight: 600;
        color: #ffffff;
      }
      .section-label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.55);
        font-size: 14px;
      }
      .gateway-buttons {
        display: flex;
        gap: 8px;
        margin-bottom: 16px;
      }
      .gateway-btn {
        flex: 1;
        padding: 10px 16px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 8px;
        background-color: rgba(255, 255, 255, 0.05);
        cursor: pointer;
        font-weight: 500;
        font-size: 14px;
        color: rgba(255, 255, 255, 0.55);
        transition: all 0.15s ease;
      }
      .gateway-btn:hover {
        color: #ffffff;
        background-color: rgba(255, 255, 255, 0.08);
      }
      .gateway-btn.active {
        border-color: #0a84ff;
        background-color: rgba(10, 132, 255, 0.12);
        color: #0a84ff;
      }
      select {
        width: 100%;
        padding: 12px 14px;
        border-radius: 8px;
        border: 1.5px solid rgba(255, 255, 255, 0.1);
        font-size: 15px;
        background-color: rgba(255, 255, 255, 0.05);
        cursor: pointer;
        color: #ffffff;
        font-family: inherit;
      }
      select:focus {
        outline: none;
        border-color: #0a84ff;
        box-shadow: 0 0 0 3px rgba(10, 132, 255, 0.12);
      }
      select option {
        background-color: rgba(10, 11, 14, 0.95);
        color: #ffffff;
      }
      .preset-desc {
        font-size: 13px;
        color: rgba(255, 255, 255, 0.55);
        margin: 4px 0 0 0;
      }
      .success-msg {
        padding: 16px;
        background-color: rgba(48, 209, 88, 0.1);
        border-radius: 8px;
        margin-bottom: 20px;
        border: 1px solid rgba(48, 209, 88, 0.25);
        color: #30d158;
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
        color: rgba(255, 255, 255, 0.55);
        font-size: 14px;
      }
      input {
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
      input:focus {
        outline: none;
        border-color: #0a84ff;
        box-shadow: 0 0 0 3px rgba(10, 132, 255, 0.12);
      }
      input.invalid {
        border-color: #ff453a;
        background-color: rgba(255, 69, 58, 0.08);
      }
      input::placeholder {
        color: rgba(255, 255, 255, 0.2);
      }
      .input-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        margin-bottom: 16px;
      }
      .error-text {
        color: #ff453a;
        font-size: 13px;
        margin-top: 4px;
      }
      .submit-btn {
        width: 100%;
        padding: 16px 20px;
        background-color: #0a84ff;
        color: white;
        border: none;
        border-radius: 9999px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        margin-top: 20px;
        box-shadow: 0 8px 20px rgba(10, 132, 255, 0.35);
      }
      .submit-btn:hover:not(:disabled) {
        opacity: 0.95;
        box-shadow: 0 10px 24px rgba(10, 132, 255, 0.45);
        transform: translateY(-1px);
      }
      .submit-btn:disabled {
        background-color: rgba(255, 255, 255, 0.05);
        color: rgba(255, 255, 255, 0.55);
        box-shadow: none;
        cursor: not-allowed;
        transform: none;
      }
      .code-section {
        margin-top: 32px;
        padding: 20px;
        background-color: rgba(255, 255, 255, 0.03);
        border-radius: 12px;
        overflow-x: auto;
        border: 1px solid rgba(255, 255, 255, 0.08);
      }
      .code-section h4 {
        color: #ffffff;
        margin: 0 0 12px 0;
        font-size: 14px;
        font-weight: 600;
      }
      .code-section pre {
        color: rgba(255, 255, 255, 0.7);
        font-size: 12px;
        margin: 0;
        line-height: 1.6;
        font-family: 'SF Mono', Monaco, Consolas, monospace;
      }
    `,
  ],
  template: `
    <div class="container">
      <h2>Form with Presets</h2>
      <p class="subtitle">
        Use createCardFormGroup() with different presets to automatically
        include the right fields and validators.
      </p>

      <!-- Configuration Panel -->
      <div class="config-section">
        <h3>Configuration</h3>

        <!-- Payment Gateway Selection -->
        <div class="section-label">Payment Gateway</div>
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

        <!-- Preset Selection -->
        <div class="section-label">Form Preset</div>
        <select [value]="selectedPreset()" (change)="onPresetChange($event)">
          <option value="none">None (Core fields only)</option>
          <option value="us">US Cardholder (ZIP Code)</option>
          <option value="billing">Full Billing Address</option>
          <option value="contact">Contact Details</option>
        </select>
        <p class="preset-desc">
          {{ getPresetDescription() }}
        </p>
      </div>

      <!-- Preset Info Box -->
      @if (presetInfo()) {
        <div
          class="config-section"
          style="background-color: rgba(10, 132, 255, 0.08); border: 1px solid rgba(10, 132, 255, 0.25);"
        >
          <h3 style="color: #0a84ff; margin: 0 0 8px 0;">
            Current Preset: {{ selectedPreset() }}
          </h3>
          <p style="margin: 0; color: rgba(255, 255, 255, 0.55); font-size: 14px;">
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

      <!-- Card Form - Uses createCardFormGroup with selected preset -->
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

        <!-- US Preset Fields -->
        @if (selectedPreset() === 'us') {
            <kg-country-select
              controlName="country"
              [value]="form.get('country')?.value || ''"
              [preset]="selectedPreset()"
              [invalid]="!!form.get('country')?.invalid && !!form.get('country')?.touched"
              (countryChange)="onCountryChange($event)"
            />
          <div class="form-group">
            <label>Postal Code</label>
            <input
              type="text"
              formControlName="postalCode"
              placeholder="10001"
            />
          </div>
        }

        <!-- Billing Preset Fields -->
        @if (selectedPreset() === 'billing') {
          <div class="form-group">
            <label>Address Line 1</label>
            <input
              type="text"
              formControlName="addressLine1"
              placeholder="123 Main St"
            />
          </div>
          <div class="form-group">
            <label>Address Line 2 (Optional)</label>
            <input
              type="text"
              formControlName="addressLine2"
              placeholder="Apt, suite, etc."
            />
          </div>
          <div class="input-grid">
            <div class="form-group">
              <label>City</label>
              <input
                type="text"
                formControlName="city"
                placeholder="New York"
              />
            </div>
            <div class="form-group">
              <label>State</label>
              <input type="text" formControlName="state" placeholder="NY" />
            </div>
          </div>
          <div class="input-grid">
            <div class="form-group">
              <label>Postal Code</label>
              <input
                type="text"
                formControlName="postalCode"
                placeholder="10001"
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

        <!-- Contact Preset Fields -->
        @if (selectedPreset() === 'contact') {
          <div class="form-group">
            <label>Email</label>
            <input
              type="email"
              formControlName="email"
              placeholder="john@example.com"
            />
          </div>
          <div class="form-group">
            <label>Phone</label>
            <input
              type="tel"
              formControlName="phone"
              placeholder="+1 (555) 123-4567"
            />
          </div>
        }

        <button
          type="submit"
          [disabled]="form.invalid || processing()"
          class="submit-btn"
        >
          {{ processing() ? 'Processing...' : 'Submit Payment' }}
        </button>
      </form>

      <!-- Code Example -->
      <div class="code-section">
        <h4>Code Example - Using createCardFormGroup</h4>
        <pre>{{ codeExample }}</pre>
      </div>
    </div>
  `,
})
export class FormWithPresetsComponent {
  fb = inject(FormBuilder);

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

  // Form is created using createCardFormGroup helper
  // Using 'any' type to avoid type mismatch between library and example node_modules
  form: any = createCardFormGroup({ preset: 'none' });

  // Update form when preset changes
  private updateForm(): void {
    // Update validators in-place rather than replacing this.form.
    // Replacing the FormGroup reference causes Angular's FormGroupDirective to
    // teardown/rebuild all formControlName bindings in the same CD pass that
    // signal-driven @if blocks use — producing "Cannot find control" errors.
    updateCardFormGroup(this.form, { preset: this.selectedPreset(), resetValues: true });
    this.cdr.markForCheck();
  }

  // Preset descriptions for UI
  presetDescriptions: Record<CardFormPreset, string> = {
    none: 'Core fields: Card Number, Expiry, CVC, Cardholder Name',
    us: 'Core fields + Country + Postal Code for US-specific forms',
    billing:
      'Core fields + Full address (addressLine1, addressLine2, city, state, postalCode, country)',
    contact: 'Core fields + Email + Phone for customer contact information',
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

    // Preset-specific fields defined as arrays
    const presetFieldsMap: Record<CardFormPreset, string[]> = {
      none: [],
      us: [
        '- country (required, with country code validation)',
        '- postalCode (required, with postal code validation)',
      ],
      billing: [
        '- addressLine1 (required, billing address line 1)',
        '- addressLine2 (optional, apartment/suite)',
        '- city (required, billing city)',
        '- state (required, billing state)',
        '- postalCode (required, billing postal code)',
        '- country (required, billing country)',
      ],
      contact: [
        '- email (required, with email validation)',
        '- phone (required, with phone validation)',
      ],
    };

    return [...coreFields, ...presetFieldsMap[preset]].join('\n');
  }

  getActiveAdapter(): StripeAdapter | OmiseAdapter {
    return this.selectedAdapter() === 'stripe'
      ? this.stripeAdapter
      : this.omiseAdapter;
  }

  getPresetDescription(): string {
    return this.presetDescriptions[this.selectedPreset()];
  }

  onPresetChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as CardFormPreset;
    this.selectedPreset.set(value);
    this.updateForm();
    this.token.set(null);
    this.error.set(null);
  }

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

  async onSubmit(): Promise<void> {
    const formValue = this.form.value;

    // Check if form is valid
    if (!formValue || this.form.invalid) {
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
        // Include optional fields if they exist in the form
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
