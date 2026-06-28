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
        font-family: 'SF Mono', Monaco, Consolas, monospace;
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
      .submit-btn {
        width: 100%;
        padding: 14px;
        background-color: #f05138;
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s ease;
        margin-top: 8px;
      }
      .submit-btn:hover:not(:disabled) {
        background-color: #d64530;
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
        font-family: 'SF Mono', Monaco, Consolas, monospace;
      }
      input:focus {
        outline: none;
        border-color: #635bff;
        box-shadow: 0 0 0 3px rgba(99, 91, 255, 0.1);
      }
      input.invalid {
        border-color: #cf222e;
      }
      input::placeholder {
        color: #6e7781;
      }
      .submit-btn {
        width: 100%;
        padding: 14px;
        background-color: #635bff;
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 15px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.15s ease;
        margin-top: 8px;
      }
      .submit-btn:hover:not(:disabled) {
        background-color: #544de6;
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
