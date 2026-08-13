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

| File             | Size   | Description                                       |
| ---------------- | ------ | ------------------------------------------------- |
| `styles.css`     | ~10KB  | Uncompressed development version with source maps |
| `styles.min.css` | ~8.2KB | Minified production version with source maps      |

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

#### A. Headless React Hook (`useCardForm`)

Use the headless `useCardForm` hook to build custom card forms with full control over your visual design. The hook manages input state, real-time masking, brand detection, and tokenization:

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

The Angular entry point targets the latest Angular (v21+, signal-based APIs)
— `input()`/`output()`/`computed()` signal syntax, the `@if`/`@for` control
flow, `inject()` DI, and standalone components/directives (shipped with an
explicit `standalone: true` so consumer AOT builds can resolve them).

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
| `onSubmit`         | `Function`            | No       | Callback triggered after token retrieval; supports async Promises (and thenables) |
| `onError`          | `Function`            | No       | Hook fired on client-side validation errors or gateway/request failures   |

### Optional Fields presets (`CardFormPreset`)

- `'none'`: Default core layout (Card Number, Expiry, CVC, Cardholder Name).
- `'us'`: core fields + Postal Code (ZIP Code visual mapping) and Country.
- `'billing'`: core fields + Address Line 1, City, State, Postal Code, Country.
- `'contact'`: core fields + Email, Phone.

> All fields activated by a preset (or listed in `fields`) are required, except
> `addressLine2`. This applies consistently across Vanilla, React, and Angular.

---

## 🛡️ Security & Anti-Leak Compliance

1. **Vault CORS Requests Only**: Data is sent straight to the secure token vault servers from the client's browser session. Your server context never touches raw PAN details.
2. **Strict Heap Sanitation**: Sensitive field values (CVC, PAN) are cleared or masked immediately after tokenization so they are never retained or echoed back into error objects.
3. **Zero Logs**: The library does not contain loggers tracing card details, and its examples never `console.log` raw card values.
4. **HTTPS Required**: Tokenization throws on insecure origins (`http:`), with `localhost`/`127.0.0.1` exempt for local development.
5. **Accessible Semantics**: Supports accessibility keyboard focus tags, overlays ARIA markers, autocomplete attributes, and manages focus traps.
6. **Publishable Keys Only — Never Secret Keys in Env**: The library only ever needs your **public** keys (`pk_…` Stripe, `pkey_…` Omise), read straight from the browser. If you use env vars (e.g. `VITE_STRIPE_PUBLIC_KEY`, `VITE_OMISE_PUBLIC_KEY`), they may hold **public keys only** — never put **secret** keys (`sk_…` Stripe, `skey_…` Omise) into `.env` files or any frontend config: everything shipped to the browser is visible to every visitor. As a safety net, the Stripe/Omise adapters throw at construction when handed a secret-looking key.

---

## 📚 Examples

This library includes comprehensive examples for both React and Angular integrations. All examples reference the library from the local `dist` folder for development, or you can install the package via npm.

### Installation Options

#### Option 1: Local Development (Using dist folder)

For local development, you can reference the library directly from the `dist` folder:

```bash
# Build the library first
npm run build

# The dist folder will be created at the root
# Examples can import from: @keeratita/card
```

In your `package.json` for examples:

```json
{
  "dependencies": {
    "@keeratita/card": "file:../.."
  }
}
```

#### Option 2: npm Installation

For production or when not working within the monorepo:

```bash
npm install @keeratita/card
```

Make sure to install React (for hook integrations) if compiling framework wrappers.

### React Examples

Located in `examples/react/`:

| Example                           | Description                                              | Key Features                        |
| --------------------------------- | -------------------------------------------------------- | ----------------------------------- |
| `basic-card-form.tsx`             | Simple integration using the `useCardForm` hook          | Basic form with token handling      |
| `custom-form-with-presets.tsx`    | Demonstration of different form presets using the hook   | Preset switching, adapter selection |
| `modal-checkout.tsx`              | Popover checkout modal implementation                    | Custom modal, hook-based management |
| `form-with-custom-validation.tsx` | Custom validation logic combined with library validators | Error handling, validation modes    |
| `multi-step-checkout.tsx`         | Complete multi-step checkout flow with step indicators   | Cart, shipping, payment steps       |

#### Running React Examples

```bash
# 1. Build the library first from the root
npm run build

# 2. Navigate to the React examples directory
cd examples/react

# 3. Install dependencies (references local dist folder)
npm install

# 4. Start the development server
npx vite
```

#### React Import Examples

```tsx
// Using useCardForm hook (headless)
import { useCardForm } from '@keeratita/card/react';

// Using country data
import { COUNTRIES } from '@keeratita/card';

// In vite.config.js for local development:
// The package.json references "file:../.." to use local dist
```

> **Pre-built React components are available**: `CardForm`, `CreditCardPreview`, and the headless `useCardForm` hook. See [docs/react-usage.md](docs/react-usage.md) for the full component API. The `vanilla` entry point provides pre-built UI components (`CardForm`, `CardModal`) that require zero framework setup.

### Angular Examples

Located in `examples/angular/`:

| Example                            | Description                                                | Key Features                 |
| ---------------------------------- | ---------------------------------------------------------- | ---------------------------- |
| `basic-card-form.component.ts`     | Basic integration using reactive forms                     | CardFormGroup directive      |
| `form-with-presets.component.ts`   | Form with different preset configurations                  | Dynamic preset switching     |
| `directives-demo.component.ts`     | Standalone input masking directives demo                   | Individual field directives  |
| `custom-validators.component.ts`   | Custom validators combined with built-in validation        | Angular validators + library |
| `multi-step-checkout.component.ts` | Multi-step checkout with billing address and order summary | Complete checkout flow       |

#### Running Angular Examples

```bash
# 1. Build the library first from the root
npm run build

# 2. Navigate to the Angular examples directory
cd examples/angular

# 3. Install dependencies (references local dist folder)
npm install

# 4. Start the development server
ng serve
```

#### Angular Import Examples

```typescript
// Using validators and directives
import {
  createCardFormGroup,
  CardNumberDirective,
  CardExpiryDirective,
  CardCvcDirective,
  COUNTRIES,
  formatCardNumber,
  formatExpiry,
  creditCardValidator,
  expiryValidator,
  cvcValidator,
} from '@keeratita/card/angular';

// Using country selection component
import { CountrySelectComponent } from '@keeratita/card/angular';

// In angular.json for styles, reference the compiled library stylesheet:
// "styles": ["node_modules/@keeratita/card/dist/vanilla/styles.css", "src/styles.scss"]
// (The checked-in examples import their own copies for the demo site.)
```

### Project Structure

```
card/
├── dist/                    # Built distribution files
│   ├── react/              # React builds
│   ├── angular/            # Angular builds
│   └── vanilla/            # Vanilla JS builds
├── examples/
│   ├── react/              # React examples
│   │   ├── package.json    # References "@keeratita/card": "file:../../dist"
│   │   ├── vite.config.js
│   │   └── *.tsx           # Example components
│   └── angular/            # Angular examples
│       ├── package.json    # References "@keeratita/card": "file:../.."
│       ├── angular.json
│       └── *.component.ts  # Example components
└── src/                    # Source files
    ├── react/
    ├── angular/
    └── vanilla/
```

See `examples/README.md` for more details.

---

## Author

- **Author**: Keerati Tansawatcharoen
- **Email**: keerati.tansawatcharoen@gmail.com
- **GitHub**: [keeratita/card](https://github.com/keeratita/card)

---

## License

MIT License. SIL Open Font License Inter typography stack. Custom MIT SVG brand icons.

---

## 🌍 Country Dropdown with Flags

The package includes a built-in country dropdown feature that displays country names with their respective flags using Unicode emoji representations.

### Features

- **244 Countries & Territories**: Pre-loaded with comprehensive international country data sorted alphabetically
- **Flag Emojis**: Native Unicode flag rendering (no external image assets required)
- **ISO 3166-1 Alpha-2 Codes**: Standard 2-letter country codes for form submission
- **Dialing Codes**: International dialing codes included for reference

### Usage

#### Vanilla JavaScript

```typescript
import { CardForm } from '@keeratita/card/vanilla';
import { COUNTRIES } from '@keeratita/card';

// The country field is automatically rendered as a dropdown when included in the preset or fields
const form = new CardForm('#payment-form', {
  adapter: stripeAdapter,
  preset: 'billing', // Includes country field
});

// Access country data directly
const allCountries = COUNTRIES; // Array of Country objects
const thailand = COUNTRIES.find((c) => c.code === 'TH');
// { code: 'TH', name: 'Thailand', emoji: '🇹🇭', dialCode: '+66' }
```

#### React

```tsx
import { COUNTRIES, type Country } from '@keeratita/card';
import { useCardForm } from '@keeratita/card/react';

// Access country data directly for custom implementations
const thailand: Country | undefined = COUNTRIES.find((c) => c.code === 'TH');
// { code: 'TH', name: 'Thailand', emoji: '🇹🇭', dialCode: '+66' }
```

#### Angular

```typescript
import { Component } from '@angular/core';
import { CountrySelectComponent } from '@keeratita/card/angular';
import { COUNTRIES } from '@keeratita/card';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CountrySelectComponent],
  template: `
    <kg-country-select
      controlName="country"
      [value]="selectedCountry"
      (countryChange)="onCountryChange($event)"
    >
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

### Country Data Structure

```typescript
interface Country {
  code: string; // 2-letter ISO code (e.g., "TH", "US")
  name: string; // Full country name (e.g., "Thailand")
  emoji: string; // Flag emoji (e.g., "🇹🇭")
  dialCode?: string; // International dialing code (e.g., "+66")
}
```

### Available Functions

| Function                   | Description                      |
| -------------------------- | -------------------------------- |
| `COUNTRIES`                | Array of all available countries |
| `getCountryByCode(code)`   | Get country object by ISO code   |
| `getAllCountryCodes()`     | Get array of all country codes   |
| `isValidCountryCode(code)` | Check if a code is valid         |

### Available Countries

The package includes **244 countries and territories** with ISO codes, flag emojis, and dialing codes. See the source code in `src/data/countries.ts` for the complete list.

---

## 📚 Data Source & Citation

### Country Data Source

The country data (names, ISO codes, and flag emojis) in this package is based on the **REST Countries** project.

- **Project**: [REST Countries](https://restcountries.com/)
- **License**: [Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/)

### Citation

If you use this package in your project, please acknowledge the source:

> Country data and flag emojis are based on the REST Countries project, licensed under CC BY 4.0. https://restcountries.com/

### License Compatibility

This package is released under the MIT License. The included country data is shared under the CC BY 4.0 license, which is compatible with MIT licensing for derivative works as long as proper attribution is provided.

---

## 🔄 Reusable Autocomplete Dropdown Component

The package includes a highly reusable, iOS-styled `AutocompleteDropdown` component that can be used for any field requiring a searchable, filterable dropdown list with icon/emoji support.

### Features

- **Searchable/Filterable**: Real-time filtering as users type
- **iOS Glassmorphism Styling**: Matches the premium translucent design of the credit card form
- **Keyboard Navigation**: Full support for ↑ ↓ Enter Escape keys
- **Icon/Emoji Support**: Display icons or emojis alongside each option
- **Click Outside to Close**: Intuitive dismissal behavior
- **Extensible Base Class**: Custom rendering support via `customRender` callback
- **Accessibility**: ARIA attributes for screen reader support

### Basic Usage

```typescript
import {
  AutocompleteDropdown,
  AutocompleteOption,
} from '@keeratita/card/vanilla';

const options: AutocompleteOption[] = [
  { value: 'apple', label: 'Apple', icon: '🍎' },
  { value: 'banana', label: 'Banana', icon: '🍌' },
  { value: 'cherry', label: 'Cherry', icon: '🍒' },
];

const dropdown = new AutocompleteDropdown({
  container: '#my-dropdown',
  options,
  placeholder: 'Select a fruit...',
  searchPlaceholder: 'Search fruits...',
  noResultsText: 'No results found',
  onSelect: (value, option) => {
    console.log('Selected:', value, option);
  },
});

// Programmatic control
dropdown.setValue('apple');
const selected = dropdown.getSelectedOption();
dropdown.destroy();
```

### Custom Rendering

```typescript
const options: AutocompleteOption[] = [
  {
    value: 'user1',
    label: 'John Doe',
    customRender: (option) => `
      <img src="avatar.jpg" class="avatar" />
      <span class="name">${option.label}</span>
      <span class="email">john@example.com</span>
    `,
  },
];
```

### Country-Specific Autocomplete

For country selection with flag emojis, use the `CountryAutocomplete` component:

```typescript
import { CountryAutocomplete } from '@keeratita/card/vanilla';

const countryDropdown = new CountryAutocomplete({
  container: '#country-field',
  placeholder: 'Select a country...',
  searchPlaceholder: 'Search countries...',
  onSelect: (countryCode, country) => {
    console.log('Selected:', countryCode, country.emoji, country.name);
    // country = { code: 'TH', name: 'Thailand', emoji: '🇹🇭', dialCode: '+66' }
  },
});

// Programmatic control
countryDropdown.setValue('US');
const selectedCountry = countryDropdown.getSelectedCountry();
countryDropdown.destroy();
```

### Configuration Options

| Option              | Type                    | Required | Description                                                      |
| ------------------- | ----------------------- | -------- | ---------------------------------------------------------------- |
| `container`         | `HTMLElement \| string` | Yes      | Container element or CSS selector                                |
| `options`           | `AutocompleteOption[]`  | Yes      | Array of dropdown options                                        |
| `onSelect`          | `Function`              | Yes      | Callback when an option is selected                              |
| `placeholder`       | `string`                | No       | Input placeholder text (default: `'Select...'`)                  |
| `searchPlaceholder` | `string`                | No       | Search input placeholder (default: `'Search...'`)                |
| `noResultsText`     | `string`                | No       | Text shown when no results match (default: `'No results found'`) |
| `maxHeight`         | `number`                | No       | Maximum dropdown height in pixels (default: `300`)               |
| `showIcons`         | `boolean`               | No       | Show/hide icons (default: `true`)                                |

### Keyboard Navigation

| Key    | Action                    |
| ------ | ------------------------- |
| ↑      | Move to previous option   |
| ↓      | Move to next option       |
| Enter  | Select highlighted option |
| Escape | Close dropdown            |

### Public API

| Method                   | Description                             |
| ------------------------ | --------------------------------------- |
| `setValue(value)`        | Programmatically set the selected value |
| `getValue()`             | Get the current input value             |
| `getSelectedOption()`    | Get the currently selected option       |
| `updateOptions(options)` | Replace all options                     |
| `refreshOptions()`       | Reset to original options               |
| `destroy()`              | Remove the component and clean up       |
