/**
 * Basic Card Form Example
 * 
 * This example demonstrates the simplest way to integrate the card form
 * into a React application using the CardForm component.
 * 
 * Run this example:
 * 1. Build the library: npm run build
 * 2. Start a dev server in this directory
 * 3. Import and use this component in your app
 */

import { useState } from 'react';
import { CardForm } from '@keeratita/card/react';
import { StripeAdapter, Token } from '@keeratita/card';

// Create a Stripe adapter instance
// In production, use your actual Stripe API key
const stripeAdapter = new StripeAdapter({
  publicKey: 'pk_test_stripe_integrated_demo_key',
});

export function BasicCardForm() {
  const [token, setToken] = useState<Token | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: { token: Token }) => {
    console.log('Token received:', data.token);
    setToken(data.token);
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 1500));
  };

  const handleError = (err: Error) => {
    console.error('Payment error:', err);
    setError(err.message);
  };

  return (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#24292e', marginBottom: '8px' }}>
        Basic Card Form
      </h2>
      <p style={{ color: '#586069', marginBottom: '24px', fontSize: '14px' }}>
        A simple integration example with default settings.
      </p>

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

      <CardForm
        adapter={stripeAdapter}
        onSubmit={handleSubmit}
        onError={handleError}
        submitButtonText="Pay Now"
      />
    </div>
  );
}

// Alternative: Using the hook directly for more control
export function BasicCardFormWithHook() {
  const [result, setResult] = useState<{ success: boolean; data?: { token: Token }; error?: string } | null>(null);

  const handleSubmit = async (data: { token: Token }) => {
    // Process the token with your backend
    console.log('Processing token:', data.token);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setResult({ success: true, data });
  };

  const handleError = (err: Error) => {
    setResult({ success: false, error: err.message });
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <h2>Card Form with Hook</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        Using the useCardForm hook for custom handling.
      </p>

      {result?.success && (
        <div style={{ 
          padding: '16px', 
          backgroundColor: '#d4edda', 
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <strong>Payment successful!</strong>
        </div>
      )}

      {result?.error && (
        <div style={{ 
          padding: '16px', 
          backgroundColor: '#f8d7da', 
          borderRadius: '8px',
          marginBottom: '20px'
        }}>
          <strong>Error:</strong> {result.error}
        </div>
      )}

      <CardForm
        adapter={stripeAdapter}
        onSubmit={handleSubmit}
        onError={handleError}
        cardLabel="Visa Platinum"
        submitButtonText="Complete Purchase"
      />
    </div>
  );
}

export default BasicCardForm;