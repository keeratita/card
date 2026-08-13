/**
 * Directives Demo Example
 *
 * This example demonstrates how to use the library's hooks and components
 * for automatic formatting, validation, and brand detection. The library's
 * `useCardForm` hook and `FormField` component handle everything internally.
 */

import { CreditCardPreview, useCardForm, FormField } from '@keeratita/card/react';
import { stripeAdapter } from '../shared/adapters';

export function DirectivesDemo() {
  const {
    values,
    brand,
    errors,
    paymentError,
    isFlipped,
    handleChange,
    handleBlur,
    handleCvcFocus,
    handleCvcBlur,
    handleSubmit: onFormSubmit,
  } = useCardForm({
    adapter: stripeAdapter,
    onSubmit: ({ token }) => {
      console.log('Token received:', token);
    },
    onError: (err: Error) => {
      console.error('Payment error:', err);
    },
  });

  return (
    <div style={{ maxWidth: '800px' }}>
      <h2 style={{ fontSize: '28px', fontWeight: '600', color: '#ffffff', margin: '0 0 8px 0' }}>
        Directives Demo
      </h2>
      <p style={{ color: 'rgba(255,255,255,0.55)', margin: '0 0 24px 0', fontSize: '15px' }}>
        Using library hooks and form field components for built-in validation, formatting, and brand detection.
      </p>

      {/* Brand Badge */}
      {brand && (
        <div style={{
          display: 'inline-block',
          backgroundColor: 'rgba(10,132,255,0.12)',
          color: '#0a84ff',
          padding: '4px 12px',
          borderRadius: '16px',
          fontSize: '12px',
          fontWeight: '600',
          marginBottom: '16px',
          textTransform: 'uppercase'
        }}>
          {brand}
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
        {/* Live Card Preview */}
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

        {/* Form with Built-in Validation */}
        <div style={{ flex: '1', minWidth: '300px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#ffffff', margin: '0 0 16px 0' }}>
            Enter Card Details
          </h3>
          <form onSubmit={onFormSubmit}>
            <FormField
              name="number"
              values={values}
              errors={errors}
              handleChange={handleChange}
              handleBlur={handleBlur}
              label="Card Number"
              placeholder="4242 4242 4242 4242"
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <FormField
                name="expiry"
                values={values}
                errors={errors}
                handleChange={handleChange}
                handleBlur={handleBlur}
                label="Expiry Date"
                placeholder="MM / YY"
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
                placeholder="123"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
              <FormField
                name="name"
                values={values}
                errors={errors}
                handleChange={handleChange}
                handleBlur={handleBlur}
                label="Cardholder Name"
              />
              <FormField
                name="postalCode"
                values={values}
                errors={errors}
                handleChange={handleChange}
                handleBlur={handleBlur}
                label="Postal Code"
              />
            </div>

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
                cursor: 'pointer',
                opacity: !values.number || !values.expiry || !values.cvc ? 0.6 : 1,
                marginTop: '16px',
                boxShadow: '0 8px 20px rgba(10,132,255,0.35)',
                transition: 'all 0.2s ease'
              }}
            >
              Pay Now
            </button>
          </form>
        </div>
      </div>

      {/* Info Box */}
      <div style={{
        backgroundColor: 'rgba(255,204,0,0.08)',
        border: '1px solid rgba(255,204,0,0.25)',
        padding: '16px',
        borderRadius: '12px',
        marginTop: '24px'
      }}>
        <h4 style={{ margin: '0 0 8px 0', color: '#ffd60a', fontSize: '14px' }}>
          Using Library Hooks & Components
        </h4>
        <p style={{ margin: 0, color: 'rgba(255,214,10,0.8)', fontSize: '13px', lineHeight: '1.5' }}>
          This demo uses the <code>useCardForm</code> hook for automatic formatting (card number, expiry, CVC),
          validation (Luhn check, expiry, CVC), and brand detection. The <code>FormField</code> component
          handles all validation state and the <code>CreditCardPreview</code> component displays the card visually.
        </p>
      </div>
    </div>
  );
}

export default DirectivesDemo;