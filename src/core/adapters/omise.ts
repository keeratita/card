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
    const rawExpYear = card.expYear.replace(/\D/g, '');
    let expYear = rawExpYear;
    // Map 2-digit years to 4-digit years for Omise if needed
    if (rawExpYear.length === 2) {
      expYear = '20' + rawExpYear;
    }

    const payload: Record<string, string> = {
      'card[number]': card.number.replace(/\D/g, ''),
      'card[expiration_month]': card.expMonth.replace(/\D/g, ''),
      'card[expiration_year]': expYear,
      'card[security_code]': card.cvc.replace(/\D/g, ''),
      'card[name]': card.name.trim(),
    };

    // Optional Billing details mapping
    if (card.addressLine1) payload['card[street1]'] = card.addressLine1.trim();
    if (card.addressLine2) payload['card[street2]'] = card.addressLine2.trim();
    if (card.city) payload['card[city]'] = card.city.trim();
    if (card.state) payload['card[state]'] = card.state.trim();
    if (card.postalCode) payload['card[postal_code]'] = card.postalCode.trim();
    if (card.country) payload['card[country]'] = card.country.trim();
    if (card.phone) payload['card[phone_number]'] = card.phone.trim();
    if (card.email) payload['card[email]'] = card.email.trim();

    try {
      // Basic Authentication where username is public key and password is empty
      const basicAuth = btoa(`${this.publicKey}:`);

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
