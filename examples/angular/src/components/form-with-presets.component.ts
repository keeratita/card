/**
 * Form with Presets Example - Angular (Latest Syntax)
 *
 * This example demonstrates how to use different form presets and
 * customize the form fields based on your requirements.
 */

import { Component, signal, inject, computed, ChangeDetectorRef } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { createCardFormGroup, formatCardNumber, formatExpiry } from '@keeratita/card/angular';
import {
  StripeAdapter,
  OmiseAdapter,
  type CardFormPreset,
} from '@keeratita/card';

@Component({
  selector: 'app-form-with-presets',
  standalone: true,
  imports: [ReactiveFormsModule],
  styles: [
    `
      .container {
        max-width: 800px;
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
      .section-label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
        color: #24292e;
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
      select {
        width: 100%;
        padding: 12px 14px;
        border-radius: 6px;
        border: 1px solid #d0d7de;
        font-size: 15px;
        background-color: #fff;
        cursor: pointer;
      }
      select:focus {
        outline: none;
        border-color: #0366d6;
        box-shadow: 0 0 0 3px rgba(3, 102, 214, 0.1);
      }
      .preset-desc {
        font-size: 13px;
        color: #586069;
        margin: 4px 0 0 0;
      }
      .success-msg {
        padding: 16px;
        background-color: #f0fdf4;
        border-radius: 8px;
        margin-bottom: 20px;
        border: 1px solid #bbf7d0;
        color: #166534;
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
        margin-top: 20px;
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
      <h2>Form with Presets</h2>
      <p class="subtitle">
        Use createCardFormGroup() with different presets to automatically include the right fields and validators.
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
        <div class="config-section" style="background-color: #fff8c5; border: 1px solid #f1c40f;">
          <h3 style="color: #856404; margin: 0 0 8px 0;">Current Preset: {{ selectedPreset() }}</h3>
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
          <div class="form-group">
            <label>Country</label>
            <input
              type="text"
              formControlName="country"
              placeholder="US"
            />
          </div>
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
              <input type="text" formControlName="city" placeholder="New York" />
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
            <div class="form-group">
              <label>Country</label>
              <input
                type="text"
                formControlName="country"
                placeholder="US"
              />
            </div>
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
  stripeAdapter = new StripeAdapter({
    publicKey: 'pk_test_stripe_integrated_demo_key',
  });
  omiseAdapter = new OmiseAdapter({
    publicKey: 'pkey_test_omise_integrated_demo_key',
  });

  cdr = inject(ChangeDetectorRef);

  // Form is created using createCardFormGroup helper
  // Using 'any' type to avoid type mismatch between library and example node_modules
  form: any = createCardFormGroup({ preset: 'none' });

  // Update form when preset changes
  private updateForm(): void {
    this.form = createCardFormGroup({ preset: this.selectedPreset() });
    this.cdr.markForCheck();
  }

  // Preset descriptions for UI
  presetDescriptions: Record<CardFormPreset, string> = {
    none: 'Core fields: Card Number, Expiry, CVC, Cardholder Name',
    us: 'Core fields + Country + Postal Code for US-specific forms',
    billing: 'Core fields + Full address (addressLine1, addressLine2, city, state, postalCode, country)',
    contact: 'Core fields + Email + Phone for customer contact information',
  };

  // Computed preset info display
  presetInfo = computed(() => this.presetDescriptions[this.selectedPreset()]);

  // Get active fields for code example
  getPresetFields(): string {
    const preset = this.selectedPreset();
    const fields: string[] = [];
    
    // Core fields are always included
    fields.push('- number (required, with credit card validation)');
    fields.push('- expiry (required, with MM/YY format validation)');
    fields.push('- cvc (required, with numeric validation)');
    fields.push('- name (required, cardholder name)');
    
    // Add preset-specific fields
    if (preset === 'us') {
      fields.push('- country (required, with country code validation)');
      fields.push('- postalCode (required, with postal code validation)');
    } else if (preset === 'billing') {
      fields.push('- addressLine1 (required, billing address line 1)');
      fields.push('- addressLine2 (optional, apartment/suite)');
      fields.push('- city (required, billing city)');
      fields.push('- state (required, billing state)');
      fields.push('- postalCode (required, billing postal code)');
      fields.push('- country (required, billing country)');
    } else if (preset === 'contact') {
      fields.push('- email (required, with email validation)');
      fields.push('- phone (required, with phone validation)');
    }
    
    return fields.join('\n');
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
        err instanceof Error ? err.message : 'An unexpected error occurred.'
      );
    } finally {
      this.processing.set(false);
    }
  }
}
