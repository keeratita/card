import React from 'react';
import {
  CardFormPreset,
  OptionalCardField,
  PaymentGateway,
  Token,
} from '../../core/domain/card';
import { CARD_FORM_TEXT_EN } from '../../lang/en';
import { useCardForm, CardFormValues } from '../useCardForm';
import { CreditCardPreview } from './card-preview';
import { FormFieldsGroup } from './form-fields-group';
import { SubmitButton } from './submit-button';

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

      {/* Form Fields */}
      <form onSubmit={handleSubmit} className='payment-form-el'>
        <div>
          <FormFieldsGroup
            values={values}
            errors={errors}
            brand={brand}
            preset={preset}
            optionalFields={fields}
            handleChange={handleChange}
            handleBlur={handleBlur}
            handleCvcFocus={handleCvcFocus}
            handleCvcBlur={handleCvcBlur}
            headerLabel={CARD_FORM_TEXT_EN.paymentMethod}
          />

          {/* Error Messages */}
          {(paymentError || errors.number || errors.expiry || errors.cvc || errors.name) && (
            <div
              className='error-text validation-error-msg'
              style={{ display: 'block' }}
            >
              {paymentError || CARD_FORM_TEXT_EN.validationError}
            </div>
          )}

          {/* Submit Button */}
          <SubmitButton
            isSubmitting={isTokenizing || isProcessing}
            isSuccess={isSuccess}
            isTokenizing={isTokenizing}
            text={submitButtonText}
            style={{ marginTop: '28px' }}
          />
        </div>
      </form>
    </div>
  );
}