/**
 * Form with Custom Validation Example
 *
 * This example demonstrates using the useCardForm hook for built-in validation
 * and formatting. The hook handles:
 * - Luhn check for card number
 * - Expiry date validation
 * - CVC validation (3-4 digits based on brand)
 * - Auto-formatting (card number, expiry, CVC)
 * - Card brand detection
 */

import { useState } from 'react';
import { CreditCardPreview, useCardForm, FormField, Token } from '@keeratita/card/react';
import { stripeAdapter, omiseAdapter } from '../shared/adapters';


export function FormWithCustomValidation() {
  const [selectedAdapter, setSelectedAdapter] = useState<'stripe' | 'omise'>('stripe');
  const [token, setToken] = useState<Token | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getActiveAdapter = () => selectedAdapter === 'stripe' ? stripeAdapter : omiseAdapter;

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
    adapter: getActiveAdapter(),
    onSubmit: handleSubmit,
    onError: handleError,
  });

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '28px', fontWeight: '600', color: '#24292e', margin: '0 0 8px 0' }}>
        Form with Library Validation
      </h2>
      <p style={{ color: '#586069', margin: '0 0 24px 0', fontSize: '15px' }}>
        Using useCardForm hook with built-in validation and formatting.
      </p>

      {/* Configuration Panel */}
      <div style={{
        backgroundColor: '#f6f8fa',
        padding: '24px',
        borderRadius: '8px',
        marginBottom: '24px',
        border: '1px solid #e1e4e8'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#24292e', margin: '0 0 16px 0' }}>
          Configuration
        </h3>

        {/* Payment Gateway Selection */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#24292e', fontSize: '14px' }}>
            Payment Gateway
          </label>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setSelectedAdapter('stripe')}
              style={{
                flex: '2',
                padding: '10px',
                border: selectedAdapter === 'stripe' ? '2px solid #0366d6' : '1px solid #d0d7de',
                borderRadius: '6px',
                backgroundColor: selectedAdapter === 'stripe' ? '#f1f8ff' : 'white',
                cursor: 'pointer',
                fontWeight: 500,
                color: selectedAdapter === 'stripe' ? '#0366d6' : '#586069',
                fontSize: '14px'
              }}
            >
              Stripe
            </button>
            <button
              onClick={() => setSelectedAdapter('omise')}
              style={{
                flex: '2',
                padding: '10px',
                border: selectedAdapter === 'omise' ? '2px solid #0366d6' : '1px solid #d0d7de',
                borderRadius: '6px',
                backgroundColor: selectedAdapter === 'omise' ? '#f1f8ff' : 'white',
                cursor: 'pointer',
                fontWeight: 500,
                color: selectedAdapter === 'omise' ? '#0366d6' : '#586069',
                fontSize: '14px'
              }}
            >
              Omise
            </button>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {token && (
        <div style={{
          padding: '16px',
          backgroundColor: '#f0fdf4',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #bbf7d0',
          color: '#166534'
        }}>
          <strong>✓ Success!</strong> Token: {token.id}
        </div>
      )}

      {error && (
        <div style={{
          padding: '16px',
          backgroundColor: '#fef2f2',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #fecaca',
          color: '#991b1b'
        }}>
          <strong>⚠ Error:</strong> {error}
        </div>
      )}

      {paymentError && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#fef2f2',
          borderRadius: '6px',
          marginBottom: '20px',
          border: '1px solid #fecaca',
          color: '#991b1b',
          fontSize: '14px'
        }}>
          {paymentError}
        </div>
      )}

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        {/* Live Card Preview with Flip */}
        <div style={{ flex: '1', minWidth: '300px' }}>
          <CreditCardPreview
            number={values.number}
            expiry={values.expiry}
            cvc={values.cvc}
            name={values.name}
            brand={brand}
            isFlipped={isFlipped}
          />
        </div>

        {/* Card Form with Built-in Validation */}
        <div style={{ flex: '1', minWidth: '300px' }}>
          <form onSubmit={onFormSubmit}>
            <FormField
              name="number"
              values={values}
              errors={errors}
              handleChange={handleChange}
              handleBlur={handleBlur}
              label="Card Number"
            />

            <FormField
              name="expiry"
              values={values}
              errors={errors}
              handleChange={handleChange}
              handleBlur={handleBlur}
              label="Expiry Date"
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <FormField
                name="cvc"
                values={values}
                errors={errors}
                handleChange={handleChange}
                handleBlur={handleBlur}
                handleCvcFocus={handleCvcFocus}
                handleCvcBlur={handleCvcBlur}
                label="CVC"
              />
              <FormField
                name="name"
                values={values}
                errors={errors}
                handleChange={handleChange}
                handleBlur={handleBlur}
                label="Cardholder Name"
              />
            </div>

            <button
              type="submit"
              disabled={!values.number || !values.expiry || !values.cvc}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: '#0366d6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: !values.number || !values.expiry || !values.cvc ? 'not-allowed' : 'pointer',
                opacity: !values.number || !values.expiry || !values.cvc ? 0.6 : 1,
                marginTop: '16px'
              }}
            >
              Submit Payment
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default FormWithCustomValidation;