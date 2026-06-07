import { detectCardBrand } from '../domain/brand';

export function cleanDigits(value: string): string {
  return value.replace(/\D/g, '');
}

export function formatCardNumber(value: string): string {
  const clean = cleanDigits(value);
  const brand = detectCardBrand(clean);

  if (brand === 'amex') {
    // Amex layout: 4-6-5 digits spacing
    const parts = [
      clean.substring(0, 4),
      clean.substring(4, 10),
      clean.substring(10, 15),
    ].filter(Boolean);
    return parts.join(' ');
  } else {
    // Default standard layout: 4-4-4-4 digits spacing
    const parts = [];
    for (let i = 0; i < clean.length && i < 16; i += 4) {
      parts.push(clean.substring(i, i + 4));
    }
    return parts.join(' ');
  }
}

export function formatExpiry(value: string): string {
  const clean = cleanDigits(value).substring(0, 4);
  if (clean.length === 0) return '';

  let month = clean.substring(0, 2);
  if (month.length === 2) {
    const m = parseInt(month, 10);
    if (m < 1) month = '01';
    if (m > 12) month = '12';
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
export function formatCountryCode(value: string): string {
  return value
    .replace(/[^a-zA-Z]/g, '')
    .substring(0, 2)
    .toUpperCase();
}

/**
 * Generates a valid future expiry date in MM/YY format based on the current date.
 * The expiry date will be at least 1 year in the future to ensure validity.
 */
export function generateExpiryDate(): string {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // getMonth is 0-indexed
  
  // Generate expiry date at least 1 year in the future
  const expiryYear = currentYear + 1;
  // For simplicity, use the same month, but if it's December, we'll use January of next year
  let expiryMonth = currentMonth;
  if (currentMonth === 12) {
    expiryMonth = 1;
  }
  
  // Format as MM/YY (e.g. 06/27 for June 2027)
  const monthStr = expiryMonth.toString().padStart(2, '0');
  const yearStr = (expiryYear % 100).toString().padStart(2, '0');
  
  return `${monthStr}/${yearStr}`;
}
export function formatPhone(value: string): string {
  // Strip non-numbers except leading '+'
  const hasPlus = value.startsWith('+');
  const clean = cleanDigits(value);
  return (hasPlus ? '+' : '') + clean;
}
