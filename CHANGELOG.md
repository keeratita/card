# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **New core exports**: `formatPhone`, `reformatExpiryDate`,
  `validateCardNumberLength`, and `isCardLengthValid` are now exported from
  the package root entry (previously documented in `docs/react-usage.md` but
  unreachable).
- **Angular**: `CountrySelectComponent` now emits `countrySelected` — a
  code-only output mirroring the React `onChange` contract.
- **Country autocomplete**: all three bindings (vanilla, React, Angular) now
  back up to the same framework-agnostic combobox core (`comboboxReduce`,
  `comboboxFilter`, `computeDropdownPlacement`) for open/close, filtering,
  keyboard navigation, and viewport placement, so behavior stays consistent
  and drifts are fixed in one place.
- **Stylesheets are importable subpaths**: `@keeratita/card/vanilla/styles.css`
  and `@keeratita/card/vanilla/styles.min.css` are now in the `exports` map, so
  the documented React statement `import '@keeratita/card/vanilla/styles.css'`
  actually resolves (it previously threw `ERR_PACKAGE_PATH_NOT_EXPORTED`).
- **React `FormField` is styled by the library**: the shared stylesheet gained a
  `.form-field` block (`__label`, `__input`, `__error`, `__required`, the
  `--error` modifier). Those class names existed only in the React example's
  private copy of the CSS, so consumers who imported the library stylesheet got
  a completely unstyled stacked field.
- **`npm run test:dist`**: a consumer suite that imports the *built* artifacts
  through the `package.json` `exports` map — all four entries, both
  stylesheets, and a JIT render of the shipped `CountrySelectComponent` — so a
  broken bundler config, a missing subpath, or a stale Angular intermediate
  fails loudly instead of shipping. It skips itself when `dist/` is absent, so
  plain `npm test` still works on a fresh clone.

- **New core export**: `getExpectedCvcLength(brand)` returns how many digits a
  brand's CVC prints (Amex 4, everything else 3). The rule was being
  re-derived at four call sites — one React field capped every brand at 4 —
  so it now lives beside `detectCardBrand`.

### Changed

- `addressLine2` is now consistently optional across all bindings: an empty
  value no longer fails `validateField` (was already optional in Angular), and
  the vanilla form no longer marks it `required`.
- `FormField` (React) renders its input hints from a compile-checked table
  (`Record<keyof CardFormValues, FieldInputConfig>`), so a field added to
  `CardFormValues` without a configuration is a build error instead of a
  runtime crash on `config.type`. `country` keeps the `country` autocomplete
  token (the stored value is an ISO 2-letter code, not a country name) and
  `phone` uses `tel`; a test asserts the autocomplete hints still agree with
  the core `FIELD_METADATA` the other two bindings render from.
- Angular `CountrySelectComponent`: click-outside closes the dropdown,
  Escape restores focus to the trigger, the live region is wired as a proper
  `combobox`/`listbox` with `aria-activedescendant`, and the list is clamped
  to the viewport.
- The shared combobox filter matches country **codes exactly** in the country
  field of **all three bindings** (a partial query like `"t"` no longer
  surfaces Chad `"TD"` in the vanilla form either). The generic
  `AutocompleteDropdown` keeps its original value-prefix matching by default;
  `CountryAutocomplete` opts out with the new `includeValuePrefixMatch: false`
  config option, which is also available to custom consumers of the widget.
- Vanilla `AutocompleteDropdown`/`CountryAutocomplete` keyboard navigation
  now **wraps** at the list ends instead of clamping.
- `moveHighlight` (root export): the first Arrow key press with no current
  selection now highlights the first item (previously ArrowUp jumped to the
  last item).
- React `CountryAutocomplete`: option rows expose
  `aria-setsize`/`aria-posinset`, the "scroll or type to find more" hint
  moved into an `aria-live` region, the list clamps to the viewport,
  arrowing past the rendered page grows the lazy window instead of
  highlighting unrendered rows, and an empty filter result now renders a
  "no countries found" row instead of a silently empty listbox.
- **One combobox ARIA contract across vanilla, React and Angular**: the
  trigger is a disclosure `button` that always reports `aria-expanded`, while
  the search input is the single `role=combobox` while open and owns
  `aria-activedescendant`; option rows carry `aria-setsize`/`aria-posinset`
  in every binding.
- **Placement**: dropdowns no longer render past the bottom of the viewport —
  the shared placement math clamps the height to the space that actually
  exists below the anchor, the Angular list keeps a usable minimum height
  instead of collapsing, and all three bindings reposition on resize.
- `reformatExpiryDate` now normalizes `MM/YYYY` (and a short month) correctly:
  `"12/2025"` → `"12 / 25"` and `"1 / 2030"` → `"01 / 30"` (previously the
  4-digit-year form could produce the century digits or a clamped month).
- `validateCardNumberLength` results now include the detected `brand`, so UI
  code can label a length message without detecting the brand a second time.
- **Accessibility of the vanilla form**: the visible country control is the
  labeled, `aria-required`/`aria-describedby`/`aria-invalid` carrier (the
  hidden value input is invisible to ATs), the trigger is `readOnly` so
  type-ahead can never strand a character in it, and closed-state keystrokes
  are ignored so the hidden search box cannot mutate widget state.
- Styling: form field labels and error text meet contrast guidelines on the
  dark surface, chevrons and the dropdown arrow rotate consistently, and the
  screen-reader-only helper (`visually-hidden`) is shared by all bindings.
- React `CountryAutocomplete` hides its live-region text with inline styles
  instead of relying only on the shared `.visually-hidden` class, so the
  result count cannot appear on screen for apps that do not import the
  stylesheet. Both framework guides now document importing
  `@keeratita/card/vanilla/styles.css` (React import, Angular `angular.json`
  `styles` entry).

- **The country autocomplete key map has a single definition.**
  `comboboxKeyCommand()` in core decides what each key does (open, close,
  move, select, or nothing) and the three bindings only execute the returned
  command. Each binding had hand-written the same switch, which is how
  `ArrowUp` opened the list in vanilla while doing nothing in React or
  Angular: **`ArrowUp` on a closed control now opens the list in all three
  bindings.** Standardized in the same pass: the search input cannot drive a
  closed list, closing from the search box hands focus back to the trigger,
  and closing from the trigger leaves focus where it is.
- **Popover geometry is shared.** `z-index` and the default list height come
  from `DROPDOWN_Z_INDEX` / `DROPDOWN_DEFAULT_MAX_HEIGHT` in core rather than
  a literal in each binding. The Angular list grows from 240px to 300px to
  match the vanilla and React widgets, and its stacking level moved from its
  inline stylesheet to a binding on the shared constant.
- **Field length bounds come from `src/core/constants.ts`.** Card numbers are
  gated by `MIN_CARD_NUMBER_LENGTH`/`MAX_CARD_NUMBER_LENGTH` (the values were
  hardcoded `13`/`19` in three places), the expiry input's `maxLength` is
  `MAX_EXPIRY_DISPLAY_LENGTH` (`MM / YY`), and CVC inputs size themselves with
  `getExpectedCvcLength(brand)`.

### Deprecated

- Angular `CountrySelectComponent.countryChange` — use `countrySelected`;
  `countryChange` still emits `{ name, value }` where `name` is the control
  name (not the country name). The bundled examples now bind
  `countrySelected`.

### Fixed

- **The Angular example now uses the shipped `CountrySelectComponent`**: it
  imports the component from `@keeratita/card/angular` and compiles it AOT
  with `strictTemplates`, so the demo exercises the published artifact instead
  of a hand-synced copy.
- **The test suite no longer depends on which `esbuild` happens to be
  hoisted**: the legacy Angular decorators are now compiled with an explicit
  flag instead of relying on dependency hoisting.
- **The React demo now uses the published stylesheet**: it styles itself
  entirely from `@keeratita/card/vanilla/styles.css` (plus its own inline
  shell styles); the forked copy of the library stylesheet is deleted.
- **The examples are npm workspaces**, installed once from the repo root;
  their per-directory lockfiles are removed.
- **`examples/angular` now runs on the `@angular/build` builders**
  (`application`, `dev-server`, `extract-i18n`) instead of the deprecated
  webpack dev-server.

- **Angular trigger role inversion**: the trigger reported `role="combobox"`
  while *closed* and `role="button"` while *open* — the inverse of the contract
  the React and vanilla bindings implement, which left screen readers with no
  stable disclosure control and a second combobox competing with the search
  input. The trigger is now a `button` in both states and points
  `aria-controls` at the listbox only while that listbox exists. The existing
  Angular test had asserted the inverted value, which is why the unit suite
  stayed green; it now asserts the disclosure role and that exactly one element
  is a combobox.
- **Focus dropped to `<body>` when a country list closed** (React selection and
  outside click; Angular outside click). The search input is unmounted on close,
  so unless focus is moved explicitly the keyboard user loses their place. Every
  close path in all three bindings now returns focus to the trigger — matching a
  native `<select>` — and only when focus was actually inside the widget, so an
  outside click that hit nothing focused does not steal focus.
- **Documented React stylesheet import failed**: `@keeratita/card/vanilla/styles.css`
  was not in the `exports` map, so every React app that followed the guide
  failed to build. (The Angular guide's `angular.json` path kept working because
  it references the file directly rather than through the exports map.)
- `reformatExpiryDate`/`validateCardNumberLength` shipped behavior is now pinned
  by the artifact suite, not just the source suite, so a build-time regression
  (e.g. an Angular entry rebuilt from stale intermediates) cannot pass unnoticed.

### Removed

- Dead rules in the published stylesheet: `.form-section-header` was declared
  twice with the earlier block fully shadowed by the later one, and
  `.row-country .ios-input-row` was declared twice with identical
  declarations. A compiled-CSS diff before and after confirms nothing else
  changed.

## [3.0.0] - 2026-08-13

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
- README + integration guides now state the env-key rule explicitly: frontend
  env vars may hold **public/publishable keys only** (`pk_` / `pkey_`); secret
  keys (`sk_` / `skey_`) must never enter `.env` files or client bundles.

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
