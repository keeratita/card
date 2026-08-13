export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'jcb' | 'discover' | 'diners' | 'unknown';

const FIRST_DIGITS_MASTERCARD = new Set(['51', '52', '53', '54', '55', '22', '23', '24', '25', '26', '27']);
const FIRST_DIGITS_AMEX = new Set(['34', '37']);
const FIRST_DIGITS_DINERS = new Set(['300', '301', '302', '303', '304', '305', '309', '36', '38', '39']);
const FIRST_DIGITS_DISCOVER_64 = new Set(['644', '645', '646', '647', '648', '649']);

export function detectCardBrand(cardNumber: string): CardBrand {
  if (!cardNumber || typeof cardNumber !== 'string') {
    return 'unknown';
  }

  const cleanNumber = cardNumber.replace(/\D/g, '').slice(0, 19);

  // Visa: starts with 4
  if (cleanNumber.startsWith('4')) {
    return 'visa';
  }

  // Mastercard: starts with 51-55 or 22-27
  if (FIRST_DIGITS_MASTERCARD.has(cleanNumber.substring(0, 2))) {
    return 'mastercard';
  }

  // Amex: starts with 34 or 37
  if (FIRST_DIGITS_AMEX.has(cleanNumber.substring(0, 2))) {
    return 'amex';
  }

  // JCB: starts with 35
  if (cleanNumber.startsWith('35')) {
    return 'jcb';
  }

  // Discover: starts with 6011, 65, or 644-649
  if (cleanNumber.startsWith('6011') || cleanNumber.startsWith('65') || FIRST_DIGITS_DISCOVER_64.has(cleanNumber.substring(0, 3))) {
    return 'discover';
  }

  // Diners: starts with 300-305, 309, 36, or 38-39
  if (FIRST_DIGITS_DINERS.has(cleanNumber.substring(0, 3)) || FIRST_DIGITS_DINERS.has(cleanNumber.substring(0, 2))) {
    return 'diners';
  }

  return 'unknown';
}
