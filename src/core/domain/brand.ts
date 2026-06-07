export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'jcb' | 'unknown';

/**
 * Detects the credit card brand based on the card number.
 * Returns 'unknown' for invalid inputs, empty strings, or unrecognized patterns.
 */
export function detectCardBrand(cardNumber: string): CardBrand {
  // Handle null, undefined, or non-string inputs gracefully
  if (!cardNumber || typeof cardNumber !== 'string') {
    return 'unknown';
  }
  
  // Truncate to prevent DoS with extremely long inputs
  const cleanNumber = cardNumber.replace(/\D/g, '').slice(0, 19);

  // Empty or too short numbers are unknown
  if (cleanNumber.length < 6) {
    return 'unknown';
  }

  if (/^4/.test(cleanNumber)) {
    return 'visa';
  }

  if (/^(5[1-5]|2[2-7])/.test(cleanNumber)) {
    return 'mastercard';
  }

  if (/^3[47]/.test(cleanNumber)) {
    return 'amex';
  }

  if (/^35/.test(cleanNumber)) {
    return 'jcb';
  }

  return 'unknown';
}
