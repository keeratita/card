/**
 * Gradient Theme Example
 *
 * This example demonstrates a modern gradient background with clean styling.
 */

import { useState } from 'react';
import { Token } from '@keeratita/card';
import { stripeAdapter } from '../shared/adapters';
import { useCardForm } from '@keeratita/card/react';
import { PaymentFormFields } from '../shared/payment-form-fields';

export function GradientCardForm() {
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
      backgroundColor: 'rgba(255,255,255,0.9)',
      border: `1px solid ${hasError ? '#ef4444' : 'transparent'}`,
      borderRadius: '10px',
      fontSize: '15px',
      fontFamily: "'SF Mono', Monaco, Consolas, monospace",
      boxSizing: 'border-box',
      outline: 'none',
    };
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '32px',
      borderRadius: '16px',
      maxWidth: '480px',
      margin: '0 auto',
      boxShadow: '0 20px 40px rgba(102, 126, 234, 0.3)'
    }}>
      <h2 style={{ color: '#fff', textAlign: 'center', marginBottom: '24px', fontSize: '20px', fontWeight: '600', textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        Gradient Checkout
      </h2>

      {token && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: 'rgba(255,255,255,0.2)',
          borderRadius: '8px',
          marginBottom: '20px',
          backdropFilter: 'blur(10px)',
          color: '#fff',
          fontSize: '13px'
        }}>
          ✓ Success! Token: {token.id}
        </div>
      )}

      {error && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: 'rgba(255,255,255,0.2)',
          borderRadius: '8px',
          marginBottom: '20px',
          backdropFilter: 'blur(10px)',
          color: '#fff',
          fontSize: '13px'
        }}>
          ⚠ Error: {error}
        </div>
      )}

      {paymentError && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: 'rgba(239,68,68,0.3)',
          borderRadius: '6px',
          marginBottom: '20px',
          color: '#fca5a5',
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
        submitStyle={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', boxShadow: '0 4px 12px rgba(245, 87, 108, 0.4)' }}
        showSecurityBadge
      />
    </div>
  );
}

export default GradientCardForm;
