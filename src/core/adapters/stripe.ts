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
    const rawExpYear = card.expYear.replace(/\D/g, '');
    let expYear = rawExpYear;
    // Map 2-digit years to 4-digit years for Stripe if needed
    if (rawExpYear.length === 2) {
      expYear = '20' + rawExpYear;
    }

    const payload: Record<string, string> = {
      'card[number]': card.number.replace(/\D/g, ''),
      'card[exp_month]': card.expMonth.replace(/\D/g, ''),
      'card[exp_year]': expYear,
      'card[cvc]': card.cvc.replace(/\D/g, ''),
      'card[name]': card.name.trim(),
    };

    // Optional Billing details mapping
    if (card.addressLine1)
      payload['card[address_line1]'] = card.addressLine1.trim();
    if (card.addressLine2)
      payload['card[address_line2]'] = card.addressLine2.trim();
    if (card.city) payload['card[address_city]'] = card.city.trim();
    if (card.state) payload['card[address_state]'] = card.state.trim();
    if (card.postalCode) payload['card[address_zip]'] = card.postalCode.trim();
    if (card.country) payload['card[address_country]'] = card.country.trim();

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
