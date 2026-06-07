import { Card, PaymentGateway, Token } from '../domain/card';
import {
  ApiValidationError,
  NetworkError,
  PaymentGatewayError,
  toFormUrlEncoded,
} from './base';

export interface StripeAdapterOptions {
  publicKey: string;
}

// Maximum allowed lengths for card data fields
const MAX_CARD_NUMBER_LENGTH = 19;
const MAX_CVC_LENGTH = 4;
const MAX_NAME_LENGTH = 100;
const MAX_ADDRESS_LINE_LENGTH = 200;
const MAX_CITY_LENGTH = 100;
const MAX_STATE_LENGTH = 100;
const MAX_POSTAL_CODE_LENGTH = 20;
const MAX_COUNTRY_LENGTH = 3;

// Sanitize input: remove dangerous characters that could be used for injection
function sanitizeInput(value: string): string {
  // Remove null bytes and other dangerous control characters
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

export class StripeAdapter implements PaymentGateway {
  public readonly name = 'Stripe';
  private readonly publicKey: string;

  constructor(options: StripeAdapterOptions) {
    if (!options.publicKey) {
      throw new Error('Stripe public key is required.');
    }
    this.publicKey = options.publicKey;
  }

  async tokenize(card: Card): Promise<Token> {
    // Sanitize and validate card number
    const cleanNumber = card.number.replace(/\D/g, '').slice(0, MAX_CARD_NUMBER_LENGTH);
    
    // Sanitize and validate expiry
    const rawExpYear = card.expYear.replace(/\D/g, '').slice(0, 4);
    let expYear = rawExpYear;
    // Map 2-digit years to 4-digit years for Stripe if needed
    if (rawExpYear.length === 2) {
      expYear = '20' + rawExpYear;
    }

    const payload: Record<string, string> = {
      'card[number]': cleanNumber,
      'card[exp_month]': card.expMonth.replace(/\D/g, '').slice(0, 2),
      'card[exp_year]': expYear,
      'card[cvc]': card.cvc.replace(/\D/g, '').slice(0, MAX_CVC_LENGTH),
      'card[name]': card.name.trim().slice(0, MAX_NAME_LENGTH),
    };

    // Optional Billing details mapping with length limits
    if (card.addressLine1)
      payload['card[address_line1]'] = sanitizeInput(card.addressLine1).trim().slice(0, MAX_ADDRESS_LINE_LENGTH);
    if (card.addressLine2)
      payload['card[address_line2]'] = sanitizeInput(card.addressLine2).trim().slice(0, MAX_ADDRESS_LINE_LENGTH);
    if (card.city)
      payload['card[address_city]'] = sanitizeInput(card.city).trim().slice(0, MAX_CITY_LENGTH);
    if (card.state)
      payload['card[address_state]'] = sanitizeInput(card.state).trim().slice(0, MAX_STATE_LENGTH);
    if (card.postalCode)
      payload['card[address_zip]'] = sanitizeInput(card.postalCode).trim().slice(0, MAX_POSTAL_CODE_LENGTH);
    if (card.country)
      payload['card[address_country]'] = sanitizeInput(card.country).trim().toUpperCase().slice(0, MAX_COUNTRY_LENGTH);

    try {
      const response = await fetch('https://api.stripe.com/v1/tokens', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.publicKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: toFormUrlEncoded(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg =
          data.error?.message || 'Tokenization failed via Stripe API.';
        const errorCode = data.error?.code || 'tokenization_failed';
        throw new ApiValidationError(errorMsg, errorCode, data);
      }

      return {
        id: data.id,
        gateway: 'stripe',
        raw: data,
      };
    } catch (error) {
      if (error instanceof PaymentGatewayError) {
        throw error;
      }
      throw new NetworkError(
        error instanceof Error
          ? error.message
          : 'Network connection to Stripe failed.',
        error,
      );
    }
  }
}
