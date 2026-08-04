import { detectCardBrand } from '../domain/brand';

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
    const digits = clean.slice(0, 19);
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
  // Clamp invalid months to 12
  const monthNum = Number.parseInt(month, 10);
  if (monthNum < 1 || monthNum > 12) {
    month = '12';
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
