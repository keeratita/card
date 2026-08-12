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
}: Readonly<CardFormProps>) {
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
    setFieldValue,
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
      <form
        onSubmit={handleSubmit}
        className='payment-form-el'
        noValidate
        aria-busy={isTokenizing || isProcessing}
      >
        <div>
          <FormFieldsGroup
            values={values}
            errors={errors}
            brand={brand}
            preset={preset}
            optionalFields={fields}
            handleChange={handleChange}
            setFieldValue={setFieldValue}
            handleBlur={handleBlur}
            handleCvcFocus={handleCvcFocus}
            handleCvcBlur={handleCvcBlur}
            headerLabel={CARD_FORM_TEXT_EN.paymentMethod}
          />

          {/* Error Messages */}
          {(paymentError || errors.number || errors.expiry || errors.cvc || errors.name) && (
            <div
              className='error-text validation-error-msg'
              role='alert'
              aria-live='assertive'
            >
              {paymentError || CARD_FORM_TEXT_EN.validationError}
            </div>
          )}

          {/* Submit Button */}
          <SubmitButton
            isSubmitting={isTokenizing || isProcessing}
            tokenizing={isTokenizing}
            isSuccess={isSuccess}
            text={!isTokenizing && !isProcessing ? submitButtonText : undefined}
            className="card-form-submit"
          />
        </div>
      </form>
    </div>
  );
}