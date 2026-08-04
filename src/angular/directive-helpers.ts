import {
  formatCardNumber,
  formatExpiry,
  formatCvc,
} from '../core/formatters/card-formatter';
import { restoreCaret } from '../core/form';

/**
 * Normalizes input element caret position and updates value with credit card layout format.
 */
export function handleCardNumberInput(inputEl: HTMLInputElement): void {
  const selectionStart = inputEl.selectionStart;
  const formatted = formatCardNumber(inputEl.value);
  // Only update if the value changed to prevent infinite input event loops
  if (inputEl.value !== formatted) {
    inputEl.value = formatted;
  }
  restoreCaret(inputEl, formatted, selectionStart);
}

/**
 * Updates value of input element with expiry format layout (MM / YY).
 */
export function handleExpiryInput(inputEl: HTMLInputElement): void {
  const formatted = formatExpiry(inputEl.value);
  // Only update if the value changed to prevent infinite input event loops
  if (inputEl.value !== formatted) {
    inputEl.value = formatted;
  }
}

/**
 * Updates value of input element with standard CVC bounds.
 */
export function handleCvcInput(
  inputEl: HTMLInputElement,
  cardNumber: string,
): void {
  const formatted = formatCvc(inputEl.value, cardNumber);
  // Only update if the value changed to prevent infinite input event loops
  if (inputEl.value !== formatted) {
    inputEl.value = formatted;
  }
}
