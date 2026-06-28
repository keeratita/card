import { Card, PaymentGateway, Token } from '../domain/card';
import {
  ApiValidationError,
  NetworkError,
  PaymentGatewayError,
  toFormUrlEncoded,
  enforceHttps,
  fetchWithTimeout,
  normalizeNetworkError,
} from './base';
import { sanitizeInput } from '../security';
import { validateCardFieldsStrict } from './validate-card';
import { validateEmail, validatePhone } from '../domain/validation';
import {
  MAX_CVC_LENGTH,
  MAX_NAME_LENGTH,
  MAX_ADDRESS_LINE_LENGTH,
  MAX_CITY_LENGTH,
  MAX_STATE_LENGTH,
  MAX_POSTAL_CODE_LENGTH,
  MAX_COUNTRY_LENGTH,
  MAX_PHONE_LENGTH,
  MAX_EMAIL_LENGTH,
  PACKAGE_VERSION,
} from '../constants';

export interface OmiseAdapterOptions {
  publicKey: string;
}

function base64Encode(str: string): string {
  if (typeof btoa !== 'undefined') {
    return btoa(str);
  }
  throw new Error(
    'Base64 encoding not supported in this environment. Please use a browser environment.',
  );
}

function cleanDigits(value: string): string {
  return value.replace(/\D/g, '');
}

function normalizeAddress(value: string, maxLength: number): string {
  return sanitizeInput(value).trim().slice(0, maxLength);
}

function buildOmisePayload(
  card: Card,
  publicKey: string,
): { body: string; auth: string } {
  const cleanYear = cleanDigits(card.expYear);
  const expYear = cleanYear.length === 2 ? '20' + cleanYear : cleanYear;

  const payload: Record<string, string> = {
    'card[number]': cleanDigits(card.number),
    'card[expiration_month]': cleanDigits(card.expMonth).slice(0, 2),
    'card[expiration_year]': expYear,
    'card[security_code]': cleanDigits(card.cvc).slice(0, MAX_CVC_LENGTH),
    'card[name]': card.name.trim().slice(0, MAX_NAME_LENGTH),
  };

  if (card.addressLine1)
    payload['card[street1]'] = normalizeAddress(
      card.addressLine1,
      MAX_ADDRESS_LINE_LENGTH,
    );
  if (card.addressLine2)
    payload['card[street2]'] = normalizeAddress(
      card.addressLine2,
      MAX_ADDRESS_LINE_LENGTH,
    );
  if (card.city)
    payload['card[city]'] = normalizeAddress(card.city, MAX_CITY_LENGTH);
  if (card.state)
    payload['card[state]'] = normalizeAddress(card.state, MAX_STATE_LENGTH);
  if (card.postalCode)
    payload['card[postal_code]'] = normalizeAddress(
      card.postalCode,
      MAX_POSTAL_CODE_LENGTH,
    );
  if (card.country)
    payload['card[country]'] = sanitizeInput(card.country)
      .trim()
      .toUpperCase()
      .slice(0, MAX_COUNTRY_LENGTH);
  if (card.phone)
    payload['card[phone_number]'] = normalizeAddress(
      card.phone,
      MAX_PHONE_LENGTH,
    );
  if (card.email)
    payload['card[email]'] = sanitizeInput(card.email)
      .trim()
      .toLowerCase()
      .slice(0, MAX_EMAIL_LENGTH);

  const credential = publicKey + ':';
  return {
    body: toFormUrlEncoded(payload),
    auth: 'Basic ' + base64Encode(credential),
  };
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
    enforceHttps();
    validateCardFieldsStrict(card);

    if (card.email && !validateEmail(card.email)) {
      throw new ApiValidationError(
        'Invalid email address.',
        'invalid_email',
        card,
      );
    }
    if (card.phone && !validatePhone(card.phone)) {
      throw new ApiValidationError(
        'Invalid phone number.',
        'invalid_phone',
        card,
      );
    }

    const { body, auth } = buildOmisePayload(card, this.publicKey);

    try {
      const response = await fetchWithTimeout('https://vault.omise.co/tokens', {
        method: 'POST',
        headers: {
          Authorization: auth,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': `@keeratita/card/${PACKAGE_VERSION}`,
        },
        body,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new ApiValidationError(
          data.message || 'Tokenization failed via Omise API.',
          data.code || 'tokenization_failed',
          data,
        );
      }

      return { id: data.id, gateway: 'omise', raw: data };
    } catch (error) {
      if (error instanceof PaymentGatewayError) throw error;
      throw new NetworkError(normalizeNetworkError(error).message, error);
    }
  }
}
