/**
 * Card Form with Live Preview Example - Angular (Latest Syntax)
 * 
 * This example demonstrates how to show card information as users enter their details.
 */

import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { createCardFormGroup, CardNumberDirective, CardExpiryDirective } from '@keeratita/card/angular';
import { StripeAdapter, type Token } from '@keeratita/card';

@Component({
  selector: 'app-card-form-with-live-preview',
  standalone: true,
  imports: [ReactiveFormsModule, CardNumberDirective, CardExpiryDirective],
  styles: [`
    .container {
      max-width: 700px;
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
    .content-grid {
      display: flex;
      gap: 24px;
      flex-wrap: wrap;
    }
    .preview-section, .form-section {
      flex: 1;
      min-width: 300px;
    }
    .section-title {
      font-size: 16px;
      font-weight: 600;
      color: #24292e;
      margin: 0 0 12px 0;
    }
    .preview-box {
      padding: 20px;
      background-color: #f6f8fa;
      border-radius: 8px;
      min-height: 180px;
      border: 1px solid #d0d7de;
    }
    .card-info {
      text-align: center;
    }
    .card-brand {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin-bottom: 15px;
    }
    .brand-icon {
      font-size: 32px;
    }
    .brand-name {
      font-size: 18px;
      font-weight: 600;
      color: #24292e;
      text-transform: uppercase;
    }
    .card-number {
      font-size: 14px;
      font-family: 'SF Mono', Monaco, Consolas, monospace;
      color: #586069;
    }
    .placeholder {
      color: #6e7781;
      text-align: center;
      margin: 0;
      font-size: 14px;
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
      background-color: #0366d6;
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
      background-color: #0255b3;
    }
    .submit-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `],
  template: `
    <div class="container">
      <h2>Card Form with Live Preview</h2>
      <p class="subtitle">
        Enter your card details and see the detected information.
      </p>

      @if (token()) {
        <div class="success-msg">
          <strong>✓ Success!</strong> Token: {{ token()?.id }}
        </div>
      }

      <div class="content-grid">
        <!-- Card Info Preview Section -->
        <div class="preview-section">
          <h3 class="section-title">Detected Card Information</h3>
          <div class="preview-box">
            @if (cardBrand(); as brand) {
              <div class="card-info">
                <div class="card-brand">
                  <span class="brand-icon">{{ getBrandIcon(brand) }}</span>
                  <span class="brand-name">{{ brand }}</span>
                </div>
                @if (cardLast4(); as last4) {
                  <div class="card-number">•••• •••• •••• {{ last4 }}</div>
                }
              </div>
            } @else {
              <p class="placeholder">Start entering card number to see details</p>
            }
          </div>
        </div>

        <!-- Card Form Section -->
        <div class="form-section">
          <h3 class="section-title">Enter Card Details</h3>
          <form [formGroup]="form" (ngSubmit)="handleSubmit()">
            <div class="form-group">
              <label>Card Number</label>
              <input
                type="text"
                formControlName="number"
                class="form-input"
                placeholder="4242 4242 4242 4242"
                [class.invalid]="form.get('number')?.invalid && form.get('number')?.touched"
                kgCardNumber
              />
            </div>

            <div class="form-group">
              <label>Expiry Date</label>
              <input
                type="text"
                formControlName="expiry"
                class="form-input"
                placeholder="MM / YY"
                [class.invalid]="form.get('expiry')?.invalid && form.get('expiry')?.touched"
                kgCardExpiry
              />
            </div>

            <div class="form-group">
              <label>CVC</label>
              <input
                type="text"
                formControlName="cvc"
                class="form-input"
                placeholder="123"
                [class.invalid]="form.get('cvc')?.invalid && form.get('cvc')?.touched"
              />
            </div>

            <button
              type="submit"
              class="submit-btn"
              [disabled]="form.invalid || isProcessing()"
            >
              {{ isProcessing() ? 'Processing...' : 'Pay Now' }}
            </button>
          </form>
        </div>
      </div>
    </div>
  `
})
export class CardFormWithLivePreviewComponent {
  form = createCardFormGroup();
  token = signal<Token | null>(null);
  error = signal<string | null>(null);
  isProcessing = signal(false);
  cardBrand = signal<string>('');
  cardLast4 = signal<string>('');
  stripeAdapter = new StripeAdapter({ publicKey: 'pk_test_stripe_integrated_demo_key' });

  getBrandIcon(brand: string): string {
    const icons: { [key: string]: string } = {
      visa: '💳',
      mastercard: '🔴',
      amex: '💎',
      discover: '🔵',
      diners: '🎫',
      jcb: '🇯🇵',
      unionpay: '🇨🇳',
      unknown: '🏦'
    };
    return icons[brand.toLowerCase()] || icons['unknown'];
  }

  onCardNumberChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const number = input.value.replace(/\s/g, '');

    if (number.startsWith('4')) {
      this.cardBrand.set('visa');
    } else if (number.startsWith('5') || number.startsWith('2')) {
      this.cardBrand.set('mastercard');
    } else if (number.startsWith('34') || number.startsWith('37')) {
      this.cardBrand.set('amex');
    } else if (number.startsWith('6')) {
      this.cardBrand.set('discover');
    } else {
      this.cardBrand.set('unknown');
    }

    if (number.length >= 4) {
      this.cardLast4.set(number.slice(-4));
    }
  }

  async handleSubmit() {
    if (this.form.invalid) return;

    this.isProcessing.set(true);
    this.error.set(null);

    try {
      const formValue = this.form.value;
      const card = {
        number: formValue.number || '',
        expMonth: formValue.expiry?.split('/')?.[0]?.trim() || '',
        expYear: formValue.expiry?.split('/')?.[1]?.trim() || '',
        cvc: formValue.cvc || '',
        name: '',
      };

      const result = await this.stripeAdapter.tokenize(card);
      this.token.set(result);
    } catch (err) {
      this.error.set(
        err instanceof Error ? err.message : 'An unexpected error occurred.'
      );
    } finally {
      this.isProcessing.set(false);
    }
  }
}

// Alternative: Compact version
@Component({
  selector: 'app-compact-card-preview',
  standalone: true,
  imports: [ReactiveFormsModule, CardNumberDirective, CardExpiryDirective],
  styles: [`
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
    .compact-preview {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 16px;
      background-color: #f6f8fa;
      border-radius: 8px;
      margin-bottom: 20px;
      border: 1px solid #d0d7de;
    }
    .brand-icon {
      font-size: 24px;
    }
    .brand-name {
      font-size: 14px;
      font-weight: 600;
      color: #24292e;
      text-transform: uppercase;
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
      background-color: #0366d6;
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
      background-color: #0255b3;
    }
    .submit-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `],
  template: `
    <div class="container">
      <h2>Quick Checkout</h2>
      <p class="subtitle">
        Fast and secure payment.
      </p>

      @if (token()) {
        <div class="success-msg">
          <strong>✓ Payment successful!</strong>
        </div>
      }

      @if (cardBrand(); as brand) {
        <div class="compact-preview">
          <span class="brand-icon">{{ getBrandIcon(brand) }}</span>
          <span class="brand-name">{{ brand }}</span>
        </div>
      }

      <form [formGroup]="form" (ngSubmit)="handleSubmit()">
        <div class="form-group">
          <label>Card Number</label>
          <input
            type="text"
            formControlName="number"
            placeholder="4242 4242 4242 4242"
            [class.invalid]="form.get('number')?.invalid && form.get('number')?.touched"
            kgCardNumber
          />
        </div>

        <div class="form-group">
          <label>Expiry Date</label>
          <input
            type="text"
            formControlName="expiry"
            placeholder="MM / YY"
            [class.invalid]="form.get('expiry')?.invalid && form.get('expiry')?.touched"
            kgCardExpiry
          />
        </div>

        <div class="form-group">
          <label>CVC</label>
          <input
            type="text"
            formControlName="cvc"
            placeholder="123"
            [class.invalid]="form.get('cvc')?.invalid && form.get('cvc')?.touched"
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
    </div>
  `
})
export class CompactCardPreviewComponent {
  form = createCardFormGroup();
  token = signal<Token | null>(null);
  error = signal<string | null>(null);
  isProcessing = signal(false);
  cardBrand = signal<string>('');
  stripeAdapter = new StripeAdapter({ publicKey: 'pk_test_stripe_integrated_demo_key' });

  getBrandIcon(brand: string): string {
    const icons: { [key: string]: string } = {
      visa: '💳',
      mastercard: '🔴',
      amex: '💎',
      discover: '🔵',
      unknown: '🏦'
    };
    return icons[brand.toLowerCase()] || icons['unknown'];
  }

  onCardNumberChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const number = input.value.replace(/\s/g, '');

    if (number.startsWith('4')) {
      this.cardBrand.set('visa');
    } else if (number.startsWith('5') || number.startsWith('2')) {
      this.cardBrand.set('mastercard');
    } else if (number.startsWith('34') || number.startsWith('37')) {
      this.cardBrand.set('amex');
    } else {
      this.cardBrand.set('unknown');
    }
  }

  async handleSubmit() {
    if (this.form.invalid) return;

    this.isProcessing.set(true);
    this.error.set(null);

    try {
      const formValue = this.form.value;
      const card = {
        number: formValue.number || '',
        expMonth: formValue.expiry?.split('/')?.[0]?.trim() || '',
        expYear: formValue.expiry?.split('/')?.[1]?.trim() || '',
        cvc: formValue.cvc || '',
        name: '',
      };

      const result = await this.stripeAdapter.tokenize(card);
      this.token.set(result);
    } catch (err) {
      this.error.set(
        err instanceof Error ? err.message : 'An unexpected error occurred.'
      );
    } finally {
      this.isProcessing.set(false);
    }
  }
}

export default CardFormWithLivePreviewComponent;