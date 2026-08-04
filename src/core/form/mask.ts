import { OptionalCardField } from '../domain/card';
import { escapeHtml } from '../security';

/**
 * Masks a sensitive value for display in a success panel.
 * - email: shows first char + "***@***.com"
 * - phone: shows "+***-****last2"
 * - address fields: shows "*** masked ***"
 */
export function maskSensitiveValue(
  field: OptionalCardField,
  value: string,
): string {
  if (!value) return '—';

  switch (field) {
    case 'email':
      if (value.length <= 1) return '*';
      return `${value.charAt(0)}***@***.com`;
    case 'phone': {
      const digits = value.replace(/\D/g, '');
      if (digits.length <= 2) return '***-***';
      return `+***-****${digits.slice(-2)}`;
    }
    case 'addressLine1':
    case 'addressLine2':
    case 'city':
    case 'state':
    case 'postalCode':
    case 'country':
      return '*** masked ***';
    default:
      return escapeHtml(value);
  }
}
