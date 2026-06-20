/**
 * Flip Card Demo Example
 *
 * This example demonstrates a flip card animation for card preview,
 * showing the front and back of a credit card with smooth transitions.
 *
 * Uses the library's `useCardForm` hook and `FormField` component
 * for built-in validation, formatting, and brand detection.
 */

import { CreditCardPreview, useCardForm, FormField, Token } from '@keeratita/card/react';
import { StripeAdapter } from '@keeratita/card';

// Create a Stripe adapter instance
const stripeAdapter = new StripeAdapter({
  publicKey: 'pk_test_stripe_integrated_demo_key',
});

export function FlipCardDemo() {
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
    onSubmit: ({ token }: { token: Token }) => {
      console.log('Token received:', token);
    },
    onError: (err: Error) => {
      console.error('Payment error:', err);
    },
  });

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '28px', fontWeight: '600', color: '#24292e', margin: '0 0 8px 0' }}>
        Flip Card Demo
      </h2>
      <p style={{ color: '#586069', margin: '0 0 24px 0', fontSize: '15px' }}>
        Interactive card preview with flip animation and live validation.
      </p>

      {/* Validation Error Banner */}
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
        <div style={{ flex: '1', minWidth: '320px' }}>
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
        <div style={{ flex: '1', minWidth: '320px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#24292e', margin: '0 0 16px 0' }}>
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
              Pay Now
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default FlipCardDemo;