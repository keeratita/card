/**
 * Gradient Theme Example
 *
 * This example demonstrates a modern gradient background with clean styling.
 */

import { useState } from 'react';
import { StripeAdapter, Token } from '@keeratita/card';
import { useCardForm } from '@keeratita/card/react';

const stripeAdapter = new StripeAdapter({
  publicKey: 'pk_test_stripe_integrated_demo_key',
});

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

  const inputStyle = (name: string): React.CSSProperties => {
    const hasError = !!errors[name as keyof typeof errors];
    return {
      width: '100%',
      padding: '12px',
      backgroundColor: 'rgba(255,255,255,0.9)',
      border: `2px solid ${hasError ? '#ef4444' : 'transparent'}`,
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

      <form onSubmit={onFormSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', color: 'rgba(255,255,255,0.9)', fontSize: '13px', fontWeight: '500' }}>
            Card Number
          </label>
          <input
            name="number"
            type="text"
            value={values.number}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="4242 4242 4242 4242"
            style={inputStyle('number')}
          />
          {errors.number && <span style={{ color: '#fecaca', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.number}</span>}
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', color: 'rgba(255,255,255,0.9)', fontSize: '13px', fontWeight: '500' }}>
            Expiry Date
          </label>
          <input
            name="expiry"
            type="text"
            value={values.expiry}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="MM / YY"
            style={inputStyle('expiry')}
          />
          {errors.expiry && <span style={{ color: '#fecaca', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.expiry}</span>}
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '6px', color: 'rgba(255,255,255,0.9)', fontSize: '13px', fontWeight: '500' }}>
            CVC
          </label>
          <input
            name="cvc"
            type="password"
            value={values.cvc}
            onChange={handleChange}
            onBlur={handleCvcBlur}
            onFocus={handleCvcFocus}
            placeholder="123"
            style={inputStyle('cvc')}
          />
          {errors.cvc && <span style={{ color: '#fecaca', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.cvc}</span>}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '6px', color: 'rgba(255,255,255,0.9)', fontSize: '13px', fontWeight: '500' }}>
            Cardholder Name
          </label>
          <input
            name="name"
            type="text"
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="John Doe"
            style={inputStyle('name')}
          />
          {errors.name && <span style={{ color: '#fecaca', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.name}</span>}
        </div>

        <button
          type="submit"
          disabled={!values.number || !values.expiry || !values.cvc}
          style={{
            width: '100%',
            padding: '14px',
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: !values.number || !values.expiry || !values.cvc ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 12px rgba(245, 87, 108, 0.4)',
            opacity: !values.number || !values.expiry || !values.cvc ? 0.6 : 1
          }}
        >
          Pay Now
        </button>
      </form>
    </div>
  );
}

export default GradientCardForm;