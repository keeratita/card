// Public API contracts, domain validation, formatters, and adapters.
// No AI identity exists in this file.

// Domain Core
export type {
  Card,
  OptionalCardField,
  CardFormPreset,
  PaymentGateway,
  CardFormOptions,
} from './core/domain/card';
export type { Token } from './core/domain/token';
export type { CardBrand } from './core/domain/brand';
export { detectCardBrand } from './core/domain/brand';

// Domain Validation
export {
  luhnCheck,
  validateExpiry,
  validateCvc,
  validateName,
  validateEmail,
  validatePhone,
  validatePostalCode,
  validateCountry,
  validateGeneric,
} from './core/domain/validation';

// Input Formatters
export {
  cleanDigits,
  formatCardNumber,
  formatExpiry,
  formatCvc,
  formatCountryCode,
  formatPhone,
} from './core/formatters/card-formatter';

// REST Gateway Adapters
export {
  PaymentGatewayError,
  NetworkError,
  ApiValidationError,
} from './core/adapters/base';
export { StripeAdapter } from './core/adapters/stripe';
export type { StripeAdapterOptions } from './core/adapters/stripe';
export { OmiseAdapter } from './core/adapters/omise';
export type { OmiseAdapterOptions } from './core/adapters/omise';
