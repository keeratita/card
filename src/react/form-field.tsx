import React from 'react';
import { CardFormValues } from './useCardForm';

const FIELD_CONFIGS: Record<
  keyof CardFormValues,
  { type: string; mode?: string; autoComplete: string; label: string; placeholder: string }
> = {
  number: { type: 'text', mode: 'numeric', autoComplete: 'cc-number', label: 'Card Number', placeholder: '4242 4242 4242 4242' },
  expiry: { type: 'text', mode: 'numeric', autoComplete: 'cc-exp', label: 'Expiry Date', placeholder: 'MM / YY' },
  cvc: { type: 'password', mode: 'numeric', autoComplete: 'cc-csc', label: 'CVC', placeholder: '123' },
  name: { type: 'text', autoComplete: 'cc-name', label: 'Cardholder Name', placeholder: 'Full Name' },
  addressLine1: { type: 'text', autoComplete: 'address-line1', label: 'Address Line 1', placeholder: '123 Main St' },
  addressLine2: { type: 'text', autoComplete: 'address-line2', label: 'Address Line 2', placeholder: 'Apt, Suite, etc. (optional)' },
  city: { type: 'text', autoComplete: 'address-level2', label: 'City', placeholder: 'City' },
  state: { type: 'text', autoComplete: 'address-level1', label: 'State / Province', placeholder: 'State' },
  postalCode: { type: 'text', mode: 'numeric', autoComplete: 'postal-code', label: 'Postal Code', placeholder: '12345' },
  country: { type: 'text', autoComplete: 'country', label: 'Country', placeholder: 'Select country' },
  phone: { type: 'tel', mode: 'tel', autoComplete: 'tel-national', label: 'Phone', placeholder: '+1234567890' },
  email: { type: 'email', mode: 'email', autoComplete: 'email', label: 'Email', placeholder: 'email@example.com' },
};

export interface FormFieldProps {
  name: keyof CardFormValues;
  values: CardFormValues;
  errors: Record<string, string | null>;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleCvcFocus?: () => void;
  handleCvcBlur?: () => void;
  type?: string;
  placeholder?: string;
  label?: string;
  maxLength?: number;
  inputMode?: 'numeric' | 'text' | 'tel' | 'email' | 'search';
  autoComplete?: string;
  required?: boolean;
  className?: string;
  errorMessage?: string;
  showErrorMessage?: boolean;
  showErrorBorder?: boolean;
}

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

  const config = FIELD_CONFIGS[name];
  const inputType = type || config.type;
  const fieldPlaceholder = placeholder || config.placeholder;
  const fieldLabel = label || config.label;
  const fieldInputMode = customInputMode || (config.mode as 'numeric' | 'text' | 'tel' | 'email' | undefined);
  const fieldAutoComplete = autoComplete || config.autoComplete;

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