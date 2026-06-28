/**
 * Dark Theme Example
 *
 * This example demonstrates a dark theme checkout form using the card form library.
 */

import { useState } from 'react';
import { Token } from '@keeratita/card';
import { stripeAdapter } from '../shared/adapters';
import { useCardForm } from '@keeratita/card/react';
import { PaymentFormFields } from '../shared/payment-form-fields';

export function DarkThemeCardForm() {
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

  const inputStyle = (name: string) => {
    const hasError = !!errors[name as keyof typeof errors];
    return {
      width: '100%',
      padding: '12px',
      backgroundColor: '#16213e',
      border: `1px solid ${hasError ? '#ef4444' : '#0f3460'}`,
      borderRadius: '8px',
      color: '#e94560',
      fontSize: '16px',
      fontFamily: "'SF Mono', Monaco, Consolas, monospace",
      boxSizing: 'border-box',
    };
  };

  return (
    <div style={{
      backgroundColor: '#1a1a2e',
      padding: '32px',
      borderRadius: '16px',
      maxWidth: '480px',
      margin: '0 auto',
    }}>
      <h2 style={{ color: '#eee', textAlign: 'center', marginBottom: '24px', fontSize: '20px', fontWeight: '600' }}>
        Dark Theme Checkout
      </h2>

      {token && (
        <div style={{
          padding: '16px',
          backgroundColor: '#10b981',
          borderRadius: '8px',
          marginBottom: '20px',
          color: '#fff'
        }}>
          <strong>✓ Success!</strong> Token: {token.id}
        </div>
      )}

      {error && (
        <div style={{
          padding: '16px',
          backgroundColor: '#af122c',
          borderRadius: '8px',
          marginBottom: '20px',
          color: '#fff'
        }}>
          <strong>⚠ Error:</strong> {error}
        </div>
      )}

      {paymentError && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#7f1d1d',
          borderRadius: '6px',
          marginBottom: '20px',
          color: '#fecaca',
          fontSize: '14px'
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
        inputStyle={inputStyle}
        submitLabel="Pay Now"
        showSecurityBadge
      />
    </div>
  );
}

export default DarkThemeCardForm;