import React from 'react';
import { CardFormPreset, OptionalCardField } from '../../core/domain/card';
import type { CardBrand } from '../../core/domain/brand';
import {
  FIELD_METADATA,
  getFieldDisplayText,
  resolveActiveFields,
} from '../../core/domain/optional-fields';
import { CARD_FORM_TEXT_EN } from '../../lang/en';
import { CountryAutocomplete } from '../country-autocomplete';
import { CardFormValues } from '../useCardForm';
import { CardNumberInput } from './card-number-input';
import { ExpiryInput } from './expiry-input';
import { CvcInput } from './cvc-input';

export interface FormFieldsGroupProps {
  values: CardFormValues;
  errors: Record<string, string | null>;
  brand: CardBrand;
  preset: CardFormPreset;
  optionalFields: OptionalCardField[];
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  setFieldValue: (name: keyof CardFormValues, value: string) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleCvcFocus: () => void;
  className?: string;
  headerLabel?: string;
}

export function FormFieldsGroup({
  values,
  errors,
  brand,
  preset,
  optionalFields,
  handleChange,
  setFieldValue,
  handleBlur,
  handleCvcFocus,
  className = '',
  headerLabel,
}: Readonly<FormFieldsGroupProps>) {
  const activeFields = resolveActiveFields(preset, optionalFields);

  return (
    <div className={`payment-form-section ${className}`}>
      {headerLabel && (
        <h3 className="form-section-header">{headerLabel}</h3>
      )}
      <div className="ios-grouped-list">
        {/* Card Number */}
        <CardNumberInput
          value={values.number}
          error={errors.number}
          onChange={handleChange}
          onBlur={handleBlur}
        />

        {/* Expiry & CVC side by side */}
        <div className="ios-input-row-half">
          <ExpiryInput
            value={values.expiry}
            error={errors.expiry}
            onChange={handleChange}
            onBlur={handleBlur}
          />
          <CvcInput
            value={values.cvc}
            error={errors.cvc}
            onChange={handleChange}
            onBlur={handleBlur}
            onFocus={handleCvcFocus}
            maxLength={brand === 'amex' ? 4 : 3}
          />
        </div>

        {/* Optional Fields */}
        {activeFields.map((field) => {
          const meta = FIELD_METADATA[field];
          if (!meta) return null;

          const { label, placeholder } = getFieldDisplayText(field, preset);

          if (field === 'country') {
            return (
              <div
                key={field}
                className={`ios-input-row row-${field} ${errors[field] ? 'invalid' : ''}`}
              >
                <label className="ios-label" htmlFor={`card-${field}`}>
                  {label}
                </label>
                <div className="country-autocomplete-container" style={{ flexGrow: 1 }}>
                  <CountryAutocomplete
                    id={`card-${field}`}
                    value={values[field as keyof typeof values] as string}
                    onChange={(countryCode) => {
                      setFieldValue('country', countryCode);
                    }}
                    placeholder={placeholder}
                    searchPlaceholder="Search countries..."
                    className=""
                  />
                </div>
              </div>
            );
          }

          return (
            <div
              key={field}
              className={`ios-input-row row-${field} ${errors[field] ? 'invalid' : ''}`}
            >
              <label className="ios-label" htmlFor={`card-${field}`}>
                {label}
              </label>
              <input
                type={meta.type}
                id={`card-${field}`}
                name={field}
                className="ios-input"
                placeholder={placeholder}
                value={values[field as keyof typeof values] || ''}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete={meta.autocomplete}
                required={field !== 'addressLine2'}
              />
            </div>
          );
        })}

        {/* Cardholder Name */}
        <div className={`ios-input-row row-name ${errors.name ? 'invalid' : ''}`}>
          <label className="ios-label" htmlFor="card-name">
            {CARD_FORM_TEXT_EN.cardholder}
          </label>
          <input
            type="text"
            id="card-name"
            name="name"
            className="ios-input card-name-input"
            placeholder={CARD_FORM_TEXT_EN.cardholderPlaceholder}
            value={values.name}
            onChange={handleChange}
            onBlur={handleBlur}
            autoComplete="cc-name"
            required
          />
        </div>
      </div>
    </div>
  );
}