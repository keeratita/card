/**
 * Card Form with Custom Styling Example
 *
 * This example demonstrates how to customize the appearance of the card form
 * to match your application's design system.
 */

import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { type Token } from '@keeratita/card';
import { formatCardNumber, formatExpiry } from '@keeratita/card/angular';
import { stripeAdapter } from '../shared/adapters';

// Dark theme example
@Component({
  selector: 'app-dark-theme-card-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="dark-container">
      <h1>Dark Theme Checkout</h1>

      @if (token()) {
        <div class="success-message">
          <strong>Success!</strong> Token: {{ token()?.id }}
        </div>
      }

      <form [formGroup]="form" (ngSubmit)="handleSubmit()">
        <div class="input-row">
          <label class="ios-label">Card Number</label>
          <input
            type="text"
            formControlName="cardNumber"
            class="ios-input dark-input"
            placeholder="4242 4242 4242 4242"
            (input)="onCardNumberInput($event)"
            [class.invalid]="
              form.get('cardNumber')?.invalid && form.get('cardNumber')?.touched
            "
          />
        </div>

        <div class="input-row">
          <label class="ios-label">Expiry Date</label>
          <input
            type="text"
            formControlName="cardExpiry"
            class="ios-input dark-input"
            placeholder="MM / YY"
            (input)="onExpiryInput($event)"
            [class.invalid]="
              form.get('cardExpiry')?.invalid && form.get('cardExpiry')?.touched
            "
          />
        </div>

        <div class="input-row">
          <label class="ios-label">CVC</label>
          <input
            type="text"
            formControlName="cardCvc"
            class="ios-input dark-input"
            placeholder="123"
            [class.invalid]="
              form.get('cardCvc')?.invalid && form.get('cardCvc')?.touched
            "
          />
        </div>

        <button
          type="submit"
          class="ios-submit dark-submit"
          [disabled]="form.invalid || isProcessing()"
        >
          {{ isProcessing() ? 'Processing...' : 'Pay Now' }}
        </button>
      </form>
    </div>
  `,
  styles: [
    `
      .dark-container {
        background-color: #1a1a2e;
        padding: 40px;
        border-radius: 16px;
        max-width: 400px;
        margin: 0 auto;
      }

      h1 {
        color: #eee;
        text-align: center;
        margin-bottom: 30px;
      }

      .success-message {
        padding: 16px;
        background-color: #10b981;
        border-radius: 8px;
        margin-bottom: 20px;
        color: #fff;
      }

      .input-row {
        margin-bottom: 16px;
      }

      .ios-label {
        display: block;
        margin-bottom: 6px;
        color: #a5b4fc;
        font-size: 14px;
      }

      .ios-input {
        width: 100%;
        padding: 12px;
        border: 1px solid #0f3460;
        border-radius: 8px;
        font-size: 16px;
        box-sizing: border-box;
        font-family: monospace;
      }

      .dark-input {
        background-color: #16213e;
        color: #e94560;
      }

      .ios-input.invalid {
        border-color: #ff3b30;
      }

      .ios-submit {
        width: 100%;
        padding: 14px;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        margin-top: 20px;
      }

      .dark-submit {
        background-color: #e94560;
        color: white;
      }

      .ios-submit:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    `,
  ],
})
export class DarkThemeCardFormComponent {
  private fb = inject(FormBuilder);
  form = this.fb.group({
    cardNumber: ['', Validators.required],
    cardExpiry: ['', Validators.required],
    cardCvc: ['', Validators.required],
  });
  token = signal<Token | null>(null);
  error = signal<string | null>(null);
  isProcessing = signal(false);
  stripeAdapter = stripeAdapter;

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

// Corporate/Enterprise theme
@Component({
  selector: 'app-corporate-card-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="corporate-container">
      <div class="header">
        <div class="icon-box">💳</div>
        <h1>Enterprise Payment</h1>
        <p>Secure & Compliant</p>
      </div>

      @if (token()) {
        <div class="success-message">
          <strong>Payment processed!</strong>
        </div>
      }

      <form [formGroup]="form" (ngSubmit)="handleSubmit()">
        <div class="input-row">
          <label class="ios-label">Card Number</label>
          <input
            type="text"
            formControlName="cardNumber"
            class="ios-input corporate-input"
            placeholder="4242 4242 4242 4242"
            (input)="onCardNumberInput($event)"
            [class.invalid]="
              form.get('cardNumber')?.invalid && form.get('cardNumber')?.touched
            "
          />
        </div>

        <div class="input-row">
          <label class="ios-label">Expiry Date</label>
          <input
            type="text"
            formControlName="cardExpiry"
            class="ios-input corporate-input"
            placeholder="MM / YY"
            (input)="onExpiryInput($event)"
            [class.invalid]="
              form.get('cardExpiry')?.invalid && form.get('cardExpiry')?.touched
            "
          />
        </div>

        <div class="input-row">
          <label class="ios-label">CVC</label>
          <input
            type="text"
            formControlName="cardCvc"
            class="ios-input corporate-input"
            placeholder="123"
            [class.invalid]="
              form.get('cardCvc')?.invalid && form.get('cardCvc')?.touched
            "
          />
        </div>

        <button
          type="submit"
          class="ios-submit corporate-submit"
          [disabled]="form.invalid || isProcessing()"
        >
          {{ isProcessing() ? 'Processing...' : 'Process Payment' }}
        </button>
      </form>

      <p class="security-note">🔒 SSL Encrypted • PCI DSS Compliant</p>
    </div>
  `,
  styles: [
    `
      .corporate-container {
        background-color: #f8fafc;
        padding: 40px;
        border-radius: 12px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        max-width: 400px;
        margin: 0 auto;
      }

      .header {
        text-align: center;
        margin-bottom: 30px;
      }

      .icon-box {
        width: 60px;
        height: 60px;
        background-color: #1e40af;
        border-radius: 12px;
        margin: 0 auto 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
      }

      h1 {
        color: #1e3a8a;
        margin: 0;
      }

      .header p {
        color: #64748b;
        margin: 8px 0 0;
      }

      .success-message {
        padding: 16px;
        background-color: #dcfce7;
        border-radius: 8px;
        margin-bottom: 20px;
        color: #166534;
      }

      .input-row {
        margin-bottom: 16px;
      }

      .ios-label {
        display: block;
        margin-bottom: 6px;
        color: #1e40af;
        font-size: 14px;
      }

      .ios-input {
        width: 100%;
        padding: 12px;
        border: 1px solid #cbd5e1;
        border-radius: 8px;
        font-size: 16px;
        box-sizing: border-box;
        font-family: monospace;
      }

      .corporate-input {
        background-color: #fff;
      }

      .ios-input.invalid {
        border-color: #ff3b30;
      }

      .ios-submit {
        width: 100%;
        padding: 14px;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        margin-top: 20px;
      }

      .corporate-submit {
        background-color: #1e40af;
        color: white;
      }

      .ios-submit:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .security-note {
        text-align: center;
        color: #94a3b8;
        font-size: 12px;
        margin-top: 20px;
      }
    `,
  ],
})
export class CorporateCardFormComponent {
  private fb = inject(FormBuilder);
  form = this.fb.group({
    cardNumber: ['', Validators.required],
    cardExpiry: ['', Validators.required],
    cardCvc: ['', Validators.required],
  });
  token = signal<Token | null>(null);
  error = signal<string | null>(null);
  isProcessing = signal(false);
  stripeAdapter = stripeAdapter;

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

// Gradient/Modern theme
@Component({
  selector: 'app-gradient-card-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="gradient-container">
      <h1>✨ Quick Pay</h1>
      <p>Fast & Secure</p>

      @if (token()) {
        <div class="success-message">
          <strong>✓ Success!</strong>
        </div>
      }

      <form [formGroup]="form" (ngSubmit)="handleSubmit()">
        <div class="input-row">
          <label class="ios-label gradient-label">Card Number</label>
          <input
            type="text"
            formControlName="cardNumber"
            class="ios-input gradient-input"
            placeholder="4242 4242 4242 4242"
            (input)="onCardNumberInput($event)"
            [class.invalid]="
              form.get('cardNumber')?.invalid && form.get('cardNumber')?.touched
            "
          />
        </div>

        <div class="input-row">
          <label class="ios-label gradient-label">Expiry Date</label>
          <input
            type="text"
            formControlName="cardExpiry"
            class="ios-input gradient-input"
            placeholder="MM / YY"
            (input)="onExpiryInput($event)"
            [class.invalid]="
              form.get('cardExpiry')?.invalid && form.get('cardExpiry')?.touched
            "
          />
        </div>

        <div class="input-row">
          <label class="ios-label gradient-label">CVC</label>
          <input
            type="text"
            formControlName="cardCvc"
            class="ios-input gradient-input"
            placeholder="123"
            [class.invalid]="
              form.get('cardCvc')?.invalid && form.get('cardCvc')?.touched
            "
          />
        </div>

        <button
          type="submit"
          class="ios-submit gradient-submit"
          [disabled]="form.invalid || isProcessing()"
        >
          {{ isProcessing() ? 'Processing...' : 'Pay Now' }}
        </button>
      </form>
    </div>
  `,
  styles: [
    `
      .gradient-container {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 40px;
        border-radius: 20px;
        max-width: 400px;
        margin: 0 auto;
      }

      h1 {
        color: #fff;
        text-align: center;
        margin-bottom: 10px;
      }

      p {
        color: rgba(255, 255, 255, 0.8);
        text-align: center;
        margin-bottom: 30px;
      }

      .success-message {
        padding: 16px;
        background-color: rgba(255, 255, 255, 0.2);
        border-radius: 8px;
        margin-bottom: 20px;
        color: #fff;
      }

      .input-row {
        margin-bottom: 16px;
      }

      .ios-label {
        display: block;
        margin-bottom: 6px;
        font-size: 14px;
      }

      .gradient-label {
        color: #fff;
      }

      .ios-input {
        width: 100%;
        padding: 12px;
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 8px;
        font-size: 16px;
        box-sizing: border-box;
        font-family: monospace;
      }

      .gradient-input {
        background-color: rgba(255, 255, 255, 0.9);
      }

      .ios-input.invalid {
        border-color: #ff3b30;
      }

      .ios-submit {
        width: 100%;
        padding: 14px;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        margin-top: 20px;
      }

      .gradient-submit {
        background-color: #fff;
        color: #667eea;
      }

      .ios-submit:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    `,
  ],
})
export class GradientCardFormComponent {
  private fb = inject(FormBuilder);
  form = this.fb.group({
    cardNumber: ['', Validators.required],
    cardExpiry: ['', Validators.required],
    cardCvc: ['', Validators.required],
  });
  token = signal<Token | null>(null);
  error = signal<string | null>(null);
  isProcessing = signal(false);
  stripeAdapter = stripeAdapter;

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

// Minimal theme
@Component({
  selector: 'app-minimal-card-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="minimal-container">
      <h1>Payment</h1>

      @if (token()) {
        <div class="success-message">
          <strong>✓</strong>
        </div>
      }

      <form [formGroup]="form" (ngSubmit)="handleSubmit()">
        <div class="input-row">
          <label class="ios-label minimal-label">Card Number</label>
          <input
            type="text"
            formControlName="cardNumber"
            class="ios-input minimal-input"
            placeholder="4242 4242 4242 4242"
            (input)="onCardNumberInput($event)"
            [class.invalid]="
              form.get('cardNumber')?.invalid && form.get('cardNumber')?.touched
            "
          />
        </div>

        <div class="input-row">
          <label class="ios-label minimal-label">Expiry Date</label>
          <input
            type="text"
            formControlName="cardExpiry"
            class="ios-input minimal-input"
            placeholder="MM / YY"
            (input)="onExpiryInput($event)"
            [class.invalid]="
              form.get('cardExpiry')?.invalid && form.get('cardExpiry')?.touched
            "
          />
        </div>

        <div class="input-row">
          <label class="ios-label minimal-label">CVC</label>
          <input
            type="text"
            formControlName="cardCvc"
            class="ios-input minimal-input"
            placeholder="123"
            [class.invalid]="
              form.get('cardCvc')?.invalid && form.get('cardCvc')?.touched
            "
          />
        </div>

        <button
          type="submit"
          class="ios-submit minimal-submit"
          [disabled]="form.invalid || isProcessing()"
        >
          →
        </button>
      </form>
    </div>
  `,
  styles: [
    `
      .minimal-container {
        padding: 40px;
        max-width: 400px;
        margin: 0 auto;
      }

      h1 {
        font-size: 24px;
        font-weight: 300;
        text-align: center;
        margin-bottom: 30px;
        color: #000;
      }

      .success-message {
        padding: 16px;
        border-bottom: 1px solid #eee;
        margin-bottom: 20px;
        color: #000;
      }

      .input-row {
        margin-bottom: 16px;
      }

      .ios-label {
        display: block;
        margin-bottom: 6px;
        font-size: 14px;
      }

      .minimal-label {
        color: #000;
      }

      .ios-input {
        width: 100%;
        padding: 12px;
        border: 1px solid #eee;
        border-radius: 0;
        font-size: 16px;
        box-sizing: border-box;
        font-family: monospace;
      }

      .minimal-input {
        background-color: transparent;
      }

      .ios-input.invalid {
        border-color: #ff3b30;
      }

      .ios-submit {
        width: 100%;
        padding: 14px;
        border: none;
        border-radius: 0;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        margin-top: 20px;
      }

      .minimal-submit {
        background-color: #000;
        color: #fff;
      }

      .ios-submit:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    `,
  ],
})
export class MinimalCardFormComponent {
  private fb = inject(FormBuilder);
  form = this.fb.group({
    cardNumber: ['', Validators.required],
    cardExpiry: ['', Validators.required],
    cardCvc: ['', Validators.required],
  });
  token = signal<Token | null>(null);
  error = signal<string | null>(null);
  isProcessing = signal(false);
  stripeAdapter = stripeAdapter;

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

export default DarkThemeCardFormComponent;
