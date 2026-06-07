import type { OptionalCardField } from '../../core/domain/card';

const OPTIONAL_FIELD_MAP: Record<OptionalCardField, true> = {
  addressLine1: true,
  addressLine2: true,
  city: true,
  state: true,
  postalCode: true,
  country: true,
  phone: true,
  email: true,
};

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function isOptionalCardField(value: string): value is OptionalCardField {
  return Object.hasOwn(OPTIONAL_FIELD_MAP, value);
}

export function sanitizeOptionalFields(
  fields: readonly string[],
): OptionalCardField[] {
  const uniqueFields = new Set<OptionalCardField>();

  fields.forEach((field) => {
    if (isOptionalCardField(field)) {
      uniqueFields.add(field);
    }
  });

  return Array.from(uniqueFields);
}
