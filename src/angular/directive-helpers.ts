import {
  formatCardNumber,
  formatExpiry,
  formatCvc,
} from '../core/formatters/card-formatter';

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

  if (selectionStart !== null) {
    // Attempt cursor correction if user deletes/adds digits in middle of input
    const preCursorChars = inputEl.value
      .substring(0, selectionStart)
      .replace(/\D/g, '').length;
    let postCursorChars = 0;

    let index = 0;
    while (index < formatted.length && postCursorChars < preCursorChars) {
      if (/\d/.test(formatted[index])) {
        postCursorChars++;
      }
      index++;
    }

    const newCursorPosition = index;
    inputEl.setSelectionRange(newCursorPosition, newCursorPosition);
  }
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
