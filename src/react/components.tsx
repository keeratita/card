import React from 'react';
import {
  CardFormPreset,
  OptionalCardField,
  PaymentGateway,
  Token,
} from '../core/domain/card';
import {
  FIELD_METADATA,
  getFieldDisplayText,
  resolveActiveFields,
} from '../core/domain/optional-fields';
import { getCardLogoSvg } from '../core/domain/card-brand-logos';
import { CARD_FORM_TEXT_EN } from '../lang/en';
import { useCardForm, CardFormValues } from './useCardForm';

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
  cardLabel,
}: CreditCardPreviewProps) {
  return (
    <div className='card-perspective'>
      <div
        className={`card-inner credit-card-element ${isFlipped ? 'flipped' : ''}`}
      >
        {/* Front of Card */}
        <div className='card-front'>
          <div className='card-header'>
            <div className='card-chip' />
            <div className='card-type-label card-gateway-label'>
              {cardLabel}
            </div>
          </div>
          <div className='card-number-display card-num-preview'>
            {number || CARD_FORM_TEXT_EN.cardNumberPlaceholder}
          </div>
          <div className='card-footer'>
            <div className='card-meta-block'>
              <span className='card-meta-label'>
                {CARD_FORM_TEXT_EN.cardholder}
              </span>
              <span className='card-meta-value card-holder-preview'>
                {name.toUpperCase() ||
                  CARD_FORM_TEXT_EN.cardholderPreviewFallback}
              </span>
            </div>
            <div className='card-meta-block'>
              <span className='card-meta-label'>
                {CARD_FORM_TEXT_EN.expires}
              </span>
              <span className='card-meta-value card-expiry-preview'>
                {expiry || CARD_FORM_TEXT_EN.expiryPlaceholder}
              </span>
            </div>
            <div
              className='brand-logo card-brand-logo'
              dangerouslySetInnerHTML={{ __html: getCardLogoSvg(brand) }}
            />
          </div>
        </div>

        {/* Back of Card */}
        <div className='card-back'>
          <div className='card-magnetic-strip' />
          <div className='card-signature-area'>
            <span className='card-meta-label' style={{ marginLeft: '4px' }}>
              {CARD_FORM_TEXT_EN.securityCode}
            </span>
            <div className='card-signature-strip'>
              <div className='card-cvc-display card-cvc-preview'>
                {'•'.repeat(cvc.length) || CARD_FORM_TEXT_EN.cvcPlaceholder}
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
  submitButtonText = CARD_FORM_TEXT_EN.submitDefault,
  onSubmit,
  onError,
  initialValues,
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
    handleSubmit,
  } = useCardForm({
    adapter,
    onSubmit,
    onError,
    initialValues,
  });

  const activeFields = resolveActiveFields(preset, fields);
  const cardLabelText = cardLabel || adapter.name.toUpperCase();

  return (
    <div className='kg-card-container'>
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
        <h3 className='form-section-header'>
          {CARD_FORM_TEXT_EN.paymentMethod}
        </h3>
        <form onSubmit={handleSubmit} className='payment-form-el'>
          <div className='ios-grouped-list'>
            {/* Card Number Row */}
            <div
              className={`ios-input-row row-number ${errors.number ? 'invalid' : ''}`}
            >
              <label className='ios-label' htmlFor='card-number'>
                {CARD_FORM_TEXT_EN.cardNumber}
              </label>
              <input
                type='text'
                id='card-number'
                name='number'
                className='ios-input card-number-input'
                placeholder={CARD_FORM_TEXT_EN.cardNumberPlaceholder}
                value={values.number}
                onChange={handleChange}
                onBlur={handleBlur}
                inputMode='numeric'
                autoComplete='cc-number'
                required
              />
            </div>

            {/* Expiry & CVC wrapper */}
            <div className='ios-input-row-half'>
              <div
                className={`ios-input-row row-expiry ${errors.expiry ? 'invalid' : ''}`}
              >
                <label
                  className='ios-label'
                  htmlFor='card-expiry'
                  style={{ width: '55px' }}
                >
                  {CARD_FORM_TEXT_EN.expires}
                </label>
                <input
                  type='text'
                  id='card-expiry'
                  name='expiry'
                  className='ios-input card-expiry-input'
                  placeholder={CARD_FORM_TEXT_EN.expiryPlaceholder}
                  value={values.expiry}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  inputMode='numeric'
                  autoComplete='cc-exp'
                  required
                />
              </div>

              <div
                className={`ios-input-row row-cvc ${errors.cvc ? 'invalid' : ''}`}
              >
                <label
                  className='ios-label'
                  htmlFor='card-cvc'
                  style={{ width: '50px' }}
                >
                  {CARD_FORM_TEXT_EN.cvc}
                </label>
                <input
                  type='password'
                  id='card-cvc'
                  name='cvc'
                  className='ios-input card-cvc-input'
                  placeholder={CARD_FORM_TEXT_EN.cvcPlaceholder}
                  value={values.cvc}
                  onChange={handleChange}
                  onFocus={handleCvcFocus}
                  onBlur={(e) => {
                    handleBlur(e);
                    handleCvcBlur();
                  }}
                  maxLength={4}
                  inputMode='numeric'
                  autoComplete='cc-csc'
                  required
                />
              </div>
            </div>

            {/* Render Optional Fields dynamically */}
            {activeFields.map((field) => {
              const meta = FIELD_METADATA[field];
              if (!meta) return null;

              const { label, placeholder } = getFieldDisplayText(field, preset);

              return (
                <div
                  key={field}
                  className={`ios-input-row row-${field} ${errors[field] ? 'invalid' : ''}`}
                >
                  <label className='ios-label' htmlFor={`card-${field}`}>
                    {label}
                  </label>
                  <input
                    type={meta.type}
                    id={`card-${field}`}
                    name={field}
                    className='ios-input'
                    placeholder={placeholder}
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
            <div
              className={`ios-input-row row-name ${errors.name ? 'invalid' : ''}`}
            >
              <label className='ios-label' htmlFor='card-name'>
                {CARD_FORM_TEXT_EN.cardholder}
              </label>
              <input
                type='text'
                id='card-name'
                name='name'
                className='ios-input card-name-input'
                placeholder={CARD_FORM_TEXT_EN.cardholderPlaceholder}
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete='cc-name'
                required
              />
            </div>
          </div>

          {(paymentError ||
            errors.number ||
            errors.expiry ||
            errors.cvc ||
            errors.name) && (
            <div
              className='error-text validation-error-msg'
              style={{ display: 'block' }}
            >
              {paymentError || CARD_FORM_TEXT_EN.validationError}
            </div>
          )}

          <button
            type='submit'
            className={`pay-btn submit-btn ${isSuccess ? 'success' : ''}`}
            disabled={isTokenizing || isProcessing || isSuccess}
            style={{ marginTop: '28px' }}
          >
            {isTokenizing && (
              <div
                className='spinner btn-spinner'
                style={{ display: 'block' }}
              />
            )}
            {isProcessing && (
              <div
                className='spinner btn-spinner'
                style={{ display: 'block' }}
              />
            )}

            <span className='btn-text'>
              {isSuccess ? (
                <>
                  <svg
                    width='18'
                    height='18'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='3'
                    style={{ verticalAlign: 'middle', marginRight: '4px' }}
                  >
                    <polyline points='20 6 9 17 4 12' />
                  </svg>
                  {CARD_FORM_TEXT_EN.paymentSuccess}
                </>
              ) : isTokenizing ? (
                CARD_FORM_TEXT_EN.tokenizing
              ) : isProcessing ? (
                CARD_FORM_TEXT_EN.processing
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
