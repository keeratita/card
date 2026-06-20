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

### Using Create React App

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
   npm start
   ```

## Examples

### 1. Basic Card Form (`basic-card-form.tsx`)

A simple implementation showing the basic card form component with default settings.

### 2. Custom Form with Presets (`custom-form-with-presets.tsx`)

Demonstrates how to use different form presets (US, billing, contact) and customize the form fields.

### 3. Modal Checkout (`modal-checkout.tsx`)

Shows how to implement a modal-based checkout flow that can be triggered from any button.

### 4. Form with Custom Validation (`form-with-custom-validation.tsx`)

Example of integrating custom validation logic and error handling.

### 5. Multi-step Checkout (`multi-step-checkout.tsx`)

A complete multi-step checkout flow with card details, billing address, and order summary.

## Library Reference

All examples reference the library from the `dist` folder:

```typescript
import { CardForm, CreditCardPreview, useCardForm } from '../../dist/react/index.mjs';
import { StripeAdapter } from '../../dist/index.mjs';
```

For production use, install the package via npm:

```bash
npm install @keeratita/card
```

Then import from the package:

```typescript
import { CardForm, CreditCardPreview, useCardForm } from '@keeratita/card/react';
import { StripeAdapter } from '@keeratita/card';