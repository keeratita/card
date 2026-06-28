import React from 'react';
import { CARD_FORM_TEXT_EN } from '../../lang/en';

export interface CardNumberInputProps {
  value: string;
  error: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  placeholder?: string;
  label?: string;
  id?: string;
  className?: string;
  showErrorBorder?: boolean;
}

const DEFAULT_PLACEHOLDER = CARD_FORM_TEXT_EN.cardNumberPlaceholder;
const DEFAULT_LABEL = CARD_FORM_TEXT_EN.cardNumber;

export function CardNumberInput({
  value,
  error,
  onChange,
  onBlur,
  placeholder = DEFAULT_PLACEHOLDER,
  label = DEFAULT_LABEL,
  id = 'card-number',
  className = '',
  showErrorBorder = true,
}: Readonly<CardNumberInputProps>) {
  const hasError = !!error && showErrorBorder;

  return (
    <div className={`ios-input-row row-number ${hasError ? 'invalid' : ''} ${className}`}>
      <label htmlFor={id} className="ios-label">
        {label}
      </label>
      <input
        id={id}
        name="number"
        type="text"
        className="ios-input card-number-input"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        inputMode="numeric"
        autoComplete="cc-number"
        required
        maxLength={19}
      />
    </div>
  );
}