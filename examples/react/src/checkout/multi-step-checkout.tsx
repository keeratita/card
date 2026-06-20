/**
 * Multi-Step Checkout Example
 *
 * This example demonstrates a multi-step checkout flow with cart, shipping, and payment.
 */

import React, { useState, useCallback } from 'react';
import { StripeAdapter, Token } from '@keeratita/card';
import { useCardForm } from '@keeratita/card/react';

const stripeAdapter = new StripeAdapter({
  publicKey: 'pk_test_stripe_integrated_demo_key',
});

type CheckoutStep = 'cart' | 'shipping' | 'payment' | 'confirmation';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface ShippingInfo {
  name: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
}

const sampleCart: CartItem[] = [
  { id: '1', name: 'Premium Widget', price: 49.99, quantity: 2 },
  { id: '2', name: 'Deluxe Gadget', price: 99.99, quantity: 1 },
];

export function MultiStepCheckout() {
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('cart');
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
    name: '',
    email: '',
    address: '',
    city: '',
    postalCode: '',
  });
  const [token, setToken] = useState<{ id: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const cartTotal = sampleCart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handlePaymentSubmit = async (data: { token: Token }) => {
    console.log('Token received:', data.token);
    setToken(data.token);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setCurrentStep('confirmation');
  };

  const handleError = (err: Error) => {
    console.error('Payment error:', err);
    setError(err.message);
  };

  const {
    values,
    errors,
    handleChange,
    handleBlur,
    handleCvcFocus,
    handleCvcBlur,
    handleSubmit: onFormSubmit,
  } = useCardForm({
    adapter: stripeAdapter,
    onSubmit: handlePaymentSubmit,
    onError: handleError,
  });

  const handleShippingChange = useCallback((name: string, value: string) => {
    setShippingInfo(prev => ({ ...prev, [name]: value }));
  }, []);

  const renderStepIndicator = () => {
    const steps: { id: CheckoutStep; label: string }[] = [
      { id: 'cart', label: 'Cart' },
      { id: 'shipping', label: 'Shipping' },
      { id: 'payment', label: 'Payment' },
      { id: 'confirmation', label: 'Complete' },
    ];
    const currentStepIndex = steps.findIndex(s => s.id === currentStep);

    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
        {steps.map((step, index) => (
          <div key={step.id} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: index <= currentStepIndex ? '#0366d6' : '#e1e4e8',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '600',
              marginRight: '8px',
              fontSize: '14px'
            }}>
              {index + 1}
            </div>
            <span style={{
              color: index <= currentStepIndex ? '#24292e' : '#586069',
              fontWeight: index === currentStepIndex ? '600' : '400',
              fontSize: '13px'
            }}>
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <div style={{
                flex: 1,
                height: '2px',
                backgroundColor: index < currentStepIndex ? '#0366d6' : '#e1e4e8',
                marginLeft: '16px',
              }} />
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderCartStep = () => (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#24292e', margin: '0 0 16px 0' }}>Your Cart</h2>
      <div style={{ marginBottom: '20px' }}>
        {sampleCart.map(item => (
          <div key={item.id} style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '12px 0',
            borderBottom: '1px solid #e1e4e8',
          }}>
            <div>
              <div style={{ fontWeight: 500, color: '#24292e' }}>{item.name}</div>
              <div style={{ color: '#586069', fontSize: '14px' }}>
                ${item.price.toFixed(2)} × {item.quantity}
              </div>
            </div>
            <div style={{ fontWeight: 600, color: '#24292e' }}>
              ${(item.price * item.quantity).toFixed(2)}
            </div>
          </div>
        ))}
      </div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '16px 0',
        borderTop: '2px solid #24292e',
        fontWeight: 600,
        fontSize: '16px',
        color: '#24292e'
      }}>
        <span>Total</span>
        <span>${cartTotal.toFixed(2)}</span>
      </div>
      <button onClick={() => setCurrentStep('shipping')} style={{
        width: '100%',
        padding: '14px',
        backgroundColor: '#0366d6',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontSize: '15px',
        fontWeight: '600',
        cursor: 'pointer',
        marginTop: '20px'
      }}>
        Continue to Shipping
      </button>
    </div>
  );

  const renderShippingStep = () => (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#24292e', margin: '0 0 16px 0' }}>Shipping Information</h2>
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#24292e', fontSize: '14px' }}>Full Name</label>
        <input type="text" value={shippingInfo.name} onChange={(e) => handleShippingChange('name', e.target.value)}
          style={{ width: '100%', padding: '12px 14px', borderRadius: '6px', border: '1px solid #d0d7de', fontSize: '15px', boxSizing: 'border-box' }}
          placeholder="John Doe" />
      </div>
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#24292e', fontSize: '14px' }}>Email</label>
        <input type="email" value={shippingInfo.email} onChange={(e) => handleShippingChange('email', e.target.value)}
          style={{ width: '100%', padding: '12px 14px', borderRadius: '6px', border: '1px solid #d0d7de', fontSize: '15px', boxSizing: 'border-box' }}
          placeholder="john@example.com" />
      </div>
      <div style={{ marginBottom: '16px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#24292e', fontSize: '14px' }}>Address</label>
        <input type="text" value={shippingInfo.address} onChange={(e) => handleShippingChange('address', e.target.value)}
          style={{ width: '100%', padding: '12px 14px', borderRadius: '6px', border: '1px solid #d0d7de', fontSize: '15px', boxSizing: 'border-box' }}
          placeholder="123 Main St" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#24292e', fontSize: '14px' }}>City</label>
          <input type="text" value={shippingInfo.city} onChange={(e) => handleShippingChange('city', e.target.value)}
            style={{ width: '100%', padding: '12px 14px', borderRadius: '6px', border: '1px solid #d0d7de', fontSize: '15px', boxSizing: 'border-box' }}
            placeholder="New York" />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#24292e', fontSize: '14px' }}>Postal Code</label>
          <input type="text" value={shippingInfo.postalCode} onChange={(e) => handleShippingChange('postalCode', e.target.value)}
            style={{ width: '100%', padding: '12px 14px', borderRadius: '6px', border: '1px solid #d0d7de', fontSize: '15px', boxSizing: 'border-box' }}
            placeholder="10001" />
        </div>
      </div>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button onClick={() => setCurrentStep('cart')} style={{
          flex: 1, padding: '14px', backgroundColor: 'white', color: '#586069', border: '1px solid #d0d7de',
          borderRadius: '6px', fontSize: '15px', fontWeight: 500, cursor: 'pointer'
        }}>Back</button>
        <button onClick={() => setCurrentStep('payment')} disabled={!shippingInfo.name || !shippingInfo.email} style={{
          flex: 1, padding: '14px', backgroundColor: '#0366d6', color: 'white', border: 'none',
          borderRadius: '6px', fontSize: '15px', fontWeight: '600', cursor: 'pointer',
          opacity: (!shippingInfo.name || !shippingInfo.email) ? 0.5 : 1
        }}>Continue to Payment</button>
      </div>
    </div>
  );

  const inputStyle = (name: string): React.CSSProperties => {
    const hasError = !!errors[name as keyof typeof errors];
    return {
      width: '100%',
      padding: '12px 14px',
      borderRadius: '6px',
      border: `1px solid ${hasError ? '#cf222e' : '#d0d7de'}`,
      fontSize: '15px',
      fontFamily: "'SF Mono', Monaco, Consolas, monospace",
      boxSizing: 'border-box',
    };
  };

  const renderPaymentStep = () => (
    <div>
      <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#24292e', margin: '0 0 8px 0' }}>Payment</h2>
      <p style={{ color: '#586069', marginBottom: '20px', fontSize: '14px' }}>
        Complete your purchase by providing your payment details.
      </p>
      {error && (
        <div style={{
          padding: '8px 12px',
          backgroundColor: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '4px',
          marginBottom: '16px',
          color: '#991b1b',
          fontSize: '13px'
        }}>
          {error}
        </div>
      )}
      <form onSubmit={onFormSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#24292e', fontSize: '14px' }}>Card Number</label>
          <input name="number" type="text" value={values.number} onChange={handleChange} onBlur={handleBlur}
            placeholder="4242 4242 4242 4242" style={inputStyle('number')} />
          {errors.number && <span style={{ color: '#cf222e', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.number}</span>}
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#24292e', fontSize: '14px' }}>Expiry Date</label>
          <input name="expiry" type="text" value={values.expiry} onChange={handleChange} onBlur={handleBlur}
            placeholder="MM / YY" style={inputStyle('expiry')} />
          {errors.expiry && <span style={{ color: '#cf222e', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.expiry}</span>}
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#24292e', fontSize: '14px' }}>CVC</label>
          <input name="cvc" type="password" value={values.cvc} onChange={handleChange} onBlur={handleCvcBlur} onFocus={handleCvcFocus}
            style={inputStyle('cvc')} />
          {errors.cvc && <span style={{ color: '#cf222e', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.cvc}</span>}
        </div>
        <div style={{ marginBottom: '16px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#24292e', fontSize: '14px' }}>Cardholder Name</label>
          <input name="name" type="text" value={values.name} onChange={handleChange} onBlur={handleBlur}
            placeholder="Full Name" style={inputStyle('name')} />
          {errors.name && <span style={{ color: '#cf222e', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.name}</span>}
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button type="submit" disabled={!values.number || !values.expiry || !values.cvc} style={{
            flex: 2, padding: '14px', backgroundColor: '#0366d6', color: 'white', border: 'none',
            borderRadius: '6px', fontSize: '15px', fontWeight: '600', cursor: !values.number || !values.expiry || !values.cvc ? 'not-allowed' : 'pointer',
            opacity: !values.number || !values.expiry || !values.cvc ? 0.6 : 1
          }}>
            Pay ${cartTotal.toFixed(2)}
          </button>
        </div>
      </form>
      <button onClick={() => setCurrentStep('shipping')} style={{
        width: '100%', padding: '12px', backgroundColor: 'transparent', color: '#586069', border: 'none',
        borderRadius: '6px', fontSize: '14px', cursor: 'pointer', marginTop: '16px'
      }}>← Back to Shipping</button>
    </div>
  );

  const renderConfirmationStep = () => (
    <div style={{ textAlign: 'center', padding: '20px 0' }}>
      <div style={{ fontSize: '64px', marginBottom: '20px', color: '#28a745' }}>✓</div>
      <h2 style={{ marginTop: 0, fontSize: '20px', fontWeight: '600', color: '#24292e' }}>Order Confirmed!</h2>
      <p style={{ color: '#586069', marginBottom: '20px' }}>
        Thank you for your purchase. A confirmation email has been sent to {shippingInfo.email}.
      </p>
      {token && (
        <div style={{ backgroundColor: '#f6f8fa', padding: '12px', borderRadius: '8px', marginBottom: '24px', fontSize: '13px' }}>
          <strong>Transaction ID:</strong> {token.id}
        </div>
      )}
      <button onClick={() => setCurrentStep('cart')} style={{
        padding: '14px 32px', backgroundColor: '#0366d6', color: 'white', border: 'none',
        borderRadius: '6px', fontSize: '15px', fontWeight: '600', cursor: 'pointer'
      }}>Start New Order</button>
    </div>
  );

  return (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#24292e', marginBottom: '8px' }}>
        Multi-Step Checkout
      </h2>
      <p style={{ color: '#586069', marginBottom: '24px', fontSize: '14px' }}>
        Complete checkout flow with cart, shipping, and payment.
      </p>
      {renderStepIndicator()}
      {currentStep === 'cart' && renderCartStep()}
      {currentStep === 'shipping' && renderShippingStep()}
      {currentStep === 'payment' && renderPaymentStep()}
      {currentStep === 'confirmation' && renderConfirmationStep()}
    </div>
  );
}

export default MultiStepCheckout;