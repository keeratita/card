import { describe, it, expect, vi } from 'vitest';
import {
  validateField,
  getFieldErrorMessage,
  parseExpiry,
  buildCard,
  getCardNumberMaxLength,
  restoreCaret,
  filterCountries,
  moveHighlight,
  findCountryByCode,
  buildSuccessSummary,
} from '../../src/core/form';

describe('validateField', () => {
  it('validates a valid card number', () => {
    expect(validateField('number', '4242424242424242').isValid).toBe(true);
  });

  it('rejects an invalid card number', () => {
    const result = validateField('number', '1234567890123456');
    expect(result.isValid).toBe(false);
    expect(result.errorCode).toBe('invalidCardNumber');
  });

  it('validates expiry requiring 4 digits', () => {
    expect(validateField('expiry', '12/30').isValid).toBe(true);
    expect(validateField('expiry', '12345').isValid).toBe(false);
    // 6-digit MMYYYY is not a supported input format: every formatter
    // truncates to MMYY before validation runs.
    expect(validateField('expiry', '122030').isValid).toBe(false);
  });

  it('validates CVC using the card number brand', () => {
    expect(
      validateField('cvc', '123', { cardNumber: '4242424242424242' }).isValid,
    ).toBe(true);
    expect(
      validateField('cvc', '123', { cardNumber: '378282246310005' }).isValid,
    ).toBe(false); // Amex requires 4 digits
    expect(
      validateField('cvc', '1234', { cardNumber: '378282246310005' }).isValid,
    ).toBe(true);
  });

  it('validates name, email, phone, postalCode, country', () => {
    expect(validateField('name', 'John Doe').isValid).toBe(true);
    expect(validateField('email', 'a@b.com').isValid).toBe(true);
    expect(validateField('email', 'nope').isValid).toBe(false);
    expect(validateField('phone', '12345678').isValid).toBe(true);
    expect(validateField('postalCode', '12345').isValid).toBe(true);
    expect(validateField('country', 'US').isValid).toBe(true);
  });

  it('falls back to non-empty for unknown fields', () => {
    expect(validateField('city', 'Bangkok').isValid).toBe(true);
    expect(validateField('city', '').isValid).toBe(false);
  });
});

describe('getFieldErrorMessage', () => {
  it('returns a message for known fields', () => {
    expect(getFieldErrorMessage('number')).toContain('card');
    expect(getFieldErrorMessage('expiry')).toBeTruthy();
    expect(getFieldErrorMessage('unknown')).toBeTruthy();
  });
});

describe('parseExpiry', () => {
  it('parses MMYY', () => {
    expect(parseExpiry('1230')).toEqual({ month: '12', year: '30' });
  });

  it('parses MM/YY', () => {
    expect(parseExpiry('12/30')).toEqual({ month: '12', year: '30' });
  });

  it('parses MM/YYYY', () => {
    expect(parseExpiry('12/2030')).toEqual({ month: '12', year: '2030' });
  });

  it('returns empty for too-short values', () => {
    expect(parseExpiry('12')).toEqual({ month: '', year: '' });
  });
});

describe('buildCard', () => {
  it('builds a card from form values', () => {
    const card = buildCard(
      {
        number: '4242 4242 4242 4242',
        expiry: '12/30',
        cvc: '123',
        name: '  John Doe  ',
      },
      ['country', 'email'],
    );
    expect(card).toEqual({
      number: '4242424242424242',
      expMonth: '12',
      expYear: '30',
      cvc: '123',
      name: 'John Doe',
    });
  });

  it('spreads active optional fields', () => {
    const card = buildCard(
      {
        number: '4242424242424242',
        expiry: '12/30',
        cvc: '123',
        name: 'John Doe',
        country: 'TH',
        email: 'a@b.com',
      },
      ['country', 'email'],
    );
    expect(card.country).toBe('TH');
    expect(card.email).toBe('a@b.com');
  });

  it('ignores empty optional fields', () => {
    const card = buildCard(
      {
        number: '4242424242424242',
        expiry: '12/30',
        cvc: '123',
        name: 'John Doe',
        country: '',
      },
      ['country'],
    );
    expect(card.country).toBeUndefined();
  });
});

describe('getCardNumberMaxLength', () => {
  it('returns 17 for Amex and 23 for every other brand (safe upper bound)', () => {
    expect(getCardNumberMaxLength('34')).toBe(17);
    expect(getCardNumberMaxLength('4')).toBe(23);
    expect(getCardNumberMaxLength('55')).toBe(23);
    expect(getCardNumberMaxLength('36')).toBe(23);
    expect(getCardNumberMaxLength('')).toBe(23);
    // The bound must never be smaller than the formatted length of the
    // longest accepted PAN (19 digits + 4 spaces)
    expect(getCardNumberMaxLength('4'.repeat(19))).toBeGreaterThanOrEqual(23);
  });
});

describe('restoreCaret', () => {
  it('restores caret position after formatting', () => {
    const input = document.createElement('input');
    input.value = '4111 1111 1111 1111';
    const setSelectionRange = vi
      .spyOn(input, 'setSelectionRange')
      .mockImplementation(() => {});
    restoreCaret(
      input,
      '4111 1111 1111 1111',
      '4111 1111 1111 1111',
      5,
    );
    expect(setSelectionRange).toHaveBeenCalled();
  });

  it('keeps the caret at the end when typing past a group boundary', () => {
    const input = document.createElement('input');
    input.value = '4242 4'; // formatted value after typing raw "42424"
    const setSelectionRange = vi
      .spyOn(input, 'setSelectionRange')
      .mockImplementation(() => {});
    restoreCaret(input, '42424', '4242 4', 5);
    // Caret must land after the newly formatted space: "4242 4|"
    expect(setSelectionRange).toHaveBeenCalledWith(6, 6);
  });

  it('keeps the caret aligned to its digit when editing in the middle', () => {
    const input = document.createElement('input');
    input.value = '4242 5424 2'; // formatted value after inserting "5"
    const setSelectionRange = vi
      .spyOn(input, 'setSelectionRange')
      .mockImplementation(() => {});
    restoreCaret(input, '4242 54242', '4242 5424 2', 6);
    // Caret stays after the 5th digit: "4242 5|424 2"
    expect(setSelectionRange).toHaveBeenCalledWith(6, 6);
  });
});

describe('country helpers', () => {
  it('filters countries by name and code', () => {
    const results = filterCountries('thai');
    expect(results.some((c) => c.code === 'TH')).toBe(true);
    const byCode = filterCountries('US');
    expect(byCode.some((c) => c.code === 'US')).toBe(true);
  });

  it('prioritizes starts-with matches over contains matches', () => {
    const results = filterCountries('t');
    // Thailand starts with "T" and must come before a country that merely
    // contains "t" (e.g. Afghanistan).
    const thaiIndex = results.findIndex((c) => c.code === 'TH');
    const afIndex = results.findIndex((c) => c.code === 'AF');
    expect(thaiIndex).toBeGreaterThanOrEqual(0);
    expect(afIndex).toBeGreaterThanOrEqual(0);
    expect(thaiIndex).toBeLessThan(afIndex);
  });

  it('returns all countries for empty query', () => {
    expect(filterCountries('').length).toBeGreaterThan(200);
  });

  it('moves highlight with wrapping', () => {
    expect(moveHighlight(0, 'down', 3)).toBe(1);
    expect(moveHighlight(2, 'down', 3)).toBe(0);
    expect(moveHighlight(0, 'up', 3)).toBe(2);
    expect(moveHighlight(1, 'up', 3)).toBe(0);
    expect(moveHighlight(0, 'down', 0)).toBe(-1);
  });

  it('finds a country by code', () => {
    expect(findCountryByCode('TH')?.name).toBe('Thailand');
    expect(findCountryByCode('XX')).toBeUndefined();
  });
});

describe('buildSuccessSummary', () => {
  it('masks sensitive fields', () => {
    const summary = buildSuccessSummary(
      ['email', 'city'],
      (f) => (f === 'email' ? 'john@example.com' : 'Bangkok'),
      'contact',
    );
    const email = summary.find((s) => s.label === 'Email');
    const city = summary.find((s) => s.label === 'City');
    expect(email?.masked).toBe(true);
    expect(email?.value).not.toContain('john@example.com');
    expect(city?.masked).toBe(true);
    expect(city?.value).toBe('*** masked ***');
  });
});
