// Public API contracts, domain validation, formatters, adapters, and security utilities.

// Security
export { sanitizeInput } from './core/security';
export { escapeHtml } from './core/security';

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
  validateCardNumber,
} from './core/domain/validation';

// Input Formatters
export {
  formatCardNumber,
  formatExpiry,
  formatCvc,
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

// Country Data
export {
  COUNTRIES,
  getCountryByCode,
  getAllCountryCodes,
  isValidCountryCode,
} from './data/countries';
export type { Country } from './data/countries';
