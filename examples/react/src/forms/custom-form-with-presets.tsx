/**
 * Custom Form with Presets Example
 * 
 * This example demonstrates how to use different form presets with the CardForm component.
 * Each preset automatically configures the right fields and validators.
 */

import { useState } from 'react';
import { CardForm, CreditCardPreview, Token } from '@keeratita/card/react';
import { StripeAdapter, OmiseAdapter } from '@keeratita/card';

// Create adapter instances
const stripeAdapter = new StripeAdapter({
  publicKey: 'pk_test_stripe_integrated_demo_key',
});

const omiseAdapter = new OmiseAdapter({
  publicKey: 'pkey_test_omise_integrated_demo_key',
});

type PresetOption = 'none' | 'us' | 'billing' | 'contact';

const presetDescriptions: Record<PresetOption, string> = {
  none: 'Core fields: Card Number, Expiry, CVC, Cardholder Name',
  us: 'Core fields + Postal Code (ZIP Code)',
  billing: 'Core fields + Address Line 1, City, State, Postal Code, Country',
  contact: 'Core fields + Email, Phone',
};

export function CustomFormWithPresets() {
  const [selectedPreset, setSelectedPreset] = useState<PresetOption>('none');
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

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '28px', fontWeight: '600', color: '#24292e', margin: '0 0 8px 0' }}>
        Form with Presets
      </h2>
      <p style={{ color: '#586069', margin: '0 0 24px 0', fontSize: '15px' }}>
        Use the preset prop to automatically include the right fields and validators.
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
              onClick={() => { setSelectedAdapter('stripe'); setToken(null); setError(null); }}
              style={{
                flex: 1,
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
              onClick={() => { setSelectedAdapter('omise'); setToken(null); setError(null); }}
              style={{
                flex: 1,
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

        {/* Preset Selection */}
        <div style={{ marginBottom: '8px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#24292e', fontSize: '14px' }}>
            Form Preset
          </label>
          <select
            value={selectedPreset}
            onChange={(e) => setSelectedPreset(e.target.value as PresetOption)}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #d0d7de',
              fontSize: '14px',
              backgroundColor: 'white'
            }}
          >
            <option value="none">None (Core fields only)</option>
            <option value="us">US Cardholder (ZIP Code)</option>
            <option value="billing">Full Billing Address</option>
            <option value="contact">Contact Details</option>
          </select>
          <p style={{ fontSize: '13px', color: '#586069', margin: '4px 0 0 0' }}>
            {presetDescriptions[selectedPreset]}
          </p>
        </div>
      </div>

      {/* Current Preset Info */}
      <div style={{
        padding: '16px',
        backgroundColor: '#fff3cd',
        borderRadius: '8px',
        marginBottom: '24px',
        border: '1px solid #ffe066',
        color: '#826301'
      }}>
        <strong>Current Preset:</strong> {selectedPreset}
        <br />
        <span style={{ fontSize: '13px' }}>{presetDescriptions[selectedPreset]}</span>
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

      {/* Error Message */}
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

      {/* Card Form with Live Preview */}
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
        {/* Card Preview */}
        <div style={{ flex: '1', minWidth: '300px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#24292e', margin: '0 0 12px 0' }}>
            Card Preview
          </h3>
          <CreditCardPreview
            number=""
            expiry=""
            cvc=""
            name=""
            brand="visa"
            isFlipped={false}
            cardLabel={selectedAdapter === 'stripe' ? 'VISA' : 'OMISE'}
          />
        </div>

        {/* Card Form */}
        <div style={{ flex: '1', minWidth: '300px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#24292e', margin: '0 0 12px 0' }}>
            Payment Form
          </h3>
          <CardForm
            adapter={getActiveAdapter()}
            preset={selectedPreset}
            cardLabel={selectedAdapter === 'stripe' ? 'VISA' : 'OMISE'}
            submitButtonText="Pay Now"
            onSubmit={handleSubmit}
            onError={handleError}
          />
        </div>
      </div>

      {/* Code Example */}
      <div style={{
        marginTop: '32px',
        padding: '20px',
        backgroundColor: '#161b22',
        borderRadius: '8px'
      }}>
        <h4 style={{ color: '#fff', margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>
          Code Example
        </h4>
        <pre style={{ color: '#c9d1d9', fontSize: '12px', margin: 0, lineHeight: 1.6, fontFamily: "'SF Mono', Monaco, Consolas, monospace" }}>
{`// Import the CardForm component and adapters
import { CardForm, CreditCardPreview } from '@keeratita/card/react';
import { StripeAdapter } from '@keeratita/card';

// Create adapter instance
const stripeAdapter = new StripeAdapter({
  publicKey: 'your_stripe_public_key',
});

// Use with any preset: 'none' | 'us' | 'billing' | 'contact'
<CardForm
  adapter={stripeAdapter}
  preset="billing"
  cardLabel="VISA"
  submitButtonText="Pay Now"
  onSubmit={(data) => console.log('Token:', data.token)}
  onError={(error) => console.error('Error:', error)}
/>

// Use CreditCardPreview for live card preview
<CreditCardPreview
  number={cardNumber}
  expiry={expiry}
  cvc={cvc}
  name={name}
  brand={brand}
  isFlipped={isFlipped}
  cardLabel="VISA"
/>`}
        </pre>
      </div>
    </div>
  );
}

export default CustomFormWithPresets;