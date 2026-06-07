import { detectCardBrand } from './brand';

// Maximum allowed lengths for various fields
const MAX_CARD_NUMBER_LENGTH = 19;
const MAX_CVC_LENGTH = 4;
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;
const MAX_PHONE_LENGTH = 20;
const MAX_POSTAL_CODE_LENGTH = 20;
const MAX_COUNTRY_LENGTH = 3;
const MAX_EXPIRY_LENGTH = 4;

/**
 * Sanitize input: remove null bytes and dangerous control characters
 */
function sanitizeInput(value: string): string {
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

export function luhnCheck(cardNumber: string): boolean {
  // Sanitize and truncate to prevent DoS attacks with extremely long inputs
  const clean = cardNumber.replace(/\D/g, '').slice(0, MAX_CARD_NUMBER_LENGTH);
  if (clean.length < 13 || clean.length > 19) return false;

  let sum = 0;
  let shouldDouble = false;

  for (let i = clean.length - 1; i >= 0; i--) {
    const digitChar = clean.charAt(i);
    // Validate that it's actually a digit before parsing
    if (digitChar < '0' || digitChar > '9') return false;
    let digit = Number.parseInt(digitChar, 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

export function validateExpiry(expMonth: string, expYear: string): boolean {
  // Sanitize and limit length
  const monthStr = expMonth.replace(/\D/g, '').slice(0, 2);
  const yearStr = expYear.replace(/\D/g, '').slice(0, MAX_EXPIRY_LENGTH);

  if (!monthStr || !yearStr) return false;

  const month = Number.parseInt(monthStr, 10);
  if (Number.isNaN(month) || month < 1 || month > 12) return false;

  let year = Number.parseInt(yearStr, 10);
  if (Number.isNaN(year)) return false;

  if (yearStr.length === 2) {
    year = 2000 + year;
  } else if (yearStr.length !== 4) {
    return false;
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // getMonth is 0-indexed

  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;

  return true;
}

export function validateCvc(cvc: string, cardNumber: string): boolean {
  // Sanitize and limit length
  const cleanCvc = cvc.replace(/\D/g, '').slice(0, MAX_CVC_LENGTH);
  // Handle null/empty card number gracefully - default to non-Amex (3 digits)
  const brand = cardNumber ? detectCardBrand(cardNumber) : 'unknown';
  const expectedLength = brand === 'amex' ? 4 : 3;
  return cleanCvc.length === expectedLength;
}

export function validateName(name: string): boolean {
  const clean = sanitizeInput(name).trim().slice(0, MAX_NAME_LENGTH);
  if (!clean) return false;
  const parts = clean.split(/\s+/);
  return parts.length >= 2;
}

export function validateEmail(email: string): boolean {
  const cleanEmail = sanitizeInput(email).trim().slice(0, MAX_EMAIL_LENGTH);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(cleanEmail);
}

export function validatePhone(phone: string): boolean {
  const clean = sanitizeInput(phone).replace(/\D/g, '').slice(0, MAX_PHONE_LENGTH);
  return clean.length >= 8;
}

export function validatePostalCode(postalCode: string): boolean {
  const clean = sanitizeInput(postalCode).trim().slice(0, MAX_POSTAL_CODE_LENGTH);
  return clean.length >= 4;
}

export function validateCountry(country: string): boolean {
  const clean = sanitizeInput(country).trim().toUpperCase().slice(0, MAX_COUNTRY_LENGTH);
  return clean.length === 2;
}

export function validateGeneric(val: string): boolean {
  const clean = sanitizeInput(val).trim();
  return clean.length > 0;
}

/**
 * Validate a credit card number against known patterns
 * Returns true if the number matches known card patterns and passes Luhn check
 */
export function validateCardNumber(cardNumber: string): boolean {
  const clean = cardNumber.replace(/\D/g, '').slice(0, MAX_CARD_NUMBER_LENGTH);
  if (clean.length < 13 || clean.length > 19) return false;
  
  // Check if it matches a known card pattern (Visa, MC, Amex, JCB)
  const brand = detectCardBrand(clean);
  if (brand === 'unknown') return false;
  
  return luhnCheck(clean);
}