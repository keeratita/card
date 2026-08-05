/**
 * Directives Demo Example - Angular (Latest Syntax)
 *
 * This example demonstrates how to use individual directives for
 * custom form layouts and field-by-field control.
 *
 * The directives (CardNumberDirective, CardExpiryDirective, CardCvcDirective)
 * are available from @keeratita/card/angular for use in your own components.
 *
 * Note: This example uses the library's validators for form validation.
 * The directives can be imported and used in your own projects for
 * automatic input formatting (card number spacing, expiry MM/YY format, CVC masking).
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
  selector: 'app-directives-demo',
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
        color: #ffffff;
        margin: 0 0 8px 0;
      }
      .subtitle {
        color: rgba(255, 255, 255, 0.55);
        margin: 0 0 24px 0;
        font-size: 15px;
      }
      .info-box {
        background-color: rgba(10, 132, 255, 0.08);
        padding: 16px;
        border-radius: 12px;
        margin-bottom: 20px;
        border: 1px solid rgba(10, 132, 255, 0.25);
        color: #0a84ff;
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
      }
      .info-box strong {
        display: block;
        margin-bottom: 8px;
      }
      .info-box pre {
        background-color: rgba(255, 255, 255, 0.05);
        padding: 12px;
        border-radius: 8px;
        font-size: 12px;
        overflow-x: auto;
        margin: 12px 0 0 0;
        color: rgba(255, 255, 255, 0.7);
        font-family: 'SF Mono', Monaco, Consolas, monospace;
        line-height: 1.5;
      }
      .success-msg {
        padding: 16px;
        background-color: rgba(48, 209, 88, 0.1);
        border-radius: 8px;
        margin-bottom: 20px;
        border: 1px solid rgba(48, 209, 88, 0.25);
        color: #30d158;
      }
      .error-msg {
        padding: 16px;
        background-color: rgba(255, 69, 58, 0.1);
        border-radius: 8px;
        margin-bottom: 20px;
        border: 1px solid rgba(255, 69, 58, 0.25);
        color: #ff453a;
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
      <h2>Directives Demo</h2>
      <p class="subtitle">Use individual directives for custom form layouts.</p>

      <!-- Info Box -->
      <div class="info-box">
        <strong>ℹ️ How to use the directives:</strong>
        <pre>{{ directiveUsage }}</pre>
      </div>

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

      <!-- Custom Form Layout -->
      <form [formGroup]="form" (ngSubmit)="onSubmit()">
        <!-- Card Number Field -->
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

        <!-- Expiry and CVC Row -->
        <div class="input-grid">
          <!-- Expiry Field -->
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

          <!-- CVC Field -->
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

        <!-- Cardholder Name Field -->
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
        <h4>Code Example</h4>
        <pre>{{ codeExample }}</pre>
      </div>
    </div>
  `,
})
export class DirectivesDemoComponent {
  form = createCardFormGroup();

  token = signal<{ id: string } | null>(null);
  error = signal<string | null>(null);
  processing = signal(false);

  stripeAdapter = stripeAdapter;

  directiveUsage = `// Import the directives from the library
import {
  CardNumberDirective,
  CardExpiryDirective,
  CardCvcDirective
} from '@keeratita/card/angular';

// Add to your component imports
@Component({
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CardNumberDirective,  // Auto-formats: 4242 4242 4242 4242
    CardExpiryDirective,  // Auto-formats: MM / YY
    CardCvcDirective      // Auto-masks: 3 or 4 digits based on card brand
  ],
  template: \`
    <input formControlName="cardNumber" kgCardNumber placeholder="4242..." />
    <input formControlName="expiry" kgCardExpiry placeholder="MM/YY" />
    <input formControlName="cvc" kgCardCvc 
           [kgCardCvcNumber]="cardNumber" placeholder="123" />
  \`
})`;

  codeExample = `// Complete example of using the library's directives

import { Component } from '@angular/core';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import {
  CardNumberDirective,
  CardExpiryDirective,
  CardCvcDirective,
  creditCardValidator,
  expiryValidator,
  cvcValidator
} from '@keeratita/card/angular';

@Component({
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CardNumberDirective,
    CardExpiryDirective,
    CardCvcDirective
  ],
  template: \`
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <!-- Card number with automatic formatting (4-4-4-4 or 4-6-5 for Amex) -->
      <input
        type="text"
        formControlName="cardNumber"
        kgCardNumber
        placeholder="4242 4242 4242 4242"
      />

      <!-- Expiry with automatic MM / YY formatting -->
      <input
        type="text"
        formControlName="expiry"
        kgCardExpiry
        placeholder="MM/YY"
      />

      <!-- CVC with automatic masking (3 digits for most cards, 4 for Amex) -->
      <input
        type="text"
        formControlName="cvc"
        kgCardCvc
        [kgCardCvcNumber]="form.get('cardNumber')?.value"
        placeholder="123"
      />

      <button type="submit">Pay Now</button>
    </form>
  \`
})
export class MyComponent {
  form = this.fb.group({
    cardNumber: ['', [Validators.required, creditCardValidator()]],
    expiry: ['', [Validators.required, expiryValidator()]],
    cvc: ['', [Validators.required, cvcValidator('cardNumber')]]
  });
}`;

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
