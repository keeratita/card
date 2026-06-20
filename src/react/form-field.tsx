import React from 'react';
import { CardFormValues } from './useCardForm';

export interface FormFieldProps {
  /** The field name (e.g. 'number', 'expiry', 'cvc', 'name') */
  name: keyof CardFormValues;
  /** The current form values from useCardForm */
  values: CardFormValues;
  /** The errors object from useCardForm */
  errors: Record<string, string | null>;
  /** The handleChange handler from useCardForm */
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  /** The handleBlur handler from useCardForm */
  handleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => void;
  /** Optional: CVC focus handler for card flip animation */
  handleCvcFocus?: () => void;
  /** Optional: CVC blur handler for card flip unflip */
  handleCvcBlur?: () => void;
  /** Input type (default: 'text', 'password' for CVC) */
  type?: string;
  /** Input placeholder */
  placeholder?: string;
  /** Input label text */
  label?: string;
  /** Maximum length for the input */
  maxLength?: number;
  /** Input mode (numeric for card fields) */
  inputMode?: 'numeric' | 'text' | 'tel' | 'email' | 'search';
  /** AutoComplete attribute */
  autoComplete?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Additional CSS class name */
  className?: string;
  /** Custom error message override (defaults to "Invalid {name}") */
  errorMessage?: string;
  /** Whether to show the error message below the input */
  showErrorMessage?: boolean;
  /** Whether to show red border on invalid fields */
  showErrorBorder?: boolean;
}

const DEFAULT_LABELS: Partial<Record<keyof CardFormValues, string>> = {
  number: 'Card Number',
  expiry: 'Expiry Date',
  cvc: 'CVC',
  name: 'Cardholder Name',
  addressLine1: 'Address Line 1',
  addressLine2: 'Address Line 2',
  city: 'City',
  state: 'State / Province',
  postalCode: 'Postal Code',
  country: 'Country',
  phone: 'Phone',
  email: 'Email',
};

const DEFAULT_PLACEHOLDERS: Partial<Record<keyof CardFormValues, string>> = {
  number: '4242 4242 4242 4242',
  expiry: 'MM / YY',
  cvc: '123',
  name: 'Full Name',
  addressLine1: '123 Main St',
  addressLine2: 'Apt, Suite, etc. (optional)',
  city: 'City',
  state: 'State',
  postalCode: '12345',
  country: 'Select country',
  phone: '+1234567890',
  email: 'email@example.com',
};

const INPUT_TYPES: Partial<Record<keyof CardFormValues, string>> = {
  number: 'text',
  expiry: 'text',
  cvc: 'password',
  name: 'text',
  addressLine1: 'text',
  addressLine2: 'text',
  city: 'text',
  state: 'text',
  postalCode: 'text',
  country: 'text',
  phone: 'tel',
  email: 'email',
};

const INPUT_MODES: Partial<Record<keyof CardFormValues, 'numeric' | 'text' | 'tel' | 'email' | 'search'>> = {
  number: 'numeric',
  expiry: 'numeric',
  cvc: 'numeric',
  postalCode: 'numeric',
  phone: 'tel',
  email: 'email',
};

const AUTOCOMPLETE: Partial<Record<keyof CardFormValues, string>> = {
  number: 'cc-number',
  expiry: 'cc-exp',
  cvc: 'cc-csc',
  name: 'cc-name',
  addressLine1: 'address-line1',
  addressLine2: 'address-line2',
  city: 'address-level2',
  state: 'address-level1',
  postalCode: 'postal-code',
  country: 'country',
  phone: 'tel-national',
  email: 'email',
};

/**
 * Reusable form field component that integrates with useCardForm hook.
 * Provides automatic validation display, error borders, and error messages.
 * 
 * This is the React equivalent of Angular's directive-based validation pattern.
 * 
 * @example
 * ```tsx
 * const { values, errors, handleChange, handleBlur, handleCvcFocus, handleCvcBlur } = useCardForm({...});
 * 
 * <FormField
 *   name="number"
 *   values={values}
 *   errors={errors}
 *   handleChange={handleChange}
 *   handleBlur={handleBlur}
 * />
 * ```
 */
export function FormField({
  name,
  values,
  errors,
  handleChange,
  handleBlur,
  handleCvcFocus,
  handleCvcBlur,
  type,
  placeholder,
  label,
  maxLength,
  inputMode: customInputMode,
  autoComplete,
  required = true,
  className = '',
  errorMessage,
  showErrorMessage = true,
  showErrorBorder = true,
}: FormFieldProps) {
  const inputValue = values[name];
  const error = errors[name];
  const hasError = !!error;

  const inputType = type || INPUT_TYPES[name] || 'text';
  const fieldPlaceholder = placeholder || DEFAULT_PLACEHOLDERS[name] || '';
  const fieldLabel = label || DEFAULT_LABELS[name] || String(name);
  const fieldInputMode = customInputMode || INPUT_MODES[name];
  const fieldAutoComplete = autoComplete || AUTOCOMPLETE[name];

  // Determine max length based on field type
  const fieldMaxLength = maxLength ?? (name === 'cvc' ? 4 : undefined);

  // Handle CVC-specific focus/blur for card flip
  const handleFocus = (_e: React.FocusEvent<HTMLInputElement>) => {
    if (name === 'cvc' && handleCvcFocus) {
      handleCvcFocus();
    }
  };

  const handleBlurEvent = (e: React.FocusEvent<HTMLInputElement>) => {
    if (name === 'cvc' && handleCvcBlur) {
      handleCvcBlur();
    }
    handleBlur(e);
  };

  return (
    <div className={`form-field ${hasError && showErrorBorder ? 'form-field--error' : ''} ${className}`}>
      <label htmlFor={`card-${name}`} className="form-field__label">
        {fieldLabel}
        {required && <span className="form-field__required">*</span>}
      </label>
      <input
        id={`card-${name}`}
        name={String(name)}
        type={inputType}
        className="form-field__input"
        placeholder={fieldPlaceholder}
        value={inputValue as string}
        onChange={handleChange}
        onBlur={handleBlurEvent}
        onFocus={handleFocus}
        inputMode={fieldInputMode}
        autoComplete={fieldAutoComplete}
        required={required}
        maxLength={fieldMaxLength}
      />
      {showErrorMessage && hasError && (
        <span className="form-field__error" role="alert">
          {errorMessage || error}
        </span>
      )}
    </div>
  );
}

export default FormField;