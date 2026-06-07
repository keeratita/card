import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { StripeAdapter } from '../../src/core/adapters/stripe';
import { OmiseAdapter } from '../../src/core/adapters/omise';
import { Card } from '../../src/core/domain/card';
import { ApiValidationError, NetworkError } from '../../src/core/adapters/base';

describe('Payment Gateway Adapters', () => {
  const card: Card = {
    number: '4111 1111 1111 1111',
    expMonth: '12',
    expYear: '28',
    cvc: '123',
    name: 'John Doe',
    addressLine1: '123 Main St',
    city: 'New York',
    state: 'NY',
    postalCode: '10001',
    country: 'US',
    phone: '+15555555555',
    email: 'john@example.com'
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('StripeAdapter', () => {
    const adapter = new StripeAdapter({ publicKey: 'pk_test_stripe_key' });

    it('should require a Stripe public key', () => {
      expect(() => new StripeAdapter({ publicKey: '' })).toThrow('Stripe public key is required.');
    });

    it('should correctly format request body and headers for Stripe API', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'tok_test_123', object: 'token' })
      });
      vi.stubGlobal('fetch', fetchMock);

      const token = await adapter.tokenize(card);

      expect(token.id).toBe('tok_test_123');
      expect(token.gateway).toBe('stripe');

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, requestInit] = fetchMock.mock.calls[0];
      expect(url).toBe('https://api.stripe.com/v1/tokens');
      expect(requestInit.method).toBe('POST');
      expect(requestInit.headers['Authorization']).toBe('Bearer pk_test_stripe_key');
      expect(requestInit.headers['Content-Type']).toBe('application/x-www-form-urlencoded');

      const bodyParams = new URLSearchParams(requestInit.body);
      expect(bodyParams.get('card[number]')).toBe('4111111111111111');
      expect(bodyParams.get('card[exp_month]')).toBe('12');
      expect(bodyParams.get('card[exp_year]')).toBe('2028');
      expect(bodyParams.get('card[cvc]')).toBe('123');
      expect(bodyParams.get('card[name]')).toBe('John Doe');
      expect(bodyParams.get('card[address_line1]')).toBe('123 Main St');
      expect(bodyParams.get('card[address_city]')).toBe('New York');
      expect(bodyParams.get('card[address_state]')).toBe('NY');
      expect(bodyParams.get('card[address_zip]')).toBe('10001');
      expect(bodyParams.get('card[address_country]')).toBe('US');
    });

    it('should include optional second address line when provided', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'tok_test_789', object: 'token' })
      });
      vi.stubGlobal('fetch', fetchMock);

      await adapter.tokenize({
        ...card,
        addressLine2: 'Apt 6C'
      });

      const [, requestInit] = fetchMock.mock.calls[0];
      const bodyParams = new URLSearchParams(requestInit.body);
      expect(bodyParams.get('card[address_line2]')).toBe('Apt 6C');
    });

    it('should throw ApiValidationError if Stripe tokenization fails', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({
          error: { message: 'Incorrect card number', code: 'incorrect_number' }
        })
      }));

      await expect(adapter.tokenize(card)).rejects.toThrow(ApiValidationError);
    });

    it('should throw NetworkError on fetch exception from Stripe', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Stripe unavailable')));

      await expect(adapter.tokenize(card)).rejects.toThrow(NetworkError);
    });
  });

  describe('OmiseAdapter', () => {
    const adapter = new OmiseAdapter({ publicKey: 'pkey_test_omise_key' });

    it('should require an Omise public key', () => {
      expect(() => new OmiseAdapter({ publicKey: '' })).toThrow('Omise public key is required.');
    });

    it('should correctly format request body and basic auth headers for Omise API', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'tokn_test_456', object: 'token' })
      });
      vi.stubGlobal('fetch', fetchMock);

      const token = await adapter.tokenize(card);

      expect(token.id).toBe('tokn_test_456');
      expect(token.gateway).toBe('omise');

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, requestInit] = fetchMock.mock.calls[0];
      expect(url).toBe('https://vault.omise.co/tokens');
      expect(requestInit.method).toBe('POST');
      
      const expectedBasicAuth = 'Basic ' + btoa('pkey_test_omise_key:');
      expect(requestInit.headers['Authorization']).toBe(expectedBasicAuth);
      expect(requestInit.headers['Content-Type']).toBe('application/x-www-form-urlencoded');

      const bodyParams = new URLSearchParams(requestInit.body);
      expect(bodyParams.get('card[number]')).toBe('4111111111111111');
      expect(bodyParams.get('card[expiration_month]')).toBe('12');
      expect(bodyParams.get('card[expiration_year]')).toBe('2028');
      expect(bodyParams.get('card[security_code]')).toBe('123');
      expect(bodyParams.get('card[name]')).toBe('John Doe');
      expect(bodyParams.get('card[street1]')).toBe('123 Main St');
      expect(bodyParams.get('card[city]')).toBe('New York');
      expect(bodyParams.get('card[state]')).toBe('NY');
      expect(bodyParams.get('card[postal_code]')).toBe('10001');
      expect(bodyParams.get('card[country]')).toBe('US');
      expect(bodyParams.get('card[phone_number]')).toBe('+15555555555');
      expect(bodyParams.get('card[email]')).toBe('john@example.com');
    });

    it('should include optional street2 field when provided', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'tokn_test_999', object: 'token' })
      });
      vi.stubGlobal('fetch', fetchMock);

      await adapter.tokenize({
        ...card,
        addressLine2: 'Floor 4'
      });

      const [, requestInit] = fetchMock.mock.calls[0];
      const bodyParams = new URLSearchParams(requestInit.body);
      expect(bodyParams.get('card[street2]')).toBe('Floor 4');
    });

    it('should throw ApiValidationError if Omise tokenization fails', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({
          message: 'Invalid security code',
          code: 'invalid_security_code'
        })
      }));

      await expect(adapter.tokenize(card)).rejects.toThrow(ApiValidationError);
    });

    it('should throw NetworkError on fetch exception', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Connection failure')));

      await expect(adapter.tokenize(card)).rejects.toThrow(NetworkError);
    });
  });
});
