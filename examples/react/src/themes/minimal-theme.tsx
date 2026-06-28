/**
 * Minimal Theme Example
 *
 * This example demonstrates a clean design with focus on simplicity.
 */

import { useState } from 'react';
import { Token } from '@keeratita/card';
import { stripeAdapter } from '../shared/adapters';
import { useCardForm } from '@keeratita/card/react';
import { PaymentFormFields } from '../shared/payment-form-fields';

export function MinimalCardForm() {
  const [token, setToken] = useState<Token | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: { token: Token }) => {
    console.log('Token received:', data.token);
    setToken(data.token);
  };

  const handleError = (err: Error) => {
    console.error('Payment error:', err);
    setError(err.message);
  };

  const {
    values,
    errors,
    paymentError,
    isTokenizing,
    handleChange,
    handleBlur,
    handleCvcFocus,
    handleCvcBlur,
    handleSubmit: onFormSubmit,
  } = useCardForm({
    adapter: stripeAdapter,
    onSubmit: handleSubmit,
    onError: handleError,
  });

  const inputStyle = (name: string): React.CSSProperties => {
    const hasError = !!errors[name as keyof typeof errors];
    return {
      width: '100%',
      padding: '12px 0',
      backgroundColor: 'transparent',
      border: 'none',
      borderBottom: `1px solid ${hasError ? '#ff0000' : '#ccc'}`,
      fontSize: '14px',
      fontFamily: "'SF Mono', Monaco, Consolas, monospace",
      letterSpacing: '2px',
      outline: 'none',
    };
  };

  return (
    <div style={{
      backgroundColor: '#fff',
      padding: '40px',
      maxWidth: '480px',
      margin: '0 auto',
    }}>
      <h2 style={{ color: '#000', textAlign: 'center', marginBottom: '32px', fontSize: '24px', fontWeight: '300', letterSpacing: '2px' }}>
        PAYMENT
      </h2>

      {token && (
        <div style={{
          padding: '12px',
          backgroundColor: '#f0f0f0',
          borderRadius: '0',
          marginBottom: '24px',
          color: '#000',
          fontSize: '13px',
          textAlign: 'center'
        }}>
          ✓ Payment successful — {token.id}
        </div>
      )}

      {error && (
        <div style={{
          padding: '12px',
          backgroundColor: '#f0f0f0',
          borderRadius: '0',
          marginBottom: '24px',
          color: '#000',
          fontSize: '13px',
          textAlign: 'center'
        }}>
          ⚠ Error: {error}
        </div>
      )}

      {paymentError && (
        <div style={{
          padding: '6px 0',
          marginBottom: '16px',
          color: '#ff0000',
          fontSize: '11px',
          borderBottom: 'none',
        }}>
          {paymentError}
        </div>
      )}

      <PaymentFormFields
        values={values}
        errors={errors}
        handleChange={handleChange}
        handleBlur={handleBlur}
        handleCvcFocus={handleCvcFocus}
        handleCvcBlur={handleCvcBlur}
        handleSubmit={onFormSubmit}
        isSubmitting={isTokenizing}
        inputStyle={inputStyle}
        submitLabel={(v: any) => (v.isSubmitting ? "PROCESSING..." : "PAY NOW")}
        submitStyle={{ backgroundColor: '#000', fontSize: '13px', fontWeight: '500', letterSpacing: '2px' }}
        showSecurityBadge
      />
    </div>
  );
}

export default MinimalCardForm;
