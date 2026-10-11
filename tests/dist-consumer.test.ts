/**
 * Built-artifact (consumer) suite.
 *
 * Every other suite imports `src/**`. This one imports the **published
 * artifacts** through the `package.json` `exports` map — the same resolution
 * a consumer gets — so a broken bundler config, a forgotten entry, a stale
 * Angular intermediate, or a build-time-only transformation cannot ship
 * silently.
 *
 * It skips itself when `dist/` is absent, so `npm test` still works on a
 * fresh clone. When the file is run explicitly (`npm run test:dist`, the
 * release gate in AGENTS.md's Validation Checklist), a missing or stale
 * `dist/` is a hard failure instead — artifact checks must never report
 * green against nothing (or against an outdated build).
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { createElement } from 'react';
import { render, fireEvent } from '@testing-library/react';
import { TestBed, getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';

// Vitest rewrites `import.meta.url`, so anchor on the process cwd (Vitest runs
// with the project root as cwd, the same anchor vitest.config.ts uses).
const DIST = resolve(process.cwd(), 'dist');
const SRC = resolve(process.cwd(), 'src');

/** Every file the package.json `exports` map promises to ship. */
const REQUIRED_ARTIFACTS = [
  'index.js',
  'index.mjs',
  'vanilla/index.js',
  'vanilla/index.mjs',
  'react/index.js',
  'react/index.mjs',
  'angular/index.js',
  'angular/index.mjs',
  'vanilla/styles.css',
  'vanilla/styles.min.css',
];
const missingArtifacts = REQUIRED_ARTIFACTS.filter(
  (file) => !existsSync(`${DIST}/${file}`),
);
const built = missingArtifacts.length === 0;

// `npm run test:dist` is the release gate; a partial or missing build must be
// red there. Under the full `npm test` suite, absence stays a (loudly named)
// skip so a fresh clone without a build still passes. The signal is the npm
// lifecycle event (vitest workers never see the CLI argv); `VITEST_DIST_REQUIRED=1`
// forces the same behavior under any other runner.
const explicitlyRequested =
  process.env.npm_lifecycle_event === 'test:dist' ||
  process.env.VITEST_DIST_REQUIRED === '1' ||
  process.argv.slice(2).some((arg) => arg.includes('dist-consumer'));

/** Newest mtime under `dir` (recursive). */
function newestMtimeMs(dir: string): number {
  let newest = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = `${dir}/${entry.name}`;
    newest = Math.max(
      newest,
      entry.isDirectory() ? newestMtimeMs(path) : statSync(path).mtimeMs,
    );
  }
  return newest;
}

/** Sub-second clock skew between a build writing dist/ right after an edit. */
const STALE_MARGIN_MS = 1000;

if (!built) {
  if (explicitlyRequested) {
    describe('published artifacts (explicit artifact run)', () => {
      it(`Fails loudly: dist/ artifacts are missing — run \`npm run build\` first (missing: ${missingArtifacts.join(', ')})`, () => {
        expect(
          built,
          'AGENTS.md requires `npm run build && npm run test:dist` before releasing; the artifact guard must not report green when artifacts were explicitly requested but are absent.',
        ).toBe(true);
      });
    });
  } else {
    // Full `npm test` (documented fresh-clone skip path). Made visible three
    // ways so it can never read as a silent green: a named skipped test in
    // the reporter, one stderr line, and the hard failure above whenever
    // the artifacts were explicitly requested (`npm run test:dist`).
    console.warn(
      '[dist-consumer] SKIPPED: no dist/ artifacts found — run `npm run build` && `npm run test:dist` before releasing (AGENTS.md validation step 4).',
    );
    describe('published artifacts', () => {
      // Named so it surfaces in the reporter instead of vanishing as a
      // silently-passing empty file (the documented skip path in AGENTS.md).
      it.skip('SKIPPED: no dist/ artifacts — run `npm run build` && `npm run test:dist` before releasing (AGENTS.md validation step 4)', () => {});
    });
  }
} else if (explicitlyRequested) {
  describe('published artifacts (freshness gate)', () => {
    it('dist/ is not older than src/ — a stale build cannot report green', () => {
      expect(
        newestMtimeMs(SRC),
        'src/ contains files modified after dist/ was built; every assertion below would pass against the outdated bundle. Run `npm run build` first.',
      ).toBeLessThanOrEqual(newestMtimeMs(DIST) + STALE_MARGIN_MS);
    });
  });
}

const describeBuilt = built ? describe : describe.skip;

/**
 * Artifact imports go through here with a computed specifier: Vite's import
 * analysis otherwise resolves the literal specifiers at transform time and
 * the whole file fails to even load when `dist/` is absent — which would
 * break the documented "npm test works on a fresh clone" skip path (and
 * prevent the loud missing-dist failure from ever registering).
 * `@vite-ignore` defers resolution to runtime, i.e. to the same `exports`
 * map a consumer hits.
 */
async function importArtifact(specifier: string): Promise<Record<string, any>> {
  return import(/* @vite-ignore */ specifier);
}

function stubGateway() {
  return {
    name: 'Stripe',
    tokenize: async () => ({
      id: 'tok_dist_1',
      gateway: 'stripe' as const,
      raw: {},
    }),
  };
}

describeBuilt('published artifacts', () => {
  it('core entry exposes the documented surface (ESM + CJS)', async () => {
    const esm = await importArtifact('@keeratita/card');
    const cjs = await importArtifact('../dist/index.js');
    for (const mod of [esm, cjs] as Array<Record<string, unknown>>) {
      for (const name of [
        'detectCardBrand',
        'formatCardNumber',
        'reformatExpiryDate',
        'validateCardNumberLength',
        'validateField',
        'filterCountries',
        'comboboxReduce',
        'computeDropdownPlacement',
        'StripeAdapter',
        'OmiseAdapter',
      ]) {
        expect(mod[name], name).toBeDefined();
      }
    }
  });

  it('ships the formatter fixes in the artifact, not just in src', async () => {
    const core = await importArtifact('@keeratita/card');
    expect(core.reformatExpiryDate('12/2025')).toBe('12 / 25');
    expect(core.reformatExpiryDate('1 / 2030')).toBe('01 / 30');
    expect(core.validateCardNumberLength('4242424242424242')).toMatchObject({
      isValid: true,
      brand: 'visa',
    });
    // Exact-code semantics reached the bundle.
    expect(core.filterCountries('t').some((c) => c.code === 'TD')).toBe(false);
  });

  it('vanilla and react entries resolve and export their widgets', async () => {
    const vanilla = await importArtifact('@keeratita/card/vanilla');
    expect(typeof vanilla.CardForm).toBe('function');
    expect(typeof vanilla.CardModal).toBe('function');
    expect(typeof vanilla.AutocompleteDropdown).toBe('function');
    expect(typeof vanilla.CountryAutocomplete).toBe('function');

    const react = await importArtifact('@keeratita/card/react');
    expect(typeof react.useCardForm).toBe('function');
    expect(typeof react.FormField).toBe('function');
    expect(react.CardForm).toBeDefined();
    expect(react.CountryAutocomplete).toBeDefined();
  });

  // typeof checks above only prove the bundle loads; these prove the shipped
  // widgets actually construct, render, and behave — so a bundle that throws
  // on construction can no longer ship green.
  it('built vanilla CardForm renders, formats input, and tears down', async () => {
    const vanilla = await importArtifact('@keeratita/card/vanilla');
    const container = document.createElement('div');
    document.body.appendChild(container);
    try {
      const form = new vanilla.CardForm(container, { adapter: stubGateway() });

      const number = container.querySelector('.card-number-input');
      expect(number, 'card number input').not.toBeNull();
      expect(container.querySelector('.card-expiry-input')).not.toBeNull();
      expect(container.querySelector('.card-cvc-input')).not.toBeNull();
      expect(container.querySelector('.card-name-input')).not.toBeNull();
      expect(container.querySelector('.submit-btn')).not.toBeNull();

      // The bundled input handler must reformat raw digits.
      const numberInput = number as HTMLInputElement;
      numberInput.value = '4242424242424242';
      numberInput.dispatchEvent(new Event('input'));
      expect(numberInput.value).toBe('4242 4242 4242 4242');

      // destroy() must remove the rendered DOM (documented cleanup contract).
      form.destroy();
      expect(container.innerHTML).toBe('');
    } finally {
      container.remove();
    }
  });

  it('built vanilla CardModal mounts an accessible overlay and destroy() removes it', async () => {
    const vanilla = await importArtifact('@keeratita/card/vanilla');
    const modal = new vanilla.CardModal({ adapter: stubGateway() });
    try {
      const overlay = document.body.querySelector('.modal-overlay');
      expect(overlay, 'overlay appended to document.body').not.toBeNull();
      const content = overlay?.querySelector('.modal-content');
      expect(content?.getAttribute('role')).toBe('dialog');
      expect(content?.getAttribute('aria-modal')).toBe('true');
      // The full CardForm was rendered inside the modal, not a stub.
      expect(overlay?.querySelector('.payment-form-el')).not.toBeNull();
      expect(overlay?.querySelector('.card-number-input')).not.toBeNull();
    } finally {
      modal.destroy();
    }
    expect(document.querySelector('.modal-overlay')).toBeNull();
  });

  it('built React CardForm renders the payment fields and formats input', async () => {
    const react = await importArtifact('@keeratita/card/react');
    const { container } = render(
      createElement(react.CardForm, { adapter: stubGateway() }),
    );

    expect(container.querySelector('.payment-form-el')).not.toBeNull();
    const number = container.querySelector(
      'input[autocomplete="cc-number"]',
    ) as HTMLInputElement;
    expect(number, 'card number input').not.toBeNull();
    expect(container.querySelector('input[autocomplete="cc-exp"]')).not.toBeNull();
    expect(container.querySelector('input[autocomplete="cc-csc"]')).not.toBeNull();
    expect(container.querySelector('input[autocomplete="cc-name"]')).not.toBeNull();

    // The bundled hook must format raw digits as the consumer types.
    fireEvent.change(number, { target: { value: '4242424242424242' } });
    expect(number.value).toBe('4242 4242 4242 4242');
  });

  it('exposes the stylesheet through the exports map, as the docs instruct', async () => {
    // `import '@keeratita/card/vanilla/styles.css'` is what both framework
    // guides tell consumers to write; a missing "exports" subpath makes that
    // import fail with ERR_PACKAGE_PATH_NOT_EXPORTED at build time.
    const { createRequire } = await import('node:module');
    // Vitest rewrites `import.meta.url` (not a file: URL), so anchor require()
    // at the package root instead.
    const require = createRequire(`${process.cwd()}/index.js`);
    for (const subpath of [
      '@keeratita/card/vanilla/styles.css',
      '@keeratita/card/vanilla/styles.min.css',
    ]) {
      let resolved = '';
      expect(() => {
        resolved = require.resolve(subpath);
      }, subpath).not.toThrow();
      expect(resolved.endsWith('.css'), subpath).toBe(true);
    }
  });

  it('generated dist manifest keeps the stylesheet subpaths in sync', async () => {
    // `node_modules/@keeratita/card` symlinks to `dist`, so the workspace and
    // the examples resolve `@keeratita/card/*` against this generated manifest
    // rather than the root one. Dropping these subpaths from
    // scripts/generate-dist-package-json.js leaves every other suite green and
    // breaks the React example build with ERR_PACKAGE_PATH_NOT_EXPORTED.
    const { readFile } = await import('node:fs/promises');
    const manifest = (await JSON.parse(
      await readFile(`${DIST}/package.json`, 'utf8'),
    )) as { exports?: Record<string, unknown> };
    const root = (await JSON.parse(
      await readFile('package.json', 'utf8'),
    )) as { exports: Record<string, unknown> };
    for (const subpath of ['./vanilla/styles.css', './vanilla/styles.min.css']) {
      expect(root.exports[subpath], `root ${subpath}`).toBeDefined();
      expect(manifest.exports?.[subpath], `dist ${subpath}`).toBeDefined();
    }
  });

  it('shipped stylesheet contains the classes the bindings render', async () => {
    const { readFile } = await import('node:fs/promises');
    const css = await readFile(`${DIST}/vanilla/styles.css`, 'utf8');
    // Every class the React binding depends on must exist in the shipped CSS,
    // otherwise the component renders unstyled for consumers.
    for (const cls of [
      '.country-autocomplete-item',
      '.country-autocomplete-list',
      '.country-autocomplete-empty',
      '.visually-hidden',
      '.autocomplete-result',
      // FormField's own block: nothing else in the package styles it, so a
      // consumer that imports the stylesheet gets an unstyled field without it.
      '.form-field',
      '.form-field__label',
      '.form-field__input',
      '.form-field__error',
      '.form-field__required',
    ]) {
      expect(css, cls).toContain(cls);
    }
  });
});

describeBuilt('published Angular entry (JIT)', () => {
  beforeAll(async () => {
    getTestBed().initTestEnvironment(
      BrowserDynamicTestingModule,
      platformBrowserDynamicTesting(),
    );
    const shipped = await importArtifact('@keeratita/card/angular');
    (globalThis as Record<string, unknown>).__shippedAngular = shipped;
  });

  function shipped(): Record<string, any> {
    return (globalThis as Record<string, any>).__shippedAngular;
  }

  async function createShippedCountrySelect() {
    await TestBed.configureTestingModule({
      imports: [shipped().CountrySelectComponent],
    }).compileComponents();
    return TestBed.createComponent(shipped().CountrySelectComponent);
  }

  it('exports the public Angular surface', () => {
    for (const name of [
      'CountrySelectComponent',
      'CardNumberDirective',
      'creditCardValidator',
      'countryValidator',
      'createCardFormGroup',
      'COUNTRIES',
    ]) {
      expect(shipped()[name], name).toBeDefined();
    }
  });

  it('renders the unified combobox ARIA contract', async () => {
    const fixture = await createShippedCountrySelect();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    const trigger = el.querySelector('.country-select-trigger') as HTMLElement;
    // Disclosure button in both states — never a second combobox.
    expect(trigger.getAttribute('role')).toBe('button');
    expect(trigger.getAttribute('aria-haspopup')).toBe('listbox');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.hasAttribute('aria-controls')).toBe(false);

    trigger.click();
    fixture.detectChanges();

    const list = el.querySelector('[role="listbox"]') as HTMLElement;
    const search = el.querySelector(
      '.country-select-search-input',
    ) as HTMLInputElement;
    expect(list).not.toBeNull();
    expect(el.querySelectorAll('[role="combobox"]')).toHaveLength(1);
    expect(search.getAttribute('role')).toBe('combobox');
    expect(search.getAttribute('aria-autocomplete')).toBe('list');
    expect(search.getAttribute('aria-controls')).toBe(list.id);
    expect(trigger.getAttribute('aria-controls')).toBe(list.id);

    search.value = 't';
    search.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    const names = [...el.querySelectorAll('.country-select-item')].map(
      (n) => n.textContent ?? '',
    );
    expect(names.some((t) => t.includes('Thailand'))).toBe(true);
    expect(names.some((t) => t.includes('Chad'))).toBe(false);

    const first = el.querySelector('.country-select-item') as HTMLElement;
    expect(first.getAttribute('aria-setsize')).toBeTruthy();
    expect(first.getAttribute('aria-posinset')).toBe('1');

    search.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
    );
    fixture.detectChanges();
    const highlighted = el.querySelector('.highlighted') as HTMLElement;
    expect(search.getAttribute('aria-activedescendant')).toBe(highlighted.id);

    search.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    fixture.detectChanges();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.hasAttribute('aria-controls')).toBe(false);
  });

  // Unlike tests/angular/country-select.test.ts (which JIT-compiles the
  // src component, where signal `input()` bindings do not register), the
  // shipped entry carries ngc partial metadata (`ɵɵngDeclareComponent`) —
  // the same thing a consumer's bundler compiles. setInput() driving these
  // signal inputs is exactly the contract the published artifact must honor.
  it('reacts to setInput("value") — selected country and option row', async () => {
    const fixture = await createShippedCountrySelect();
    fixture.componentRef.setInput('value', 'TH');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    // Trigger shows the selected country instead of the placeholder.
    expect(el.querySelector('.country-select-placeholder')).toBeNull();
    expect(el.querySelector('.country-select-name')?.textContent).toContain(
      'Thailand',
    );

    // Open the list: the TH row is the marked-selected option.
    (el.querySelector('.country-select-trigger') as HTMLElement).click();
    fixture.detectChanges();
    const thRow = el.querySelector('[data-code="TH"]') as HTMLElement;
    expect(thRow, 'TH option row').not.toBeNull();
    expect(thRow.getAttribute('aria-selected')).toBe('true');
    expect(thRow.classList.contains('selected')).toBe(true);
    const usRow = el.querySelector('[data-code="US"]') as HTMLElement;
    expect(usRow.getAttribute('aria-selected')).toBe('false');
    expect(usRow.classList.contains('selected')).toBe(false);
  });

  it('reacts to setInput("invalid") — invalid class and aria-invalid', async () => {
    const fixture = await createShippedCountrySelect();
    fixture.componentRef.setInput('invalid', true);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;

    expect(el.querySelector('.row-country')?.classList.contains('invalid')).toBe(
      true,
    );
    const trigger = el.querySelector('.country-select-trigger') as HTMLElement;
    expect(trigger.classList.contains('invalid')).toBe(true);
    expect(trigger.getAttribute('aria-invalid')).toBe('true');

    // And the state must clear when the input flips back.
    fixture.componentRef.setInput('invalid', false);
    fixture.detectChanges();
    expect(el.querySelector('.row-country')?.classList.contains('invalid')).toBe(
      false,
    );
    expect(trigger.hasAttribute('aria-invalid')).toBe(false);
  });

  it('reacts to setInput("required") — required star and aria-required', async () => {
    const fixture = await createShippedCountrySelect();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const trigger = el.querySelector('.country-select-trigger') as HTMLElement;

    // Default: required, with the visible star.
    expect(el.querySelector('.required-star')).not.toBeNull();
    expect(trigger.getAttribute('aria-required')).toBe('true');

    fixture.componentRef.setInput('required', false);
    fixture.detectChanges();
    expect(el.querySelector('.required-star')).toBeNull();
    expect(trigger.getAttribute('aria-required')).toBe('false');
  });

  it('ships working reactive validators', () => {
    const control = (value: string) => ({ value }) as never;
    expect(
      shipped().creditCardValidator()(control('4242424242424242')),
    ).toBeNull();
    expect(
      shipped().creditCardValidator()(control('1234567890123456')),
    ).toBeTruthy();
    expect(shipped().countryValidator()(control('TH'))).toBeNull();
    // Empty is "not filled in" (Angular `required` covers that), not invalid.
    expect(shipped().countryValidator()(control(''))).toBeNull();
    expect(shipped().countryValidator()(control('X'))).toBeTruthy();
  });
});
