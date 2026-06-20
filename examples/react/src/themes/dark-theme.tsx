/**
 * Dark Theme Example
 *
 * This example demonstrates a dark theme checkout form using the card form library.
 */

import { useState } from 'react';
import { StripeAdapter, Token } from '@keeratita/card';
import { useCardForm } from '@keeratita/card/react';

const stripeAdapter = new StripeAdapter({
  publicKey: 'pk_test_stripe_integrated_demo_key',
});

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

      <form onSubmit={onFormSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label htmlFor="card-number" style={{ display: 'block', marginBottom: '6px', color: '#a5b4fc', fontSize: '14px' }}>
            Card Number
          </label>
          <input
            id="card-number"
            name="number"
            type="text"
            value={values.number}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleCvcFocus}
            placeholder="4242 4242 4242 4242"
            style={inputStyle('number')}
          />
          {errors.number && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.number}</span>}
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label htmlFor="expiry" style={{ display: 'block', marginBottom: '6px', color: '#a5b4fc', fontSize: '14px' }}>
            Expiry Date
          </label>
          <input
            id="expiry"
            name="expiry"
            type="text"
            value={values.expiry}
            onChange={handleChange}
            onBlur={handleBlur}
            style={inputStyle('expiry')}
          />
          {errors.expiry && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.expiry}</span>}
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label htmlFor="cvc" style={{ display: 'block', marginBottom: '6px', color: '#a5b4fc', fontSize: '14px' }}>
            CVC
          </label>
          <input
            id="cvc"
            name="cvc"
            type="password"
            value={values.cvc}
            onChange={handleChange}
            onBlur={handleCvcBlur}
            onFocus={handleCvcFocus}
            style={inputStyle('cvc')}
          />
          {errors.cvc && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.cvc}</span>}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="name" style={{ display: 'block', marginBottom: '6px', color: '#a5b4fc', fontSize: '14px' }}>
            Cardholder Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="John Doe"
            style={inputStyle('name')}
          />
          {errors.name && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.name}</span>}
        </div>

        <button
          type="submit"
          disabled={!values.number || !values.expiry || !values.cvc}
          style={{
            width: '100%',
            padding: '14px',
            backgroundColor: '#e94560',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: !values.number || !values.expiry || !values.cvc ? 'not-allowed' : 'pointer',
            opacity: !values.number || !values.expiry || !values.cvc ? 0.6 : 1
          }}
        >
          Pay Now
        </button>
      </form>
    </div>
  );
}

export default DarkThemeCardForm;