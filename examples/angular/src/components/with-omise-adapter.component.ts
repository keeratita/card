/**
 * Card Form with Omise Adapter Example - Angular (Latest Syntax)
 *
 * This example demonstrates how to integrate the card form with Omise payment gateway.
 * Omise is a popular payment gateway in Southeast Asia.
 */

import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { type Token } from '@keeratita/card';
import { formatCardNumber, formatExpiry } from '@keeratita/card/angular';
import { stripeAdapter, omiseAdapter } from '../shared/adapters';

@Component({
  selector: 'app-card-form-with-omise',
  standalone: true,
  imports: [ReactiveFormsModule],
  styles: [
    `
      .container {
        max-width: 480px;
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
        font-family: 'SF Mono', Monaco, Consolas, monospace;
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
      .submit-btn {
        width: 100%;
        padding: 16px 20px;
        background-color: #f05138;
        color: white;
        border: none;
        border-radius: 9999px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        margin-top: 8px;
        box-shadow: 0 8px 20px rgba(240, 81, 56, 0.35);
      }
      .submit-btn:hover:not(:disabled) {
        background-color: #d64530;
        box-shadow: 0 10px 24px rgba(240, 81, 56, 0.45);
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
      <h2>Payment with Omise</h2>
      <p class="subtitle">
        Secure payment integration using Omise payment gateway.
      </p>

      @if (token()) {
        <div class="success-msg">
          <strong>✓ Success!</strong> Token received: {{ token()?.id }}
        </div>
      }

      @if (error()) {
        <div class="error-msg"><strong>⚠ Error:</strong> {{ error() }}</div>
      }

      <form [formGroup]="form" (ngSubmit)="handleSubmit()">
        <div class="form-group">
          <label>Card Number</label>
          <input
            type="text"
            formControlName="cardNumber"
            placeholder="1234 5678 1234 5678"
            (input)="onCardNumberInput($event)"
            [class.invalid]="
              form.get('cardNumber')?.invalid && form.get('cardNumber')?.touched
            "
          />
        </div>

        <div class="form-group">
          <label>Expiry Date</label>
          <input
            type="text"
            formControlName="cardExpiry"
            placeholder="MM / YY"
            (input)="onExpiryInput($event)"
            [class.invalid]="
              form.get('cardExpiry')?.invalid && form.get('cardExpiry')?.touched
            "
          />
        </div>

        <div class="form-group">
          <label>CVC</label>
          <input
            type="text"
            formControlName="cardCvc"
            placeholder="123"
            [class.invalid]="
              form.get('cardCvc')?.invalid && form.get('cardCvc')?.touched
            "
          />
        </div>

        <button
          type="submit"
          class="submit-btn"
          [disabled]="form.invalid || isProcessing()"
        >
          {{ isProcessing() ? 'Processing...' : 'Pay with Omise' }}
        </button>
      </form>

      <div class="code-section">
        <h4>Code Example</h4>
        <pre>{{ codeExample }}</pre>
      </div>
    </div>
  `,
})
export class CardFormWithOmiseComponent {
  private fb = inject(FormBuilder);
  form = this.fb.group({
    cardNumber: ['', Validators.required],
    cardExpiry: ['', Validators.required],
    cardCvc: ['', Validators.required],
  });
  token = signal<Token | null>(null);
  error = signal<string | null>(null);
  isProcessing = signal(false);
  omiseAdapter = omiseAdapter

  codeExample = `// Import the Omise adapter

// Create Omise adapter instance
const omiseAdapter = omiseAdapter

// Use in your form submission
async function handleSubmit(data) {
  const token = await omiseAdapter.createToken(data);
  console.log('Token:', token.id);
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

  async handleSubmit() {
    if (this.form.invalid) return;

    this.isProcessing.set(true);
    this.error.set(null);

    try {
      const formValue = this.form.value;
      const card = {
        number: formValue.cardNumber || '',
        expMonth: formValue.cardExpiry?.split('/')?.[0]?.trim() || '',
        expYear: formValue.cardExpiry?.split('/')?.[1]?.trim() || '',
        cvc: formValue.cardCvc || '',
        name: '',
      };

      const result = await this.omiseAdapter.tokenize(card);
      this.token.set(result);
    } catch (err) {
      this.error.set(
        err instanceof Error ? err.message : 'An unexpected error occurred.',
      );
    } finally {
      this.isProcessing.set(false);
    }
  }
}

// Alternative: Using with Stripe adapter
@Component({
  selector: 'app-card-form-with-stripe',
  standalone: true,
  imports: [ReactiveFormsModule],
  styles: [
    `
      .container {
        max-width: 480px;
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
        font-family: 'SF Mono', Monaco, Consolas, monospace;
      }
      input:focus {
        outline: none;
        border-color: #635bff;
        box-shadow: 0 0 0 3px rgba(99, 91, 255, 0.12);
      }
      input.invalid {
        border-color: #ff453a;
        background-color: rgba(255, 69, 58, 0.08);
      }
      input::placeholder {
        color: rgba(255, 255, 255, 0.2);
      }
      .submit-btn {
        width: 100%;
        padding: 16px 20px;
        background-color: #635bff;
        color: white;
        border: none;
        border-radius: 9999px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        margin-top: 8px;
        box-shadow: 0 8px 20px rgba(99, 91, 255, 0.35);
      }
      .submit-btn:hover:not(:disabled) {
        background-color: #544de6;
        box-shadow: 0 10px 24px rgba(99, 91, 255, 0.45);
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
      <h2>Payment with Stripe</h2>
      <p class="subtitle">Fast and secure checkout powered by Stripe.</p>

      @if (token()) {
        <div class="success-msg">
          <strong>✓ Payment successful!</strong>
        </div>
      }

      <form [formGroup]="form" (ngSubmit)="handleSubmit()">
        <div class="form-group">
          <label>Card Number</label>
          <input
            type="text"
            formControlName="cardNumber"
            placeholder="4242 4242 4242 4242"
            (input)="onCardNumberInput($event)"
            [class.invalid]="
              form.get('cardNumber')?.invalid && form.get('cardNumber')?.touched
            "
          />
        </div>

        <div class="form-group">
          <label>Expiry Date</label>
          <input
            type="text"
            formControlName="cardExpiry"
            placeholder="MM / YY"
            (input)="onExpiryInput($event)"
            [class.invalid]="
              form.get('cardExpiry')?.invalid && form.get('cardExpiry')?.touched
            "
          />
        </div>

        <div class="form-group">
          <label>CVC</label>
          <input
            type="text"
            formControlName="cardCvc"
            placeholder="123"
            [class.invalid]="
              form.get('cardCvc')?.invalid && form.get('cardCvc')?.touched
            "
          />
        </div>

        <button
          type="submit"
          class="submit-btn"
          [disabled]="form.invalid || isProcessing()"
        >
          {{ isProcessing() ? 'Processing...' : 'Complete Purchase' }}
        </button>
      </form>

      <div class="code-section">
        <h4>Code Example</h4>
        <pre>{{ codeExample }}</pre>
      </div>
    </div>
  `,
})
export class CardFormWithStripeComponent {
  private fb = inject(FormBuilder);
  form = this.fb.group({
    cardNumber: ['', Validators.required],
    cardExpiry: ['', Validators.required],
    cardCvc: ['', Validators.required],
  });
  token = signal<Token | null>(null);
  error = signal<string | null>(null);
  isProcessing = signal(false);
  stripeAdapter = stripeAdapter

  codeExample = `// Import the Stripe adapter

// Create Stripe adapter instance
const stripeAdapter = stripeAdapter

// Use in your form submission
async function handleSubmit(data) {
  const token = await stripeAdapter.createToken(data);
  console.log('Token:', token.id);
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

  async handleSubmit() {
    if (this.form.invalid) return;

    this.isProcessing.set(true);

    try {
      const formValue = this.form.value;
      const card = {
        number: formValue.cardNumber || '',
        expMonth: formValue.cardExpiry?.split('/')?.[0]?.trim() || '',
        expYear: formValue.cardExpiry?.split('/')?.[1]?.trim() || '',
        cvc: formValue.cardCvc || '',
        name: '',
      };

      const result = await this.stripeAdapter.tokenize(card);
      this.token.set(result);
    } catch (err) {
      this.error.set(
        err instanceof Error ? err.message : 'An unexpected error occurred.',
      );
    } finally {
      this.isProcessing.set(false);
    }
  }
}

export default CardFormWithOmiseComponent;
