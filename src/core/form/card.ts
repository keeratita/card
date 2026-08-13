import { Card, OptionalCardField } from '../domain/card';
import { cleanDigits } from '../formatters/card-formatter';
import { parseExpiry } from './expiry';

export interface CardFormValuesLike {
  number: string;
  expiry: string;
  cvc: string;
  name: string;
  [key: string]: string | undefined;
}

/**
 * Builds a `Card` from raw form values. Cleans digits, parses the expiry,
 * trims the cardholder name, and spreads the active optional fields.
 * Shared by all framework bindings so the payload is always identical.
 */
export function buildCard(
  values: CardFormValuesLike,
  activeFields: readonly OptionalCardField[] = [],
): Card {
  const { month, year } = parseExpiry(values.expiry);

  const card: Card = {
    number: cleanDigits(values.number),
    expMonth: month,
    expYear: year,
    cvc: cleanDigits(values.cvc),
    name: (values.name || '').trim(),
  };

  activeFields.forEach((field) => {
    const val = values[field];
    if (val) {
      card[field] = val;
    }
  });

  return card;
}
