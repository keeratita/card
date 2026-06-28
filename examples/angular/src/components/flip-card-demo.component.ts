/**
 * Flip Card Demo Example - Angular (Latest Syntax)
 *
 * This example demonstrates a flip card animation for card preview,
 * showing the front and back of a credit card with smooth transitions.
 *
 * This demo uses the library's validators for form validation.
 */

import { Component, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import {
  createCardFormGroup,
  formatCardNumber,
  formatExpiry,
} from '@keeratita/card/angular';

@Component({
  selector: 'app-flip-card-demo',
  standalone: true,
  imports: [ReactiveFormsModule],
  styles: [
    `
      .container {
        max-width: 500px;
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
      .flip-card-container {
        perspective: 1000px;
        margin-bottom: 32px;
      }
      .flip-card {
        position: relative;
        width: 100%;
        height: 220px;
        transform-style: preserve-3d;
        transition: transform 0.6s;
        cursor: pointer;
      }
      .flip-card.flipped {
        transform: rotateY(180deg);
      }
      .flip-card-face {
        position: absolute;
        width: 100%;
        height: 100%;
        backface-visibility: hidden;
        border-radius: 16px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      }
      .flip-card-front {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      }
      .flip-card-back {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        transform: rotateY(180deg);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      }
      .flip-card-back .magnetic-strip {
        width: 90%;
        height: 40px;
        background: linear-gradient(90deg, #333, #555, #333);
        margin-bottom: 20px;
        border-radius: 4px;
      }
      .flip-card-back .cvc-display {
        background: white;
        padding: 12px 24px;
        border-radius: 8px;
        font-family: 'Courier New', monospace;
        font-size: 20px;
        font-weight: 600;
        letter-spacing: 2px;
      }
      .flip-card-back .cvc-label {
        color: white;
        font-size: 12px;
        margin-top: 8px;
        opacity: 0.9;
      }
      .flip-hint {
        text-align: center;
        color: #586069;
        font-size: 14px;
        margin-bottom: 24px;
      }
      .form-section {
        background-color: #f6f8fa;
        padding: 24px;
        border-radius: 8px;
      }
      .form-section h3 {
        margin: 0 0 16px 0;
        font-size: 16px;
        font-weight: 600;
        color: #24292e;
      }
      .form-group {
        margin-bottom: 16px;
      }
      .form-group label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
        color: #24292e;
        font-size: 14px;
      }
      .form-input {
        width: 100%;
        padding: 12px 14px;
        border-radius: 6px;
        border: 1px solid #d0d7de;
        font-size: 15px;
        transition: all 0.15s ease;
        box-sizing: border-box;
      }
      .form-input:focus {
        outline: none;
        border-color: #0366d6;
        box-shadow: 0 0 0 3px rgba(3, 102, 214, 0.1);
      }
      .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }
      .info-box {
        background-color: #fff8c5;
        border: 1px solid #f1c40f;
        padding: 16px;
        border-radius: 8px;
        margin-top: 24px;
      }
      .info-box h4 {
        margin: 0 0 8px 0;
        color: #856404;
        font-size: 14px;
      }
      .info-box p {
        margin: 0;
        color: #856404;
        font-size: 13px;
        line-height: 1.5;
      }
    `,
  ],
  template: `
    <div class="container">
      <h2>Flip Card Demo</h2>
      <p class="subtitle">Interactive card preview with flip animation.</p>

      <!-- Flip Card -->
      <div class="flip-card-container">
        <div
          class="flip-card"
          [class.flipped]="isFlipped()"
          (click)="toggleFlip()"
        >
          <!-- Front of Card -->
          <div class="flip-card-face flip-card-front">
            <div
              style="padding: 20px; height: 100%; display: flex; flex-direction: column; justify-content: space-between;"
            >
              <div
                style="display: flex; justify-content: space-between; align-items: center;"
              >
                <span style="color: rgba(255,255,255,0.8); font-size: 12px;"
                  >CREDIT CARD</span
                >
                <span
                  style="color: white; font-weight: 600; font-size: 14px;"
                  >{{ getBrandName() }}</span
                >
              </div>
              <div>
                <div
                  style="font-family: 'Courier New', monospace; font-size: 20px; letter-spacing: 2px; color: white; margin-bottom: 16px;"
                >
                  {{ formatCardNumber() || '•••• •••• •••• ••••' }}
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <div>
                    <div
                      style="font-size: 10px; color: rgba(255,255,255,0.7); margin-bottom: 4px;"
                    >
                      CARDHOLDER
                    </div>
                    <div
                      style="font-size: 12px; color: white; text-transform: uppercase;"
                    >
                      {{ form.get('name')?.value || 'NAME' }}
                    </div>
                  </div>
                  <div>
                    <div
                      style="font-size: 10px; color: rgba(255,255,255,0.7); margin-bottom: 4px;"
                    >
                      EXPIRES
                    </div>
                    <div style="font-size: 12px; color: white;">
                      {{ form.get('expiry')?.value || 'MM/YY' }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Back of Card -->
          <div class="flip-card-face flip-card-back">
            <div class="magnetic-strip"></div>
            <div class="cvc-display">{{ form.get('cvc')?.value || '***' }}</div>
            <div class="cvc-label">CVC/CVV</div>
          </div>
        </div>
      </div>

      <p class="flip-hint">Click on the card to flip it</p>

      <!-- Card Form -->
      <div class="form-section">
        <h3>Enter Card Details</h3>
        <form [formGroup]="form">
          <div class="form-group">
            <label>Card Number</label>
            <input
              type="text"
              formControlName="number"
              class="form-input"
              placeholder="4242 4242 4242 4242"
              (input)="onCardNumberInput($event)"
            />
          </div>

          <div class="form-group">
            <label>Cardholder Name</label>
            <input
              type="text"
              formControlName="name"
              class="form-input"
              placeholder="John Doe"
            />
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label>Expiry Date</label>
              <input
                type="text"
                formControlName="expiry"
                class="form-input"
                placeholder="MM/YY"
                (input)="onExpiryInput($event)"
              />
            </div>
            <div class="form-group">
              <label>CVC</label>
              <input
                type="text"
                formControlName="cvc"
                class="form-input"
                placeholder="123"
              />
            </div>
          </div>
        </form>
      </div>

      <!-- Info Box -->
      <div class="info-box">
        <h4>Using Library Validators</h4>
        <p>
          This demo uses the library's built-in validators:
          <code>creditCardValidator()</code>, <code>expiryValidator()</code>,
          and <code>cvcValidator()</code> for real-time form validation.
        </p>
      </div>
    </div>
  `,
})
export class FlipCardDemoComponent {
  isFlipped = signal(false);

  form = createCardFormGroup();

  // Simple brand detection for demo
  getBrandName(): string {
    const number = this.form.get('number')?.value || '';
    if (!number) return 'VISA';
    const cleanNumber = number.replace(/\s/g, '');
    if (cleanNumber.startsWith('4')) return 'VISA';
    if (cleanNumber.startsWith('5')) return 'MASTERCARD';
    if (cleanNumber.startsWith('3')) return 'AMEX';
    if (cleanNumber.startsWith('6')) return 'DISCOVER';
    return 'VISA';
  }

  formatCardNumber(): string {
    const number = this.form.get('number')?.value || '';
    return formatCardNumber(number);
  }

  toggleFlip(): void {
    this.isFlipped.update((v) => !v);
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
}
