import { CardFormPreset, OptionalCardField } from '../domain/card';
import {
  getFieldDisplayText,
  SENSITIVE_FIELDS,
} from '../domain/optional-fields';
import { maskSensitiveValue } from './mask';
import { escapeHtml } from '../security';

export interface SuccessSummaryItem {
  label: string;
  value: string;
  masked: boolean;
}

/**
 * Builds the masked/escaped display values for a set of optional fields,
 * shared by all framework bindings so the success summary is consistent.
 * `getValue` supplies the raw field value for each active field.
 */
export function buildSuccessSummary(
  fields: readonly OptionalCardField[],
  getValue: (field: OptionalCardField) => string,
  preset: CardFormPreset = 'none',
): SuccessSummaryItem[] {
  return fields.map((field) => {
    const value = getValue(field);
    const { label } = getFieldDisplayText(field, preset);
    const masked = SENSITIVE_FIELDS.has(field);
    return {
      label,
      value: masked ? maskSensitiveValue(field, value) : escapeHtml(value),
      masked,
    };
  });
}
