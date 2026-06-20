import React from 'react';
import { CARD_FORM_TEXT_EN } from '../../lang/en';

export interface CvcInputProps {
  value: string;
  error: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus: () => void;
  brand?: string;
  label?: string;
  id?: string;
  className?: string;
  showErrorBorder?: boolean;
}

const DEFAULT_LABEL = CARD_FORM_TEXT_EN.cvc;

export function CvcInput({
  value,
  error,
  onChange,
  onBlur,
  onFocus,
  brand,
  label = DEFAULT_LABEL,
  id = 'card-cvc',
  className = '',
  showErrorBorder = true,
}: CvcInputProps) {
  const hasError = !!error && showErrorBorder;
  const maxLength = brand === 'amex' ? 4 : 3;

  return (
    <div className={`ios-input-row ${hasError ? 'invalid' : ''} ${className}`}>
      <label htmlFor={id} className="ios-label">
        {label}
      </label>
      <input
        id={id}
        name="cvc"
        type="password"
        className="ios-input"
        placeholder="•••"
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        inputMode="numeric"
        autoComplete="cc-csc"
        required
        maxLength={maxLength}
      />
    </div>
  );
}