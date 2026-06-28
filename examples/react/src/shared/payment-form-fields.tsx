/**
 * Shared payment form fields component.
 * Eliminates ~100 lines of duplicate form input markup across 4+ theme files.
 *
 * Usage (inside a useCardForm hook):
 * ```tsx
 * import { PaymentFormFields } from '../shared/payment-form-fields';
 *
 * const { values, errors, handleChange, handleBlur, handleCvcFocus, handleCvcBlur, handleSubmit } = useCardForm({ adapter, onSubmit, onError });
 *
 * <PaymentFormFields
 *   values={values}
 *   errors={errors}
 *   handleChange={handleChange}
 *   handleBlur={handleBlur}
 *   handleCvcFocus={handleCvcFocus}
 *   handleCvcBlur={handleCvcBlur}
 *   handleSubmit={handleSubmit}
 *   inputStyle={(name) => ({ /* theme-specific styles *\/ })}
 *   submitLabel="Pay Securely"
 * />;
 * ```
 */

import React from 'react';
import { CardFormValues } from '@keeratita/card/react';

export interface PaymentFormFieldsProps {
  values: CardFormValues;
  errors: Record<string, string | null>;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  handleBlur: (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  handleCvcFocus?: () => void;
  handleCvcBlur?: () => void;
  handleSubmit: (e?: React.FormEvent) => void;
  inputStyle: (name: string) => React.CSSProperties;
  labels?: Record<string, string>;
  placeholders?: Record<string, string>;
  isSubmitting?: boolean;
  submitLabel?: string | ((values: any) => string);
  submitStyle?: React.CSSProperties;
  showSecurityBadge?: boolean;
}

const DEFAULT_LABELS: Record<string, string> = {
  number: 'Card Number',
  expiry: 'Expiry Date',
  cvc: 'CVC',
  name: 'Cardholder Name',
};

const DEFAULT_PLACEHOLDERS: Record<string, string> = {
  number: '4242 4242 4242 4242',
  expiry: 'MM / YY',
  cvc: '123',
  name: 'John Doe',
};

export const PaymentFormFields: React.FC<PaymentFormFieldsProps> = ({
  values,
  errors,
  handleChange,
  handleBlur,
  handleCvcFocus,
  handleCvcBlur,
  handleSubmit,
  isSubmitting = false,
  inputStyle,
  labels = DEFAULT_LABELS,
  placeholders = DEFAULT_PLACEHOLDERS,
  submitLabel = (v: any) => (v.isSubmitting ? "Processing..." : "Pay Now"),
  submitStyle,
  showSecurityBadge,
}) => {
  const isDisabled = !values.number || !values.expiry || !values.cvc;

  const buttonStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px',
    backgroundColor: '#0366d6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    opacity: isDisabled ? 0.6 : 1,
    ...submitStyle,
  };

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ marginBottom: '16px' }}>
        <label
          htmlFor='card-number'
          style={{ display: 'block', marginBottom: '6px', fontSize: '14px' }}
        >
          {labels.number}
        </label>
        <input
          id='card-number'
          name='number'
          type='text'
          value={values.number}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleCvcFocus}
          placeholder={placeholders.number}
          style={inputStyle('number')}
        />
        {errors.number && (
          <span
            style={{
              color: '#ef4444',
              fontSize: '12px',
              marginTop: '4px',
              display: 'block',
            }}
          >
            {errors.number}
          </span>
        )}
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label
          htmlFor='expiry'
          style={{ display: 'block', marginBottom: '6px', fontSize: '14px' }}
        >
          {labels.expiry}
        </label>
        <input
          id='expiry'
          name='expiry'
          type='text'
          value={values.expiry}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholders.expiry}
          style={inputStyle('expiry')}
        />
        {errors.expiry && (
          <span
            style={{
              color: '#ef4444',
              fontSize: '12px',
              marginTop: '4px',
              display: 'block',
            }}
          >
            {errors.expiry}
          </span>
        )}
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label
          htmlFor='cvc'
          style={{ display: 'block', marginBottom: '6px', fontSize: '14px' }}
        >
          {labels.cvc}
        </label>
        <input
          id='cvc'
          name='cvc'
          type='password'
          value={values.cvc}
          onChange={handleChange}
          onBlur={handleCvcBlur || handleBlur}
          onFocus={handleCvcFocus}
          placeholder={placeholders.cvc}
          style={inputStyle('cvc')}
        />
        {errors.cvc && (
          <span
            style={{
              color: '#ef4444',
              fontSize: '12px',
              marginTop: '4px',
              display: 'block',
            }}
          >
            {errors.cvc}
          </span>
        )}
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label
          htmlFor='name'
          style={{ display: 'block', marginBottom: '6px', fontSize: '14px' }}
        >
          {labels.name}
        </label>
        <input
          id='name'
          name='name'
          type='text'
          value={values.name}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholders.name}
          style={inputStyle('name')}
        />
        {errors.name && (
          <span
            style={{
              color: '#ef4444',
              fontSize: '12px',
              marginTop: '4px',
              display: 'block',
            }}
          >
            {errors.name}
          </span>
        )}
      </div>

      <button type='submit' disabled={isDisabled} style={buttonStyle}>
        {typeof submitLabel === "function" ? submitLabel({ ...values, isSubmitting }) : submitLabel}
      </button>

      {showSecurityBadge && (
        <div
          style={{
            marginTop: '16px',
            textAlign: 'center',
            fontSize: '11px',
            color: '#9ca3af',
          }}
        >
          🔒 Your payment information is encrypted and secure
        </div>
      )}
    </form>
  );
};
