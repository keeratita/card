/**
 * Modal Checkout Example
 *
 * This example demonstrates how to implement a modal-based checkout flow.
 */

import React, { useState, useCallback } from 'react';
import { Token } from '@keeratita/card';
import { stripeAdapter, omiseAdapter } from '../shared/adapters';
import { useCardForm } from '@keeratita/card/react';



interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

function Modal({ isOpen, onClose, children, title }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#1c1c1e',
          borderRadius: '16px',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
        }}
      >
        {title && (
          <div style={{
            padding: '16px 24px',
            borderBottom: '1px solid rgba(255,255,255,0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#ffffff' }}>{title}</h3>
            <button onClick={onClose} style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              fontSize: '20px',
              color: 'rgba(255,255,255,0.55)'
            }}>×</button>
          </div>
        )}
        <div style={{ padding: '24px' }}>{children}</div>
      </div>
    </div>
  );
}

export function ModalCheckout() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAdapter, setSelectedAdapter] = useState<'stripe' | 'omise'>('stripe');
  const [token, setToken] = useState<Token | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getActiveAdapter = () => selectedAdapter === 'stripe' ? stripeAdapter : omiseAdapter;

  const handlePaymentSubmit = async (data: { token: Token }) => {
    console.log('Token received:', data.token);
    setToken(data.token);
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
    adapter: getActiveAdapter(),
    onSubmit: handlePaymentSubmit,
    onError: handleError,
  });

  const openModal = useCallback(() => {
    setToken(null);
    setError(null);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const inputStyle = (name: string): React.CSSProperties => {
    const hasError = !!errors[name as keyof typeof errors];
    return {
      width: '100%',
      padding: '12px 14px',
      borderRadius: '8px',
      border: `1.5px solid ${hasError ? '#ff453a' : 'rgba(255,255,255,0.1)'}`,
      fontSize: '15px',
      fontFamily: "'SF Mono', Monaco, Consolas, monospace",
      boxSizing: 'border-box',
      backgroundColor: hasError ? 'rgba(255,69,58,0.08)' : 'rgba(255,255,255,0.05)',
      color: '#ffffff',
    };
  };

  return (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#ffffff', marginBottom: '8px' }}>
        Modal Checkout
      </h2>
      <p style={{ color: 'rgba(255,255,255,0.55)', marginBottom: '24px', fontSize: '14px' }}>
        Click the button below to open the payment modal.
      </p>

      {/* Configuration */}
      <div style={{
        backgroundColor: 'rgba(255,255,255,0.03)',
        padding: '16px',
        borderRadius: '12px',
        marginBottom: '24px',
        border: '1px solid rgba(255,255,255,0.08)'
      }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <button
            onClick={() => setSelectedAdapter('stripe')}
            style={{
              flex: 1,
              padding: '8px',
              border: selectedAdapter === 'stripe' ? '2px solid #0a84ff' : '1px solid rgba(255,255,255,0.1)',
              borderRadius: '9999px',
              backgroundColor: selectedAdapter === 'stripe' ? 'rgba(10,132,255,0.12)' : 'rgba(255,255,255,0.05)',
              cursor: 'pointer',
              fontWeight: 500,
              color: selectedAdapter === 'stripe' ? '#0a84ff' : 'rgba(255,255,255,0.55)',
              fontSize: '13px'
            }}
          >
            Stripe
          </button>
          <button
            onClick={() => setSelectedAdapter('omise')}
            style={{
              flex: 1,
              padding: '8px',
              border: selectedAdapter === 'omise' ? '2px solid #0a84ff' : '1px solid rgba(255,255,255,0.1)',
              borderRadius: '9999px',
              backgroundColor: selectedAdapter === 'omise' ? 'rgba(10,132,255,0.12)' : 'rgba(255,255,255,0.05)',
              cursor: 'pointer',
              fontWeight: 500,
              color: selectedAdapter === 'omise' ? '#0a84ff' : 'rgba(255,255,255,0.55)',
              fontSize: '13px'
            }}
          >
            Omise
          </button>
        </div>
      </div>

      {/* Trigger Button */}
      <button
        onClick={openModal}
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
          boxShadow: '0 8px 20px rgba(10,132,255,0.35)',
          transition: 'all 0.2s ease'
        }}
      >
        Checkout with Card
      </button>

      {/* Success Message */}
      {token && (
        <div style={{
          marginTop: '20px',
          padding: '16px',
          backgroundColor: 'rgba(48,209,88,0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(48,209,88,0.25)',
          color: '#30d158'
        }}>
          <strong>✓ Payment Successful!</strong>
          <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>Token: {token.id}</p>
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title="Secure Payment">
        {token ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px', color: '#30d158' }}>✓</div>
            <h3 style={{ margin: '0 0 8px 0', color: '#ffffff' }}>Payment Successful!</h3>
            <p style={{ color: 'rgba(255,255,255,0.55)', margin: 0 }}>Your order has been processed.</p>
            <button onClick={closeModal} style={{
              marginTop: '20px',
              padding: '12px 24px',
              backgroundColor: '#0a84ff',
              color: 'white',
              border: 'none',
              borderRadius: '9999px',
              cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(10,132,255,0.35)'
            }}>
              Close
            </button>
          </div>
        ) : (
          error && (
            <div style={{
              padding: '12px 16px',
              backgroundColor: 'rgba(255,69,58,0.1)',
              border: '1px solid rgba(255,69,58,0.25)',
              borderRadius: '8px',
              marginBottom: '16px',
              color: '#ff453a',
              fontSize: '13px'
            }}>
              {error}
            </div>
          )
        )}
        <form onSubmit={onFormSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: 'rgba(255,255,255,0.55)', fontSize: '14px' }}>
              Card Number
            </label>
            <input name="number" type="text" value={values.number} onChange={handleChange} onBlur={handleBlur}
              placeholder="4242 4242 4242 4242" style={inputStyle('number')} />
            {errors.number && <span style={{ color: '#ff453a', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.number}</span>}
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: 'rgba(255,255,255,0.55)', fontSize: '14px' }}>
              Expiry Date
            </label>
            <input name="expiry" type="text" value={values.expiry} onChange={handleChange} onBlur={handleBlur}
              placeholder="MM / YY" style={inputStyle('expiry')} />
            {errors.expiry && <span style={{ color: '#ff453a', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.expiry}</span>}
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: 'rgba(255,255,255,0.55)', fontSize: '14px' }}>
              CVC
            </label>
            <input name="cvc" type="password" value={values.cvc} onChange={handleChange} onBlur={handleCvcBlur} onFocus={handleCvcFocus}
              style={inputStyle('cvc')} />
            {errors.cvc && <span style={{ color: '#ff453a', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.cvc}</span>}
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: 'rgba(255,255,255,0.55)', fontSize: '14px' }}>
              Cardholder Name
            </label>
            <input name="name" type="text" value={values.name} onChange={handleChange} onBlur={handleBlur}
              placeholder="Full Name" style={inputStyle('name')} />
            {errors.name && <span style={{ color: '#ff453a', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.name}</span>}
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
              cursor: !values.number || !values.expiry || !values.cvc ? 'not-allowed' : 'pointer',
              opacity: !values.number || !values.expiry || !values.cvc ? 0.6 : 1,
              boxShadow: '0 8px 20px rgba(10,132,255,0.35)'
            }}
          >
            Pay Now
          </button>
        </form>
      </Modal>
    </div>
  );
}

export default ModalCheckout;