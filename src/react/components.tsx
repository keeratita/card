import React from 'react';
import { CardFormPreset, OptionalCardField, PaymentGateway, Token } from '../core/domain/card';
import { useCardForm, CardFormValues } from './useCardForm';

const BRAND_LOGOS: Record<string, React.ReactNode> = {
  visa: (
    <svg viewBox="0 0 24 24" style={{ height: '100%', fill: 'currentColor' }}>
      <path fill="#0a84ff" d="M12.8 15.6h1.7l1-6.5h-1.7zm5.5-6.5c-.4-.1-.9-.2-1.4-.2-1.5 0-2.6.8-2.6 1.9 0 .8.8 1.3 1.3 1.6.6.3.8.5.8.7 0 .4-.5.6-1 .6-.6 0-1.1-.2-1.6-.4l-.2-.1-.3 1.8c.5.2 1.4.4 2.2.4 1.6 0 2.6-.8 2.6-2 0-.7-.4-1.2-1.4-1.7-.6-.3-.9-.5-.9-.7 0-.3.3-.5.8-.5.5 0 .9.1 1.2.3l.1.1.3-1.8zM9.5 9.1h-1.6c-.5 0-.9.3-1.1.7L4 15.6h1.8l.4-1h2.2l.2 1H10l-.5-6.5zm-2.7 4.1.8-2.3.5 2.3H6.8zm7.9-4.1h-1.4c-.4 0-.8.2-.9.6l-2.6 5.8h1.8l.4-1h2.2l.2 1H16l-1.3-6.4z"/>
    </svg>
  ),
  mastercard: (
    <svg viewBox="0 0 24 24" style={{ height: '100%', fill: 'currentColor' }}>
      <circle cx="9" cy="12" r="6" fill="#ff453a" opacity="0.95"/>
      <circle cx="15" cy="12" r="6" fill="#ff9f0a" opacity="0.95"/>
    </svg>
  ),
  amex: (
    <svg viewBox="0 0 24 24" style={{ height: '100%', fill: 'currentColor' }}>
      <rect width="24" height="24" rx="3" fill="#0a84ff"/>
      <path fill="#fff" d="M4 17h1.6l.8-2.3h2.3l.8 2.3H11l-2.7-7H7.7L4 17zm3.6-4.2.7-2.1.7 2.1H7.6zm5 4.2h1.5v-4.1l1.8 4.1h1.3l1.8-4.1v4.1h1.5v-7h-1.8l-2.1 4.8-2.1-4.8h-1.8v7z"/>
    </svg>
  ),
  jcb: (
    <svg viewBox="0 0 24 24" style={{ height: '100%', fill: 'currentColor' }}>
      <rect width="24" height="24" rx="3" fill="#0b4e9f"/>
      <path fill="#ff453a" d="M4 7h16v10H4z"/>
      <path fill="#fff" d="M7 15h1.5v-4.1l1.8 4.1h1.3l1.8-4.1v4.1H15v-7h-1.8l-2.1 4.8-2.1-4.8H7v7z"/>
    </svg>
  )
};

const DEFAULT_CARD_LOGO = (
  <svg viewBox="0 0 48 48" style={{ height: '100%', fill: 'currentColor' }}>
    <path fill="#8e8e93" d="M37,40H11c-1.65,0-3-1.35-3-3V11c0-1.65,1.35-3,3-3h26c1.65,0,3,1.35,3,3v26C40,38.65,38.65,40,37,40z"/>
    <path fill="#2c2c2e" d="M8,14h32v4H8V14z"/>
  </svg>
);

const FIELD_METADATA: Record<OptionalCardField, { label: string; placeholder: string; type: string; autocomplete: string }> = {
  addressLine1: { label: 'Address', placeholder: 'Street address', type: 'text', autocomplete: 'address-line1' },
  addressLine2: { label: 'Apt, Suite', placeholder: 'Apt, Suite, Unit (optional)', type: 'text', autocomplete: 'address-line2' },
  city: { label: 'City', placeholder: 'City', type: 'text', autocomplete: 'address-level2' },
  state: { label: 'State', placeholder: 'State or Province', type: 'text', autocomplete: 'address-level1' },
  postalCode: { label: 'Postal Code', placeholder: 'Postal/ZIP Code', type: 'text', autocomplete: 'postal-code' },
  country: { label: 'Country', placeholder: 'Country Code (e.g. US, TH)', type: 'text', autocomplete: 'country' },
  phone: { label: 'Phone', placeholder: '+668 1234 567', type: 'tel', autocomplete: 'tel' },
  email: { label: 'Email', placeholder: 'name@example.com', type: 'email', autocomplete: 'email' }
};

const PRESET_FIELDS: Record<string, OptionalCardField[]> = {
  none: [],
  us: ['postalCode'],
  billing: ['addressLine1', 'city', 'state', 'postalCode', 'country'],
  contact: ['email', 'phone']
};

export interface CreditCardPreviewProps {
  number: string;
  expiry: string;
  cvc: string;
  name: string;
  brand: string;
  isFlipped: boolean;
  cardLabel?: string;
}

export function CreditCardPreview({
  number,
  expiry,
  cvc,
  name,
  brand,
  isFlipped,
  cardLabel
}: CreditCardPreviewProps) {
  return (
    <div className="card-perspective">
      <div className={`card-inner credit-card-element ${isFlipped ? 'flipped' : ''}`}>
        {/* Front of Card */}
        <div className="card-front">
          <div className="card-header">
            <div className="card-chip" />
            <div className="card-type-label card-gateway-label">{cardLabel}</div>
          </div>
          <div className="card-number-display card-num-preview">{number || '•••• •••• •••• ••••'}</div>
          <div className="card-footer">
            <div className="card-meta-block">
              <span className="card-meta-label">Cardholder</span>
              <span className="card-meta-value card-holder-preview">{name.toUpperCase() || 'CARDHOLDER NAME'}</span>
            </div>
            <div className="card-meta-block">
              <span className="card-meta-label">Expires</span>
              <span className="card-meta-value card-expiry-preview">{expiry || 'MM/YY'}</span>
            </div>
            <div className="brand-logo card-brand-logo">
              {BRAND_LOGOS[brand] || DEFAULT_CARD_LOGO}
            </div>
          </div>
        </div>

        {/* Back of Card */}
        <div className="card-back">
          <div className="card-magnetic-strip" />
          <div className="card-signature-area">
            <span className="card-meta-label" style={{ marginLeft: '4px' }}>Security Code</span>
            <div className="card-signature-strip">
              <div className="card-cvc-display card-cvc-preview">
                {'•'.repeat(cvc.length) || '•••'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export interface CardFormProps {
  adapter: PaymentGateway;
  preset?: CardFormPreset;
  fields?: OptionalCardField[];
  cardLabel?: string;
  submitButtonText?: string;
  onSubmit?: (data: { token: Token }) => Promise<void> | void;
  onError?: (error: Error) => void;
  initialValues?: Partial<CardFormValues>;
}

export function CardForm({
  adapter,
  preset = 'none',
  fields = [],
  cardLabel,
  submitButtonText = 'Pay Now',
  onSubmit,
  onError,
  initialValues
}: CardFormProps) {
  const {
    values,
    brand,
    errors,
    isTokenizing,
    isProcessing,
    isSuccess,
    paymentError,
    isFlipped,
    handleChange,
    handleBlur,
    handleCvcFocus,
    handleCvcBlur,
    handleSubmit
  } = useCardForm({
    adapter,
    onSubmit,
    onError,
    initialValues
  });

  const getActiveFields = (): OptionalCardField[] => {
    const presetFields = PRESET_FIELDS[preset] || [];
    const set = new Set<OptionalCardField>([...presetFields, ...fields]);
    return Array.from(set);
  };

  const activeFields = getActiveFields();
  const cardLabelText = cardLabel || adapter.name.toUpperCase();

  return (
    <div className="kg-card-container">
      {/* 3D Card Preview */}
      <CreditCardPreview
        number={values.number}
        expiry={values.expiry}
        cvc={values.cvc}
        name={values.name}
        brand={brand}
        isFlipped={isFlipped}
        cardLabel={cardLabelText}
      />

      {/* Form Fields inputs grouped */}
      <div>
        <h3 className="form-section-header">Payment Method</h3>
        <form onSubmit={handleSubmit} className="payment-form-el">
          <div className="ios-grouped-list">
            {/* Card Number Row */}
            <div className={`ios-input-row row-number ${errors.number ? 'invalid' : ''}`}>
              <label className="ios-label" htmlFor="card-number">Card Number</label>
              <input
                type="text"
                id="card-number"
                name="number"
                className="ios-input card-number-input"
                placeholder="•••• •••• •••• ••••"
                value={values.number}
                onChange={handleChange}
                onBlur={handleBlur}
                inputMode="numeric"
                autoComplete="cc-number"
                required
              />
            </div>

            {/* Expiry & CVC wrapper */}
            <div className="ios-input-row-half">
              <div className={`ios-input-row row-expiry ${errors.expiry ? 'invalid' : ''}`}>
                <label className="ios-label" htmlFor="card-expiry" style={{ width: '55px' }}>Expires</label>
                <input
                  type="text"
                  id="card-expiry"
                  name="expiry"
                  className="ios-input card-expiry-input"
                  placeholder="MM/YY"
                  value={values.expiry}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  required
                />
              </div>

              <div className={`ios-input-row row-cvc ${errors.cvc ? 'invalid' : ''}`}>
                <label className="ios-label" htmlFor="card-cvc" style={{ width: '50px' }}>CVC</label>
                <input
                  type="password"
                  id="card-cvc"
                  name="cvc"
                  className="ios-input card-cvc-input"
                  placeholder="•••"
                  value={values.cvc}
                  onChange={handleChange}
                  onFocus={handleCvcFocus}
                  onBlur={(e) => {
                    handleBlur(e);
                    handleCvcBlur();
                  }}
                  maxLength={4}
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  required
                />
              </div>
            </div>

            {/* Render Optional Fields dynamically */}
            {activeFields.map(field => {
              const meta = FIELD_METADATA[field];
              if (!meta) return null;
              
              let labelText = meta.label;
              let placeholderText = meta.placeholder;

              if (field === 'postalCode' && preset === 'us') {
                labelText = 'ZIP Code';
                placeholderText = '12345';
              }

              return (
                <div key={field} className={`ios-input-row row-${field} ${errors[field] ? 'invalid' : ''}`}>
                  <label className="ios-label" htmlFor={`card-${field}`}>{labelText}</label>
                  <input
                    type={meta.type}
                    id={`card-${field}`}
                    name={field}
                    className="ios-input"
                    placeholder={placeholderText}
                    value={(values as any)[field] || ''}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    autoComplete={meta.autocomplete}
                    required={field !== 'addressLine2'}
                  />
                </div>
              );
            })}

            {/* Cardholder Name Row (Always last in list) */}
            <div className={`ios-input-row row-name ${errors.name ? 'invalid' : ''}`}>
              <label className="ios-label" htmlFor="card-name">Cardholder</label>
              <input
                type="text"
                id="card-name"
                name="name"
                className="ios-input card-name-input"
                placeholder="Full Name"
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="cc-name"
                required
              />
            </div>
          </div>

          {(paymentError || errors.number || errors.expiry || errors.cvc || errors.name) && (
            <div className="error-text validation-error-msg" style={{ display: 'block' }}>
              {paymentError || 'Please correct the invalid fields above.'}
            </div>
          )}

          <button
            type="submit"
            className={`pay-btn submit-btn ${isSuccess ? 'success' : ''}`}
            disabled={isTokenizing || isProcessing || isSuccess}
            style={{ marginTop: '28px' }}
          >
            {isTokenizing && <div className="spinner btn-spinner" style={{ display: 'block' }} />}
            {isProcessing && <div className="spinner btn-spinner" style={{ display: 'block' }} />}
            
            <span className="btn-text">
              {isSuccess ? (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ verticalAlign: 'middle', marginRight: '4px' }}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Payment Success!
                </>
              ) : isTokenizing ? (
                'Tokenizing card...'
              ) : isProcessing ? (
                'Processing Payment...'
              ) : (
                submitButtonText
              )}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
