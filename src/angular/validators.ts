import { validateField } from '../core/form';
import { validateExpiry } from '../core/domain/validation';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Validates that the credit card number passes Luhn's algorithm.
 */
export function creditCardValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control?.value) return null;
    const { isValid, errorCode } = validateField('number', String(control.value));
    // Static descriptor: never echo the raw value (PAN) into errors, as
    // consumers commonly serialize control.errors into logging/analytics.
    // The core errorCode is added alongside the legacy key so integrators
    // can branch on one stable identifier across all bindings.
    return isValid ? null : { creditCard: true, [errorCode]: true };
  };
}

/**
 * Validates that the card expiry date is in MM/YY format and is in the future.
 * An empty value is considered valid (no error, no auto-generated default).
 *
 * Note: this keeps its own slash-aware parsing (rejecting malformed formats
 * like "12//25") rather than delegating to the shared `validateField('expiry')`,
 * which is intentionally more lenient for the vanilla/React input masks.
 */
export function expiryValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control?.value) {
      // Empty expiry is valid; the required validator handles presence.
      return null;
    }

    const value = String(control.value);
    let month: string;
    let year: string;

    if (value.includes('/')) {
      const parts = value.split('/');
      if (parts.length !== 2) {
        return { expiryInvalid: true };
      }
      month = parts[0].trim();
      year = parts[1].trim();
    } else {
      const val = value.replace(/\D/g, '');
      if (val.length !== 4) {
        return { expiryInvalid: true };
      }
      month = val.substring(0, 2);
      year = val.substring(2, 4);
    }

    const isValid = validateExpiry(month, year);
    return isValid ? null : { expiryInvalid: true };
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

    const { isValid, errorCode } = validateField('cvc', cvc, { cardNumber });
    return isValid ? null : { cvcInvalid: true, [errorCode]: true };
  };
}

/**
 * Validates that the cardholder name is non-empty.
 */
export function cardholderNameValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control?.value) return null;
    const { isValid, errorCode } = validateField('name', String(control.value));
    return isValid ? null : { cardholderNameInvalid: true, [errorCode]: true };
  };
}

/**
 * Validates email formatting.
 */
export function emailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control?.value) return null;
    const { isValid, errorCode } = validateField('email', String(control.value));
    return isValid ? null : { emailInvalid: true, [errorCode]: true };
  };
}

/**
 * Validates phone formatting.
 */
export function phoneValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control?.value) return null;
    const { isValid, errorCode } = validateField('phone', String(control.value));
    return isValid ? null : { phoneInvalid: true, [errorCode]: true };
  };
}

/**
 * Validates postal code formatting.
 */
export function postalCodeValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control?.value) return null;
    const { isValid, errorCode } = validateField('postalCode', String(control.value));
    return isValid ? null : { postalCodeInvalid: true, [errorCode]: true };
  };
}

/**
 * Validates ISO country code formatting.
 */
export function countryValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control?.value) return null;
    const { isValid, errorCode } = validateField('country', String(control.value));
    return isValid ? null : { countryInvalid: true, [errorCode]: true };
  };
}
