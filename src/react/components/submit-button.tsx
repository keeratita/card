import React from 'react';
import { CARD_FORM_TEXT_EN } from '../../lang/en';

export interface SubmitButtonProps {
  isSubmitting?: boolean;
  isSuccess?: boolean;
  tokenizing?: boolean;
  disabled?: boolean;
  text?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function SubmitButton({
  isSubmitting,
  isSuccess,
  tokenizing,
  disabled,
  text,
  className = '',
  style,
}: Readonly<SubmitButtonProps>) {
  let buttonContent: React.ReactNode;

  if (isSuccess) {
    buttonContent = (
      <>
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
        {CARD_FORM_TEXT_EN.paymentSuccess}
      </>
    );
  } else if (tokenizing) {
    buttonContent = text || CARD_FORM_TEXT_EN.tokenizing;
  } else if (isSubmitting) {
    buttonContent = text || CARD_FORM_TEXT_EN.processing;
  } else {
    buttonContent = text || CARD_FORM_TEXT_EN.submitDefault;
  }

  return (
    <button
      type="submit"
      className={`pay-btn submit-btn ${isSuccess ? 'success' : ''} ${className}`}
      disabled={isSubmitting || isSuccess || disabled}
      style={style}
    >
      {isSubmitting && <div className="spinner btn-spinner" />}
      <span className="btn-text">{buttonContent}</span>
    </button>
  );
}
