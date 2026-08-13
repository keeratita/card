# Angular Integration Guide

This document provides comprehensive guidance on integrating the @keeratita/card library with Angular applications using reactive forms and directives.

> **Requirements**: Angular `>= 21` (the Angular entry point uses signal-based
> APIs — `input()`/`output()`/`computed()` — the `@if`/`@for` control flow,
> `inject()` DI, and standalone components/directives). The library ships
> components/directives with an explicit `standalone: true` so consumer AOT
> builds can resolve them regardless of how the app compiles.
> Tested against the latest stable Angular release.

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
    // and postalCode + country (via 'us' preset) with correct validators.
    this.checkoutForm = createCardFormGroup({ preset: 'us' });
  }
}
```

### Available Presets

- `'none'`: Default core layout (Card Number, Expiry, CVC, Cardholder Name)
- `'us'`: Core fields + Postal Code (ZIP Code visual mapping) and Country
- `'billing'`: Core fields + Address Line 1, City, State, Postal Code, Country
- `'contact'`: Core fields + Email, Phone

> All fields activated by a preset or listed in `fields` are required (except
> `addressLine2`): the HTML renderer, `createCardFormGroup`, and the
> `kgCard*` masking directives all enforce the same rule.

### Cleanup (`disposeCardFormGroup`)

`createCardFormGroup` subscribes to the card-number control so the CVC length
constraint revalidates reactively when the brand changes (Amex vs standard).
Release that subscription when the form group is no longer needed — e.g. on
component destroy — with `disposeCardFormGroup`:

```typescript
import { Component, DestroyRef, inject } from '@angular/core';
import {
  createCardFormGroup,
  disposeCardFormGroup,
} from '@keeratita/card/angular';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
})
export class CheckoutComponent {
  private readonly destroyRef = inject(DestroyRef);
  checkoutForm: FormGroup;

  constructor() {
    this.checkoutForm = createCardFormGroup({ preset: 'us' });
    this.destroyRef.onDestroy(() => disposeCardFormGroup(this.checkoutForm));
  }
}
```

This prevents a per-form-subscription leak if the form group outlives the
component (e.g. forms created in a loop or re-created on route change).

## Manual Form Configuration

For more control, you can manually configure form fields using individual validator functions.

```typescript
import { Component, inject } from '@angular/core';
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
  private readonly fb = inject(FormBuilder);

  checkoutForm: FormGroup;

  constructor() {
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

- **Type**: signal-based `input()` (`InputSignal<string>`; bind with
  `[cardNumber]="..."` — programmatic reads return the signal itself)
- **Description**: Used for cross-validation of CVC against card number to ensure proper length validation

## Validator Functions & Error Keys

The Angular package exports validator functions that produce specific error keys. Access them via `form.get('field')?.errors?.['errorKey']`:

| Validator | Error Key | Returns When |
|-----------|-----------|---------------|
| `creditCardValidator()` | `creditCard` | Card number fails Luhn check (only when 13+ digits typed) |
| `expiryValidator()` | `expiryInvalid` | Invalid MM/YY format or expired date |
| `cvcValidator()` | `cvcInvalid` | CVC length doesn't match card brand (3 or 4 digits) |
| `cardholderNameValidator()` | `cardholderNameInvalid` | Name doesn't contain first + last name |
| `emailValidator()` | `emailInvalid` | Invalid email format |
| `phoneValidator()` | `phoneInvalid` | Phone number too short (need 8+ digits) |
| `postalCodeValidator()` | `postalCodeInvalid` | Postal code too short (need 4+ chars) |
| `countryValidator()` | `countryInvalid` | Not a valid 2-3 letter ISO code |

Example:

```typescript
// Check specific validation error
const errors = this.checkoutForm.get('cardNumber')?.errors;
if (errors?.['creditCard']) {
  console.log('Card number failed Luhn check');
}
```

The Angular package exports 8 validator functions for use with Angular reactive forms. Usage:

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
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import {
  CardNumberDirective,
  CardExpiryDirective,
  CardCvcDirective,
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
  imports: [ReactiveFormsModule, CardNumberDirective, CardExpiryDirective, CardCvcDirective],
  template: `
    <form [formGroup]="checkoutForm" (ngSubmit)="onSubmit()">
      <div class="form-row">
        <input
          type="text"
          formControlName="cardNumber"
          placeholder="•••• •••• •••• ••••"
          kgCardNumber
        />
        @if (checkoutForm.get('cardNumber')?.invalid && checkoutForm.get('cardNumber')?.touched) {
          <div class="error">Invalid card number</div>
        }
      </div>

      <div class="form-row">
        <input
          type="text"
          formControlName="expiry"
          placeholder="MM/YY"
          kgCardExpiry
        />
        @if (checkoutForm.get('expiry')?.invalid && checkoutForm.get('expiry')?.touched) {
          <div class="error">Invalid expiry date</div>
        }
      </div>

      <div class="form-row">
        <input
          type="password"
          formControlName="cvc"
          placeholder="•••"
          kgCardCvc
          [cardNumber]="checkoutForm.get('cardNumber')?.value"
        />
        @if (checkoutForm.get('cvc')?.invalid && checkoutForm.get('cvc')?.touched) {
          <div class="error">Invalid CVC</div>
        }
      </div>

      <div class="form-row">
        <input
          type="text"
          formControlName="cardholderName"
          placeholder="Cardholder Name"
        />
        @if (checkoutForm.get('cardholderName')?.invalid && checkoutForm.get('cardholderName')?.touched) {
          <div class="error">Invalid cardholder name</div>
        }
      </div>

      <div class="form-row">
        <input type="email" formControlName="email" placeholder="Email" />
        @if (checkoutForm.get('email')?.invalid && checkoutForm.get('email')?.touched) {
          <div class="error">Invalid email</div>
        }
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
export class CheckoutComponent {
  private readonly fb = inject(FormBuilder);

  checkoutForm: FormGroup;

  constructor() {
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

  onSubmit(): void {
    if (this.checkoutForm.valid) {
      // Forward the token to your backend — never log the raw form value,
      // it contains the PAN and CVC.
      const tokenId = this.checkoutForm.get('cardNumber')?.value;
      void tokenId;
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

## Country Selection Component

The package exports `CountrySelectComponent` — a standalone, searchable country dropdown with flag emojis:

```typescript
import { Component } from '@angular/core';
import { CountrySelectComponent } from '@keeratita/card/angular';

@Component({
  selector: 'app-checkout',
  imports: [CountrySelectComponent],
  template: `
    <kg-country-select
      controlName="shipCountry"
      [value]="selectedCountry"
      preset="billing"
      (countryChange)="onCountryChange($event)">
    </kg-country-select>
  `,
})
export class CheckoutComponent {
  selectedCountry = 'US';

  onCountryChange(event: { name: string; value: string }) {
    console.log('Selected country:', event.value);
  }
}
```

**Component Inputs:**
| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `controlName` | `string` | `'country'` | Name/ID for the form control |
| `value` | `string` | `''` | Currently selected country code |
| `preset` | `CardFormPreset` (string) | `'none'` | Preset affecting label/placeholder text |
| `invalid` | `boolean` | `false` | Shows invalid border styling |
| `required` | `boolean` | `true` | Marks the field as required |

**Output:**
- `countryChange` — Emits `{ name: string, value: string }` (form control name + country code)

## Re-exported Utilities

The Angular entry point also re-exports these utilities for convenience when importing from `@keeratita/card/angular`:

- `COUNTRIES` — Array of country objects
- `Country` type
- `formatCardNumber` — Format card number with spacing
- `formatExpiry` — Format expiry date (MMYY → MM / YY)

## Best Practices

1. **Always use validators**: Apply appropriate validators to all card-related form controls
2. **Cross-validation**: Use `cvcValidator('cardNumber')` for proper CVC validation
3. **Real-time formatting**: Utilize the provided directives for automatic input formatting
4. **Proper error handling**: Display validation errors appropriately to users
5. **Accessibility**: Ensure proper labeling and ARIA attributes for screen readers
6. **Security**: Never log or store sensitive card data in your application
