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
import { Token } from '@keeratita/card';
import { stripeAdapter } from '../shared/adapters';

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
      <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#ffffff', marginBottom: '8px' }}>
        Basic Card Form
      </h2>
      <p style={{ color: 'rgba(255,255,255,0.55)', marginBottom: '24px', fontSize: '14px' }}>
        A simple integration example with default settings.
      </p>

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
      <h2 style={{ color: '#ffffff' }}>Card Form with Hook</h2>
      <p style={{ color: 'rgba(255,255,255,0.55)', marginBottom: '20px' }}>
        Using the useCardForm hook for custom handling.
      </p>

      {result?.success && (
        <div style={{ 
          padding: '16px', 
          backgroundColor: 'rgba(48,209,88,0.1)', 
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid rgba(48,209,88,0.25)',
          color: '#30d158'
        }}>
          <strong>Payment successful!</strong>
        </div>
      )}

      {result?.error && (
        <div style={{ 
          padding: '16px', 
          backgroundColor: 'rgba(255,69,58,0.1)', 
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid rgba(255,69,58,0.25)',
          color: '#ff453a'
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