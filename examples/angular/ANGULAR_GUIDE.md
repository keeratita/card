# Angular Guide for @keeratita/card

This guide provides comprehensive documentation for integrating the `@keeratita/card` library with Angular applications.

## Table of Contents

1. [Installation](#installation)
2. [Basic Usage](#basic-usage)
3. [Reactive Forms Integration](#reactive-forms-integration)
4. [Input Masking Directives](#input-masking-directives)
5. [Validator Functions](#validator-functions)
6. [Available Examples](#available-examples)
7. [API Reference](#api-reference)

## Installation

```bash
npm install @keeratita/card
```

```typescript
import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { createCardFormGroup } from '@keeratita/card/angular';
```

## Basic Usage

The easiest way to integrate with Angular is to use the `createCardFormGroup` helper function:

```typescript
import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { createCardFormGroup } from '@keeratita/card/angular';

@Component({
  selector: 'app-checkout',
  template: `
    <form [formGroup]="checkoutForm" (ngSubmit)="onSubmit()">
      <input formControlName="cardNumber" placeholder="•••• •••• •••• ••••" />
      <input formControlName="expiry" placeholder="MM/YY" />
      <input formControlName="cvc" placeholder="•••" />
      <input formControlName="name" placeholder="Cardholder Name" />
      <button type="submit" [disabled]="checkoutForm.invalid">Pay Now</button>
    </form>
  `,
})
export class CheckoutComponent {
  checkoutForm = createCardFormGroup({ preset: 'us' });

  onSubmit(): void {
    if (this.checkoutForm.valid) {
      console.log(this.checkoutForm.value);
    }
  }
}
```

## Reactive Forms Integration

### Available Presets

- `'none'`: Default core layout (Card Number, Expiry, CVC, Cardholder Name)
- `'us'`: Core fields + Postal Code (ZIP Code visual mapping)
- `'billing'`: Core fields + Address Line 1, City, State, Postal Code, Country
- `'contact'`: Core fields + Email, Phone

### Manual Form Configuration

For more control, manually configure form fields using individual validator functions:

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
  template: `
    <form [formGroup]="checkoutForm" (ngSubmit)="onSubmit()">
      <input formControlName="cardNumber" placeholder="•••• •••• •••• ••••" />
      <input formControlName="expiry" placeholder="MM/YY" />
      <input formControlName="cvc" placeholder="•••" />
      <button type="submit" [disabled]="checkoutForm.invalid">Pay Now</button>
    </form>
  `,
})
export class CheckoutComponent {
  checkoutForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.checkoutForm = this.fb.group({
      cardNumber: ['', [Validators.required, creditCardValidator()]],
      expiry: ['', [Validators.required, expiryValidator()]],
      cvc: ['', [Validators.required, cvcValidator('cardNumber')]],
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
      [cardNumber]="cardNumber"
      placeholder="•••"
    />
  `,
})
export class CheckoutComponent {
  cardNumber = '';
}
```

### Directive Properties

#### `cardNumber`

- **Type**: `string` (using Angular v20+ `input()` signal)
- **Description**: Used for cross-validation of CVC against card number to ensure proper length validation

## Validator Functions

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

## Available Examples

The library includes several example applications demonstrating different use cases:

| Example | Description |
|---------|-------------|
| **Basic Form** | Quick start with pre-built form group and minimal configuration |
| **Presets** | Experiment with billing, contact, and US cardholder presets |
| **Directives** | Individual directives for custom form layouts |
| **Validators** | Built-in and custom validation logic for payment forms |
| **Multi-Step Checkout** | Complete checkout flow with cart, shipping, and payment |
| **Live Preview** | Real-time card preview as users enter details |
| **Omise Adapter** | Integration with Omise payment gateway |
| **Dark Theme** | Dark mode support for modern applications |
| **Corporate Theme** | Enterprise-style payment form with security indicators |
| **Gradient Theme** | Modern gradient background with clean styling |
| **Minimal Theme** | Clean design with focus on simplicity |
| **Flip Card Demo** | Interactive 3D flip card animation with brand detection |
| **Country Dropdown** | Searchable country selection with flags and dial codes |

## API Reference

### Exports

```typescript
// Validators
import {
  creditCardValidator,
  expiryValidator,
  cvcValidator,
  cardholderNameValidator,
  emailValidator,
  phoneValidator,
  postalCodeValidator,
  countryValidator,
} from '@keeratita/card/angular';

// Directives
import {
  CardNumberDirective,
  CardExpiryDirective,
  CardCvcDirective,
} from '@keeratita/card/angular';

// Form Helpers
import { createCardFormGroup } from '@keeratita/card/angular';

// Formatters
import { formatCardNumber, formatExpiry } from '@keeratita/card/angular';

// Country Data
import { COUNTRIES, type Country } from '@keeratita/card/angular';
```

## Best Practices

1. **Always use validators**: Apply appropriate validators to all card-related form controls
2. **Cross-validation**: Use `cvcValidator('cardNumber')` for proper CVC validation
3. **Real-time formatting**: Utilize the provided directives for automatic input formatting
4. **Proper error handling**: Display validation errors appropriately to users
5. **Accessibility**: Ensure proper labeling and ARIA attributes for screen readers
6. **Security**: Never log or store sensitive card data in your application