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
import {
  MAX_CARD_NUMBER_LENGTH,
  MAX_CVC_LENGTH,
  MAX_NAME_LENGTH,
  MAX_ADDRESS_LINE_LENGTH,
  MAX_CITY_LENGTH,
  MAX_STATE_LENGTH,
  MAX_POSTAL_CODE_LENGTH,
  MAX_COUNTRY_LENGTH,
  PACKAGE_VERSION,
} from '../constants';

export interface StripeAdapterOptions {
  /**
   * The Stripe API key.
   *
   * Note: When calling the Stripe Tokens API directly from the browser,
   * you use a public key (`pk_test_...` or `pk_live_...`). Never
   * expose your secret API key (`sk_...`) in client-side code.
   */
  publicKey: string;
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
    enforceHttps();

    validateCardFieldsStrict(card);

    const cleanNumber = card.number.replace(/\D/g, '').slice(0, MAX_CARD_NUMBER_LENGTH);

    const cleanExp = card.expYear.replace(/\D/g, '').slice(0, 4);
    let expYear = cleanExp;
    if (cleanExp.length === 2) {
      expYear = '20' + cleanExp;
    }

    const payload: Record<string, string> = {
      'card[number]': cleanNumber,
      'card[exp_month]': card.expMonth.replace(/\D/g, '').slice(0, 2),
      'card[exp_year]': expYear,
      'card[cvc]': card.cvc.replace(/\D/g, '').slice(0, MAX_CVC_LENGTH),
      'card[name]': card.name.trim().slice(0, MAX_NAME_LENGTH),
    };

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
      const response = await fetchWithTimeout('https://api.stripe.com/v1/tokens', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.publicKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': `@keeratita/card/${PACKAGE_VERSION}`,
        },
        body: toFormUrlEncoded(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new ApiValidationError(
          data.error?.message || 'Tokenization failed via Stripe API.',
          data.error?.code || 'tokenization_failed',
          data,
        );
      }

      return { id: data.id, gateway: 'stripe', raw: data };
    } catch (error) {
      if (error instanceof PaymentGatewayError) throw error;
      throw new NetworkError(
        normalizeNetworkError(error).message,
        error,
      );
    }
  }
}