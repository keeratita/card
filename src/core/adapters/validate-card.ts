import { Card } from '../domain/card';
import {
  validateCardNumber,
  validateExpiry,
  validateCvc,
  validateName,
} from '../domain/validation';
import { ApiValidationError } from './base';

export interface ValidationError {
  field: string;
  code: string;
  message: string;
}

/** Validate all required card fields and return structured errors. */
export function validateCardFields(card: Card): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!validateCardNumber(card.number)) {
    errors.push({ field: 'number', code: 'invalid_card_number', message: 'Invalid card number.' });
  }
  if (!validateExpiry(card.expMonth, card.expYear)) {
    errors.push({ field: 'expiry', code: 'invalid_expiry', message: 'Card expired or invalid.' });
  }
  if (!validateCvc(card.cvc, card.number)) {
    errors.push({ field: 'cvc', code: 'invalid_cvc', message: 'Invalid CVC.' });
  }
  if (!validateName(card.name)) {
    errors.push({ field: 'name', code: 'invalid_name', message: 'Invalid cardholder name.' });
  }

  return errors;
}

/** Validate card fields and throw a structured error if any field is invalid.
 * The error includes all validation failures for better UX.
 */
export function validateCardFieldsStrict(card: Card): void {
  const errors = validateCardFields(card);
  if (errors.length > 0) {
    const detailedError = new ApiValidationError(
      errors.map((e) => e.message).join(' '),
      errors.map((e) => e.code).join(','),
      errors,
    );
    throw detailedError;
  }
}
