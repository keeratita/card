import {
  luhnCheck,
  validateExpiry,
  validateCvc,
  validateName,
  validateEmail,
  validatePhone,
  validatePostalCode,
  validateCountry,
} from '../domain/validation';
import { cleanDigits } from '../formatters/card-formatter';
import { parseExpiry } from './expiry';
import { CARD_FORM_TEXT_EN } from '../../lang/en';

export type CardFieldName =
  | 'number'
  | 'expiry'
  | 'cvc'
  | 'name'
  | 'email'
  | 'phone'
  | 'postalCode'
  | 'country';

export interface ValidateFieldContext {
  /** The card number, used to determine the expected CVC length by brand. */
  cardNumber?: string;
}

export interface FieldValidationResult {
  isValid: boolean;
  errorCode: string;
}

/**
 * Single source of truth for per-field validation across all framework
 * bindings (vanilla, React, Angular). Returns a structured result so each
 * binding can render its own error message via `getFieldErrorMessage`.
 */
export function validateField(
  field: string,
  value: string,
  context: ValidateFieldContext = {},
): FieldValidationResult {
  const val = value ?? '';

  switch (field) {
    case 'number': {
      const clean = cleanDigits(val);
      return {
        isValid: luhnCheck(clean),
        errorCode: 'invalidCardNumber',
      };
    }
    case 'expiry': {
      const clean = cleanDigits(val);
      let isValid = false;
      // Only MMYY is accepted: every framework input formats expiry via
      // `formatExpiry`, which truncates to 4 digits.
      if (clean.length === 4) {
        const { month, year } = parseExpiry(clean);
        isValid = validateExpiry(month, year);
      }
      return { isValid, errorCode: 'invalidExpiry' };
    }
    case 'cvc': {
      const clean = cleanDigits(val);
      return {
        isValid: validateCvc(clean, context.cardNumber || ''),
        errorCode: 'invalidCvc',
      };
    }
    case 'name':
      return { isValid: validateName(val), errorCode: 'invalidName' };
    case 'email':
      return { isValid: validateEmail(val), errorCode: 'invalidEmail' };
    case 'phone':
      return { isValid: validatePhone(val), errorCode: 'invalidPhone' };
    case 'postalCode':
      return {
        isValid: validatePostalCode(val),
        errorCode: 'invalidPostalCode',
      };
    case 'country':
      return { isValid: validateCountry(val), errorCode: 'invalidCountry' };
    default:
      return { isValid: val.trim().length > 0, errorCode: 'invalidField' };
  }
}

/** Returns the user-facing error message for a field, driven by shared lang. */
export function getFieldErrorMessage(field: string): string {
  switch (field) {
    case 'number':
      return CARD_FORM_TEXT_EN.invalidCardNumber;
    case 'expiry':
      return CARD_FORM_TEXT_EN.invalidExpiry;
    case 'cvc':
      return CARD_FORM_TEXT_EN.invalidCvc;
    case 'name':
      return CARD_FORM_TEXT_EN.invalidName;
    case 'email':
      return CARD_FORM_TEXT_EN.invalidEmail;
    case 'phone':
      return CARD_FORM_TEXT_EN.invalidPhone;
    case 'postalCode':
      return CARD_FORM_TEXT_EN.invalidPostalCode;
    case 'country':
      return CARD_FORM_TEXT_EN.invalidCountry;
    default:
      return CARD_FORM_TEXT_EN.invalidField;
  }
}
