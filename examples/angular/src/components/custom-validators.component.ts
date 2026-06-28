/**
 * Custom Validators Example - Angular (Latest Syntax)
 *
 * This example demonstrates how to use custom validators with the card form.
 */

import { Component, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  createCardFormGroup,
  formatCardNumber,
  formatExpiry,
} from '@keeratita/card/angular';
import { stripeAdapter } from '../shared/adapters';

@Component({
  selector: 'app-custom-validators',
  standalone: true,
  imports: [ReactiveFormsModule],
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
      <h2>Custom Validators</h2>
      <p class="subtitle">
        Use built-in validators or create your own custom validation logic.
      </p>

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
          @if (form.get('number')?.errors?.['invalidCard']) {
            <small class="error-text">Card number failed validation</small>
          }
        </div>

        <!-- Expiry -->
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
          @if (form.get('expiry')?.errors?.['invalidExpiry']) {
            <small class="error-text">Please enter a valid expiry date</small>
          }
        </div>

        <!-- CVC -->
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
          @if (form.get('cvc')?.errors?.['invalidCvc']) {
            <small class="error-text">Please enter a valid CVC</small>
          }
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
          @if (form.get('name')?.errors?.['invalidName']) {
            <small class="error-text">Please enter a valid name</small>
          }
        </div>

        <!-- Email with custom validator -->
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
          @if (form.get('email')?.errors?.['invalidEmail']) {
            <small class="error-text">Please enter a valid email</small>
          }
        </div>

        <!-- Postal Code with custom validator -->
        <div class="form-group">
          <label>Postal Code</label>
          <input
            type="text"
            formControlName="postalCode"
            placeholder="10001"
            [class.invalid]="
              form.get('postalCode')?.invalid && form.get('postalCode')?.touched
            "
          />
          @if (form.get('postalCode')?.errors?.['invalidPostalCode']) {
            <small class="error-text">Please enter a valid postal code</small>
          }
        </div>

        <button
          type="submit"
          [disabled]="form.invalid || processing()"
          class="submit-btn"
        >
          {{ processing() ? 'Processing...' : 'Submit' }}
        </button>
      </form>

      <!-- Code Example -->
      <div class="code-section">
        <h4>Code Example</h4>
        <pre>{{ codeExample }}</pre>
      </div>
    </div>
  `,
})
export class CustomValidatorsComponent {
  form = createCardFormGroup({ preset: 'billing', fields: ['email', 'postalCode'] });

  token = signal<{ id: string } | null>(null);
  error = signal<string | null>(null);
  processing = signal(false);

  stripeAdapter = stripeAdapter

  codeExample = `// Import the helper function
import { createCardFormGroup } from '@keeratita/card/angular';

// Create form group with preset and custom fields
// The form will automatically include the correct fields
// and validators based on the preset you choose
const form = createCardFormGroup({ preset: 'billing', fields: ['email', 'postalCode'] });

// The form includes these fields:
// - number (required, with credit card validation)
// - expiry (required, with MM/YY format validation)
// - cvc (required, with numeric validation)
// - name (required, cardholder name)
// - addressLine1 (required, billing address line 1)
// - addressLine2 (optional, apartment/suite)
// - city (required, billing city)
// - state (required, billing state)
// - postalCode (required, billing postal code)
// - country (required, billing country)
// - email (required, with email validation)
// - phone (required, with phone validation)`;

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

  async onSubmit() {
    if (this.form.invalid) return;

    this.processing.set(true);
    this.error.set(null);

    try {
      const formValue = this.form.value;
      const card = {
        number: formValue.number || '',
        expMonth: formValue.expiry?.split('/')?.[0]?.trim() || '',
        expYear: formValue.expiry?.split('/')?.[1]?.trim() || '',
        cvc: formValue.cvc || '',
        name: formValue.name || '',
      };

      const result = await this.stripeAdapter.tokenize(card);
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
