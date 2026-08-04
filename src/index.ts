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

// Utility
export { cleanDigits } from './core/formatters/card-formatter';

// Shared form logic (framework-agnostic)
export {
  validateField,
  getFieldErrorMessage,
  parseExpiry,
  buildCard,
  getCardNumberMaxLength,
  restoreCaret,
  maskSensitiveValue,
  filterCountries,
  moveHighlight,
  findCountryByCode,
  buildSuccessSummary,
} from './core/form';
export type {
  CardFieldName,
  ValidateFieldContext,
  FieldValidationResult,
  ParsedExpiry,
  CardFormValuesLike,
  SuccessSummaryItem,
} from './core/form';

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
