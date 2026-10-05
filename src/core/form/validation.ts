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
import { ALWAYS_OPTIONAL_FIELDS } from '../domain/optional-fields';
import type { OptionalCardField } from '../domain/card';
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

type FieldValidator = (
  value: string,
  context: ValidateFieldContext,
) => boolean;

/**
 * User-facing messages keyed by error code, driven by shared lang.
 * Declared without an explicit type annotation so `keyof typeof` below
 * yields the literal code union — adding a code here and referencing it
 * without a message is a compile error.
 */
const ERROR_MESSAGES = {
  invalidCardNumber: CARD_FORM_TEXT_EN.invalidCardNumber,
  invalidExpiry: CARD_FORM_TEXT_EN.invalidExpiry,
  invalidCvc: CARD_FORM_TEXT_EN.invalidCvc,
  invalidName: CARD_FORM_TEXT_EN.invalidName,
  invalidEmail: CARD_FORM_TEXT_EN.invalidEmail,
  invalidPhone: CARD_FORM_TEXT_EN.invalidPhone,
  invalidPostalCode: CARD_FORM_TEXT_EN.invalidPostalCode,
  invalidCountry: CARD_FORM_TEXT_EN.invalidCountry,
  invalidField: CARD_FORM_TEXT_EN.invalidField,
} as const;

/** Error codes `validateField` can return; every one has a message above. */
export type FieldErrorCode = keyof typeof ERROR_MESSAGES;

interface FieldEntry {
  validator: FieldValidator;
  errorCode: FieldErrorCode;
}

/**
 * Single source of truth for per-field validation across all framework
 * bindings (vanilla, React, Angular). Keyed by `CardFieldName`, so a
 * mistyped key inside the table is a compile-time error. Any other field
 * name (e.g. address lines, which have no structural format) falls back
 * to "pass if non-empty" — see `lookupEntry`.
 */
const FIELD_ENTRIES: Record<CardFieldName, FieldEntry> = {
  number: {
    validator: (value) => luhnCheck(cleanDigits(value)),
    errorCode: 'invalidCardNumber',
  },
  expiry: {
    validator: (value) => {
      const clean = cleanDigits(value);
      // Only MMYY is accepted: every framework input formats expiry via
      // `formatExpiry`, which truncates to 4 digits.
      if (clean.length !== 4) return false;
      const { month, year } = parseExpiry(clean);
      return validateExpiry(month, year);
    },
    errorCode: 'invalidExpiry',
  },
  cvc: {
    validator: (value, context) =>
      validateCvc(cleanDigits(value), context.cardNumber || ''),
    errorCode: 'invalidCvc',
  },
  name: { validator: validateName, errorCode: 'invalidName' },
  email: { validator: validateEmail, errorCode: 'invalidEmail' },
  phone: { validator: validatePhone, errorCode: 'invalidPhone' },
  postalCode: { validator: validatePostalCode, errorCode: 'invalidPostalCode' },
  country: { validator: validateCountry, errorCode: 'invalidCountry' },
};

/**
 * Looks up the validation entry for `field`. `field` arrives as an
 * arbitrary string from DOM `name`/control names, so the lookup is guarded
 * to own properties — otherwise names like `toString` or `constructor`
 * would resolve through `Object.prototype` and crash on `.validator`.
 */
function lookupEntry(field: string): FieldEntry | undefined {
  return Object.prototype.hasOwnProperty.call(FIELD_ENTRIES, field)
    ? FIELD_ENTRIES[field as CardFieldName]
    : undefined;
}

/**
 * Validates `value` for `field`. Returns a structured result so each
 * binding can render its own message via `getFieldErrorMessage`. Unknown
 * field names pass when non-empty (and always pass for
 * `ALWAYS_OPTIONAL_FIELDS`).
 */
export function validateField(
  field: string,
  value: string,
  context: ValidateFieldContext = {},
): FieldValidationResult {
  const val = value ?? '';
  const entry = lookupEntry(field);

  if (!entry) {
    const isValid = ALWAYS_OPTIONAL_FIELDS.has(field as OptionalCardField)
      ? true
      : val.trim().length > 0;
    return { isValid, errorCode: 'invalidField' };
  }

  return {
    isValid: entry.validator(val, context),
    errorCode: entry.errorCode,
  };
}

/** Returns the user-facing error message for a field, driven by shared lang. */
export function getFieldErrorMessage(field: string): string {
  const entry = lookupEntry(field);
  return entry
    ? ERROR_MESSAGES[entry.errorCode]
    : CARD_FORM_TEXT_EN.invalidField;
}
