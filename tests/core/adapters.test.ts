import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { StripeAdapter } from '../../src/core/adapters/stripe';
import { OmiseAdapter } from '../../src/core/adapters/omise';
import { Card, PaymentGateway } from '../../src/core/domain/card';
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
    email: 'john@example.com',
  };

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('StripeAdapter', () => {
    let adapter: StripeAdapter;

    beforeEach(() => {
      adapter = new StripeAdapter({ publicKey: 'pk_test_stripe_key' });
    });

    it('should require a Stripe public key', () => {
      expect(() => new StripeAdapter({ publicKey: '' })).toThrow(
        'Stripe public key is required.',
      );
    });

    it('should reject secret keys (sk_) in the browser', () => {
      expect(() => new StripeAdapter({ publicKey: 'sk_live_secret_key' })).toThrow(
        /secret/i,
      );
    });

    it('should correctly format request body and headers for Stripe API', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'tok_test_123', object: 'token' }),
      });
      vi.stubGlobal('fetch', fetchMock);

      const token = await adapter.tokenize(card);

      expect(token.id).toBe('tok_test_123');
      expect(token.gateway).toBe('stripe');

      expect(fetchMock).toHaveBeenCalledTimes(1);
      const [url, requestInit] = fetchMock.mock.calls[0];
      expect(url).toBe('https://api.stripe.com/v1/tokens');
      expect(requestInit.method).toBe('POST');
      expect(requestInit.headers['Authorization']).toBe(
        'Bearer pk_test_stripe_key',
      );
      expect(requestInit.headers['Content-Type']).toBe(
        'application/x-www-form-urlencoded',
      );

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
        json: async () => ({ id: 'tok_test_789', object: 'token' }),
      });
      vi.stubGlobal('fetch', fetchMock);

      await adapter.tokenize({
        ...card,
        addressLine2: 'Apt 6C',
      });

      const [, requestInit] = fetchMock.mock.calls[0];
      const bodyParams = new URLSearchParams(requestInit.body);
      expect(bodyParams.get('card[address_line2]')).toBe('Apt 6C');
    });

    it('should throw ApiValidationError if Stripe tokenization fails', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          json: async () => ({
            error: {
              message: 'Incorrect card number',
              code: 'incorrect_number',
            },
          }),
        }),
      );

      await expect(adapter.tokenize(card)).rejects.toThrow(ApiValidationError);
    });

    it('should throw NetworkError on fetch exception from Stripe', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockRejectedValue(new Error('Stripe unavailable')),
      );

      await expect(adapter.tokenize(card)).rejects.toThrow(NetworkError);
    });

    it('should map an aborted request (timeout) to a timeout NetworkError', async () => {
      vi.useFakeTimers();
      try {
        const fetchMock = vi.fn((_url: string, init: RequestInit) => {
          return new Promise((_resolve, reject) => {
            const signal = init.signal as AbortSignal;
            signal.addEventListener('abort', () =>
              reject(new DOMException('The operation was aborted.', 'AbortError')),
            );
          });
        });
        vi.stubGlobal('fetch', fetchMock);

        const promise = adapter.tokenize(card);
        const assertion = expect(promise).rejects.toMatchObject({
          name: 'NetworkError',
          message: 'Request timed out.',
        });
        await vi.advanceTimersByTimeAsync(30_000);
        await assertion;
      } finally {
        vi.useRealTimers();
      }
    });
  });

  describe('OmiseAdapter', () => {
    const adapter = new OmiseAdapter({ publicKey: 'pkey_test_omise_key' });

    it('should require an Omise public key', () => {
      expect(() => new OmiseAdapter({ publicKey: '' })).toThrow(
        'Omise public key is required.',
      );
    });

    it('should reject secret keys (skey_) in the browser', () => {
      expect(() => new OmiseAdapter({ publicKey: 'skey_test_secret_key' })).toThrow(
        /secret/i,
      );
    });

    it('should correctly format request body and basic auth headers for Omise API', async () => {
      const fetchMock = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ id: 'tokn_test_456', object: 'token' }),
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
      expect(requestInit.headers['Content-Type']).toBe(
        'application/x-www-form-urlencoded',
      );

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
        json: async () => ({ id: 'tokn_test_999', object: 'token' }),
      });
      vi.stubGlobal('fetch', fetchMock);

      await adapter.tokenize({
        ...card,
        addressLine2: 'Floor 4',
      });

      const [, requestInit] = fetchMock.mock.calls[0];
      const bodyParams = new URLSearchParams(requestInit.body);
      expect(bodyParams.get('card[street2]')).toBe('Floor 4');
    });

    it('should throw ApiValidationError if Omise tokenization fails', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: false,
          json: async () => ({
            message: 'Invalid security code',
            code: 'invalid_security_code',
          }),
        }),
      );

      await expect(adapter.tokenize(card)).rejects.toThrow(ApiValidationError);
    });

    it('should throw NetworkError on fetch exception', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockRejectedValue(new Error('Connection failure')),
      );

      await expect(adapter.tokenize(card)).rejects.toThrow(NetworkError);
    });

    it('should not attach the raw card (PAN/CVC) to invalid-email errors', async () => {
      const error = await adapter
        .tokenize({ ...card, email: 'not-an-email' })
        .then(
          () => null,
          (err: unknown) => err,
        );

      expect(error).toBeInstanceOf(ApiValidationError);
      const raw = (error as ApiValidationError).raw as { email: string };
      expect(raw.email).toBe('not-an-email');
      // The serialized raw payload must not contain card data
      expect(JSON.stringify(error)).not.toContain('4111');
      expect(JSON.stringify(error)).not.toContain('123');
    });
  });

  // These guards run inside the adapters' tokenize() but were never actually
  // exercised: jsdom's location is always http://localhost (which enforceHttps
  // exempts), and every tokenize test used a valid card so the strict
  // validator never fired. Both are security-relevant, so assert them here.
  describe('tokenize() security guards', () => {
    const validCard: Card = {
      number: '4111 1111 1111 1111',
      expMonth: '12',
      expYear: '28',
      cvc: '123',
      name: 'John Doe',
    };

    const gateways: Array<{ name: string; build: () => PaymentGateway }> = [
      {
        name: 'StripeAdapter',
        build: () => new StripeAdapter({ publicKey: 'pk_test_stripe_key' }),
      },
      {
        name: 'OmiseAdapter',
        build: () => new OmiseAdapter({ publicKey: 'pkey_test_omise_key' }),
      },
    ];

    beforeEach(() => {
      vi.restoreAllMocks();
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    describe.each(gateways)('$name enforces HTTPS', ({ build }) => {
      it('rejects tokenization on a plain-http, non-localhost origin', async () => {
        const fetchMock = vi.fn();
        vi.stubGlobal('location', {
          protocol: 'http:',
          hostname: 'evil.example',
        });
        vi.stubGlobal('fetch', fetchMock);

        await expect(build().tokenize(validCard)).rejects.toThrow(
          /require HTTPS/i,
        );
        // The PAN/CVC must never have been handed to the network layer.
        expect(fetchMock).not.toHaveBeenCalled();
      });

      it.each([
        ['http://localhost', 'http:', 'localhost'],
        ['http://127.0.0.1', 'http:', '127.0.0.1'],
        ['https://checkout.example', 'https:', 'checkout.example'],
      ])(
        'allows tokenization from %s (secure-context exemption)',
        async (_label, protocol, hostname) => {
          const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ id: 'tok_ok', object: 'token' }),
          });
          vi.stubGlobal('location', { protocol, hostname });
          vi.stubGlobal('fetch', fetchMock);

          const token = await build().tokenize(validCard);
          expect(token.id).toBe('tok_ok');
          expect(fetchMock).toHaveBeenCalledTimes(1);
        },
      );

      it('is a no-op when there is no window (SSR), deferring to the vault', async () => {
        const fetchMock = vi.fn().mockResolvedValue({
          ok: true,
          json: async () => ({ id: 'tok_ok', object: 'token' }),
        });
        vi.stubGlobal('window', undefined);
        vi.stubGlobal('fetch', fetchMock);

        const token = await build().tokenize(validCard);
        expect(token.id).toBe('tok_ok');
      });
    });

    describe('validateCardFieldsStrict rejects invalid fields before the network', () => {
      // Each case breaks exactly one field of an otherwise-valid card, so the
      // thrown ApiValidationError carries that field's code and fetch is
      // never reached — a client-side gate that must not leak raw PAN data.
      const invalidCases: Array<{
        field: string;
        patch: Partial<Card>;
        code: string;
      }> = [
        {
          field: 'luhn-failing PAN',
          patch: { number: '4111 1111 1111 1112' },
          code: 'invalid_card_number',
        },
        {
          field: 'too-short PAN',
          patch: { number: '4242' },
          code: 'invalid_card_number',
        },
        {
          field: 'expired expiry',
          patch: { expMonth: '01', expYear: '20' },
          code: 'invalid_expiry',
        },
        {
          field: 'malformed expiry month',
          patch: { expMonth: '13' },
          code: 'invalid_expiry',
        },
        { field: 'short CVC', patch: { cvc: '12' }, code: 'invalid_cvc' },
        { field: 'empty name', patch: { name: '' }, code: 'invalid_name' },
      ];

      it.each(invalidCases)(
        'rejects $field with $code and never calls fetch',
        async ({ patch, code }) => {
          for (const { build } of gateways) {
            const fetchMock = vi.fn();
            vi.stubGlobal('fetch', fetchMock);

            const error = await build()
              .tokenize({ ...validCard, ...patch })
              .then(
                () => null,
                (err: unknown) => err,
              );

            expect(error).toBeInstanceOf(ApiValidationError);
            expect((error as ApiValidationError).code).toContain(code);
            expect(fetchMock).not.toHaveBeenCalled();
          }
        },
      );

      it('reports every failing field at once in the code list', async () => {
        const fetchMock = vi.fn();
        vi.stubGlobal('fetch', fetchMock);

        const error = await new StripeAdapter({
          publicKey: 'pk_test_stripe_key',
        })
          .tokenize({
            ...validCard,
            number: '4111 1111 1111 1112',
            cvc: '1',
          })
          .then(
            () => null,
            (err: unknown) => err,
          );

        expect(error).toBeInstanceOf(ApiValidationError);
        const codes = (error as ApiValidationError).code ?? '';
        expect(codes).toContain('invalid_card_number');
        expect(codes).toContain('invalid_cvc');
        expect(fetchMock).not.toHaveBeenCalled();
      });
    });
  });
});
