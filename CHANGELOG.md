# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Angular 22 support**: peer dependencies now require Angular `>= 21` and the
  library is built/tested against the latest stable release (22.x). The Angular
  entry point uses modern signal-based syntax throughout: `input()`/`output()`/
  `computed()`, the `@if`/`@for` control flow, `inject()` DI, and standalone
  components/directives (shipped with explicit `standalone: true` so consumer
  AOT builds can resolve them).
- `disposeCardFormGroup` releases the internal CVC cross-validation
  subscription created by `createCardFormGroup` (call it when the form group is
  no longer needed, e.g. on component destroy, to avoid a per-form leak).
- Stripe/Omise adapters throw immediately at **construction** when given a
  secret-looking key (`sk_` / `skey_`) instead of sending it to the vault.
- Shared `isThenable` helper so the double-loading `onSubmit` lifecycle awaits
  cross-realm promises and thenables consistently in every binding.
- Form submits are now guarded against re-entrancy (Enter key / double-click)
  to prevent duplicate `tokenize()` calls and double charges; guarded-out
  submits are silently ignored (no `onError`).
- Reject submit buttons and validation error regions in React announce state
  via `aria-busy` / `role="alert"`; visible keyboard focus rings and
  `prefers-reduced-motion` overrides added to the stylesheet.

### Fixed

- Card numbers are no longer truncated by brand: 19-digit PANs (e.g. modern
  Visa) and 16-digit Diners Club International cards (`36`/`38`/`39` prefixes)
  can be entered and tokenized again; the input `maxLength` is a safe upper
  bound (17 Amex / 23 others).
- Expiry typing: typing `2` `0` `2` `5` now formats as `02 / 25` instead of
  being silently clamped to `12 / 25`; a single leading `0` is preserved as an
  intermediate state; `13`-`19` still clamp to `12`.
- Network timeouts now surface as `NetworkError` with the message
  `"Request timed out."` (previously the raw `AbortError` message surfaced,
  and the branch was effectively unreachable); the timeout now covers the
  response body read, not just the headers.
- React: editing a field after a successful payment resets the success state,
  and re-entering a card number strips the masked `•••• •••• •••• 4242` prefix
  instead of appending digits to it; blurring the masked number (without
  typing) no longer surfaces an "Invalid card number." error.
- Card-number caret position: typing the 5th digit (which makes the formatter
  insert a space) no longer jumps the caret in front of the new space; caret
  restoration now positions against the raw typed value.
- Vanilla: the inline error message under an optional field (email, phone,
  postal code, city, …, country) is now rendered — previously only the red
  invalid highlight appeared.
- Vanilla: the CVC input is cleared after successful tokenization (previously
  it stayed in the DOM, e.g. across modal open/close cycles).
- Angular: custom country option text and the email mask are now escaped;
  required-field semantics are consistent between `renderOptionalFieldHtml`,
  `createCardFormGroup`, and the React/vanilla bindings.
- Rust-format documentation mismatches: README presets (`us` includes Country),
  React pre-built components note, HTTPS requirement, `submitButtonText`
  default (`Pay Now`), and the React examples README (removed stale Create
  React App instructions).

### Changed

- React `CvcInput` prop `onBlurCvc` renamed to `handleCvcBlur` for consistency
  with the hook and `FormField`.
- `formatExpiry` normalizes a month typed without a leading zero (`2`, `20`,
  `2025`) as `0X` instead of clamping to `12`. Note for direct callers of the
  exported function: intermediate values like `formatExpiry("20")` now return
  `"02"`, so re-test autofill/saved-value flows that pre-format expiries.
- **`onError` now also fires for client-side validation failures** (previously
  only gateway/network failures, despite docs). It receives a generic
  `Error("Please correct the invalid fields.")`; field-level details stay in
  per-field errors. Consumers using `onError` solely as a "payment failed"
  signal should gate on error type/code.
- Angular validation error objects are now static descriptors (see Breaking).
- The Angular entry is now shipped as **Angular partial-compiled output**
  (`ngc -p tsconfig.ngc.partial.json` + `scripts/ship-angular-partial.js`)
  instead of tsup/esbuild runtime decorators. This is what makes the
  components/directives importable in AOT-compiled Angular CLI apps
  (previously such imports failed with NG2012).
- The Angular test suite no longer mocks `@angular/core`; directive tests
  instantiate inside a real injection context.

### Security

- The Omise adapter no longer attaches the raw card object (PAN + CVC) to
  `ApiValidationError.raw`; only the validated field value is included.
- Angular validators no longer echo raw control values (PAN/CVC) into
  `ValidationErrors`, preventing accidental leakage into logs/analytics.
- Vanilla country autocomplete options and the email success mask are escaped
  before insertion into the DOM.
- Documentation/example code no longer demonstrates `console.log` of raw form
  values (PAN/CVC).

### Breaking

- **Angular `>= 21` required.** Angular 14–20 are no longer supported. The
  Angular entry point uses signal-based APIs and control-flow syntax that
  requires at least Angular 17.3; the declared floor is now 21 to track the
  latest releases. Angular consumers also need Node >= 22 for the example app.
- **Angular validator error shapes changed**: error objects are static
  descriptors, e.g. `{ creditCard: true }` instead of
  `{ creditCard: { value: "4111…" } }`. Error *keys* are unchanged. Consumers
  that read `form.get('x')?.errors?.creditCard` still work; consumers that
  read `.value` inside the error object need updating (and should never have
  held the raw PAN there).
- **Angular signal inputs/outputs are type-level breaking**: the emitted d.ts
  now exposes `InputSignal` (from `input()`) and `OutputEmitterRef` (from
  `output()`) instead of plain fields/`EventEmitter`. Template bindings
  (`[cardNumber]`, `(countryChange)`) are unchanged; only programmatic reads
  of these members (unit tests, wrapper components, `.next()` calls) break.
- **React `CvcInput.onBlurCvc` → `handleCvcBlur`** (prop rename).
- **Expiry validation no longer accepts 6-digit (MMYYYY) values** — the branch
  was unreachable from any input and contradicted the Angular validator;
  regression to the documented MM/YY contract.
- **Adapters reject secret keys at construction** (`sk_` / `skey_` prefixes):
  the throw happens in the adapter constructor, so `new StripeAdapter({ publicKey: 'sk_...' })`
  fails at setup time (any try/catch around `tokenize()` will not catch it).

### Removed

- None.
