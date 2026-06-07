import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CardFormPreset, OptionalCardField } from '../core/domain/card';
import {
  creditCardValidator,
  expiryValidator,
  cvcValidator,
  cardholderNameValidator,
  emailValidator,
  phoneValidator,
  postalCodeValidator,
  countryValidator,
} from './validators';

const PRESET_FIELDS: Record<CardFormPreset, OptionalCardField[]> = {
  none: [],
  us: ['postalCode'],
  billing: ['addressLine1', 'city', 'state', 'postalCode', 'country'],
  contact: ['email', 'phone'],
};

export interface CardFormGroupConfig {
  preset?: CardFormPreset;
  fields?: OptionalCardField[];
}

/**
 * Creates and returns a fully-configured Angular FormGroup containing the core and optional credit card input controls
 * with their appropriate required and structural validation constraints pre-bound.
 */
export function createCardFormGroup(
  config: CardFormGroupConfig = {},
): FormGroup {
  const preset = config.preset || 'none';
  const fieldsFromPreset = PRESET_FIELDS[preset] || [];
  const fieldsFromConfig = config.fields || [];
  const activeOptionalFields = Array.from(
    new Set([...fieldsFromPreset, ...fieldsFromConfig]),
  );

  // Core required fields
  const group: Record<string, any> = {
    number: new FormControl('', [Validators.required, creditCardValidator()]),
    expiry: new FormControl('', [Validators.required, expiryValidator()]),
    cvc: new FormControl('', [Validators.required, cvcValidator('number')]),
    name: new FormControl('', [Validators.required, cardholderNameValidator()]),
  };

  // Dynamically populate optional fields with appropriate validations
  activeOptionalFields.forEach((field) => {
    // AddressLine2 is usually optional in real payment forms
    if (field === 'addressLine2') {
      group[field] = new FormControl('');
      return;
    }

    const validators = [Validators.required];
    if (field === 'email') {
      validators.push(emailValidator());
    } else if (field === 'phone') {
      validators.push(phoneValidator());
    } else if (field === 'postalCode') {
      validators.push(postalCodeValidator());
    } else if (field === 'country') {
      validators.push(countryValidator());
    }

    group[field] = new FormControl('', validators);
  });

  return new FormGroup(group);
}
