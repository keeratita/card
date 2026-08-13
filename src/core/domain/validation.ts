import { detectCardBrand } from './brand';
import {
  MAX_CARD_NUMBER_LENGTH,
  MAX_CVC_LENGTH,
  MAX_NAME_LENGTH,
  MAX_EMAIL_LENGTH,
  MAX_PHONE_LENGTH,
  MAX_POSTAL_CODE_LENGTH,
  MAX_COUNTRY_LENGTH,
  MAX_EXPIRY_LENGTH,
} from '../constants';
import { sanitizeInput } from '../security';

export function luhnCheck(cardNumber: string): boolean {
  const clean = cardNumber.replace(/\D/g, '').slice(0, MAX_CARD_NUMBER_LENGTH);
  if (clean.length < 13 || clean.length > 19) return false;

  let sum = 0;
  let shouldDouble = false;

  for (let i = clean.length - 1; i >= 0; i--) {
    const digitChar = clean.charAt(i);
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

  // A Luhn sum of 0 only occurs when every digit is 0. All-zero PANs pass the
  // checksum but are never real card numbers, so reject them explicitly.
  return sum > 0 && sum % 10 === 0;
}

export function validateExpiry(expMonth: string, expYear: string): boolean {
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

  if (year > 2100) return false;

  const now = new Date();
  if (year < now.getFullYear()) return false;
  if (year === now.getFullYear() && month < now.getMonth() + 1) return false;

  return true;
}

export function validateCvc(cvc: string, cardNumber: string): boolean {
  const cleanCvc = cvc.replace(/\D/g, '').slice(0, MAX_CVC_LENGTH);
  const brand = cardNumber ? detectCardBrand(cardNumber) : 'unknown';
  const expectedLength = brand === 'amex' ? 4 : 3;
  return cleanCvc.length === expectedLength;
}

export function validateName(name: string): boolean {
  const clean = sanitizeInput(name).trim().slice(0, MAX_NAME_LENGTH);
  if (!clean) return false;
  return clean.length >= 1;
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
  return clean.length === 2 || clean.length === 3;
}

export function validateCardNumber(cardNumber: string): boolean {
  const clean = cardNumber.replace(/\D/g, '').slice(0, MAX_CARD_NUMBER_LENGTH);
  if (clean.length < 13 || clean.length > 19) return false;

  // Note: brand is intentionally not required here. Rejecting unrecognized
  // brands (e.g. UnionPay, Maestro, newer ranges) would decline valid cards
  // that still pass Luhn. Luhn + length is the acceptance gate.
  return luhnCheck(clean);
}