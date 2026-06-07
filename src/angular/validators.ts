import { luhnCheck, validateExpiry, validateCvc, validateName, validateEmail, validatePhone, validatePostalCode, validateCountry } from '../core/domain/validation';

export interface AbstractControl {
  value: any;
  root: any;
  get(path: string): AbstractControl | null;
}

export type ValidationErrors = { [key: string]: any };

export type ValidatorFn = (control: any) => ValidationErrors | null;

/**
 * Validates that the credit card number passes Luhn's algorithm.
 */
export function creditCardValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control || !control.value) return null;
    const clean = String(control.value).replace(/\D/g, '');
    const isValid = luhnCheck(clean);
    return isValid ? null : { 'creditCard': { value: control.value } };
  };
}

/**
 * Validates that the card expiry date is in MM/YY format and is in the future.
 */
export function expiryValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control || !control.value) return null;
    const val = String(control.value).replace(/\D/g, '');
    if (val.length !== 4) {
      return { 'expiryInvalid': { value: control.value } };
    }
    const month = val.substring(0, 2);
    const year = val.substring(2, 4);
    const isValid = validateExpiry(month, year);
    return isValid ? null : { 'expiryInvalid': { value: control.value } };
  };
}

/**
 * Validates that the CVC security code matches the required length (3 or 4 digits depending on brand).
 * Can cross-validate using another form control for card number.
 */
export function cvcValidator(cardNumberControlPath?: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control || !control.value) return null;
    const cvc = String(control.value).replace(/\D/g, '');
    
    let cardNumber = '';
    if (cardNumberControlPath && control.root && typeof control.root.get === 'function') {
      const cardNumCtrl = control.root.get(cardNumberControlPath);
      if (cardNumCtrl) {
        cardNumber = String(cardNumCtrl.value || '');
      }
    }
    
    const isValid = validateCvc(cvc, cardNumber);
    return isValid ? null : { 'cvcInvalid': { value: control.value } };
  };
}

/**
 * Validates that the cardholder name contains at least a first name and a last name.
 */
export function cardholderNameValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control || !control.value) return null;
    const isValid = validateName(String(control.value));
    return isValid ? null : { 'cardholderNameInvalid': { value: control.value } };
  };
}

/**
 * Validates email formatting.
 */
export function emailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control || !control.value) return null;
    const isValid = validateEmail(String(control.value));
    return isValid ? null : { 'emailInvalid': { value: control.value } };
  };
}

/**
 * Validates phone formatting.
 */
export function phoneValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control || !control.value) return null;
    const isValid = validatePhone(String(control.value));
    return isValid ? null : { 'phoneInvalid': { value: control.value } };
  };
}

/**
 * Validates postal code formatting.
 */
export function postalCodeValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control || !control.value) return null;
    const isValid = validatePostalCode(String(control.value));
    return isValid ? null : { 'postalCodeInvalid': { value: control.value } };
  };
}

/**
 * Validates ISO country code formatting.
 */
export function countryValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control || !control.value) return null;
    const isValid = validateCountry(String(control.value));
    return isValid ? null : { 'countryInvalid': { value: control.value } };
  };
}
