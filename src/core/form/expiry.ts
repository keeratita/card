import { cleanDigits } from '../formatters/card-formatter';

export interface ParsedExpiry {
  month: string;
  year: string;
}

/**
 * Parses a card expiry value into month and year.
 * Accepts "MM/YY", "MM / YY", "MMYY", "MM/YYYY", or a raw digit string.
 * Returns empty strings when the value cannot be parsed.
 */
export function parseExpiry(value: string): ParsedExpiry {
  const clean = cleanDigits(value ?? '');

  // MMYYYY (6 digits) — 4-digit year
  if (clean.length === 6) {
    return {
      month: clean.substring(0, 2),
      year: clean.substring(2, 6),
    };
  }

  if (clean.length < 4) {
    return { month: '', year: '' };
  }

  // MMYY (4 digits)
  return {
    month: clean.substring(0, 2),
    year: clean.substring(2, 4),
  };
}
