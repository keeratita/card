import {
  luhnCheck,
  validateExpiry,
  validateCvc,
  validateName,
  validateEmail,
  validatePhone,
  validatePostalCode,
  validateCountry,
} from '../core/domain/validation';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validates that the credit card number passes Luhn's algorithm.
 */
export function creditCardValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control?.value) return null;
    const clean = String(control.value).replace(/\D/g, '');
    // Only validate when input has at least 13 digits (minimum for any card type)
    // This prevents showing invalid error while user is still typing
    if (clean.length < 13) return null;
    const isValid = luhnCheck(clean);
    return isValid ? null : { creditCard: { value: control.value } };
  };
}

/**
 * Validates that the card expiry date is in MM/YY format and is in the future.
 * If no value is provided, it generates a valid expiry date.
 */
export function expiryValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control?.value) {
      // If no value is provided, we could generate a valid expiry date
      // But for validation purposes, we typically don't auto-generate values
      return null;
    }

    // Handle formats like MM/YY or MMYY
    const value = String(control.value);
    let month, year;

    if (value.includes('/')) {
      const parts = value.split('/');
      if (parts.length !== 2) {
        return { expiryInvalid: { value: control.value } };
      }
      month = parts[0].trim();
      year = parts[1].trim();
    } else {
      const val = value.replace(/\D/g, '');
      if (val.length !== 4) {
        return { expiryInvalid: { value: control.value } };
      }
      month = val.substring(0, 2);
      year = val.substring(2, 4);
    }

    const isValid = validateExpiry(month, year);
    return isValid ? null : { expiryInvalid: { value: control.value } };
  };
}

/**
 * Validates that the CVC security code matches the required length (3 or 4 digits depending on brand).
 * Can cross-validate using another form control for card number.
 */
export function cvcValidator(cardNumberControlPath?: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control?.value) return null;
    const cvc = String(control.value).replace(/\D/g, '');

    let cardNumber = '';
    if (cardNumberControlPath && control.root) {
      try {
        const cardNumCtrl = control.root.get(cardNumberControlPath);
        if (cardNumCtrl) {
          cardNumber = String(cardNumCtrl.value || '');
        }
      } catch {
        // If we can't access the root or get the control, proceed without cross-validation
      }
    }

    const isValid = validateCvc(cvc, cardNumber);
    return isValid ? null : { cvcInvalid: { value: control.value } };
  };
}

/**
 * Validates that the cardholder name is non-empty.
 */
export function cardholderNameValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control?.value) return null;
    const isValid = validateName(String(control.value));
    return isValid ? null : { cardholderNameInvalid: { value: control.value } };
  };
}

/**
 * Validates email formatting.
 */
export function emailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control?.value) return null;
    const isValid = validateEmail(String(control.value));
    return isValid ? null : { emailInvalid: { value: control.value } };
  };
}

/**
 * Validates phone formatting.
 */
export function phoneValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control?.value) return null;
    const isValid = validatePhone(String(control.value));
    return isValid ? null : { phoneInvalid: { value: control.value } };
  };
}

/**
 * Validates postal code formatting.
 */
export function postalCodeValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control?.value) return null;
    const isValid = validatePostalCode(String(control.value));
    return isValid ? null : { postalCodeInvalid: { value: control.value } };
  };
}

/**
 * Validates ISO country code formatting.
 */
export function countryValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control?.value) return null;
    const isValid = validateCountry(String(control.value));
    return isValid ? null : { countryInvalid: { value: control.value } };
  };
}
