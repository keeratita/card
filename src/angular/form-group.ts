import { FormGroup, FormControl, Validators, ValidatorFn } from '@angular/forms';
import { CardFormPreset, OptionalCardField } from '../core/domain/card';
import { resolveActiveFields } from '../core/domain/optional-fields';
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

export interface CardFormGroupConfig {
  preset?: CardFormPreset;
  fields?: OptionalCardField[];
}

export interface UpdateCardFormGroupConfig extends CardFormGroupConfig {
  resetValues?: boolean;
}

/**
 * The value type for a card form group containing all core and optional fields.
 * All optional fields are always present; the preset only determines which are required.
 */
export interface CardFormGroupValue {
  // Core required fields
  number: string;
  expiry: string;
  cvc: string;
  name: string;
  // Billing address fields
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  // Contact fields
  email: string | null;
  phone: string | null;
}

/** Type for the form controls structure (used by Angular's FormGroup) */
export type CardFormControls = {
  [K in keyof CardFormGroupValue]: FormControl<string | null>;
};

/** Validators for each optional field type (without required) */
const OPTIONAL_FIELD_VALIDATORS: Record<
  OptionalCardField,
  (() => ValidatorFn) | null
> = {
  addressLine1: null,
  addressLine2: null,
  city: null,
  state: null,
  postalCode: postalCodeValidator,
  country: countryValidator,
  email: emailValidator,
  phone: phoneValidator,
};

/**
 * Creates and returns a fully-configured Angular FormGroup containing the core and optional credit card input controls
 * with their appropriate required and structural validation constraints pre-bound.
 *
 * All optional fields are always created as controls. The preset only determines which fields
 * have the `required` validator bound, allowing templates to safely use @if directives to
 * show/hide fields without Angular throwing "Cannot find control" errors.
 */
export function createCardFormGroup(
  config: CardFormGroupConfig = {},
): FormGroup<CardFormControls> {
  const preset = config.preset || 'none';
  const activeOptionalFields = resolveActiveFields(preset, config.fields || []);

  // Core required fields
  const controls: CardFormControls = {
    number: new FormControl('', [Validators.required, creditCardValidator()]),
    expiry: new FormControl('', [Validators.required, expiryValidator()]),
    cvc: new FormControl('', [Validators.required, cvcValidator('number')]),
    name: new FormControl('', [
      Validators.required,
      cardholderNameValidator(),
    ]),
    // All optional fields ALWAYS created (preset only affects required validator)
    addressLine1: new FormControl(''),
    addressLine2: new FormControl(''),
    city: new FormControl(''),
    state: new FormControl(''),
    postalCode: new FormControl(''),
    country: new FormControl(''),
    email: new FormControl(''),
    phone: new FormControl(''),
  };

  const group = new FormGroup(controls);

  // Cross-validate CVC when card number changes to reactively update CVC length constraints (e.g. Amex vs Visa)
  if (controls.number.valueChanges) {
    controls.number.valueChanges.subscribe(() => {
      if (controls.cvc.updateValueAndValidity) {
        controls.cvc.updateValueAndValidity({ onlySelf: true });
      }
    });
  }

  // Add required validator to active optional fields
  activeOptionalFields.forEach((field) => {
    // AddressLine2 is usually optional in real payment forms
    if (field === 'addressLine2') {
      return;
    }

    const specificValidator = OPTIONAL_FIELD_VALIDATORS[field];
    const validators = [Validators.required];
    if (specificValidator) {
      validators.push(specificValidator());
    }

    controls[field].setValidators(validators);
  });

  return group;
}

/**
 * Updates an existing FormGroup (created by `createCardFormGroup`) in-place when
 * the preset or field configuration changes.
 *
 * Prefer this over calling `createCardFormGroup` again and replacing the form reference.
 * Replacing the form reference causes Angular's `FormGroupDirective` to teardown and
 * rebuild all `formControlName` bindings in the same change-detection pass as signal-driven
 * `@if` blocks, producing "Cannot find control" errors during the transition window.
 *
 * By mutating the same FormGroup instance the directive reference stays stable, eliminating
 * the race condition entirely.
 *
 * @param group   The FormGroup returned by a previous `createCardFormGroup` call.
 * @param config  New preset / fields configuration to apply.
 */
export function updateCardFormGroup(
  group: FormGroup<CardFormControls>,
  config: UpdateCardFormGroupConfig = {},
): void {
  const preset = config.preset || 'none';
  const activeOptionalFields = resolveActiveFields(preset, config.fields || []);

  // Reset all optional fields to no validators first
  const allOptionalFields = Object.keys(OPTIONAL_FIELD_VALIDATORS) as OptionalCardField[];
  allOptionalFields.forEach((field) => {
    group.controls[field].clearValidators();
  });

  // Re-apply required + specific validators for newly active fields
  activeOptionalFields.forEach((field) => {
    if (field === 'addressLine2') return; // always optional
    const specificValidator = OPTIONAL_FIELD_VALIDATORS[field];
    const validators = [Validators.required];
    if (specificValidator) validators.push(specificValidator());
    group.controls[field].setValidators(validators);
  });

  // Update validity for all changed controls
  allOptionalFields.forEach((field) => {
    group.controls[field].updateValueAndValidity({ emitEvent: false });
  });

  if (config.resetValues) {
    allOptionalFields.forEach((field) => {
      group.controls[field].reset('');
    });
  }
}