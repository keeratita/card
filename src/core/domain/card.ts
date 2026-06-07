import { Token } from './token';
export type { Token };

export interface Card {
  number: string;
  expMonth: string; // MM format (e.g. "12")
  expYear: string; // YY or YYYY format (e.g. "28" or "2028")
  cvc: string; // CVC/CVV code
  name: string; // Cardholder name
  // Billing details
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string; // 2-letter ISO country code
  phone?: string;
  email?: string;
}

export type OptionalCardField =
  | 'addressLine1'
  | 'addressLine2'
  | 'city'
  | 'state'
  | 'postalCode'
  | 'country'
  | 'phone'
  | 'email';

export type CardFormPreset = 'none' | 'us' | 'billing' | 'contact';

export interface PaymentGateway {
  name: string; // "Stripe" or "Omise"
  tokenize(card: Card): Promise<Token>;
}

export interface CardFormOptions {
  adapter: PaymentGateway;
  preset?: CardFormPreset;
  fields?: OptionalCardField[];
  cardLabel?: string;
  submitButtonText?: string;
  onSubmit?: (data: { token: Token }) => Promise<void> | void;
  onError?: (error: Error) => void;
}
