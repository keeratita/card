import {
  detectCardBrand,
  getExpectedCvcLength,
} from '../domain/brand';
import type { CardBrand } from '../domain/brand';
import {
  MAX_CARD_NUMBER_LENGTH,
  MIN_CARD_NUMBER_LENGTH,
} from '../constants';

export function cleanDigits(value: string): string {
  return value.replace(/\D/g, '');
}

export function formatCardNumber(value: string): string {
  const clean = cleanDigits(value);
  const brand = detectCardBrand(clean);

  if (brand === 'amex') {
    const parts = [
      clean.substring(0, 4),
      clean.substring(4, 10),
      clean.substring(10, 15),
    ].filter(Boolean);
    return parts.join(' ');
  } else {
    // Keep up to 19 digits regardless of brand: validation accepts 13-19 digit
    // numbers for every brand (incl. 19-digit Visa), so the formatter must
    // never silently truncate a PAN the validators would accept.
    const digits = clean.slice(0, MAX_CARD_NUMBER_LENGTH);
    const parts = [];
    for (let i = 0; i < digits.length; i += 4) {
      parts.push(digits.substring(i, i + 4));
    }
    return parts.join(' ');
  }
}

export function formatExpiry(value: string): string {
  const clean = cleanDigits(value).substring(0, 4);
  if (clean.length === 0) return '';

  let month = clean.substring(0, 2);
  const monthNum = Number.parseInt(month, 10);

  if (monthNum > 12) {
    const firstDigit = month.charAt(0);
    if (firstDigit >= '2' && firstDigit <= '9') {
      // "2025" typed without a leading zero means month 02 + year "25":
      // interpret the first digit as a 0X month. Never rewrite a tens-prefixed
      // month like "20" into "12" (silent February → December).
      month = '0' + firstDigit;
    } else {
      // "13".."19" clamp to 12; "00" stays as-is so validation rejects it.
      month = '12';
    }
  }

  const year = clean.substring(2, 4);
  if (clean.length > 2) {
    return `${month} / ${year}`;
  }

  return month;
}

export function formatCvc(value: string, cardNumber: string): string {
  const clean = cleanDigits(value);
  const brand = detectCardBrand(cardNumber);
  const limit = getExpectedCvcLength(brand);
  return clean.substring(0, limit);
}

const BRAND_LENGTH_RANGES: Record<string, [min: number, max: number]> = {
  amex: [15, 15],
  discover: [16, 17],
  diners: [14, 14],
  jcb: [16, 17],
  mastercard: [16, 17],
  visa: [13, 16],
  unknown: [MIN_CARD_NUMBER_LENGTH, MAX_CARD_NUMBER_LENGTH],
};

export function formatPhone(value: string): string {
  const hasPlus = value.startsWith('+');
  const clean = cleanDigits(value);
  return (hasPlus ? '+' : '') + clean;
}

/**
 * Normalizes a stored/user-typed expiry (any `MM[-/ ]YY[YY]` shape) into
 * the library's display format. A 4-digit year is reduced to its last two
 * digits first, so backend-stored `MM/YYYY` values ("12/2025") normalize to
 * `"12 / 25"` — not to the century digits (`"12 / 20"`). The month is
 * zero-padded in the same pass, so `"1 / 2030"` normalizes to `"01 / 30"`
 * instead of being misread as the ambiguous 3-digit "130".
 */
export function reformatExpiryDate(value: string): string {
  const withFullYear = /^(\d{1,2})\D*(\d{4})$/.exec(value.trim());
  const normalized = withFullYear
    ? `${withFullYear[1].padStart(2, '0')}${withFullYear[2].slice(2)}`
    : value.replace(/[/\-\s]/g, '');
  return formatExpiry(normalized);
}

export interface CardNumberLengthResult {
  isValid: boolean;
  /** Brand the length range was taken from (detect once, reuse in UI). */
  brand: CardBrand;
  minLength: number;
  maxLength: number;
  actualLength: number;
}

export function validateCardNumberLength(
  cardNumber: string,
): CardNumberLengthResult {
  const clean = cleanDigits(cardNumber);
  const brand = detectCardBrand(clean);

  // Brands absent from the table fall back to the all-brands bounds.
  const [minLength, maxLength] = BRAND_LENGTH_RANGES[brand] || [
    MIN_CARD_NUMBER_LENGTH,
    MAX_CARD_NUMBER_LENGTH,
  ];
  const actualLength = clean.length;

  return {
    isValid: actualLength >= minLength && actualLength <= maxLength,
    brand,
    minLength,
    maxLength,
    actualLength,
  };
}

export function isCardLengthValid(cardNumber: string): boolean {
  const clean = cleanDigits(cardNumber);
  const brand = detectCardBrand(clean);
  const [minLength, maxLength] = BRAND_LENGTH_RANGES[brand] || [
    MIN_CARD_NUMBER_LENGTH,
    MAX_CARD_NUMBER_LENGTH,
  ];
  return clean.length >= minLength && clean.length <= maxLength;
}
