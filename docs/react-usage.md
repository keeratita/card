# React Integration Guide

This document provides comprehensive guidance on integrating the `@keeratita/card` library with React applications using hooks and utility functions.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Card Form Hook](#card-form-hook)
3. [CardForm Component](#cardform-component)
4. [Reactive Form Components](#reactive-form-components)
5. [Country Autocomplete Component](#country-autocomplete-component)
6. [Payment Adapters](#payment-adapters)
7. [Utility Functions](#utility-functions)
8. [Country Data](#country-data)
9. [Complete Examples](#complete-examples)

## Quick Start

The fastest way to get started is to use the provided utility functions directly in your React components:

```tsx
import React, { useState, useCallback } from 'react';
import {
  StripeAdapter,
  formatCardNumber,
  formatExpiry,
  luhnCheck,
} from '@keeratita/card';

const stripeAdapter = new StripeAdapter({
  publicKey: 'your_stripe_public_key',
});

export function CardForm() {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');

  const handleCardNumberChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/\D/g, '');
      const formatted = formatCardNumber(raw);
      setCardNumber(formatted);
    },
    [],
  );

  const handleExpiryChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/\D/g, '');
      const formatted = formatExpiry(raw);
      setExpiry(formatted);
    },
    [],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNumber = cardNumber.replace(/\s/g, '');

    if (!luhnCheck(cleanNumber)) {
      alert('Invalid card number');
      return;
    }

    const token = await stripeAdapter.tokenize({
      number: cleanNumber,
      expMonth: expiry.substring(0, 2),
      expYear: expiry.substring(2, 4),
      cvc,
    });
    console.log('Token:', token.id);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type='text'
        value={cardNumber}
        onChange={handleCardNumberChange}
        placeholder='4242 4242 4242 4242'
      />
      <input
        type='text'
        value={expiry}
        onChange={handleExpiryChange}
        placeholder='MM / YY'
      />
      <input
        type='text'
        value={cvc}
        onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))}
        placeholder='123'
      />
      <button type='submit'>Pay</button>
    </form>
  );
}
```

## Card Form Hook

The library provides a custom hook `useCardForm` that manages card form state, formatting, and validation:

```tsx
import React from 'react';
import { StripeAdapter } from '@keeratita/card';
import { useCardForm } from '@keeratita/card/react';

const stripeAdapter = new StripeAdapter({
  publicKey: 'pk_test_stripe_key',
});

export function CardFormWithHook() {
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
      <input
        type='text'
        value={values.number}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder='4242 4242 4242 4242'
        style={{
          borderColor: errors.number ? '#cf222e' : '#d0d7de',
        }}
      />
      {errors.number && (
        <span style={{ color: '#cf222e' }}>Invalid card number</span>
      )}

      <input
        type='text'
        value={values.expiry}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder='MM / YY'
        style={{
          borderColor: errors.expiry ? '#cf222e' : '#d0d7de',
        }}
      />
      {errors.expiry && (
        <span style={{ color: '#cf222e' }}>Invalid expiry</span>
      )}

      <input
        type='text'
        value={values.cvc}
        onChange={handleChange}
        onFocus={handleCvcFocus}
        onBlur={(e) => {
          handleBlur(e);
          handleCvcBlur();
        }}
        placeholder='123'
        style={{
          borderColor: errors.cvc ? '#cf222e' : '#d0d7de',
        }}
      />
      {errors.cvc && <span style={{ color: '#cf222e' }}>Invalid CVC</span>}

      <input
        type='text'
        value={values.name}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder='Cardholder Name'
        style={{
          borderColor: errors.name ? '#cf222e' : '#d0d7de',
        }}
      />
      {errors.name && <span style={{ color: '#cf222e' }}>Invalid name</span>}

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
            : 'Pay'}
      </button>
    </form>
  );
}
```

### Hook Return Type

```typescript
interface FormState {
  number: string;
  expiry: string;
  cvc: string;
  name: string;
}

// Error values are i18n strings (null means no error for that field)
interface FormErrors {
  number: string | null;
  expiry: string | null;
  cvc: string | null;
  name: string | null;
  [field: string]: string | null; // Optional fields (email, phone, postalCode, etc.)
}

interface UseCardFormReturn {
  values: FormState; // Current field values
  brand: string; // Detected card brand (e.g., "visa", "mastercard")
  errors: Record<string, string | null>; // Validation errors (null = no error)
  isTokenizing: boolean;
  isProcessing: boolean;
  isSuccess: boolean;
  paymentError: string | null;
  isFlipped: boolean; // True when CVC is focused (3D card flip)
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  handleBlur: (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  handleCvcFocus: () => void;
  handleCvcBlur: () => void;
  handleSubmit: (e?: React.FormEvent<HTMLFormElement>) => Promise<void>;
}
```

### Hook Parameters

```typescript
interface UseCardFormParams {
  adapter: PaymentGateway; // Payment gateway adapter (required)
  initialValues?: Partial<CardFormValues>; // Initial form values (optional)
  onSubmit?: (data: { token: Token }) => Promise<void> | void; // Success callback (optional)
  onError?: (error: Error) => void; // Error callback (optional)
}
```

## CardForm Component

The `CardForm` component provides a complete, ready-to-use payment form with built-in card preview:

```tsx
import { CardForm, CreditCardPreview } from '@keeratita/card/react';
import { StripeAdapter } from '@keeratita/card';

const stripeAdapter = new StripeAdapter({
  publicKey: 'pk_test_stripe_key',
});

function MyApp() {
  return (
    <CardForm
      adapter={stripeAdapter}
      preset='billing'
      cardLabel='VISA'
      submitButtonText='Pay Now'
      onSubmit={({ token }) => console.log('Token:', token.id)}
      onError={(error) => console.error('Error:', error)}
      initialValues={{ name: 'John Doe' }}
    />
  );
}
```

### CardForm Props

```typescript
interface CardFormProps {
  adapter: PaymentGateway; // Payment gateway adapter (required)
  preset?: CardFormPreset; // Form preset: 'none' | 'us' | 'billing' | 'contact'
  fields?: OptionalCardField[]; // Additional fields to include
  cardLabel?: string; // Label shown on card preview (e.g., "VISA", "OMISE")
  submitButtonText?: string; // Text for submit button (default: "Pay Now")
  onSubmit?: (data: { token: Token }) => Promise<void> | void; // Success callback
  onError?: (error: Error) => void; // Error callback
  initialValues?: Partial<CardFormValues>; // Initial form values
}
```

### Available Presets

| Preset      | Description          | Additional Fields                                                   |
| ----------- | -------------------- | ------------------------------------------------------------------- |
| `'none'`    | Core fields only     | Card Number, Expiry, CVC, Name                                      |
| `'us'`      | US cardholder        | + Postal Code (ZIP), Country                                         |
| `'billing'` | Full billing address | + Address Line 1, Address Line 2, City, State, Postal Code, Country |
| `'contact'` | Contact details      | + Email, Phone                                                      |

### Card Form Values

```typescript
interface CardFormValues {
  number: string; // Card number (formatted: "4242 4242 4242 4242")
  expiry: string; // Expiry date (formatted: "12 / 25")
  cvc: string; // CVC security code
  name: string; // Cardholder name
  addressLine1?: string; // Street address
  addressLine2?: string; // Apartment, suite, unit, etc.
  city?: string; // City
  state?: string; // State/Province
  postalCode?: string; // Postal/ZIP code
  country?: string; // Country code (ISO 3166-1 alpha-2)
  phone?: string; // Phone number
  email?: string; // Email address
}
```

### Optional Card Fields

```typescript
type OptionalCardField =
  | 'addressLine1'
  | 'addressLine2'
  | 'city'
  | 'state'
  | 'postalCode'
  | 'country'
  | 'phone'
  | 'email';
```

## Reactive Form Components

The library exports individual form field components that can be composed into custom layouts:

### CardNumberInput

```tsx
import { CardNumberInput } from '@keeratita/card/react';

<CardNumberInput
  value={values.number}
  error={errors.number}
  onChange={handleChange}
  onBlur={handleBlur}
  placeholder='4242 4242 4242 4242'
  label='Card Number'
  id='card-number'
  className=''
  showErrorBorder={true}
/>;
```

### ExpiryInput

```tsx
import { ExpiryInput } from '@keeratita/card/react';

<ExpiryInput
  value={values.expiry}
  error={errors.expiry}
  onChange={handleChange}
  onBlur={handleBlur}
  placeholder='MM / YY'
  label='Expiry Date'
  id='card-expiry'
/>;
```

### CvcInput

```tsx
import { CvcInput } from '@keeratita/card/react';

<CvcInput
  value={values.cvc}
  error={errors.cvc}
  onChange={handleChange}
  onBlur={handleBlur}
  onFocus={handleCvcFocus}
  brand={brand}
  placeholder='123'
  label='CVC'
  id='card-cvc'
/>;
```

### SubmitButton

```tsx
import { SubmitButton } from '@keeratita/card/react';

<SubmitButton
  isSubmitting={isTokenizing || isProcessing}
  isSuccess={isSuccess}
  isTokenizing={isTokenizing}
  text='Pay Now'
  style={{}}
/>;
```

### FormField

A generic form field wrapper for custom inputs:

```tsx
import { FormField } from '@keeratita/card/react';

<FormField
  name='email'
  label='Email'
  type='email'
  value={values.email}
  onChange={handleChange}
  onBlur={handleBlur}
  error={errors.email}
  placeholder='email@example.com'
/>;
```

### FormFieldsGroup

A grouped form section that includes all core fields plus optional fields:

```tsx
import { FormFieldsGroup } from '@keeratita/card/react';

<FormFieldsGroup
  values={values}
  errors={errors}
  brand={brand}
  preset='billing'
  optionalFields={fields}
  handleChange={handleChange}
  handleBlur={handleBlur}
  handleCvcFocus={handleCvcFocus}
  handleCvcBlur={handleCvcBlur}
  headerLabel='Payment Method'
  className=''
/>;
```

## Country Autocomplete Component

The `CountryAutocomplete` component provides a searchable country dropdown with flag emojis:

```tsx
import { CountryAutocomplete } from '@keeratita/card/react';

<CountryAutocomplete
  value={values.country}
  onChange={(countryCode) => {
    setValues((prev) => ({ ...prev, country: countryCode }));
  }}
  placeholder='Select a country...'
  searchPlaceholder='Search countries...'
  id='card-country'
  className=''
/>;
```

### CountryAutocomplete Props

```typescript
interface CountryAutocompleteProps {
  value: string; // Selected country code (e.g., "US", "GB")
  onChange: (countryCode: string) => void; // Called when a country is selected
  placeholder?: string; // Placeholder when no country selected
  searchPlaceholder?: string; // Placeholder for search input
  className?: string; // CSS class for the wrapper
  id?: string; // HTML id for the input element
}
```

### Features

- **Search filtering**: Type to filter countries by name or code
- **Flag emojis**: Each country displays its Unicode flag emoji
- **Keyboard navigation**: Use Arrow keys, Enter, and Escape
- **Lazy loading**: Loads 20 countries at a time with scroll-to-load-more
- **Auto-positioning**: Dropdown positions itself to avoid viewport overflow
- **Click outside**: Closes dropdown when clicking outside

## Payment Adapters

The library provides adapter implementations for popular payment processors.

> ⚠️ **Use publishable keys only.** The adapters run in the browser and must be
> configured with **public** keys (`pk_…` Stripe, `pkey_…` Omise). You may load
> them from client-side env vars (e.g. `VITE_STRIPE_PUBLIC_KEY`), but those env
> vars must hold **public keys only** — never **secret** keys (`sk_…` Stripe,
> `skey_…` Omise). Anything in the client bundle is visible to every user, and
> the adapters throw at construction when given a secret-looking key.

### Stripe Adapter

```typescript
import { StripeAdapter } from '@keeratita/card';

const stripeAdapter = new StripeAdapter({
  publicKey: 'pk_test_your_stripe_key',
});

// Tokenize a card
const token = await stripeAdapter.tokenize({
  number: '4242424242424242',
  expMonth: '12',
  expYear: '28',
  cvc: '123',
  name: 'John Doe',
  postalCode: '10001',
});

console.log(token.id); // tok_xxx
```

### Omise Adapter

```typescript
import { OmiseAdapter } from '@keeratita/card';

const omiseAdapter = new OmiseAdapter({
  publicKey: 'pkey_test_your_omise_key',
});

const token = await omiseAdapter.tokenize({
  number: '4242424242424242',
  expMonth: '12',
  expYear: '28',
  cvc: '123',
  name: 'John Doe',
});
```

### Custom Adapter

Extend the `PaymentGateway` interface to integrate with any payment processor:

```typescript
import type { Card, Token, PaymentGateway } from '@keeratita/card';

interface MyTokenResult extends Token {
  // ... your adapter's additional token properties
}

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

const adapter = new MyAdapter();
```

## Utility Functions

### Card Number Formatting

```typescript
import { formatCardNumber } from '@keeratita/card';

formatCardNumber('4242424242424242');
// => "4242 4242 4242 4242"

formatCardNumber('5500000000000004');
// => "5500 0000 0000 0004"

formatCardNumber('340000000000009'); // AMEX
// => "3400 000000 00009"
```

### Expiry Formatting

```typescript
import { formatExpiry } from '@keeratita/card';

formatExpiry('1228');
// => "12 / 28"

formatExpiry('122');
// => "12 / 2"

formatExpiry('1');
// => "1"
```

### Card Validation

```typescript
import { luhnCheck, validateExpiry, validateCvc } from '@keeratita/card';

// Luhn check for card numbers
luhnCheck('4242424242424242'); // => true
luhnCheck('1234567890123456'); // => false

// Expiry validation
validateExpiry('12', '28'); // => true (valid future date)
validateExpiry('01', '20'); // => false (expired)
validateExpiry('13', '28'); // => false (invalid month)

// CVC validation
validateCvc('123', '4242424242424242'); // => true (3 digits for Visa)
validateCvc('1234', '340000000000009'); // => true (4 digits for AMEX)
validateCvc('12', '4242424242424242'); // => false (too short)
```

### Brand Detection

```typescript
import { detectCardBrand } from '@keeratita/card';

detectCardBrand('4242424242424242'); // => "VISA"
detectCardBrand('5500000000000004'); // => "MASTERCARD"
detectCardBrand('340000000000009'); // => "AMEX"
detectCardBrand('6011000000000004'); // => "DISCOVER"
detectCardBrand(''); // => "unknown" (default for invalid/empty input)
```

> **Note:** The library exports `detectCardBrand()` but does not currently export a `BRAND_LOGOS` constant. Use the brand value to drive your own UI logic (e.g., conditional CSS classes or SVG rendering).

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

### Additional Formatters

```typescript
import {
  cleanDigits,
  formatCvc,
  formatPhone,
  reformatExpiryDate,
  validateCardNumberLength,
  isCardLengthValid,
} from '@keeratita/card';

// Strip all non-digit characters
cleanDigits('4242 4242 4242 4242'); // => "4242424242424242"

// Format CVC (restricts length based on card brand)
formatCvc('12345', '4242424242424242'); // => "123"
formatCvc('1234', '340000000000009'); // => "1234" (AMEX allows 4)

// Format phone number
formatPhone('+2345678901'); // => "+2345678901"

// Reformat expiry date (handles "1225", "12-25", "12/2025", etc.)
reformatExpiryDate('1225'); // => "12 / 25"

// Check if card number length is valid for its brand
isCardLengthValid('4242424242424242'); // => true (Visa expects 16 digits)
isCardLengthValid('340000000000009'); // => true (AMEX expects 15 digits)
isCardLengthValid('1234567890123456'); // => false (invalid length)
validateCardNumberLength('4242424242424242'); // => { isValid: true, expectedLength: 16, actualLength: 16 }
validateCardNumberLength('340000000000009'); // => { isValid: true, expectedLength: 15, actualLength: 15 }
```

### Additional Validators

```typescript
import {
  validateName,
  validateEmail,
  validatePhone,
  validatePostalCode,
  validateCountry,
  validateGeneric,
} from '@keeratita/card';

// Validate cardholder name
validateName('John Doe'); // => true
validateName('John'); // => false (needs first + last)

// Validate email
validateEmail('user@example.com'); // => true
validateEmail('user@'); // => false

// Validate phone
validatePhone('1234567890'); // => true (at least 8 digits)
validatePhone('123'); // => false (too short)

// Validate postal code
validatePostalCode('10001'); // => true (at least 4 chars)
validatePostalCode('12'); // => false (too short)

// Validate country code
validateCountry('US'); // => true (2-3 letter ISO code)
validateCountry('USA'); // => true

// Generic validation (non-empty trimmed string)
validateGeneric('hello'); // => true
validateGeneric('  '); // => false
```

### Error Classes (Adapters)

```typescript
import {
  PaymentGatewayError,
  NetworkError,
  ApiValidationError,
} from '@keeratita/card';

// All adapters throw these error types
try {
  await adapter.tokenize(card);
} catch (err) {
  if (err instanceof NetworkError) {
    console.error('Network issue:', err.message);
  } else if (err instanceof ApiValidationError) {
    console.error('API rejected:', err.code, err.message);
  } else {
    console.error('Gateway error:', err.message);
  }
}
```

## Country Data

The library exports a comprehensive list of countries with flags and dial codes:

```typescript
import { COUNTRIES, type Country } from '@keeratita/card';

// Get all countries (244)
const allCountries: Country[] = COUNTRIES;

// Find country by code
const us = COUNTRIES.find((c) => c.code === 'US');
console.log(us?.emoji); // => "🇺🇸"
console.log(us?.name); // => "United States"
console.log(us?.dialCode); // => "+1"

// Filter countries by search
const query = 'japan';
const results = COUNTRIES.filter(
  (c) =>
    c.name.toLowerCase().includes(query) ||
    c.code.toLowerCase().includes(query),
);
```

### Country Type

```typescript
interface Country {
  name: string;
  code: string; // ISO 3166-1 alpha-2 (e.g., "US", "GB", "JP")
  emoji: string; // Unicode flag emoji
  dialCode?: string; // International dial code (e.g., "+1", "+81")
}
```

## Complete Examples

### Basic Card Form with Stripe

```tsx
import React, { useState, useCallback } from 'react';
import {
  StripeAdapter,
  formatCardNumber,
  formatExpiry,
  luhnCheck,
  validateExpiry,
  validateCvc,
} from '@keeratita/card';

const stripeAdapter = new StripeAdapter({
  publicKey: 'pk_test_stripe_key',
});

export function BasicCardForm() {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [name, setName] = useState('');
  const [token, setToken] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCardNumberChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/\D/g, '');
      setCardNumber(formatCardNumber(raw));
    },
    [],
  );

  const handleExpiryChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/\D/g, '');
      setExpiry(formatExpiry(raw));
    },
    [],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const cleanNumber = cardNumber.replace(/\s/g, '');
      const expParts = expiry.split(' / ');
      const result = await stripeAdapter.tokenize({
        number: cleanNumber,
        expMonth: expParts[0] || '',
        expYear: expParts[1] || '',
        cvc,
        name,
      });
      setToken(result);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={cardNumber}
        onChange={handleCardNumberChange}
        placeholder='Card Number'
      />
      <input
        value={expiry}
        onChange={handleExpiryChange}
        placeholder='Expiry'
      />
      <input
        value={cvc}
        onChange={(e) => setCvc(e.target.value)}
        placeholder='CVC'
      />
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder='Name'
      />
      <button disabled={isProcessing}>
        {isProcessing ? 'Processing...' : 'Pay'}
      </button>
      {token && <div>Token: {token.id}</div>}
    </form>
  );
}
```

### Form with Validation

```tsx
import React, { useState, useCallback } from 'react';
import {
  luhnCheck,
  validateExpiry,
  validateCvc,
  formatCardNumber,
  formatExpiry,
} from '@keeratita/card';

export function ValidatedCardForm() {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [errors, setErrors] = useState<{
    number?: string;
    expiry?: string;
    cvc?: string;
  }>({});

  const validate = useCallback(() => {
    const newErrors: typeof errors = {};
    const cleanNumber = cardNumber.replace(/\s/g, '');

    if (cleanNumber.length >= 13 && !luhnCheck(cleanNumber)) {
      newErrors.number = 'Invalid card number';
    }

    if (expiry.length === 4) {
      const month = expiry.substring(0, 2);
      const year = expiry.substring(2, 4);
      if (!validateExpiry(month, year)) {
        newErrors.expiry = 'Invalid expiry date';
      }
    }

    if (cvc.length >= 3 && !validateCvc(cvc, cleanNumber)) {
      newErrors.cvc = 'Invalid CVC';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [cardNumber, expiry, cvc]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        validate() && submit();
      }}
    >
      <input
        value={cardNumber}
        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
        style={{ borderColor: errors.number ? 'red' : undefined }}
        placeholder='Card Number'
      />
      {errors.number && <span style={{ color: 'red' }}>{errors.number}</span>}

      <input
        value={expiry}
        onChange={(e) => setExpiry(formatExpiry(e.target.value))}
        style={{ borderColor: errors.expiry ? 'red' : undefined }}
        placeholder='MM / YY'
      />
      {errors.expiry && <span style={{ color: 'red' }}>{errors.expiry}</span>}

      <input
        value={cvc}
        onChange={(e) => setCvc(e.target.value)}
        style={{ borderColor: errors.cvc ? 'red' : undefined }}
        placeholder='CVC'
      />
      {errors.cvc && <span style={{ color: 'red' }}>{errors.cvc}</span>}

      <button type='submit'>Pay</button>
    </form>
  );
}
```

### Country Dropdown Component

```tsx
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { COUNTRIES, type Country } from '@keeratita/card';

export function CountryDropdown() {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filtered = COUNTRIES.filter(
    (c) =>
      !searchQuery ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.code.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const selectCountry = useCallback((country: Country) => {
    setSelectedCountry(country);
    setSearchQuery('');
    setIsOpen(false);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '12px',
          border: '1px solid #d0d7de',
          borderRadius: '6px',
          cursor: 'pointer',
        }}
      >
        {selectedCountry ? (
          <>
            <span style={{ marginRight: '8px' }}>{selectedCountry.emoji}</span>
            {selectedCountry.name}
          </>
        ) : (
          <span style={{ color: '#6e7781' }}>Select a country</span>
        )}
      </div>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            border: '1px solid #d0d7de',
            borderRadius: '6px',
            background: '#fff',
            zIndex: 1000,
          }}
        >
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder='Search...'
            style={{
              width: '100%',
              padding: '8px',
              border: 'none',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          {filtered.map((country) => (
            <div
              key={country.code}
              onClick={() => selectCountry(country)}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>{country.emoji}</span>
              <span>{country.name}</span>
              <span style={{ color: '#586069', fontSize: '12px' }}>
                {country.code}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## Best Practices

1. **Always validate card numbers**: Use `luhnCheck()` to verify card numbers before tokenization
2. **Format inputs in real-time**: Use `formatCardNumber()` and `formatExpiry()` for better UX
3. **Detect card brand**: Use `detectCardBrand()` to show appropriate CVC length and card logos
4. **Handle errors gracefully**: Display validation errors inline with form fields
5. **Use adapters for tokenization**: Never send raw card data to your own servers
6. **Store tokens securely**: Store only the returned token IDs, never the card details
7. **Accessibility**: Use proper labels and ARIA attributes for screen readers
8. **TypeScript**: Use the provided type definitions for better IDE support
