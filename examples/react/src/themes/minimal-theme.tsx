/**
 * Minimal Theme Example
 *
 * This example demonstrates a clean design with focus on simplicity.
 */

import { useState } from 'react';
import { StripeAdapter, Token } from '@keeratita/card';
import { useCardForm } from '@keeratita/card/react';

const stripeAdapter = new StripeAdapter({
  publicKey: 'pk_test_stripe_integrated_demo_key',
});

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
    handleChange,
    handleBlur,
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

      <form onSubmit={onFormSubmit}>
        <div style={{ marginBottom: '24px' }}>
          <input
            name="number"
            type="text"
            value={values.number}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="CARD NUMBER"
            style={inputStyle('number')}
          />
          {errors.number && <span style={{ color: '#ff0000', fontSize: '11px', marginTop: '4px', display: 'block' }}>{errors.number}</span>}
        </div>

        <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
          <div style={{ flex: 1 }}>
            <input
              name="expiry"
              type="text"
              value={values.expiry}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="EXPIRY"
              style={inputStyle('expiry')}
            />
            {errors.expiry && <span style={{ color: '#ff0000', fontSize: '11px', marginTop: '4px', display: 'block' }}>{errors.expiry}</span>}
          </div>
          <div style={{ flex: 1 }}>
            <input
              name="cvc"
              type="password"
              value={values.cvc}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="CVC"
              style={inputStyle('cvc')}
            />
            {errors.cvc && <span style={{ color: '#ff0000', fontSize: '11px', marginTop: '4px', display: 'block' }}>{errors.cvc}</span>}
          </div>
        </div>

        <div style={{ marginBottom: '32px' }}>
          <input
            name="name"
            type="text"
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="CARDHOLDER NAME"
            style={inputStyle('name')}
          />
          {errors.name && <span style={{ color: '#ff0000', fontSize: '11px', marginTop: '4px', display: 'block' }}>{errors.name}</span>}
        </div>

        <button
          type="submit"
          disabled={!values.number || !values.expiry || !values.cvc}
          style={{
            width: '100%',
            padding: '16px',
            backgroundColor: '#000',
            color: 'white',
            border: 'none',
            fontSize: '13px',
            fontWeight: '500',
            letterSpacing: '2px',
            cursor: !values.number || !values.expiry || !values.cvc ? 'not-allowed' : 'pointer',
            opacity: !values.number || !values.expiry || !values.cvc ? 0.4 : 1,
          }}
        >
          {values.number ? 'PAY NOW' : 'PROCESSING...'}
        </button>
      </form>
    </div>
  );
}

export default MinimalCardForm;