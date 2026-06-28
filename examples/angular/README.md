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

For Angular applications using NgModules, import the necessary modules:

```typescript
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CardNumberDirective, CardExpiryDirective, CardCvcDirective } from '@keeratita/card/angular';

@NgModule({
  declarations: [
    YourComponent,
    CardNumberDirective,
    CardExpiryDirective,
    CardCvcDirective
  ],
  imports: [
    ReactiveFormsModule
  ]
})
export class YourModule { }
```

For standalone components (Angular 14+):

```typescript
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CardNumberDirective, CardExpiryDirective, CardCvcDirective } from '@keeratita/card/angular';

@Component({
  selector: 'app-your-component',
  standalone: true,
  imports: [ReactiveFormsModule, CardNumberDirective, CardExpiryDirective, CardCvcDirective],
  templateUrl: './your-component.html'
})
export class YourComponent { }