# React Guide for @keeratita/card

This guide provides comprehensive documentation for integrating the `@keeratita/card` library with React applications.

## Table of Contents

1. [Installation](#installation)
2. [Basic Usage](#basic-usage)
3. [Form Hook](#form-hook)
4. [Adapters](#adapters)
5. [Validator Functions](#validator-functions)
6. [Available Examples](#available-examples)
7. [API Reference](#api-reference)

## Installation

```bash
npm install @keeratita/card
```

```jsx
import { StripeAdapter, formatCardNumber, formatExpiry } from '@keeratita/card';
```

## Basic Usage

The easiest way to integrate with React is to use the `useCardForm` hook:

```jsx
import React from 'react';
import { StripeAdapter } from '@keeratita/card';
import { useCardForm } from '@keeratita/card/react';

export function BasicCardForm() {
  const stripeAdapter = new StripeAdapter({
    publicKey: 'pk_test_stripe_key',
  });

  const {
    values,
    brand,
    errors,
    isTokenizing,
    isProcessing,
    isSuccess,
    paymentError,
    isFlipped,
    handleChange,
    handleBlur,
    handleCvcFocus,
    handleCvcBlur,
    handleSubmit,
  } = useCardForm({
    adapter: stripeAdapter,
    onSubmit: async ({ token }) => {
      console.log('Token:', token.id);
    },
  });

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Card Number</label>
        <input
          type='text'
          name='number'
          value={values.number}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder='4242 4242 4242 4242'
        />
        {errors.number && <span style={{ color: 'red' }}>{errors.number}</span>}
      </div>

      <div>
        <label>Expiry Date</label>
        <input
          type='text'
          name='expiry'
          value={values.expiry}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder='MM/YY'
        />
        {errors.expiry && <span style={{ color: 'red' }}>{errors.expiry}</span>}
      </div>

      <div>
        <label>CVC</label>
        <input
          type='text'
          name='cvc'
          value={values.cvc}
          onChange={handleChange}
          onFocus={handleCvcFocus}
          onBlur={(e) => {
            handleBlur(e);
            handleCvcBlur();
          }}
          placeholder='123'
        />
        {errors.cvc && <span style={{ color: 'red' }}>{errors.cvc}</span>}
      </div>

      <div>
        <label>Cardholder Name</label>
        <input
          type='text'
          name='name'
          value={values.name}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder='John Doe'
        />
        {errors.name && <span style={{ color: 'red' }}>{errors.name}</span>}
      </div>

      {brand && <span>Detected: {brand}</span>}
      {isSuccess && (
        <span style={{ color: 'green' }}>✓ Payment successful</span>
      )}
      {paymentError && <span style={{ color: 'red' }}>{paymentError}</span>}

      <button type='submit' disabled={isTokenizing || isProcessing}>
        {isTokenizing
          ? 'Tokenizing...'
          : isProcessing
            ? 'Processing...'
            : 'Pay Now'}
      </button>
    </form>
  );
}
```

## Form Hook

### `useCardForm(options)`

The `useCardForm` hook provides a reactive form state with built-in validation, formatting, and tokenization.

```typescript
import { useCardForm } from '@keeratita/card/react';

interface UseCardFormParams {
  adapter: PaymentGateway; // Payment gateway adapter (required)
  initialValues?: Partial<CardFormValues>; // Initial form values (optional)
  onSubmit?: (data: { token: Token }) => Promise<void> | void; // Success callback (optional)
  onError?: (error: Error) => void; // Error callback (optional)
}

const {
  values,
  brand,
  errors,
  isTokenizing,
  isProcessing,
  isSuccess,
  paymentError,
  isFlipped,
  handleChange,
  handleBlur,
  handleCvcFocus,
  handleCvcBlur,
  handleSubmit,
} = useCardForm({
  adapter: stripeAdapter,
  onSubmit: async ({ token }) => {
    console.log('Token:', token.id);
  },
});
```

### Form Values

```typescript
interface CardFormValues {
  number: string;
  expiry: string;
  cvc: string;
  name: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  email?: string;
}
```

### Hook Return Type

```typescript
interface UseCardFormReturn {
  values: CardFormValues; // Current field values
  brand: CardBrand; // Detected card brand (e.g., "visa", "mastercard", "amex")
  errors: Record<string, string | null>; // Validation errors (null = no error)
  isTokenizing: boolean; // True while tokenizing with gateway
  isProcessing: boolean; // True while processing onSubmit callback
  isSuccess: boolean; // True after successful submission
  paymentError: string | null; // Error message from payment processing
  isFlipped: boolean; // True when CVC is focused (3D card flip)
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  handleCvcFocus: () => void;
  handleCvcBlur: () => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
}
```

### Available Brands

```typescript
type CardBrand =
  | 'visa'
  | 'mastercard'
  | 'amex'
  | 'discover'
  | 'jcb'
  | 'diners'
  | 'unknown';
```

## Adapters

Adapters provide integration with payment processors.

### Stripe Adapter

```jsx
import { StripeAdapter } from '@keeratita/card';

const stripeAdapter = new StripeAdapter({
  publicKey: 'pk_test_your_stripe_api_key',
});

// Tokenize card
const token = await stripeAdapter.tokenize({
  number: '4242424242424242',
  expMonth: '12',
  expYear: '25',
  cvc: '123',
  name: 'John Doe',
  postalCode: '10001',
});

console.log(token.id); // Stripe token ID (e.g., "tok_xxx")
console.log(token.gateway); // "stripe"
```

### Omise Adapter

```jsx
import { OmiseAdapter } from '@keeratita/card';

const omiseAdapter = new OmiseAdapter({
  publicKey: 'pkey_your_omise_public_key',
});

// Tokenize card
const token = await omiseAdapter.tokenize({
  number: '4242424242424242',
  expMonth: '12',
  expYear: '25',
  cvc: '123',
  name: 'John Doe',
});

console.log(token.id); // Omise token ID
console.log(token.gateway); // "omise"
```

### Custom Adapter

Implement the `PaymentGateway` interface to integrate with any payment processor:

```typescript
import type { Card, Token, PaymentGateway } from '@keeratita/card';

class MyAdapter implements PaymentGateway {
  name = 'MyProvider';

  async tokenize(card: Card): Promise<Token> {
    const response = await fetch('/api/create-token', {
      method: 'POST',
      body: JSON.stringify(card),
    });
    const data = await response.json();
    return {
      id: data.id,
      gateway: 'myprovider',
      raw: data,
    };
  }
}
```

## Validator Functions

### `luhnCheck(cardNumber)`

Validates that the credit card number passes Luhn's algorithm.

```jsx
import { luhnCheck } from '@keeratita/card';

luhnCheck('4242424242424242'); // true
luhnCheck('1234567890123456'); // false
```

### `validateExpiry(month, year)`

Validates that the card expiry date is in the future.

```jsx
import { validateExpiry } from '@keeratita/card';

validateExpiry('12', '25'); // true (valid future date)
validateExpiry('01', '20'); // false (expired)
validateExpiry('13', '25'); // false (invalid month)
```

### `validateCvc(cvc, cardNumber)`

Validates that the CVC security code matches the required length (3 or 4 digits depending on brand).

```jsx
import { validateCvc } from '@keeratita/card';

validateCvc('123', '4242424242424242'); // true (3 digits for Visa)
validateCvc('1234', '340000000000009'); // true (4 digits for AMEX)
validateCvc('12', '4242424242424242'); // false (too short)
```

### `validateName(name)`

Validates that the cardholder name contains at least a first and last name.

```jsx
import { validateName } from '@keeratita/card';

validateName('John Doe'); // true
validateName('John'); // false (needs first + last)
```

### `validateEmail(email)`

Validates email format.

```jsx
import { validateEmail } from '@keeratita/card';

validateEmail('user@example.com'); // true
validateEmail('user@'); // false
```

### `validatePhone(phone)`

Validates phone number (minimum 8 digits).

```jsx
import { validatePhone } from '@keeratita/card';

validatePhone('1234567890'); // true
validatePhone('123'); // false (too short)
```

### `validatePostalCode(postalCode)`

Validates postal code (minimum 4 characters).

```jsx
import { validatePostalCode } from '@keeratita/card';

validatePostalCode('10001'); // true
validatePostalCode('12'); // false (too short)
```

### `validateCountry(country)`

Validates ISO country code (2-3 letter code).

```jsx
import { validateCountry } from '@keeratita/card';

validateCountry('US'); // true
validateCountry('USA'); // true
validateCountry('X'); // false
```

### `detectCardBrand(cardNumber)`

Detects the credit card brand from the card number.

```jsx
import { detectCardBrand } from '@keeratita/card';

detectCardBrand('4242424242424242'); // "visa"
detectCardBrand('5500000000000004'); // "mastercard"
detectCardBrand('340000000000009'); // "amex"
detectCardBrand('6011000000000004'); // "discover"
detectCardBrand(''); // "unknown"
```

### Formatters

```jsx
import {
  formatCardNumber,
  formatExpiry,
  formatCvc,
  cleanDigits,
} from '@keeratita/card';

formatCardNumber('4242424242424242'); // "4242 4242 4242 4242"
formatCardNumber('340000000000009'); // "3400 000000 00009" (AMEX)
formatExpiry('1225'); // "12 / 25"
formatCvc('12345', '4242424242424242'); // "123" (3 digits for Visa)
formatCvc('1234', '340000000000009'); // "1234" (4 digits for AMEX)
cleanDigits('4242 4242 4242 4242'); // "4242424242424242"
```

## Available Examples

The library includes several example applications demonstrating different use cases:

| Example                 | Description                                                   |
| ----------------------- | ------------------------------------------------------------- |
| **Basic Form**          | Quick start with `useCardForm` hook and minimal configuration |
| **Presets**             | Experiment with billing, contact, and US cardholder presets   |
| **Custom Validation**   | Built-in and custom validation logic for payment forms        |
| **Multi-Step Checkout** | Complete checkout flow with cart, shipping, and payment       |
| **Live Preview**        | Real-time card preview as users enter details                 |
| **Omise Adapter**       | Integration with Omise payment gateway                        |
| **Dark Theme**          | Dark mode support for modern applications                     |
| **Corporate Theme**     | Enterprise-style payment form with security indicators        |
| **Gradient Theme**      | Modern gradient background with clean styling                 |
| **Minimal Theme**       | Clean design with focus on simplicity                         |
| **Flip Card Demo**      | Interactive 3D flip card animation with brand detection       |
| **Country Dropdown**    | Searchable country selection with flags and dial codes        |

## API Reference

### Exports

```jsx
// Hook (from @keeratita/card/react)
import { useCardForm } from '@keeratita/card/react';

// Validators
import {
  luhnCheck,
  validateExpiry,
  validateCvc,
  validateName,
  validateEmail,
  validatePhone,
  validatePostalCode,
  validateCountry,
} from '@keeratita/card';

// Formatters
import {
  formatCardNumber,
  formatExpiry,
  formatCvc,
  cleanDigits,
} from '@keeratita/card';

// Brand Detection
import { detectCardBrand } from '@keeratita/card';

// Adapters
import { StripeAdapter, OmiseAdapter } from '@keeratita/card';

// Country Data
import { COUNTRIES } from '@keeratita/card';
```

### Country Data

```jsx
import { COUNTRIES } from '@keeratita/card';

// Get all countries (244 countries with flags)
const allCountries = COUNTRIES;

// Get country by code
const us = COUNTRIES.find(c => c.code === 'US');
console.log(us?.emoji, us?.name); // 🇺🇸 United States

// Country type
interface Country {
  name: string;
  code: string;      // ISO 3166-1 alpha-2
  emoji: string;     // Unicode flag emoji
  dialCode: string;  // International dial code
}
```

## Best Practices

1. **Use the hook**: Always use `useCardForm` for form state management
2. **Validate in real-time**: Use built-in validators for immediate feedback
3. **Format inputs**: Use `formatCardNumber` and `formatExpiry` for user-friendly input
4. **Detect card brand**: Use `detectCardBrand()` to show appropriate CVC length and card logos
5. **Choose the right adapter**: Select the payment processor adapter that matches your needs
6. **Error handling**: Display validation errors appropriately to users
7. **Accessibility**: Ensure proper labeling and ARIA attributes for screen readers
8. **Security**: Never log or store sensitive card data in your application
