import { describe, it, expect } from 'vitest';
import type { Card, OptionalCardField, CardFormPreset, PaymentGateway, CardFormOptions } from '../../src/core/domain/card';
import type { Token } from '../../src/core/domain/token';

describe('Card Domain Types', () => {
  describe('Card Interface', () => {
    it('should create a valid card object with required fields', () => {
      const card: Card = {
        number: '4242424242424242',
        expMonth: '12',
        expYear: '28',
        cvc: '123',
        name: 'John Doe'
      };

      expect(card.number).toBe('4242424242424242');
      expect(card.expMonth).toBe('12');
      expect(card.expYear).toBe('28');
      expect(card.cvc).toBe('123');
      expect(card.name).toBe('John Doe');
    });

    it('should create a card object with all optional fields', () => {
      const card: Card = {
        number: '4242424242424242',
        expMonth: '12',
        expYear: '2028',
        cvc: '123',
        name: 'John Doe',
        addressLine1: '123 Main St',
        addressLine2: 'Apt 4B',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'US',
        phone: '+1234567890',
        email: 'john@example.com'
      };

      expect(card.addressLine1).toBe('123 Main St');
      expect(card.addressLine2).toBe('Apt 4B');
      expect(card.city).toBe('New York');
      expect(card.state).toBe('NY');
      expect(card.postalCode).toBe('10001');
      expect(card.country).toBe('US');
      expect(card.phone).toBe('+1234567890');
      expect(card.email).toBe('john@example.com');
    });

    it('should create a card object with only required fields', () => {
      const card: Card = {
        number: '5500000000000004',
        expMonth: '06',
        expYear: '30',
        cvc: '999',
        name: 'Jane Smith'
      };

      expect(card.addressLine1).toBeUndefined();
      expect(card.addressLine2).toBeUndefined();
      expect(card.city).toBeUndefined();
      expect(card.state).toBeUndefined();
      expect(card.postalCode).toBeUndefined();
      expect(card.country).toBeUndefined();
      expect(card.phone).toBeUndefined();
      expect(card.email).toBeUndefined();
    });
  });

  describe('OptionalCardField Type', () => {
    it('should include all valid optional field names', () => {
      const optionalFields: OptionalCardField[] = [
        'addressLine1',
        'addressLine2',
        'city',
        'state',
        'postalCode',
        'country',
        'phone',
        'email'
      ];

      expect(optionalFields).toHaveLength(8);
      expect(optionalFields).toContain('addressLine1');
      expect(optionalFields).toContain('email');
    });
  });

  describe('CardFormPreset Type', () => {
    it('should include all valid preset values', () => {
      const presets: CardFormPreset[] = ['none', 'us', 'billing', 'contact'];

      expect(presets).toHaveLength(4);
      expect(presets).toContain('none');
      expect(presets).toContain('us');
      expect(presets).toContain('billing');
      expect(presets).toContain('contact');
    });
  });

  describe('PaymentGateway Interface', () => {
    it('should define a payment gateway with tokenize method', () => {
      const mockGateway: PaymentGateway = {
        name: 'Stripe',
        tokenize: async (_card: Card): Promise<Token> => {
          return {
            id: 'tok_123456',
            gateway: 'stripe',
            raw: { id: 'tok_123456', livemode: false }
          };
        }
      };

      expect(mockGateway.name).toBe('Stripe');
      expect(typeof mockGateway.tokenize).toBe('function');
    });

    it('should support Omise gateway', () => {
      const omiseGateway: PaymentGateway = {
        name: 'Omise',
        tokenize: async (_card: Card): Promise<Token> => {
          return {
            id: 'tok_test_123',
            gateway: 'omise',
            raw: { object: 'token', used: false }
          };
        }
      };

      expect(omiseGateway.name).toBe('Omise');
    });
  });

  describe('CardFormOptions Interface', () => {
    it('should create minimal options with just adapter', () => {
      const mockAdapter: PaymentGateway = {
        name: 'TestGateway',
        tokenize: async () => ({ id: 'tok_1', gateway: 'stripe', raw: {} })
      };

      const options: CardFormOptions = {
        adapter: mockAdapter
      };

      expect(options.adapter).toBe(mockAdapter);
      expect(options.preset).toBeUndefined();
    });

    it('should create options with all properties', () => {
      const mockAdapter: PaymentGateway = {
        name: 'Stripe',
        tokenize: async () => ({ id: 'tok_1', gateway: 'stripe', raw: {} })
      };

      const options: CardFormOptions = {
        adapter: mockAdapter,
        preset: 'billing',
        fields: ['phone', 'email'],
        cardLabel: 'Credit Card',
        submitButtonText: 'Pay $99',
        onSubmit: async ({ token }) => {
          void token;
        },
        onError: (_error: Error) => {
          // Error handler
        }
      };

      expect(options.preset).toBe('billing');
      expect(options.fields).toEqual(['phone', 'email']);
      expect(options.cardLabel).toBe('Credit Card');
      expect(options.submitButtonText).toBe('Pay $99');
      expect(typeof options.onSubmit).toBe('function');
      expect(typeof options.onError).toBe('function');
    });

    it('should handle onSubmit that returns void', () => {
      const options: CardFormOptions = {
        adapter: {
          name: 'Test',
          tokenize: async () => ({ id: 'tok_1', gateway: 'stripe', raw: {} })
        },
        onSubmit: ({ token }) => {
          // Synchronous handler
          void token;
        }
      };

      expect(typeof options.onSubmit).toBe('function');
    });
  });
});