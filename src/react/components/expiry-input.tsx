import React from 'react';
import { CARD_FORM_TEXT_EN } from '../../lang/en';

export interface ExpiryInputProps {
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

const DEFAULT_PLACEHOLDER = 'MM / YY';
const DEFAULT_LABEL = CARD_FORM_TEXT_EN.expires;

export function ExpiryInput({
  value,
  error,
  onChange,
  onBlur,
  placeholder = DEFAULT_PLACEHOLDER,
  label = DEFAULT_LABEL,
  id = 'card-expiry',
  className = '',
  showErrorBorder = true,
}: ExpiryInputProps) {
  const hasError = !!error && showErrorBorder;

  return (
    <div className={`ios-input-row ${hasError ? 'invalid' : ''} ${className}`}>
      <label htmlFor={id} className="ios-label">
        {label}
      </label>
      <input
        id={id}
        name="expiry"
        type="text"
        className="ios-input"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        inputMode="numeric"
        autoComplete="cc-exp"
        required
        maxLength={7}
      />
    </div>
  );
}