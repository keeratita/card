/**
 * Card Form with Live Preview Example - React
 * 
 * This example demonstrates how to use the CreditCardPreview component
 * alongside the useCardForm hook for a fully customized form with live preview.
 */

import { useState } from 'react';
import { CreditCardPreview, useCardForm, FormField, Token } from '@keeratita/card/react';
import { stripeAdapter } from '../shared/adapters';

export function CardFormWithLivePreview() {
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

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '28px', fontWeight: '600', color: '#ffffff', margin: '0 0 8px 0' }}>
        Card Form with Live Preview
      </h2>
      <p style={{ color: 'rgba(255,255,255,0.55)', margin: '0 0 24px 0', fontSize: '15px' }}>
        Use the useCardForm hook for full control over the form while getting live card detection.
      </p>

      {/* Success Message */}
      {token && (
        <div style={{
          padding: '16px',
          backgroundColor: 'rgba(48,209,88,0.1)',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid rgba(48,209,88,0.25)',
          color: '#30d158'
        }}>
          <strong>✓ Success!</strong> Token: {token.id}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div style={{
          padding: '16px',
          backgroundColor: 'rgba(255,69,58,0.1)',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid rgba(255,69,58,0.25)',
          color: '#ff453a'
        }}>
          <strong>⚠ Error:</strong> {error}
        </div>
      )}

      {/* Validation Error Banner */}
      {paymentError && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: 'rgba(255,69,58,0.1)',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid rgba(255,69,58,0.25)',
          color: '#ff453a',
          fontSize: '14px'
        }}>
          {paymentError}
        </div>
      )}

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        {/* Card Info Preview Section */}
        <div style={{ flex: '1', minWidth: '300px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff', margin: '0 0 12px 0' }}>
            Live Card Preview
          </h3>
          <CreditCardPreview
            number={values.number}
            expiry={values.expiry}
            cvc={values.cvc}
            name={values.name}
            brand={brand}
            isFlipped={isFlipped}
            cardLabel="VISA"
          />
        </div>

        {/* Card Form Section - Using FormField with validation */}
        <div style={{ flex: '1', minWidth: '300px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff', margin: '0 0 12px 0' }}>
            Enter Card Details
          </h3>
          <form onSubmit={onFormSubmit}>
            {/* Card Number Field with Validation */}
            <FormField
              name="number"
              values={values}
              errors={errors}
              handleChange={handleChange}
              handleBlur={handleBlur}
              label="Card Number"
              placeholder="4242 4242 4242 4242"
              inputMode="numeric"
            />

            {/* Expiry Field with Validation */}
            <FormField
              name="expiry"
              values={values}
              errors={errors}
              handleChange={handleChange}
              handleBlur={handleBlur}
              label="Expiry Date"
              placeholder="MM / YY"
              inputMode="numeric"
            />

            {/* CVC Field with Validation */}
            <FormField
              name="cvc"
              values={values}
              errors={errors}
              handleChange={handleChange}
              handleBlur={handleBlur}
              handleCvcFocus={handleCvcFocus}
              handleCvcBlur={handleCvcBlur}
              label="CVC"
              placeholder="123"
              inputMode="numeric"
            />

            {/* Name Field with Validation */}
            <FormField
              name="name"
              values={values}
              errors={errors}
              handleChange={handleChange}
              handleBlur={handleBlur}
              label="Cardholder Name"
              placeholder="Full Name"
            />

            <button
              type="submit"
              disabled={!values.number || !values.expiry || !values.cvc}
              style={{
                width: '100%',
                padding: '16px 20px',
                backgroundColor: '#0a84ff',
                color: 'white',
                border: 'none',
                borderRadius: '9999px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: !values.number || !values.expiry || !values.cvc ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                opacity: !values.number || !values.expiry || !values.cvc ? 0.6 : 1,
                marginTop: '8px',
                boxShadow: '0 8px 20px rgba(10,132,255,0.35)'
              }}
            >
              Pay Now
            </button>
          </form>
        </div>
      </div>

      {/* Code Example */}
      <div style={{
        marginTop: '32px',
        padding: '20px',
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: '12px',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        <h4 style={{ color: '#ffffff', margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>
          Code Example - Using FormField with Validation
        </h4>
        <pre style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', margin: 0, lineHeight: 1.6, fontFamily: "'SF Mono', Monaco, Consolas, monospace" }}>
{`import { useCardForm, CreditCardPreview, FormField } from '@keeratita/card/react';
import { stripeAdapter } from '../shared/adapters';


const {
  values,      // { number, expiry, cvc, name, ... }
  brand,       // detected card brand (visa, mastercard, etc.)
  errors,      // { number: string | null, expiry: string | null, ... }
  isFlipped,   // for 3D card flip animation
  paymentError, // validation error banner message
  handleChange, // input change handler with auto-formatting
  handleBlur,   // blur handler with validation
  handleCvcFocus, // flip card on CVC focus
  handleCvcBlur,  // unflip card on CVC blur
  handleSubmit, // form submit handler with tokenization
} = useCardForm({
  adapter: stripeAdapter,
  onSubmit: (data) => console.log('Token:', data.token),
  onError: (error) => console.error('Error:', error),
});

// FormField automatically handles:
// - Validation error display
// - Red border on invalid fields
// - Error messages below inputs
// - Proper input attributes (type, inputMode, autoComplete)
<FormField
  name="number"
  values={values}
  errors={errors}
  handleChange={handleChange}
  handleBlur={handleBlur}
  label="Card Number"
  placeholder="4242 4242 4242 4242"
/>`}
        </pre>
      </div>
    </div>
  );
}

export default CardFormWithLivePreview;