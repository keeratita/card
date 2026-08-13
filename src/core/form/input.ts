import { detectCardBrand } from '../domain/brand';

/**
 * Returns the maximum character length for a card-number input, accounting
 * for the spaces added by formatting:
 * - Amex: 15 digits + 2 spaces = 17
 * - Others: 19 digits + 4 spaces = 23
 *
 * This is a safe upper bound per brand; `formatCardNumber` enforces the
 * actual digit limit (19) so inputs can never hold more digits than the
 * validators accept.
 */
export function getCardNumberMaxLength(cardNumber: string): number {
  const brand = detectCardBrand(cardNumber);
  return brand === 'amex' ? 17 : 23;
}

/**
 * Restores the caret position after reformatting a card number, so editing
 * in the middle of the number doesn't jump the cursor to the end.
 *
 * `rawValue` must be the input value as it was when the input event fired
 * (before formatting). Positioning in raw coordinates matters because once
 * a space is inserted before the caret — e.g. typing the 5th digit inserts
 * one at position 4 — the formatted string no longer maps 1:1 onto the
 * typed value and the caret would land in front of the space instead of
 * at the end.
 */
export function restoreCaret(
  input: HTMLInputElement,
  rawValue: string,
  formatted: string,
  selectionStart: number | null,
): void {
  if (selectionStart === null) return;

  const preCursorDigits = rawValue
    .substring(0, selectionStart)
    .replace(/\D/g, '').length;

  let postCursorDigits = 0;
  let index = 0;
  while (index < formatted.length && postCursorDigits < preCursorDigits) {
    if (/\d/.test(formatted[index])) {
      postCursorDigits++;
    }
    index++;
  }

  input.setSelectionRange(index, index);
}
