# React Integration Examples

This directory contains React integration examples for the `@keeratita/card` package.

## Prerequisites

Before running these examples, ensure you have built the library:

```bash
npm run build
```

## Running the Examples

### Using Vite (Recommended)

1. Navigate to the example directory:
   ```bash
   cd examples/react
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to the URL shown in the terminal (typically `http://localhost:5173`)

## Demo Keys & Environment

The demos fall back to mock test keys and can be overridden with env vars:

- `VITE_STRIPE_PUBLIC_KEY` — your Stripe **publishable** key (`pk_test_…` / `pk_live_…`)
- `VITE_OMISE_PUBLIC_KEY` — your Omise **public** key (`pkey_test_…` / `pkey_live_…`)

⚠️ **Only public keys may ever go into `.env`.** Secret keys
(`sk_…` Stripe, `skey_…` Omise) must never be placed in env vars or any frontend
config — everything bundled for the browser is visible to users. The adapters
reject secret-looking keys at construction, and tokenization happens
client-side only, so secret keys are never needed anywhere in this app.

## Examples

All example components live under `src/` (Vite single-page app — see `src/App.tsx`):

### 1. Basic Card Form (`src/basic/basic-card-form.tsx`)

A simple implementation showing the pre-built `CardForm` component with default settings.

### 2. Custom Form with Presets (`src/forms/custom-form-with-presets.tsx`)

Demonstrates how to use different form presets (US, billing, contact) and customize the form fields.

### 3. Modal Checkout (`src/checkout/`)

`modal-checkout.tsx` shows a modal-based checkout flow; `multi-step-checkout.tsx` is a complete
multi-step flow with billing address and order summary.

### 4. Form with Custom Validation (`src/forms/form-with-custom-validation.tsx`)

Example of integrating custom validation logic and error handling.

### 5. Component showcase (`src/features/`)

Individual feature demos: card preview, flip card, directives, and country dropdown.

## Library Reference

Every example imports from the built package entry points — unless you rewire them, do
**not** copy the relative `../../dist/...` paths from older versions of this README; use the
exported subpaths:

```typescript
import { CardForm, CreditCardPreview, useCardForm } from '@keeratita/card/react';
import { StripeAdapter } from '@keeratita/card';
```