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
 * fresh clone; run it after a build with `npm run test:dist`.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { TestBed, getTestBed } from '@angular/core/testing';
import {
  BrowserDynamicTestingModule,
  platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';

// Vitest rewrites `import.meta.url`, so anchor on the process cwd (Vitest runs
// with the project root as cwd, the same anchor vitest.config.ts uses).
const DIST = resolve(process.cwd(), 'dist');
const built = existsSync(`${DIST}/index.js`) && existsSync(`${DIST}/angular/index.js`);

const describeBuilt = built ? describe : describe.skip;

if (!built) {
  // One line of guidance instead of 20 silently-skipped tests.
  console.warn('[dist-consumer] dist/ not found — run `npm run build` first.');
}

describeBuilt('published artifacts', () => {
  it('core entry exposes the documented surface (ESM + CJS)', async () => {
    const esm = await import('@keeratita/card');
    const cjs = await import('../dist/index.js');
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
    const core = await import('@keeratita/card');
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
    const vanilla = await import('@keeratita/card/vanilla');
    expect(typeof vanilla.CardForm).toBe('function');
    expect(typeof vanilla.CardModal).toBe('function');
    expect(typeof vanilla.AutocompleteDropdown).toBe('function');
    expect(typeof vanilla.CountryAutocomplete).toBe('function');

    const react = await import('@keeratita/card/react');
    expect(typeof react.useCardForm).toBe('function');
    expect(typeof react.FormField).toBe('function');
    expect(react.CardForm).toBeDefined();
    expect(react.CountryAutocomplete).toBeDefined();
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
    const shipped = await import('@keeratita/card/angular');
    (globalThis as Record<string, unknown>).__shippedAngular = shipped;
  });

  function shipped(): Record<string, any> {
    return (globalThis as Record<string, any>).__shippedAngular;
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
    await TestBed.configureTestingModule({
      imports: [shipped().CountrySelectComponent],
    }).compileComponents();

    const fixture = TestBed.createComponent(shipped().CountrySelectComponent);
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
