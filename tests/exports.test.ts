/**
 * Public API surface guard.
 *
 * `package.json` `exports` is the library's contract: `.`, `./vanilla`,
 * `./react`, `./angular`. A value that stops being re-exported from an entry
 * file is a breaking change for consumers even when the source module still
 * exports it, so each entry point is asserted here by importing the entry
 * file itself (not the individual modules).
 */
import { describe, it, expect } from 'vitest';
import * as core from '../src/index';
import * as vanilla from '../src/vanilla/index';
import * as react from '../src/react/index';
import * as angular from '../src/angular/index';

describe('public entry points', () => {
  it('core exposes domain, validation, formatters and adapters', () => {
    const expectedFunctions = [
      'detectCardBrand',
      'luhnCheck',
      'formatCardNumber',
      'formatExpiry',
      'formatCvc',
      'cleanDigits',
      'reformatExpiryDate',
      'validateCardNumberLength',
      'isCardLengthValid',
      'validateField',
      'getFieldErrorMessage',
      'buildCard',
      'parseExpiry',
      'filterCountries',
      'findCountryByCode',
      'sanitizeInput',
      'escapeHtml',
    ] as const;
    for (const name of expectedFunctions) {
      expect(typeof (core as Record<string, unknown>)[name], name).toBe(
        'function',
      );
    }
    expect(typeof core.StripeAdapter).toBe('function');
    expect(typeof core.OmiseAdapter).toBe('function');
    expect(typeof core.PaymentGatewayError).toBe('function');
  });

  // The combobox core is part of the public surface (AGENTS.md requires new
  // exports to be re-exported from the matching entry file): bindings build
  // custom widgets on top of it.
  it('core exposes the shared combobox primitives', () => {
    expect(typeof core.comboboxReduce).toBe('function');
    expect(typeof core.comboboxFilter).toBe('function');
    expect(typeof core.computeDropdownPlacement).toBe('function');
    expect(typeof core.moveHighlight).toBe('function');
    expect(core.INITIAL_COMBOBOX_STATE).toEqual({
      isOpen: false,
      query: '',
      highlightedIndex: -1,
    });
  });

  it('vanilla exposes the form, modal and autocomplete widgets', () => {
    expect(typeof vanilla.CardForm).toBe('function');
    expect(typeof vanilla.CardModal).toBe('function');
    expect(typeof vanilla.AutocompleteDropdown).toBe('function');
    expect(typeof vanilla.CountryAutocomplete).toBe('function');
  });

  it('react exposes the hook and components', () => {
    expect(typeof react.useCardForm).toBe('function');
    expect(typeof react.CardForm).toBe('function');
    // Memoized components are exotic objects (`{$$typeof: react.memo}`), not
    // plain functions — assert presence instead of typeof.
    expect(react.CreditCardPreview).toBeDefined();
    expect(react.CountryAutocomplete).toBeDefined();
    expect(react.FormFieldsGroup).toBeDefined();
    expect(react.FormField).toBeDefined();
  });

  it('angular exposes the standalone components and validators', () => {
    expect(typeof angular.CountrySelectComponent).toBe('function');
    // Directive classes are decorators-wrapped classes; presence is the
    // contract that matters here.
    expect(typeof angular.CardNumberDirective).toBe('function');
  });
});
