/**
 * Multi-Step Checkout Example - Angular (Latest Syntax)
 *
 * This example demonstrates how to implement a multi-step checkout flow
 * where the card form is shown as the final step.
 */

import { Component, signal, computed, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { createCardFormGroup, formatCardNumber, formatExpiry } from '@keeratita/card/angular';
import { stripeAdapter, omiseAdapter } from '../shared/adapters';
import { StripeAdapter, OmiseAdapter } from '@keeratita/card';

type CheckoutStep = 'cart' | 'shipping' | 'payment' | 'confirmation';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

const sampleCart: CartItem[] = [
  { id: '1', name: 'Premium Widget', price: 49.99, quantity: 2 },
  { id: '2', name: 'Deluxe Gadget', price: 99.99, quantity: 1 },
];

@Component({
  selector: 'app-multi-step-checkout',
  standalone: true,
  imports: [ReactiveFormsModule],
  styles: [
    `
      .container {
        max-width: 500px;
        margin: 0 auto;
      }
      .step-indicator {
        display: flex;
        justify-content: space-between;
        margin-bottom: 30px;
      }
      .step-item {
        flex: 1;
        display: flex;
        align-items: center;
      }
      .step-number {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        margin-right: 8px;
      }
      .step-number.active {
        background-color: #0a84ff;
      }
      .step-number.inactive {
        background-color: rgba(255, 255, 255, 0.1);
      }
      .step-label {
        font-size: 14px;
      }
      .step-label.active {
        color: #ffffff;
        font-weight: 600;
      }
      .step-label.inactive {
        color: rgba(255, 255, 255, 0.55);
        font-weight: 400;
      }
      .step-connector {
        flex: 1;
        height: 2px;
        margin-left: 16px;
      }
      .step-connector.active {
        background-color: #0a84ff;
      }
      .step-connector.inactive {
        background-color: rgba(255, 255, 255, 0.1);
      }
      .content-card {
        background-color: rgba(255, 255, 255, 0.03);
        border-radius: 16px;
        padding: 32px;
        border: 1px solid rgba(255, 255, 255, 0.08);
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
      }
      .content-card h2 {
        margin-top: 0;
        font-size: 24px;
        font-weight: 600;
        color: #ffffff;
      }
      .cart-item {
        display: flex;
        justify-content: space-between;
        padding: 12px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      }
      .cart-item-name {
        font-weight: 500;
        color: #ffffff;
      }
      .cart-item-price {
        color: rgba(255, 255, 255, 0.55);
        font-size: 14px;
      }
      .cart-item-total {
        font-weight: 600;
        color: #ffffff;
      }
      .cart-total {
        display: flex;
        justify-content: space-between;
        padding: 16px 0;
        border-top: 2px solid rgba(255, 255, 255, 0.2);
        font-weight: 600;
        font-size: 18px;
        color: #ffffff;
      }
      .btn {
        width: 100%;
        padding: 16px 20px;
        border-radius: 9999px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }
      .btn-primary {
        background-color: #0a84ff;
        color: white;
        border: none;
        box-shadow: 0 8px 20px rgba(10, 132, 255, 0.35);
      }
      .btn-primary:hover:not(:disabled) {
        opacity: 0.95;
        box-shadow: 0 10px 24px rgba(10, 132, 255, 0.45);
        transform: translateY(-1px);
      }
      .btn-primary:disabled {
        background-color: rgba(255, 255, 255, 0.05);
        color: rgba(255, 255, 255, 0.55);
        box-shadow: none;
        cursor: not-allowed;
        transform: none;
      }
      .btn-secondary {
        background-color: rgba(255, 255, 255, 0.05);
        color: #ffffff;
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
      .btn-secondary:hover {
        background-color: rgba(255, 255, 255, 0.08);
      }
      .btn-back {
        background-color: transparent;
        color: rgba(255, 255, 255, 0.55);
        border: none;
        margin-top: 16px;
      }
      .btn-back:hover {
        color: #ffffff;
      }
      .form-group {
        margin-bottom: 16px;
      }
      .form-group label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
        color: rgba(255, 255, 255, 0.55);
        font-size: 14px;
      }
      .form-input {
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
      .form-input:focus {
        outline: none;
        border-color: #0a84ff;
        box-shadow: 0 0 0 3px rgba(10, 132, 255, 0.12);
      }
      .form-input::placeholder {
        color: rgba(255, 255, 255, 0.2);
      }
      .form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        margin-bottom: 16px;
      }
      .btn-group {
        display: flex;
        gap: 12px;
      }
      .gateway-btn {
        flex: 1;
        padding: 10px;
        border-radius: 8px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.15s ease;
      }
      .gateway-btn.active {
        border: 2px solid #0a84ff;
        background-color: rgba(10, 132, 255, 0.12);
        color: #0a84ff;
      }
      .gateway-btn.inactive {
        border: 1px solid rgba(255, 255, 255, 0.1);
        background-color: rgba(255, 255, 255, 0.05);
        color: rgba(255, 255, 255, 0.55);
      }
      .confirmation-icon {
        font-size: 64px;
        margin-bottom: 20px;
        color: #30d158;
      }
      .confirmation-text {
        color: rgba(255, 255, 255, 0.55);
        margin-bottom: 20px;
      }
      .transaction-id {
        background-color: rgba(255, 255, 255, 0.03);
        padding: 12px;
        border-radius: 8px;
        margin-bottom: 24px;
        font-size: 13px;
        color: rgba(255, 255, 255, 0.7);
        border: 1px solid rgba(255, 255, 255, 0.08);
      }
    `,
  ],
  template: `
    <div class="container">
      <!-- Step Indicator -->
      <div class="step-indicator">
        @for (step of steps(); track step.id; let i = $index) {
          <div class="step-item">
            <div
              class="step-number"
              [class.active]="i <= currentStepIndex()"
              [class.inactive]="i > currentStepIndex()"
            >
              {{ i + 1 }}
            </div>
            <span
              class="step-label"
              [class.active]="i <= currentStepIndex()"
              [class.inactive]="i > currentStepIndex()"
            >
              {{ step.label }}
            </span>
            @if (i < steps().length - 1) {
              <div
                class="step-connector"
                [class.active]="i < currentStepIndex()"
                [class.inactive]="i >= currentStepIndex()"
              ></div>
            }
          </div>
        }
      </div>

      <!-- Content -->
      <div class="content-card">
        <!-- Cart Step -->
        @if (currentStep() === 'cart') {
          <div>
            <h2>Your Cart</h2>
            @for (item of cart(); track item.id) {
              <div class="cart-item">
                <div>
                  <div class="cart-item-name">{{ item.name }}</div>
                  <div class="cart-item-price">
                    {{ formatPrice(item.price) }} x {{ item.quantity }}
                  </div>
                </div>
                <div class="cart-item-total">
                  {{ formatPrice(item.price * item.quantity) }}
                </div>
              </div>
            }
            <div class="cart-total">
              <span>Total</span>
              <span>{{ formatPrice(cartTotal()) }}</span>
            </div>
            <button
              class="btn btn-primary"
              (click)="currentStep.set('shipping')"
            >
              Continue to Shipping
            </button>
          </div>
        }

        <!-- Shipping Step -->
        @if (currentStep() === 'shipping') {
          <div>
            <h2>Shipping Information</h2>
            <div class="form-group">
              <label>Full Name</label>
              <input
                type="text"
                formControlName="name"
                class="form-input"
                placeholder="John Doe"
              />
            </div>
            <div class="form-group">
              <label>Email</label>
              <input
                type="email"
                formControlName="email"
                class="form-input"
                placeholder="john@example.com"
              />
            </div>
            <div class="form-group">
              <label>Address</label>
              <input
                type="text"
                formControlName="address"
                class="form-input"
                placeholder="123 Main St"
              />
            </div>
            <div class="form-grid">
              <div class="form-group">
                <label>City</label>
                <input
                  type="text"
                  formControlName="city"
                  class="form-input"
                  placeholder="New York"
                />
              </div>
              <div class="form-group">
                <label>Postal Code</label>
                <input
                  type="text"
                  formControlName="postalCode"
                  class="form-input"
                  placeholder="10001"
                />
              </div>
            </div>
            <div class="btn-group">
              <button
                class="btn btn-secondary"
                (click)="currentStep.set('cart')"
              >
                Back
              </button>
              <button
                class="btn btn-primary"
                (click)="goToPayment()"
                [disabled]="
                  !shippingForm.get('name')?.value ||
                  !shippingForm.get('email')?.value
                "
              >
                Continue to Payment
              </button>
            </div>
          </div>
        }

        <!-- Payment Step -->
        @if (currentStep() === 'payment') {
          <div>
            <h2>Payment</h2>
            <p class="confirmation-text">
              Complete your purchase by providing your payment details.
            </p>

            <!-- Payment Gateway Selection -->
            <div class="form-group">
              <label>Payment Gateway</label>
              <div class="gateway-btn-group">
                <button
                  class="gateway-btn"
                  [class.active]="selectedAdapter() === 'stripe'"
                  [class.inactive]="selectedAdapter() !== 'stripe'"
                  (click)="selectedAdapter.set('stripe')"
                >
                  Stripe
                </button>
                <button
                  class="gateway-btn"
                  [class.active]="selectedAdapter() === 'omise'"
                  [class.inactive]="selectedAdapter() !== 'omise'"
                  (click)="selectedAdapter.set('omise')"
                >
                  Omise
                </button>
              </div>
            </div>

            <form [formGroup]="paymentForm" (ngSubmit)="onPaymentSubmit()">
              <!-- Card Number -->
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

              <!-- Expiry and CVC -->
              <div class="form-grid">
                <div class="form-group">
                  <label>Expiry</label>
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

              <!-- Cardholder Name -->
              <div class="form-group">
                <label>Cardholder Name</label>
                <input
                  type="text"
                  formControlName="name"
                  class="form-input"
                  placeholder="John Doe"
                />
              </div>

              <button
                type="submit"
                class="btn btn-primary"
                [disabled]="paymentForm.invalid || processing()"
              >
                {{
                  processing()
                    ? 'Processing...'
                    : 'Pay ' + formatPrice(cartTotal())
                }}
              </button>
            </form>

            <button class="btn btn-back" (click)="currentStep.set('shipping')">
              ← Back to Shipping
            </button>
          </div>
        }

        <!-- Confirmation Step -->
        @if (currentStep() === 'confirmation') {
          <div style="textAlign: 'center'; padding: '20px 0'">
            <div class="confirmation-icon">✓</div>
            <h2>Order Confirmed!</h2>
            <p class="confirmation-text">
              Thank you for your purchase. A confirmation email has been sent to
              {{ shippingForm.get('email')?.value }}.
            </p>
            @if (token()) {
              <div class="transaction-id">
                <strong>Transaction ID:</strong> {{ token()?.id }}
              </div>
            }
            <button class="btn btn-primary" (click)="resetCheckout()">
              Start New Order
            </button>
          </div>
        }
      </div>
    </div>
  `,
})
export class MultiStepCheckoutComponent {
  fb = inject(FormBuilder);

  currentStep = signal<CheckoutStep>('cart');
  selectedAdapter = signal<'stripe' | 'omise'>('stripe');
  token = signal<{ id: string } | null>(null);
  error = signal<string | null>(null);
  processing = signal(false);

  cart = signal<CartItem[]>(sampleCart);
  shippingForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    address: [''],
    city: [''],
    postalCode: [''],
  });
  paymentForm = createCardFormGroup();

  stripeAdapter = stripeAdapter;
  omiseAdapter = omiseAdapter;

  steps = signal([
    { id: 'cart' as const, label: 'Cart' },
    { id: 'shipping' as const, label: 'Shipping' },
    { id: 'payment' as const, label: 'Payment' },
    { id: 'confirmation' as const, label: 'Complete' },
  ]);

  currentStepIndex = computed(() => {
    return this.steps().findIndex((s) => s.id === this.currentStep());
  });

  cartTotal = computed(() => {
    return this.cart().reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
  });

  formatPrice(price: number): string {
    return '$' + price.toFixed(2);
  }

  getActiveAdapter(): StripeAdapter | OmiseAdapter {
    return this.selectedAdapter() === 'stripe'
      ? this.stripeAdapter
      : this.omiseAdapter;
  }

  goToPayment(): void {
    this.currentStep.set('payment');
  }

  async onPaymentSubmit(): Promise<void> {
    if (this.paymentForm.invalid) return;

    this.processing.set(true);
    this.error.set(null);

    try {
      const formValue = this.paymentForm.value;
      const card = {
        number: formValue.number || '',
        expMonth: formValue.expiry?.split('/')?.[0]?.trim() || '',
        expYear: formValue.expiry?.split('/')?.[1]?.trim() || '',
        cvc: formValue.cvc || '',
        name: formValue.name || '',
      };

      const adapter = this.getActiveAdapter();
      const result = await adapter.tokenize(card);
      this.token.set(result);
      this.currentStep.set('confirmation');
    } catch (err) {
      this.error.set(
        err instanceof Error ? err.message : 'An unexpected error occurred.',
      );
    } finally {
      this.processing.set(false);
    }
  }

  resetCheckout(): void {
    this.currentStep.set('cart');
    this.token.set(null);
    this.error.set(null);
    this.shippingForm.reset();
    this.paymentForm.reset();
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
