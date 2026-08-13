# AGENTS.md

Guidance for AI agents (and human contributors) working in this repository.

## Project Overview

`@keeratita/card` is a lightweight, framework-agnostic TypeScript library for building secure, iOS-style credit card input forms with real-time formatting/validation, a 3D card preview, and direct REST tokenization to Stripe and Omise.

Key characteristics:

- **No SDK/CDN scripts** — the library talks directly to Stripe (`api.stripe.com/v1/tokens`) and Omise (`vault.omise.co/tokens`) over REST.
- **Framework-agnostic** — ships separate entry points for Vanilla JS, React, and Angular.
- **Security-sensitive code** — this package processes PAN/CVC data. Treat all changes with extra care (see [Security](#security)).
- **Clean architecture** — `src/core` contains all framework-agnostic logic; framework directories are thin wrappers over it.

## Repository Structure

```
src/
  index.ts            # Core entry point (shared API: domain, validation, formatters, adapters, data)
  core/               # Framework-agnostic logic — the heart of the library
    constants.ts      # Package version + max field length constants (single source of truth)
    security.ts       # sanitizeInput, escapeHtml — applied to all user input before rendering
    domain/           # card.ts, brand.ts, token.ts, validation.ts, optional-fields.ts, card-brand-logos.ts
    form/             # Framework-agnostic form state machine: validateField, buildCard, masking, caret, success summary
    formatters/       # card-formatter.ts: formatCardNumber, formatExpiry, formatCvc, cleanDigits
    adapters/         # base.ts (errors), stripe.ts, omise.ts, validate-card.ts
  vanilla/            # Vanilla JS: CardForm (inline), CardModal (popover checkout), autocomplete dropdowns, styles.scss
  react/              # React: useCardForm hook + form components + country autocomplete
  angular/            # Angular: validators, directives, form-group helpers, components
  data/               # countries.ts (+ COUNTRIES data, flag emojis)
  lang/               # Localization strings (en.ts)
tests/                # Mirrors src/ layout (tests/core, tests/vanilla, tests/react, tests/angular)
docs/                 # Framework integration guides (react-usage.md, angular-usage.md)
examples/             # Runnable demos: vanilla/, react/, angular/
scripts/              # generate-dist-package-json.js (build helper)
```

Source layout rule: **code lives in `src/`, tests in `tests/`, mirroring the same folder structure** (e.g. `src/react/useCardForm.ts` → `tests/react/useCardForm.test.ts`).

## Commands

| Command | Purpose |
| --- | --- |
| `npm run build` | Full build: tsup (all 4 entry points, CJS+ESM+dts), dist package.json generation, and SASS compilation |
| `npm run build:core` / `build:vanilla` / `build:react` / `build:angular` | Build a single entry point |
| `npm run dev` | Watch mode for tsup + sass |
| `npm test` | Run all Vitest tests (jsdom environment) |
| `npm run lint` | ESLint (flat config, typescript-eslint) over `src` |
| `npm run release` | Tag + GitHub release via release-it (bumps version) |
| `npm run deploy` | Build then `npm publish --access public` |
| `npm run demo` / `demo:react` / `demo:angular` / `demo:all` | Run the demos for local validation |

The Husky pre-commit hook runs `npm run lint` plus the test suite **excluding** the Angular directive/component/form-group tests:

```
npm run lint && npm test -- --exclude=tests/angular/directives.test.ts --exclude=tests/angular/components.test.ts --exclude=tests/angular/form-group.test.ts
```

Run the full suite locally before pushing.

## Architecture Principles

1. **Keep `src/core` framework-agnostic.** Core modules must not import React, Angular, or DOM/framework APIs. Framework-specific behavior lives in `src/react`, `src/angular`, `src/vanilla` and delegates to core.
2. **Adapters implement `PaymentGateway`** (`src/core/domain/card.ts: tokenize(card): Promise<Token>`). To add a new provider, implement the interface and register it in `src/core/adapters/` and `src/index.ts`.
3. **Constants are the single source of truth.** Max lengths and the package version live in `src/core/constants.ts`; validation and adapters must reference them, never hardcode. The version is auto-synced by `@release-it/bumper` — do not hand-edit `PACKAGE_VERSION`.
4. **All user input is sanitized/escaped** via `src/core/security.ts` helpers before it reaches the DOM (see Security).
5. **Styles are written in SCSS** (`src/vanilla/styles.scss`) and compiled to `dist/vanilla/styles.css` + `styles.min.css`. Do not edit generated dist CSS by hand.

## Code Conventions

Enforced by ESLint (`eslint.config.mjs`) and `tsconfig.json`:

- **TypeScript strict mode** is on. No `@ts-ignore`/`any` without a strong reason (`no-explicit-any` is a warning).
- **Interfaces are PascalCase and must NOT be prefixed with `I`** (e.g. `CardFormOptions`, not `ICardFormOptions`).
- **Max 6 parameters** per function (`@typescript-eslint/max-params`).
- **No unused variables** — arguments named with a leading `_` are exempt.
- **No `debugger` statements.** `console.*` is warned.
- Imports use the `@/` alias only in tests (Vitest resolves `@` → `./src`). Source files use relative imports.
- `Target ES2022`, `moduleResolution: bundler`, `jsx: react-jsx`.

## Testing

- **Vitest**, `jsdom` environment, globals enabled. See `vitest.config.ts` and `tests/setup.ts` (Angular JIT + DOM mocks).
- Tests live in `tests/` mirroring `src/` layout. DOM-rendering tests use `@testing-library/react`.
- Follow existing conventions: `describe`/`it` with behavioral naming, per-framework suites (e.g. `Angular Components - renderOptionalFieldHtml`).
- Coverage is collected with v8 for `src/**/*.ts` — run `npm test` before finalizing changes and make sure you haven't broken existing suites.

## Security

This library handles **raw payment card data (PAN, CVC)** in the browser. Non-negotiables:

- Never log, cache, or retain card numbers/CVCs. `maskSensitiveValue` is used for display; card data is dereferenced after tokenization (see `useCardForm.handleSubmit`).
- Any new handling of input must go through `sanitizeInput`/`escapeHtml` (XSS prevention).
- Tokenization must be direct-to-vault via the adapters — do not introduce server-side relays or SDK CDNs.
- Secrets (Stripe/Omise keys) are never part of the library; consumers pass `publicKey` in adapter options at runtime.

## Public API & Entry Points

`package.json` `exports` map is the public surface. Always keep it in sync when adding exports:

- `.` → core (`src/index.ts`)
- `./vanilla` → `src/vanilla/index.ts`
- `./react` → `src/react/index.ts`
- `./angular` → `src/angular/index.ts`

New exports must be re-exported from the matching entry file, and types must be exported alongside runtime values.

## Release Process

1. `npm run release` — release-it bumps the version, syncs `src/core/constants.ts` via `@release-it/bumper`, commits `chore: release vX.Y.Z`, and creates a GitHub release.
2. `npm run deploy` — builds and publishes to npm (`access: public`).
3. Version bumps are the only intentional edit to `PACKAGE_VERSION` in `src/core/constants.ts`.

The GitHub Actions workflow (`demo-pages.yml`) builds the package and deploys the demo site to GitHub Pages on `main` (Node 22, `npm ci`).

## Validation Checklist

Before considering a change complete:

1. `npm run lint` — no new errors.
2. `npm test` — full suite passes (including Angular tests that pre-commit skips).
3. `npm run build` — dist artifacts build cleanly and entry-point exports resolve.
4. If examples/tests touch rendering, sanity-check via `npm run demo` where feasible.
