# Angular Integration Examples

This directory contains Angular integration examples for the `@keeratita/card` package.

## Prerequisites

This example is an **npm workspace** of the root package — install dependencies
once from the repo root (there is no per-example lockfile, and you should not
run `npm install` inside this directory):

```bash
npm install
```

Before running the example, build the library so `dist/` is up to date:

```bash
npm run build
```

## Running the Examples

### Using Angular CLI

From the repo root, start the development server for this workspace:

```bash
npm run start -w @keeratita/card-angular-examples
```

(Or use the convenience script that builds the library first: `npm run demo:angular`.)

Open your browser to `http://localhost:4201` (the dev-server port configured
in `angular.json`).

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

### 1. Basic Card Form (`basic-card-form.component.ts`)

A simple implementation showing the basic card form integration with Angular reactive forms.

### 2. Form with Presets (`form-with-presets.component.ts`)

Demonstrates how to use different form presets (US, billing, contact) and customize validators.

### 3. Standalone Directives (`directives-demo.component.ts`)

Shows how to use the input masking directives (CardNumberDirective, CardExpiryDirective, CardCvcDirective) for real-time formatting.

### 4. Custom Validators (`custom-validators.component.ts`)

Example of implementing custom validation logic alongside the built-in validators.

### 5. Multi-Step Checkout (`multi-step-checkout.component.ts`)

A complete multi-step checkout flow with card details, billing address, and order summary.

## Library Reference

All examples import from the package's public subpaths — nothing in this
example reaches into the `dist` folder with relative paths:

```typescript
import { createCardFormGroup, creditCardValidator, expiryValidator } from '@keeratita/card/angular';
import { StripeAdapter } from '@keeratita/card';
```

In this workspace the package resolves to the repo itself (`"@keeratita/card":
"file:../.."`), so the examples consume whatever `npm run build` last produced.
In your own app, install the published package:

```bash
npm install @keeratita/card
```

## Module Setup

All library components and directives are **standalone** — shipped with an
explicit `standalone: true` flag so consumer AOT builds can resolve them — so
import them directly into your component's `imports` — no NgModule wiring
required:

```typescript
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CardNumberDirective, CardExpiryDirective, CardCvcDirective } from '@keeratita/card/angular';

@Component({
  selector: 'app-checkout',
  imports: [ReactiveFormsModule, CardNumberDirective, CardExpiryDirective, CardCvcDirective],
  template: `
    <input type="text" kgCardNumber placeholder="•••• •••• •••• ••••" />
    <input type="text" kgCardExpiry placeholder="MM/YY" />
    <input type="password" kgCardCvc placeholder="•••" />
  `,
})
export class YourComponent {}
```

> Note: do **not** list standalone directives in an NgModule `declarations`
> array (that fails compilation with NG9110).

## Examples

All examples are standalone components (Angular 21+):

```typescript
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CardNumberDirective, CardExpiryDirective, CardCvcDirective } from '@keeratita/card/angular';

@Component({
  selector: 'app-your-component',
  imports: [ReactiveFormsModule, CardNumberDirective, CardExpiryDirective, CardCvcDirective],
  templateUrl: './your-component.html'
})
export class YourComponent { }
```