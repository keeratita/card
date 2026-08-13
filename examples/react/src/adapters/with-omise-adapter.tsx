/**
 * Card Form with Omise Adapter Example
 *
 * This example demonstrates how to integrate the card form with Omise payment gateway.
 */

import { useState } from 'react';
import { CreditCardPreview, useCardForm, FormField, Token } from '@keeratita/card/react';
import { omiseAdapter } from '../shared/adapters';


export function CardFormWithOmiseAdapter() {
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
    adapter: omiseAdapter,
    onSubmit: handleSubmit,
    onError: handleError,
  });

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#ffffff', marginBottom: '8px' }}>
        Omise Adapter
      </h2>
      <p style={{ color: 'rgba(255,255,255,0.55)', marginBottom: '24px', fontSize: '14px' }}>
        Secure payment integration using Omise payment gateway.
      </p>

      {/* Info Box */}
      <div style={{
        padding: '16px',
        backgroundColor: 'rgba(255,255,255,0.03)',
        borderRadius: '12px',
        marginBottom: '24px',
        border: '1px solid rgba(255,255,255,0.08)',
        fontSize: '14px',
        color: 'rgba(255,255,255,0.55)'
      }}>
        <strong style={{ color: '#ffffff' }}>Omise</strong> is a popular payment gateway in Southeast Asia,
        supporting credit cards, debit cards, and various local payment methods.
      </div>

      {/* Success Message */}
      {token && (
        <div style={{
          padding: '16px',
          backgroundColor: 'rgba(48,209,88,0.1)',
          borderRadius: '12px',
          marginBottom: '20px',
          border: '1px solid rgba(48,209,88,0.25)',
          color: '#30d158'
        }}>
          <strong>✓ Success!</strong> Token: {token.id}
        </div>
      )}

      {/* Error / Payment Error */}
      {error && (
        <div style={{
          padding: '16px',
          backgroundColor: 'rgba(255,69,58,0.08)',
          borderRadius: '12px',
          marginBottom: '20px',
          border: '1px solid rgba(255,69,58,0.25)',
          color: '#ff453a'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {paymentError && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: 'rgba(255,69,58,0.08)',
          borderRadius: '12px',
          marginBottom: '20px',
          border: '1px solid rgba(255,69,58,0.25)',
          color: '#ff453a',
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
              name="name"
              values={values}
              errors={errors}
              handleChange={handleChange}
              handleBlur={handleBlur}
              label="Cardholder Name"
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <FormField
                name="expiry"
                values={values}
                errors={errors}
                handleChange={handleChange}
                handleBlur={handleBlur}
                label="Expiry Date"
              />
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
            </div>

            <button
              type="submit"
              disabled={!values.number || !values.expiry || !values.cvc}
              style={{
                width: '100%',
                padding: '16px 20px',
                backgroundColor: '#0a84ff',
                color: '#ffffff',
                border: 'none',
                borderRadius: '9999px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: !values.number || !values.expiry || !values.cvc ? 'not-allowed' : 'pointer',
                opacity: !values.number || !values.expiry || !values.cvc ? 0.6 : 1,
                marginTop: '16px',
                boxShadow: '0 8px 20px rgba(10,132,255,0.35)',
                transition: 'all 0.2s ease'
              }}
            >
              Pay with Omise
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CardFormWithOmiseAdapter;