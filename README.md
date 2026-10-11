# @keeratita/card

A lightweight, framework-agnostic TypeScript library for secure, iOS-style credit card forms: real-time formatting and validation, a 3D card preview with CVC flip, and direct browser-to-vault tokenization for Stripe and Omise.

No SDK scripts or CDN tags. The library posts straight to the vault REST APIs, so you keep control of performance, accessibility, and styling.

**Live demo:** https://keeratita.github.io/card/ · [Vanilla demo](https://keeratita.github.io/card/examples/vanilla/index.html)

## Features

- **Liquid glass UI** — grouped input rows, squircle corners, glassmorphic card preview.
- **3D card preview** — mirrors the fields live and flips 180° to the signature strip when CVC is focused.
- **Direct REST vaulting** — Stripe (`api.stripe.com/v1/tokens`) and Omise (`vault.omise.co/tokens`), no external SDK.
- **Field presets** — add ZIP code, full billing address, or contact fields in one option.
- **Double-loading submit lifecycle** — manages `"Tokenizing..."` and `"Processing..."` so your backend can verify before the form unlocks.
- **Strict data isolation** — PAN and CVC are dereferenced as soon as tokenization returns; nothing is logged or cached.
- **Framework agnostic** — Vanilla JS, React, or Angular reactive forms over one shared core.

## Installation

```bash
npm install @keeratita/card
```

Install `react`/`react-dom` separately if you use the React entry, and `@angular/core`/`@angular/forms` for the Angular entry — all four are optional peer dependencies.

## Stylesheet

The package ships a compiled stylesheet, in full and minified form:

```html
<link rel="stylesheet" href="node_modules/@keeratita/card/dist/vanilla/styles.min.css" />
```

Or import it from a bundler (Vite, Next, Angular CLI via `angular.json` `styles`):

```ts
import '@keeratita/card/vanilla/styles.css';
```

Every class is plain CSS — override any of them in your own stylesheet to match your design system. The components remain functional and accessible without it (screen-reader-only text is hidden with inline styles).

## Quick start

### Vanilla — inline form

```ts
import { StripeAdapter } from '@keeratita/card';
import { CardForm } from '@keeratita/card/vanilla';

const form = new CardForm('#inline-payment-form', {
  adapter: new StripeAdapter({ publicKey: 'pk_test_your_stripe_key' }),
  preset: 'billing', // addressLine1, city, state, postalCode, country
  cardLabel: 'Visa Platinum',
  submitButtonText: 'Pay Now',
  onSubmit: async ({ token }) => {
    // Verify on your backend; throw to roll the form back to its previous state.
    const res = await fetch('/api/charge', {
      method: 'POST',
      body: JSON.stringify({ tokenId: token.id }),
    });
    if (!res.ok) throw new Error('Transaction declined.');
  },
  onError: (error) => console.error(error.message),
});
```

### Vanilla — checkout modal

```ts
import { OmiseAdapter } from '@keeratita/card';
import { CardModal } from '@keeratita/card/vanilla';

const checkout = new CardModal({
  adapter: new OmiseAdapter({ publicKey: 'pkey_test_your_omise_key' }),
  preset: 'us', // postalCode + country
  onSubmit: async ({ token }) => processPayment(token),
});

button.addEventListener('click', () => checkout.open());
```

### React — headless hook

`useCardForm` owns field state, masking, brand detection, flip state and tokenization, so you render whatever markup you want:

```tsx
import { StripeAdapter } from '@keeratita/card';
import { useCardForm } from '@keeratita/card/react';

export default function CheckoutForm() {
  const {
    values, brand, errors, isTokenizing, isProcessing, paymentError, isFlipped,
    handleChange, handleBlur, handleCvcFocus, handleCvcBlur, handleSubmit,
  } = useCardForm({
    adapter: new StripeAdapter({ publicKey: 'pk_test_stripe_key' }),
    onSubmit: async ({ token }) => chargeCard(token.id),
  });

  return (
    <form onSubmit={handleSubmit}>
      <div className={`card-inner ${isFlipped ? 'flipped' : ''}`}>
        <div className='card-num-preview'>{values.number || '•••• •••• •••• ••••'}</div>
        <div className='card-brand'>{brand.toUpperCase()}</div>
      </div>

      <input name='number' value={values.number} onChange={handleChange} onBlur={handleBlur} placeholder='Card Number' />
      {errors.number && <span>{errors.number}</span>}

      <input
        type='password'
        name='cvc'
        value={values.cvc}
        onChange={handleChange}
        onFocus={handleCvcFocus}
        onBlur={(e) => { handleBlur(e); handleCvcBlur(); }}
        placeholder='CVC'
      />

      <button type='submit' disabled={isTokenizing || isProcessing}>
        {isTokenizing ? 'Tokenizing...' : isProcessing ? 'Processing...' : 'Pay'}
      </button>
      {paymentError && <div role='alert'>{paymentError}</div>}
    </form>
  );
}
```

Pre-built React components (`CardForm`, `CreditCardPreview`, `FormField`, `CardNumberInput`, `ExpiryInput`, `CvcInput`, `FormFieldsGroup`, `SubmitButton`, `CountryAutocomplete`) are exported from `@keeratita/card/react` — see [docs/react-usage.md](docs/react-usage.md).

### Angular — reactive forms

Targets Angular v21+ and uses signal-based APIs (`input()`/`output()`/`computed()`, `@if`/`@for`, `inject()`, standalone components).

```ts
import { Component } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { createCardFormGroup, CardNumberDirective, CardExpiryDirective, CardCvcDirective } from '@keeratita/card/angular';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CardNumberDirective, CardExpiryDirective, CardCvcDirective],
  template: `
    <form [formGroup]="checkoutForm">
      <input kgCardNumber formControlName="number" placeholder="•••• •••• •••• ••••" />
      <input kgCardExpiry formControlName="expiry" placeholder="MM/YY" />
      <input kgCardCvc type="password" formControlName="cvc" [cardNumber]="number" placeholder="•••" />
    </form>
  `,
})
export class CheckoutComponent {
  checkoutForm: FormGroup = createCardFormGroup({ preset: 'us' });
  get number() { return this.checkoutForm.get('number')?.value ?? ''; }
}
```

Individual validators (`creditCardValidator`, `expiryValidator`, `cvcValidator('number')`, `countryValidator`, …) are exported for hand-built form groups. Full guide: [docs/angular-usage.md](docs/angular-usage.md).

## API reference

### `CardFormOptions`

| Attribute          | Type                  | Required | Description                                                        |
| :----------------- | :-------------------- | :------- | :----------------------------------------------------------------- |
| `adapter`          | `PaymentGateway`      | Yes      | `StripeAdapter` or `OmiseAdapter`                                  |
| `preset`           | `CardFormPreset`      | No       | `'none' \| 'us' \| 'billing' \| 'contact'` (default `'none'`)      |
| `fields`           | `OptionalCardField[]` | No       | Explicit list of optional fields to render                         |
| `cardLabel`        | `string`              | No       | Overrides the gateway text in the preview's top-right              |
| `submitButtonText` | `string`              | No       | Submit label (default `'Pay Now'`)                                 |
| `onSubmit`         | `Function`            | No       | Runs after tokenization; async results are awaited (double-loading) |
| `onError`          | `Function`            | No       | Fires on validation errors or gateway failures                     |

### Presets

| Preset      | Adds                                                          |
| :---------- | :------------------------------------------------------------ |
| `'none'`    | Card number, expiry, CVC, cardholder name                     |
| `'us'`      | + postal code, country                                        |
| `'billing'` | + address line 1, city, state, postal code, country           |
| `'contact'` | + email, phone                                                |

Every field a preset (or `fields`) adds is required, except `addressLine2` — in all three bindings.

### Adapters

Both take `{ publicKey }` and implement `PaymentGateway.tokenize(card)`. Pass **public** keys only (`pk_…`, `pkey_…`); constructing an adapter with a secret-looking key (`sk_…`, `skey_…`) throws immediately. Failures surface as `PaymentGatewayError` (with `ApiValidationError` / `NetworkError` subclasses).

To add another gateway, implement `PaymentGateway` and pass your instance as `adapter`.

### Formatting, validation and data helpers

Everything below is exported from the package root and is framework-agnostic.

| Group      | Exports |
| :--------- | :------ |
| Format     | `formatCardNumber`, `formatExpiry`, `formatCvc`, `formatPhone`, `cleanDigits`, `reformatExpiryDate` |
| Validate   | `validateField`, `getFieldErrorMessage`, `validateCardNumber`, `validateCardNumberLength`, `isCardLengthValid`, `luhnCheck`, `validateExpiry`, `validateCvc`, `validateName`, `validateEmail`, `validatePhone`, `validatePostalCode`, `validateCountry` |
| Brand      | `detectCardBrand`, `getCardNumberMaxLength`, `getExpectedCvcLength` |
| Country    | `COUNTRIES`, `getCountryByCode`, `getAllCountryCodes`, `isValidCountryCode`, `findCountryByCode`, `filterCountries` |
| Sanitize   | `sanitizeInput`, `escapeHtml`, `maskSensitiveValue` |

## Country dropdown with flags

The country field renders as a searchable dropdown with Unicode flag emojis — no image assets. 244 countries and territories, sorted alphabetically, with ISO 3166-1 alpha-2 codes and dialing codes.

```ts
import { COUNTRIES, type Country } from '@keeratita/card';

const thailand = COUNTRIES.find((c) => c.code === 'TH');
// { code: 'TH', name: 'Thailand', emoji: '🇹🇭', dialCode: '+66' }
```

```ts
interface Country {
  code: string; // ISO 3166-1 alpha-2, e.g. "TH"
  name: string; // "Thailand"
  emoji: string; // "🇹🇭"
  dialCode?: string; // "+66"
}
```

In Angular, drop in `<kg-country-select controlName="country" [value]="selected" (countrySelected)="onCountry($event)" />` (import `CountrySelectComponent`). Codes match the `country` value the other bindings store.

## Reusable autocomplete

`AutocompleteDropdown` is the iOS-styled combobox behind the country field, usable for any searchable list.

```ts
import { AutocompleteDropdown, type AutocompleteOption } from '@keeratita/card/vanilla';

const dropdown = new AutocompleteDropdown({
  container: '#my-dropdown',
  options: [
    { value: 'apple', label: 'Apple', icon: '🍎' },
    { value: 'banana', label: 'Banana', icon: '🍌' },
  ],
  placeholder: 'Select a fruit...',
  searchPlaceholder: 'Search fruits...',
  noResultsText: 'No results found',
  onSelect: (value, option) => console.log(value, option),
});
```

| Option                    | Type                    | Default    | Description |
| :------------------------ | :---------------------- | :--------- | :---------- |
| `container`               | `HTMLElement \| string` | —          | Container element or selector (required) |
| `options`                 | `AutocompleteOption[]`  | —          | Dropdown options (required) |
| `onSelect`                | `Function`              | —          | Selection callback (required) |
| `placeholder`             | `string`                | `'Select...'` | Trigger placeholder |
| `searchPlaceholder`       | `string`                | `'Search...'` | Search input placeholder |
| `noResultsText`           | `string`                | `'No results found'` | Empty-state text |
| `maxHeight`               | `number`                | `300`      | Maximum list height in px |
| `showIcons`               | `boolean`               | `true`     | Show option icons/emojis |
| `includeValuePrefixMatch` | `boolean`               | `true`     | Also match `value`s on prefix/contains. Set `false` for short codes (ISO countries) so a partial query only matches a value exactly — e.g. `"t"` never surfaces Chad `"TD"` |

Options may supply `customRender(option)` returning HTML for rich rows (use `sanitizeInput`/`escapeHtml` on anything user-supplied).

**Keyboard:** ↑/↓ move with wrap-around · Enter selects · Escape closes and returns focus to the trigger · any printable key while closed opens the list with that character as the filter.

**Accessibility:** trigger is a disclosure `button` (`aria-haspopup`, `aria-expanded`, `aria-controls` only while the list exists); the search input is the single `role=combobox` and owns `aria-activedescendant`; rows carry `aria-setsize`/`aria-posinset`; a polite live region announces the result count. The same contract holds in the React and Angular bindings.

**Methods:** `setValue(value)`, `getValue()`, `getSelectedOption()`, `updateOptions(options)`, `refreshOptions()`, `destroy()`. `CountryAutocomplete` is the country-specific variant, adding `getSelectedCountry()`.

## Security

- **Browser-to-vault only.** Raw PAN/CVC go straight to the vault; your server never sees them and only receives the token.
- **No retention.** Sensitive values are cleared or masked as soon as tokenization completes, and are never echoed into error objects.
- **No logging.** The library contains no loggers that touch card data.
- **HTTPS enforced.** Tokenization throws on insecure origins, with `localhost`/`127.0.0.1` exempt.
- **Publishable keys only.** Everything shipped to the browser is public — keep secret keys (`sk_…`, `skey_…`) out of `.env` and frontend config.
- **Sanitized input.** All user input passes through `sanitizeInput`/`escapeHtml` before reaching the DOM.

## Guides and examples

- [React usage](docs/react-usage.md) — component API, `useCardForm`, styling.
- [Angular usage](docs/angular-usage.md) — form groups, validators, directives, `CountrySelectComponent`.
- [Examples](examples/README.md) — runnable Vanilla, React and Angular demos.

## Data source and citation

Country names, ISO codes and flag emojis are based on [REST Countries](https://restcountries.com/), licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). If you use this package, please acknowledge the source:

> Country data and flag emojis are based on the REST Countries project, licensed under CC BY 4.0. https://restcountries.com/

The included country data is shared under CC BY 4.0, which is compatible with this package's MIT license provided attribution is retained.

## Author

- **Keerati Tansawatcharoen** · keerati.tansawatcharoen@gmail.com · [GitHub](https://github.com/keeratita/card)

## License

MIT. Inter typography stack under the SIL Open Font License; brand icons are custom MIT-licensed SVGs.
