import React from 'react';
import { CARD_FORM_TEXT_EN } from '../../lang/en';

export interface SubmitButtonProps {
  isSubmitting?: boolean;
  isSuccess?: boolean;
  disabled?: boolean;
  text?: string;
  className?: string;
  style?: React.CSSProperties;
  isTokenizing?: boolean;
}

export function SubmitButton({
  isSubmitting,
  isSuccess,
  disabled,
  text,
  className = '',
  style,
  isTokenizing,
}: SubmitButtonProps) {
  const buttonText = getTextState({ isSubmitting, isSuccess, text, isTokenizing });

  return (
    <button
      type="submit"
      className={`pay-btn submit-btn ${isSuccess ? 'success' : ''} ${className}`}
      disabled={isSubmitting || isSuccess || disabled}
      style={style}
    >
      {isSubmitting && (
        <div className="spinner btn-spinner" />
      )}
      <span className="btn-text">
        {buttonText.icon}
        {buttonText.label}
      </span>
    </button>
  );
}

interface ButtonTextState {
  label: string;
  icon?: React.ReactNode;
}

function getTextState({ isSubmitting, isSuccess, text, isTokenizing }: { 
  isSubmitting?: boolean; 
  isSuccess?: boolean; 
  text?: string; 
  isTokenizing?: boolean;
}): ButtonTextState {
  if (isSuccess) {
    return {
      label: CARD_FORM_TEXT_EN.paymentSuccess,
      icon: (
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          style={{ verticalAlign: 'middle', marginRight: '4px' }}
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ),
    };
  }
  if (isTokenizing) {
    return { label: CARD_FORM_TEXT_EN.tokenizing };
  }
  if (isSubmitting) {
    return { label: CARD_FORM_TEXT_EN.processing };
  }
  return { label: text || CARD_FORM_TEXT_EN.submitDefault };
}
