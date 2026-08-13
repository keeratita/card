import { OptionalCardField } from '../core/domain/card';

export const OPTIONAL_FIELD_TEXT_EN: Record<
  OptionalCardField,
  { label: string; placeholder: string }
> = {
  addressLine1: {
    label: 'Address',
    placeholder: 'Street address',
  },
  addressLine2: {
    label: 'Apt, Suite',
    placeholder: 'Apt, Suite, Unit (optional)',
  },
  city: {
    label: 'City',
    placeholder: 'City',
  },
  state: {
    label: 'State',
    placeholder: 'State or Province',
  },
  postalCode: {
    label: 'Postal Code',
    placeholder: 'Postal/ZIP Code',
  },
  country: {
    label: 'Country',
    placeholder: 'Country Code (e.g. US, TH)',
  },
  phone: {
    label: 'Phone',
    placeholder: '+668 1234 567',
  },
  email: {
    label: 'Email',
    placeholder: 'name@example.com',
  },
};

export const CARD_FORM_TEXT_EN = {
  submitDefault: 'Pay Now',
  paymentMethod: 'Payment Method',
  cardNumber: 'Card Number',
  cardNumberPlaceholder: '•••• •••• •••• ••••',
  expires: 'Expires',
  expiryPlaceholder: 'MM / YY',
  cvc: 'CVC',
  cvcPlaceholder: '•••',
  cardholder: 'Cardholder',
  cardholderPlaceholder: 'Full Name',
  securityCode: 'Security Code',
  cardholderPreviewFallback: 'CARDHOLDER NAME',
  validationError: 'Please correct the invalid fields above.',
  tokenizing: 'Tokenizing card...',
  processing: 'Processing Payment...',
  paymentSuccess: 'Payment Success!',
  tokenizedSuccessfully: 'Tokenized Successfully',
  paymentFailed: 'Payment processing failed. Please try again.',
  zipCode: 'ZIP Code',
  zipCodePlaceholder: '12345',
  gateway: 'Gateway',
  cardBrand: 'Card Brand',
  tokenId: 'Token ID',
  searchCountries: 'Search countries...',
  invalidCardNumber: 'Invalid card number.',
  invalidExpiry: 'Invalid or expired date.',
  invalidCvc: 'Invalid security code.',
  invalidName: 'Enter the cardholder name.',
  invalidEmail: 'Enter a valid email.',
  invalidPhone: 'Enter a valid phone number.',
  invalidPostalCode: 'Enter a valid postal code.',
  invalidCountry: 'Select a country.',
  invalidField: 'This field is required.',
} as const;
