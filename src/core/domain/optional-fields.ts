import { CardFormPreset, OptionalCardField } from './card';
import { CARD_FORM_TEXT_EN, OPTIONAL_FIELD_TEXT_EN } from '../../lang/en';

export interface OptionalFieldMetadata {
  label: string;
  placeholder: string;
  type: string;
  autocomplete: string;
}

const OPTIONAL_FIELD_KEYS = [
  'addressLine1',
  'addressLine2',
  'city',
  'state',
  'postalCode',
  'country',
  'phone',
  'email',
] as const;

const OPTIONAL_FIELD_SET = new Set<OptionalCardField>(OPTIONAL_FIELD_KEYS);

export const FIELD_METADATA: Record<OptionalCardField, OptionalFieldMetadata> =
  {
    addressLine1: {
      label: OPTIONAL_FIELD_TEXT_EN.addressLine1.label,
      placeholder: OPTIONAL_FIELD_TEXT_EN.addressLine1.placeholder,
      type: 'text',
      autocomplete: 'address-line1',
    },
    addressLine2: {
      label: OPTIONAL_FIELD_TEXT_EN.addressLine2.label,
      placeholder: OPTIONAL_FIELD_TEXT_EN.addressLine2.placeholder,
      type: 'text',
      autocomplete: 'address-line2',
    },
    city: {
      label: OPTIONAL_FIELD_TEXT_EN.city.label,
      placeholder: OPTIONAL_FIELD_TEXT_EN.city.placeholder,
      type: 'text',
      autocomplete: 'address-level2',
    },
    state: {
      label: OPTIONAL_FIELD_TEXT_EN.state.label,
      placeholder: OPTIONAL_FIELD_TEXT_EN.state.placeholder,
      type: 'text',
      autocomplete: 'address-level1',
    },
    postalCode: {
      label: OPTIONAL_FIELD_TEXT_EN.postalCode.label,
      placeholder: OPTIONAL_FIELD_TEXT_EN.postalCode.placeholder,
      type: 'text',
      autocomplete: 'postal-code',
    },
    country: {
      label: OPTIONAL_FIELD_TEXT_EN.country.label,
      placeholder: OPTIONAL_FIELD_TEXT_EN.country.placeholder,
      type: 'select',
      autocomplete: 'country-name',
    },
    phone: {
      label: OPTIONAL_FIELD_TEXT_EN.phone.label,
      placeholder: OPTIONAL_FIELD_TEXT_EN.phone.placeholder,
      type: 'tel',
      autocomplete: 'tel',
    },
    email: {
      label: OPTIONAL_FIELD_TEXT_EN.email.label,
      placeholder: OPTIONAL_FIELD_TEXT_EN.email.placeholder,
      type: 'email',
      autocomplete: 'email',
    },
  };

export const PRESET_FIELDS: Record<CardFormPreset, OptionalCardField[]> = {
  none: [],
  us: ['postalCode'],
  billing: ['addressLine1', 'city', 'state', 'postalCode', 'country'],
  contact: ['email', 'phone'],
};

function isOptionalCardField(value: string): value is OptionalCardField {
  return OPTIONAL_FIELD_SET.has(value as OptionalCardField);
}

export function resolveActiveFields(
  preset: CardFormPreset = 'none',
  fields: readonly string[] = [],
): OptionalCardField[] {
  const presetFields = PRESET_FIELDS[preset] || [];
  const uniqueFields = new Set<OptionalCardField>();

  [...presetFields, ...fields].forEach((field) => {
    if (isOptionalCardField(field)) {
      uniqueFields.add(field);
    }
  });

  return Array.from(uniqueFields);
}

export function getFieldDisplayText(
  field: OptionalCardField,
  preset: CardFormPreset = 'none',
): { label: string; placeholder: string } {
  if (field === 'postalCode' && preset === 'us') {
    return {
      label: CARD_FORM_TEXT_EN.zipCode,
      placeholder: CARD_FORM_TEXT_EN.zipCodePlaceholder,
    };
  }

  const meta = FIELD_METADATA[field];
  return {
    label: meta.label,
    placeholder: meta.placeholder,
  };
}
