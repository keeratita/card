/**
 * Corporate Theme Example
 *
 * This example demonstrates an enterprise-style payment form with security indicators.
 */

import { useState } from 'react';
import { StripeAdapter, Token } from '@keeratita/card';
import { useCardForm } from '@keeratita/card/react';

const stripeAdapter = new StripeAdapter({
  publicKey: 'pk_test_stripe_integrated_demo_key',
});

export function CorporateCardForm() {
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
    brand,
    isFlipped,
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
      padding: '10px 12px',
      border: `1px solid ${hasError ? '#ef4444' : '#d1d5db'}`,
      borderRadius: '6px',
      fontSize: '14px',
      fontFamily: "'SF Mono', Monaco, Consolas, monospace",
      boxSizing: 'border-box',
    };
  };

  return (
    <div style={{
      backgroundColor: '#ffffff',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      maxWidth: '480px',
      margin: '0 auto',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
    }}>
      {/* Corporate Header */}
      <div style={{
        backgroundColor: '#f9fafb',
        padding: '16px 24px',
        borderBottom: '1px solid #d1d5db',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#111827' }}>
            Secure Payment
          </h2>
          <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#6b7280' }}>
            Enterprise-grade encrypted transaction
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {brand && (
            <span style={{
              fontSize: '11px',
              color: '#374151',
              backgroundColor: '#f3f4f6',
              padding: '2px 8px',
              borderRadius: '4px',
              textTransform: 'uppercase'
            }}>
              {brand}
            </span>
          )}
          <span style={{
            fontSize: '11px',
            color: '#059669',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            🔒 Secure
          </span>
        </div>
      </div>

      {/* Form Body */}
      <div style={{ padding: '24px' }}>
        {token && (
          <div style={{
            padding: '12px 16px',
            backgroundColor: '#ecfdf5',
            borderRadius: '6px',
            marginBottom: '16px',
            border: '1px solid #a7f3d0',
            fontSize: '13px',
            color: '#065f46'
          }}>
            ✓ Payment processed successfully. Token: {token.id}
          </div>
        )}

        {error && (
          <div style={{
            padding: '12px 16px',
            backgroundColor: '#fef2f2',
            borderRadius: '6px',
            marginBottom: '16px',
            border: '1px solid #fecaca',
            fontSize: '13px',
            color: '#991b1b'
          }}>
            ⚠ Error: {error}
          </div>
        )}

        {paymentError && (
          <div style={{
            padding: '8px 12px',
            backgroundColor: '#fef2f2',
            borderRadius: '4px',
            marginBottom: '16px',
            fontSize: '12px',
            color: '#991b1b'
          }}>
            {paymentError}
          </div>
        )}

        <form onSubmit={onFormSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#374151' }}>
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
            {errors.number && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.number}</span>}
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#374151' }}>
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
            {errors.expiry && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.expiry}</span>}
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#374151' }}>
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
            {errors.cvc && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.cvc}</span>}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '500', color: '#374151' }}>
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
            {errors.name && <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.name}</span>}
          </div>

          <button
            type="submit"
            disabled={!values.number || !values.expiry || !values.cvc}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#111827',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: !values.number || !values.expiry || !values.cvc ? 'not-allowed' : 'pointer',
              opacity: !values.number || !values.expiry || !values.cvc ? 0.6 : 1,
            }}
          >
            Pay Securely
          </button>

          <div style={{
            marginTop: '16px',
            textAlign: 'center',
            fontSize: '11px',
            color: '#9ca3af'
          }}>
            🔒 Your payment information is encrypted and secure
          </div>
        </form>
      </div>
    </div>
  );
}

export default CorporateCardForm;