# @keeratita/card

A lightweight, framework-agnostic TypeScript library that provides a secure, premium translucent credit card input form with iOS-style visual design principles, real-time input formatting/validations, CVC 3D card flips, and direct REST tokenization vaulting to Stripe and Omise.

No SDK scripts or CDNs are required. The package uses direct browser-to-vault REST APIs, ensuring absolute control over performance, accessibility, and visual aesthetics.

## Live Demo

- Home: https://keeratita.github.io/card/
- Vanilla demo: https://keeratita.github.io/card/examples/vanilla/index.html

---

## Features

- **Liquid Glass Visual Style**: Grouped input list rows with squircle rounded corners, thin separators, glassmorphic card previews, and dynamic visual state triggers.
- **3D Card Preview**: Responsive digital preview card that dynamically mirrors input fields and flips 180 degrees to show the signature strip when the CVC field gains focus.
- **Direct REST Vaulting**: Perform secure browser-to-vault POST tokenization calls to Stripe (`api.stripe.com/v1/tokens`) and Omise (`vault.omise.co/tokens`) without loading external SDK CDNs.
- **Dynamic Field Preset Configurations**: Load required optional fields automatically (ZIP Code for US cards, full billing addresses, or customer contacts) dynamically.
- **Double-Loading submission lifecycle**: Automatically manages `"Tokenizing..."` and `"Processing..."` states, allowing host backends to verify transactions before form locks or rollbacks.
- **Strict Data Isolation**: Credit card details are dereferenced immediately from in-memory contexts after vault queries complete to guarantee zero caching leaks.
- **Framework Agnostic**: Integrates natively with Vanilla JS, React, or Angular Reactive Forms.

---

## Installation

```bash
npm install @keeratita/card
```

Make sure to install React (for hook integrations) if compiling framework wrappers.

---

## 🎨 CSS Stylesheet Options

The package includes two stylesheet versions:

| File | Size | Description |
|------|------|-------------|
| `styles.css` | ~10KB | Uncompressed development version with source maps |
| `styles.min.css` | ~8.2KB | Minified production version with source maps |

For production deployments, use `styles.min.css` for better performance (~18% smaller file size).

---

## 🚀 Quick Start & Integration Guides

### 1. Vanilla JavaScript Integration

Add the stylesheet to your HTML page header:

```html
<!-- Development (uncompressed) -->
<link
  rel="stylesheet"
  href="node_modules/@keeratita/card/dist/vanilla/styles.css"
/>

<!-- Production (minified) - Recommended for production -->
<link
  rel="stylesheet"
  href="node_modules/@keeratita/card/dist/vanilla/styles.min.css"
/>
```

#### A. Inline Form Mode

Attach the form directly to a container element on your page:

```html
<div id="inline-payment-form"></div>
```

```typescript
import { StripeAdapter } from '@keeratita/card';
import { CardForm } from '@keeratita/card/vanilla';

// Initialize the gateway adapter
const stripeAdapter = new StripeAdapter({
  publicKey: 'pk_test_your_stripe_key',
});

// Instantiate the form controller
const form = new CardForm('#inline-payment-form', {
  adapter: stripeAdapter,
  preset: 'billing', // Loads addressLine1, city, state, postalCode, country
  cardLabel: 'Visa Platinum',
  submitButtonText: 'Pay Now',
  onSubmit: async ({ token }) => {
    // Phase 2: Send token.id to your backend checkout API
    const response = await fetch('/api/charge', {
      method: 'POST',
      body: JSON.stringify({ tokenId: token.id }),
    });
    if (!response.ok) {
      throw new Error('Transaction declined from backend API.');
    }
  },
  onError: (error) => {
    console.error('Validation or API vault failure: ', error.message);
  },
});
```

#### B. Popover Checkout Modal Mode

Instantiate a overlay dialog popup that dynamically slides up:

```typescript
import { OmiseAdapter } from '@keeratita/card';
import { CardModal } from '@keeratita/card/vanilla';

const omiseAdapter = new OmiseAdapter({
  publicKey: 'pkey_test_your_omise_key',
});

const checkoutModal = new CardModal({
  adapter: omiseAdapter,
  preset: 'us', // ZIP Code preset
  onSubmit: async ({ token }) => {
    // Direct secure submit to your backend payment processing API
    await processPayment(token);
  },
});

// Open checkout popup drawer
button.addEventListener('click', () => checkoutModal.open());
```

---

### 2. React Integration

#### A. Pre-Built UI Component (`CardForm`)

The easiest integration path in React is dropping our pre-built, pre-styled glassmorphic `CardForm` component. Make sure to import the package stylesheet in your root file:

```typescript
import '@keeratita/card/dist/vanilla/styles.css';
```

```tsx
import React from 'react';
import { StripeAdapter } from '@keeratita/card';
import { CardForm } from '@keeratita/card/react';

const stripeAdapter = new StripeAdapter({ publicKey: 'pk_test_stripe_key' });

export default function CheckoutPage() {
  const handleCheckout = async ({ token }) => {
    // Send token.id to your backend payment processing API
    await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tokenId: token.id }),
    });
  };

  return (
    <CardForm
      adapter={stripeAdapter}
      preset='billing'
      submitButtonText='Pay $29.99'
      onSubmit={handleCheckout}
      onError={(error) => console.error('Checkout error:', error.message)}
    />
  );
}
```

#### B. Headless React Hook (`useCardForm`)

If you want absolute control over your visual design, use the headless `useCardForm` hook to manage input state, real-time masking, brand detection, and loading cycles manually:

```tsx
import React from 'react';
import { StripeAdapter } from '@keeratita/card';
import { useCardForm } from '@keeratita/card/react';

const stripeAdapter = new StripeAdapter({ publicKey: 'pk_test_stripe_key' });

export default function CustomCheckoutForm() {
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
      // Backend transaction API verify
      await chargeCard(token.id);
    },
  });

  return (
    <form onSubmit={handleSubmit}>
      {/* Dynamic 3D Card Preview container */}
      <div className={`card-inner ${isFlipped ? 'flipped' : ''}`}>
        <div className='card-num-preview'>
          {values.number || '•••• •••• •••• ••••'}
        </div>
        <div className='card-brand'>{brand.toUpperCase()}</div>
      </div>

      {/* Form Fields */}
      <input
        type='text'
        name='number'
        value={values.number}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder='Card Number'
      />
      {errors.number && <span>{errors.number}</span>}

      <input
        type='password'
        name='cvc'
        value={values.cvc}
        onChange={handleChange}
        onFocus={handleCvcFocus}
        onBlur={(e) => {
          handleBlur(e);
          handleCvcBlur();
        }}
        placeholder='CVC'
      />

      <button type='submit' disabled={isTokenizing || isProcessing}>
        {isTokenizing
          ? 'Tokenizing...'
          : isProcessing
            ? 'Processing...'
            : 'Pay'}
      </button>
      {paymentError && <div className='error'>{paymentError}</div>}
    </form>
  );
}
```

---

### 3. Angular Integration Helpers

#### A. Reactive Forms Configuration

Initialize a pre-validated `FormGroup` automatically using the `createCardFormGroup` helper:

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

Or configure fields manually using the individual validator helpers:

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

#### B. Real-Time Masking Directives

The package exports pre-built standalone input masking directives out-of-the-box. Import them directly into your standalone components:

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

---

## 🛠️ API Reference

### Form Configurations (`CardFormOptions`)

| Attribute          | Type                  | Required | Description                                                       |
| :----------------- | :-------------------- | :------- | :---------------------------------------------------------------- |
| `adapter`          | `PaymentGateway`      | Yes      | `StripeAdapter` or `OmiseAdapter`                                 |
| `preset`           | `CardFormPreset`      | No       | `'none' \| 'us' \| 'billing' \| 'contact'` (default: `'none'`)    |
| `fields`           | `OptionalCardField[]` | No       | Array of optional elements to render                              |
| `cardLabel`        | `string`              | No       | Overrides gateway text displayed in preview top-right             |
| `submitButtonText` | `string`              | No       | Custom submit button label (default: `'Pay Now'`)                 |
| `onSubmit`         | `Function`            | No       | Callback triggered after token retrieval; supports async Promises |
| `onError`          | `Function`            | No       | Hook fired on validation errors or request failures               |

### Optional Fields presets (`CardFormPreset`)

- `'none'`: Default core layout (Card Number, Expiry, CVC, Cardholder Name).
- `'us'`: core fields + Postal Code (ZIP Code visual mapping).
- `'billing'`: core fields + Address Line 1, City, State, Postal Code, Country.
- `'contact'`: core fields + Email, Phone.

---

## 🛡️ Security & Anti-Leak Compliance

1. **Vault CORS Requests Only**: Data is sent straight to the secure token vault servers from the client's browser session. Your server context never touches raw PAN details.
2. **Strict Heap Sanitation**: Sensitive data properties (`Card` data structures, raw input buffers) are assigned to `null` immediately after vault POST calls finish to ensure immediate garbage collection.
3. **Zero Logs**: The library does not contain loggers tracing card details.
4. **Accessible Semantics**: Supports accessibility keyboard focus tags, overlays ARIA markers, autocomplete attributes, and manages focus traps.

---

## Author

- **Author**: Keerati Tansawatcharoen
- **Email**: keerati.tansawatcharoen@gmail.com
- **GitHub**: [keeratita/card](https://github.com/keeratita/card)

---

## License

MIT License. SIL Open Font License Inter typography stack. Custom MIT SVG brand icons.
