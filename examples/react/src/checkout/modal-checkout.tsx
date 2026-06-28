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
          backgroundColor: 'white',
          borderRadius: '8px',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
        }}
      >
        {title && (
          <div style={{
            padding: '16px 24px',
            borderBottom: '1px solid #e1e4e8',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#24292e' }}>{title}</h3>
            <button onClick={onClose} style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              fontSize: '20px',
              color: '#586069'
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
      borderRadius: '6px',
      border: `1px solid ${hasError ? '#cf222e' : '#d0d7de'}`,
      fontSize: '15px',
      fontFamily: "'SF Mono', Monaco, Consolas, monospace",
      boxSizing: 'border-box',
    };
  };

  return (
    <div>
      <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#24292e', marginBottom: '8px' }}>
        Modal Checkout
      </h2>
      <p style={{ color: '#586069', marginBottom: '24px', fontSize: '14px' }}>
        Click the button below to open the payment modal.
      </p>

      {/* Configuration */}
      <div style={{
        backgroundColor: '#f6f8fa',
        padding: '16px',
        borderRadius: '8px',
        marginBottom: '24px',
        border: '1px solid #e1e4e8'
      }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <button
            onClick={() => setSelectedAdapter('stripe')}
            style={{
              flex: 1,
              padding: '8px',
              border: selectedAdapter === 'stripe' ? '2px solid #0366d6' : '1px solid #d0d7de',
              borderRadius: '6px',
              backgroundColor: selectedAdapter === 'stripe' ? '#f1f8ff' : 'white',
              cursor: 'pointer',
              fontWeight: 500,
              color: selectedAdapter === 'stripe' ? '#0366d6' : '#586069',
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
              border: selectedAdapter === 'omise' ? '2px solid #0366d6' : '1px solid #d0d7de',
              borderRadius: '6px',
              backgroundColor: selectedAdapter === 'omise' ? '#f1f8ff' : 'white',
              cursor: 'pointer',
              fontWeight: 500,
              color: selectedAdapter === 'omise' ? '#0366d6' : '#586069',
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
          padding: '14px',
          backgroundColor: '#0366d6',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '15px',
          fontWeight: '600',
          cursor: 'pointer'
        }}
      >
        Checkout with Card
      </button>

      {/* Success Message */}
      {token && (
        <div style={{
          marginTop: '20px',
          padding: '16px',
          backgroundColor: '#f0fdf4',
          borderRadius: '8px',
          border: '1px solid #bbf7d0',
          color: '#166534'
        }}>
          <strong>✓ Payment Successful!</strong>
          <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>Token: {token.id}</p>
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title="Secure Payment">
        {token ? (
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px', color: '#28a745' }}>✓</div>
            <h3 style={{ margin: '0 0 8px 0' }}>Payment Successful!</h3>
            <p style={{ color: '#586069', margin: 0 }}>Your order has been processed.</p>
            <button onClick={closeModal} style={{
              marginTop: '20px',
              padding: '12px 24px',
              backgroundColor: '#0366d6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}>
              Close
            </button>
          </div>
        ) : (
          error && (
            <div style={{
              padding: '12px 16px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '6px',
              marginBottom: '16px',
              color: '#991b1b',
              fontSize: '13px'
            }}>
              {error}
            </div>
          )
        )}
        <form onSubmit={onFormSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#24292e', fontSize: '14px' }}>
              Card Number
            </label>
            <input name="number" type="text" value={values.number} onChange={handleChange} onBlur={handleBlur}
              placeholder="4242 4242 4242 4242" style={inputStyle('number')} />
            {errors.number && <span style={{ color: '#cf222e', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.number}</span>}
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#24292e', fontSize: '14px' }}>
              Expiry Date
            </label>
            <input name="expiry" type="text" value={values.expiry} onChange={handleChange} onBlur={handleBlur}
              placeholder="MM / YY" style={inputStyle('expiry')} />
            {errors.expiry && <span style={{ color: '#cf222e', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.expiry}</span>}
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#24292e', fontSize: '14px' }}>
              CVC
            </label>
            <input name="cvc" type="password" value={values.cvc} onChange={handleChange} onBlur={handleCvcBlur} onFocus={handleCvcFocus}
              style={inputStyle('cvc')} />
            {errors.cvc && <span style={{ color: '#cf222e', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.cvc}</span>}
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#24292e', fontSize: '14px' }}>
              Cardholder Name
            </label>
            <input name="name" type="text" value={values.name} onChange={handleChange} onBlur={handleBlur}
              placeholder="Full Name" style={inputStyle('name')} />
            {errors.name && <span style={{ color: '#cf222e', fontSize: '12px', marginTop: '4px', display: 'block' }}>{errors.name}</span>}
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
              opacity: !values.number || !values.expiry || !values.cvc ? 0.6 : 1
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