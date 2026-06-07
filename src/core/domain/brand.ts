export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'jcb' | 'unknown';

export function detectCardBrand(cardNumber: string): CardBrand {
  const cleanNumber = cardNumber.replace(/\D/g, '');

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
