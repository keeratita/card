import { detectCardBrand } from './brand';

export function luhnCheck(cardNumber: string): boolean {
  const clean = cardNumber.replace(/\D/g, '');
  if (clean.length < 13 || clean.length > 19) return false;
  
  let sum = 0;
  let shouldDouble = false;
  
  for (let i = clean.length - 1; i >= 0; i--) {
    let digit = parseInt(clean.charAt(i), 10);
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
  const monthStr = expMonth.replace(/\D/g, '');
  const yearStr = expYear.replace(/\D/g, '');
  
  if (!monthStr || !yearStr) return false;
  
  const month = parseInt(monthStr, 10);
  if (isNaN(month) || month < 1 || month > 12) return false;
  
  let year = parseInt(yearStr, 10);
  if (isNaN(year)) return false;
  
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
  const cleanCvc = cvc.replace(/\D/g, '');
  const brand = detectCardBrand(cardNumber);
  const expectedLength = brand === 'amex' ? 4 : 3;
  return cleanCvc.length === expectedLength;
}

export function validateName(name: string): boolean {
  const clean = name.trim();
  if (!clean) return false;
  const parts = clean.split(/\s+/);
  return parts.length >= 2;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  const clean = phone.replace(/\D/g, '');
  return clean.length >= 8;
}

export function validatePostalCode(postalCode: string): boolean {
  return postalCode.trim().length >= 4;
}

export function validateCountry(country: string): boolean {
  return country.trim().length === 2;
}

export function validateGeneric(val: string): boolean {
  return val.trim().length > 0;
}
