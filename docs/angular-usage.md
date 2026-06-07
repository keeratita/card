# Angular Integration Guide

This document provides comprehensive guidance on integrating the @keeratita/card library with Angular applications using reactive forms and directives.

## Table of Contents

1. [Reactive Forms Integration](#reactive-forms-integration)
2. [Manual Form Configuration](#manual-form-configuration)
3. [Input Masking Directives](#input-masking-directives)
4. [Validator Functions](#validator-functions)
5. [Complete Example](#complete-example)

## Reactive Forms Integration

The easiest way to integrate with Angular reactive forms is to use the `createCardFormGroup` helper function which automatically creates a properly configured form group with all required validators.

### Basic Usage

```typescript
import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { createCardFormGroup } from '@keeratita/card/angular';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
})
export class CheckoutComponent {
  checkoutForm: FormGroup;

  constructor() {
    // Automatically compiles controls for number, expiry, cvc, name,
    // and postalCode (via 'us' preset) with correct validators attached.
    this.checkoutForm = createCardFormGroup({ preset: 'us' });
  }
}
```

### Available Presets

- `'none'`: Default core layout (Card Number, Expiry, CVC, Cardholder Name)
- `'us'`: Core fields + Postal Code (ZIP Code visual mapping)
- `'billing'`: Core fields + Address Line 1, City, State, Postal Code, Country
- `'contact'`: Core fields + Email, Phone

## Manual Form Configuration

For more control, you can manually configure form fields using individual validator functions.

```typescript
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  creditCardValidator,
  expiryValidator,
  cvcValidator,
} from '@keeratita/card/angular';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
})
export class CheckoutComponent {
  checkoutForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.checkoutForm = this.fb.group({
      cardNumber: ['', [Validators.required, creditCardValidator()]],
      expiry: ['', [Validators.required, expiryValidator()]],
      cvc: ['', [Validators.required, cvcValidator('cardNumber')]], // cross-validates against cardNumber control
    });
  }
}
```

## Input Masking Directives

The package provides standalone input masking directives for real-time formatting:

```typescript
import { Component } from '@angular/core';
import {
  CardNumberDirective,
  CardExpiryDirective,
  CardCvcDirective,
} from '@keeratita/card/angular';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CardNumberDirective, CardExpiryDirective, CardCvcDirective],
  template: `
    <!-- Card Number formatting -->
    <input type="text" kgCardNumber placeholder="•••• •••• •••• ••••" />

    <!-- Expiry date formatting (MM / YY) -->
    <input type="text" kgCardExpiry placeholder="MM/YY" />

    <!-- CVC formatting dynamically restricted based on card brand -->
    <input
      type="password"
      kgCardCvc
      [kgCardCvcNumber]="cardNumber"
      placeholder="•••"
    />
  `,
})
export class CheckoutComponent {
  cardNumber = '';
}
```

### Directive Properties

#### `kgCardCvcNumber`

- **Type**: `string`
- **Description**: Used for cross-validation of CVC against card number to ensure proper length validation

## Validator Functions

The Angular package exports several validator functions for use with Angular reactive forms:

### `creditCardValidator()`

Validates that the credit card number passes Luhn's algorithm.

```typescript
cardNumber: ['', [Validators.required, creditCardValidator()]];
```

### `expiryValidator()`

Validates that the card expiry date is in MM/YY format and is in the future.

```typescript
expiry: ['', [Validators.required, expiryValidator()]];
```

### `cvcValidator(cardNumberControlPath?)`

Validates that the CVC security code matches the required length (3 or 4 digits depending on brand).

Can optionally cross-validate using another form control for card number.

```typescript
// Without cross-validation
cvc: ['', [Validators.required, cvcValidator()]];

// With cross-validation against card number
cvc: ['', [Validators.required, cvcValidator('cardNumber')]];
```

### `cardholderNameValidator()`

Validates that the cardholder name contains at least a first name and a last name.

```typescript
cardholderName: ['', [Validators.required, cardholderNameValidator()]];
```

### `emailValidator()`

Validates email formatting.

```typescript
email: ['', [Validators.required, emailValidator()]];
```

### `phoneValidator()`

Validates phone formatting.

```typescript
phone: ['', [Validators.required, phoneValidator()]];
```

### `postalCodeValidator()`

Validates postal code formatting.

```typescript
postalCode: ['', [Validators.required, postalCodeValidator()]];
```

### `countryValidator()`

Validates ISO country code formatting.

```typescript
country: ['', [Validators.required, countryValidator()]];
```

## Complete Example

Here's a complete working example combining all components:

```typescript
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  createCardFormGroup,
  creditCardValidator,
  expiryValidator,
  cvcValidator,
  cardholderNameValidator,
  emailValidator,
  phoneValidator,
  postalCodeValidator,
  countryValidator,
} from '@keeratita/card/angular';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    // Add any required directives here
  ],
  template: `
    <form [formGroup]="checkoutForm" (ngSubmit)="onSubmit()">
      <div class="form-row">
        <input
          type="text"
          formControlName="cardNumber"
          placeholder="•••• •••• •••• ••••"
          kgCardNumber
        />
        <div
          *ngIf="
            checkoutForm.get('cardNumber')?.invalid &&
            checkoutForm.get('cardNumber')?.touched
          "
          class="error"
        >
          Invalid card number
        </div>
      </div>

      <div class="form-row">
        <input
          type="text"
          formControlName="expiry"
          placeholder="MM/YY"
          kgCardExpiry
        />
        <div
          *ngIf="
            checkoutForm.get('expiry')?.invalid &&
            checkoutForm.get('expiry')?.touched
          "
          class="error"
        >
          Invalid expiry date
        </div>
      </div>

      <div class="form-row">
        <input
          type="password"
          formControlName="cvc"
          placeholder="•••"
          kgCardCvc
          [kgCardCvcNumber]="checkoutForm.get('cardNumber')?.value"
        />
        <div
          *ngIf="
            checkoutForm.get('cvc')?.invalid && checkoutForm.get('cvc')?.touched
          "
          class="error"
        >
          Invalid CVC
        </div>
      </div>

      <div class="form-row">
        <input
          type="text"
          formControlName="cardholderName"
          placeholder="Cardholder Name"
        />
        <div
          *ngIf="
            checkoutForm.get('cardholderName')?.invalid &&
            checkoutForm.get('cardholderName')?.touched
          "
          class="error"
        >
          Invalid cardholder name
        </div>
      </div>

      <div class="form-row">
        <input type="email" formControlName="email" placeholder="Email" />
        <div
          *ngIf="
            checkoutForm.get('email')?.invalid &&
            checkoutForm.get('email')?.touched
          "
          class="error"
        >
          Invalid email
        </div>
      </div>

      <button type="submit" [disabled]="checkoutForm.invalid">Pay Now</button>
    </form>
  `,
  styles: [
    `
      .form-row {
        margin-bottom: 1rem;
      }

      .error {
        color: red;
        font-size: 0.875rem;
      }
    `,
  ],
})
export class CheckoutComponent implements OnInit {
  checkoutForm: FormGroup;

  constructor(private fb: FormBuilder) {
    // Create a form with all required fields and validators
    this.checkoutForm = this.fb.group({
      cardNumber: ['', [Validators.required, creditCardValidator()]],
      expiry: ['', [Validators.required, expiryValidator()]],
      cvc: ['', [Validators.required, cvcValidator('cardNumber')]],
      cardholderName: ['', [Validators.required, cardholderNameValidator()]],
      email: ['', [Validators.required, emailValidator()]],
      phone: ['', [Validators.required, phoneValidator()]],
      postalCode: ['', [Validators.required, postalCodeValidator()]],
      country: ['', [Validators.required, countryValidator()]],
    });
  }

  ngOnInit(): void {
    // Additional initialization if needed
  }

  onSubmit(): void {
    if (this.checkoutForm.valid) {
      // Process the form data
      console.log(this.checkoutForm.value);
    } else {
      // Mark all fields as touched to show validation errors
      this.markFormGroupTouched(this.checkoutForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
```

## Best Practices

1. **Always use validators**: Apply appropriate validators to all card-related form controls
2. **Cross-validation**: Use `cvcValidator('cardNumber')` for proper CVC validation
3. **Real-time formatting**: Utilize the provided directives for automatic input formatting
4. **Proper error handling**: Display validation errors appropriately to users
5. **Accessibility**: Ensure proper labeling and ARIA attributes for screen readers
6. **Security**: Never log or store sensitive card data in your application
