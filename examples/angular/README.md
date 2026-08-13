# Angular Integration Examples

This directory contains Angular integration examples for the `@keeratita/card` package.

## Prerequisites

Before running these examples, ensure you have built the library:

```bash
npm run build
```

## Running the Examples

### Using Angular CLI

1. Navigate to the example directory:
   ```bash
   cd examples/angular
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   ng serve
   ```

4. Open your browser to `http://localhost:4200`

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

All examples reference the library from the `dist` folder:

```typescript
import { createCardFormGroup, creditCardValidator, expiryValidator } from '../../dist/angular/index.mjs';
import { StripeAdapter } from '../../dist/index.mjs';
```

For production use, install the package via npm:

```bash
npm install @keeratita/card
```

Then import from the package:

```typescript
import { createCardFormGroup, creditCardValidator, expiryValidator } from '@keeratita/card/angular';
import { StripeAdapter } from '@keeratita/card';
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