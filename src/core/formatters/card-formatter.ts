import { detectCardBrand } from '../domain/brand';
import { MAX_CARD_NUMBER_LENGTH } from '../constants';

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
  const limit = brand === 'amex' ? 4 : 3;
  return clean.substring(0, limit);
}

const BRAND_LENGTH_RANGES: Record<string, [min: number, max: number]> = {
  amex: [15, 15],
  discover: [16, 17],
  diners: [14, 14],
  jcb: [16, 17],
  mastercard: [16, 17],
  visa: [13, 16],
  unknown: [13, 19],
};

export function formatCountryCode(value: string): string {
  return value
    .replace(/[^a-zA-Z]/g, '')
    .substring(0, 2)
    .toUpperCase();
}

export function generateExpiryDate(): string {
  const now = new Date();
  const expiryYear = now.getFullYear() + 1;
  let expiryMonth = now.getMonth() + 1;
  if (expiryMonth === 12) {
    expiryMonth = 1;
  }

  const monthStr = expiryMonth.toString().padStart(2, '0');
  const yearStr = (expiryYear % 100).toString().padStart(2, '0');

  return `${monthStr}/${yearStr}`;
}

export function formatPhone(value: string): string {
  const hasPlus = value.startsWith('+');
  const clean = cleanDigits(value);
  return (hasPlus ? '+' : '') + clean;
}

export function reformatExpiryDate(value: string): string {
  const cleaned = value.replace(/[/\-\s]/g, '');
  return formatExpiry(cleaned);
}

export function validateCardNumberLength(cardNumber: string): {
  isValid: boolean;
  minLength: number;
  maxLength: number;
  actualLength: number;
} {
  const clean = cleanDigits(cardNumber);
  const brand = detectCardBrand(clean);

  const [minLength, maxLength] = BRAND_LENGTH_RANGES[brand] || [13, 19];
  const actualLength = clean.length;

  return {
    isValid: actualLength >= minLength && actualLength <= maxLength,
    minLength,
    maxLength,
    actualLength,
  };
}

export function isCardLengthValid(cardNumber: string): boolean {
  const clean = cleanDigits(cardNumber);
  const brand = detectCardBrand(clean);
  const [minLength, maxLength] = BRAND_LENGTH_RANGES[brand] || [13, 19];
  return clean.length >= minLength && clean.length <= maxLength;
}
