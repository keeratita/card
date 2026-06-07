import { Card, PaymentGateway, Token } from '../domain/card';
import {
  ApiValidationError,
  NetworkError,
  PaymentGatewayError,
  toFormUrlEncoded,
} from './base';

export interface OmiseAdapterOptions {
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
const MAX_PHONE_LENGTH = 20;
const MAX_EMAIL_LENGTH = 254;

// Sanitize input: remove dangerous characters that could be used for injection
function sanitizeInput(value: string): string {
  // Remove null bytes and other dangerous control characters
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '');
}

// Base64 encoding using standard browser API (btoa)
// This library targets browser environments where btoa is available
function base64Encode(str: string): string {
  if (typeof btoa !== 'undefined') {
    return btoa(str);
  }
  throw new Error(
    'Base64 encoding not supported in this environment. Please use a browser environment.',
  );
}

export class OmiseAdapter implements PaymentGateway {
  public readonly name = 'Omise';
  private readonly publicKey: string;

  constructor(options: OmiseAdapterOptions) {
    if (!options.publicKey) {
      throw new Error('Omise public key is required.');
    }
    this.publicKey = options.publicKey;
  }

  async tokenize(card: Card): Promise<Token> {
    // Sanitize and validate card number
    const cleanNumber = card.number
      .replace(/\D/g, '')
      .slice(0, MAX_CARD_NUMBER_LENGTH);

    // Sanitize and validate expiry
    const rawExpYear = card.expYear.replace(/\D/g, '').slice(0, 4);
    let expYear = rawExpYear;
    // Map 2-digit years to 4-digit years for Omise if needed
    if (rawExpYear.length === 2) {
      expYear = '20' + rawExpYear;
    }

    const payload: Record<string, string> = {
      'card[number]': cleanNumber,
      'card[expiration_month]': card.expMonth.replace(/\D/g, '').slice(0, 2),
      'card[expiration_year]': expYear,
      'card[security_code]': card.cvc
        .replace(/\D/g, '')
        .slice(0, MAX_CVC_LENGTH),
      'card[name]': card.name.trim().slice(0, MAX_NAME_LENGTH),
    };

    // Optional Billing details mapping with length limits
    if (card.addressLine1)
      payload['card[street1]'] = sanitizeInput(card.addressLine1)
        .trim()
        .slice(0, MAX_ADDRESS_LINE_LENGTH);
    if (card.addressLine2)
      payload['card[street2]'] = sanitizeInput(card.addressLine2)
        .trim()
        .slice(0, MAX_ADDRESS_LINE_LENGTH);
    if (card.city)
      payload['card[city]'] = sanitizeInput(card.city)
        .trim()
        .slice(0, MAX_CITY_LENGTH);
    if (card.state)
      payload['card[state]'] = sanitizeInput(card.state)
        .trim()
        .slice(0, MAX_STATE_LENGTH);
    if (card.postalCode)
      payload['card[postal_code]'] = sanitizeInput(card.postalCode)
        .trim()
        .slice(0, MAX_POSTAL_CODE_LENGTH);
    if (card.country)
      payload['card[country]'] = sanitizeInput(card.country)
        .trim()
        .toUpperCase()
        .slice(0, MAX_COUNTRY_LENGTH);
    if (card.phone)
      payload['card[phone_number]'] = sanitizeInput(card.phone)
        .trim()
        .slice(0, MAX_PHONE_LENGTH);
    if (card.email)
      payload['card[email]'] = sanitizeInput(card.email)
        .trim()
        .toLowerCase()
        .slice(0, MAX_EMAIL_LENGTH);

    try {
      // Basic Authentication where username is public key and password is empty
      const basicAuth = base64Encode(`${this.publicKey}:`);

      const response = await fetch('https://vault.omise.co/tokens', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: toFormUrlEncoded(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        const errorMsg = data.message || 'Tokenization failed via Omise API.';
        const errorCode = data.code || 'tokenization_failed';
        throw new ApiValidationError(errorMsg, errorCode, data);
      }

      return {
        id: data.id,
        gateway: 'omise',
        raw: data,
      };
    } catch (error) {
      if (error instanceof PaymentGatewayError) {
        throw error;
      }
      throw new NetworkError(
        error instanceof Error
          ? error.message
          : 'Network connection to Omise failed.',
        error,
      );
    }
  }
}
