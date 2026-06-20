export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'jcb' | 'discover' | 'diners' | 'unknown';

/**
 * Pre-compiled regex patterns for card brand detection.
 * Compiled once at module load time to reduce GC pressure on hot paths.
 */
const BRAND_PATTERNS = {
  visa: /^4/,
  mastercard: /^(5[1-5]|2[2-7])/,
  amex: /^3[47]/,
  jcb: /^35/,
  discover6011: /^6011/,
  discover65: /^65/,
  discover64: /^64[4-9]/,
  diners: /^3(0[0-5]|09|6|8[9])/,
} as const;

/**
 * Detects the credit card brand based on the card number.
 * Returns 'unknown' for invalid inputs, empty strings, or unrecognized patterns.
 * 
 * PERFORMANCE: Uses pre-compiled regex patterns and short-circuit evaluation
 * to minimize allocations on the hot path (called on every keystroke).
 */
export function detectCardBrand(cardNumber: string): CardBrand {
  // Handle null, undefined, or non-string inputs gracefully
  if (!cardNumber || typeof cardNumber !== 'string') {
    return 'unknown';
  }

  // Truncate to prevent DoS with extremely long inputs
  const cleanNumber = cardNumber.replace(/\D/g, '').slice(0, 19);

  // Empty or too short numbers are unknown
  // Minimum 6 digits ensures we have enough context to distinguish brands
  // (e.g., Visa "4" vs Mastercard "51" vs Amex "37")
  if (cleanNumber.length < 6) {
    return 'unknown';
  }

  // Use pre-compiled regex patterns (short-circuit from most common to least)
  if (BRAND_PATTERNS.visa.test(cleanNumber)) {
    return 'visa';
  }

  if (BRAND_PATTERNS.mastercard.test(cleanNumber)) {
    return 'mastercard';
  }

  if (BRAND_PATTERNS.amex.test(cleanNumber)) {
    return 'amex';
  }

  if (BRAND_PATTERNS.jcb.test(cleanNumber)) {
    return 'jcb';
  }

  // Discover: starts with 6011, 65, or 644-649
  if (BRAND_PATTERNS.discover6011.test(cleanNumber) ||
      BRAND_PATTERNS.discover65.test(cleanNumber) ||
      BRAND_PATTERNS.discover64.test(cleanNumber)) {
    return 'discover';
  }

  // Diners Club: starts with 300-305, 36, 309, or 3[8-9]
  if (BRAND_PATTERNS.diners.test(cleanNumber)) {
    return 'diners';
  }

  return 'unknown';
}
