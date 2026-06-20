import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCardForm, CardFormValues, UseCardFormParams } from '../../src/react/useCardForm';
import type { PaymentGateway } from '../../src/core/domain/card';

// Mock React
vi.mock('react', async () => {
  const actual = await vi.importActual('react');
  return {
    ...actual,
    useState: vi.fn((initialValue) => [initialValue, vi.fn()])
  };
});

describe('React useCardForm Hook', () => {
  describe('CardFormValues interface', () => {
    it('should have required fields', () => {
      const values: CardFormValues = {
        number: '4242424242424242',
        expiry: '12 / 25',
        cvc: '123',
        name: 'John Doe'
      };

      expect(values.number).toBe('4242424242424242');
      expect(values.expiry).toBe('12 / 25');
      expect(values.cvc).toBe('123');
      expect(values.name).toBe('John Doe');
    });

    it('should have optional fields', () => {
      const values: CardFormValues = {
        number: '4242424242424242',
        expiry: '12 / 25',
        cvc: '123',
        name: 'John Doe',
        addressLine1: '123 Main St',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'US',
        phone: '+1234567890',
        email: 'john@example.com'
      };

      expect(values.addressLine1).toBe('123 Main St');
      expect(values.city).toBe('New York');
      expect(values.state).toBe('NY');
      expect(values.postalCode).toBe('10001');
      expect(values.country).toBe('US');
      expect(values.phone).toBe('+1234567890');
      expect(values.email).toBe('john@example.com');
    });
  });

  describe('UseCardFormParams interface', () => {
    it('should accept minimal params with just adapter', () => {
      const params: UseCardFormParams = {
        adapter: {
          name: 'Stripe',
          tokenize: async () => ({ id: 'tok_1', gateway: 'stripe', raw: {} })
        }
      };

      expect(params.adapter).toBeDefined();
    });

    it('should accept params with initialValues', () => {
      const params: UseCardFormParams = {
        adapter: {
          name: 'Stripe',
          tokenize: async () => ({ id: 'tok_1', gateway: 'stripe', raw: {} })
        },
        initialValues: {
          number: '4242',
          name: 'John'
        }
      };

      expect(params.initialValues).toBeDefined();
    });

    it('should accept params with onSubmit', () => {
      const params: UseCardFormParams = {
        adapter: {
          name: 'Stripe',
          tokenize: async () => ({ id: 'tok_1', gateway: 'stripe', raw: {} })
        },
        onSubmit: async ({ token }) => {
          void token;
        }
      };

      expect(typeof params.onSubmit).toBe('function');
    });

    it('should accept params with onError', () => {
      const params: UseCardFormParams = {
        adapter: {
          name: 'Stripe',
          tokenize: async () => ({ id: 'tok_1', gateway: 'stripe', raw: {} })
        },
        onError: (error: Error) => {
          void error;
        }
      };

      expect(typeof params.onError).toBe('function');
    });
  });

  describe('useCardForm hook', () => {
    it('should return all expected properties', () => {
      const mockAdapter: PaymentGateway = {
        name: 'Stripe',
        tokenize: async () => ({ id: 'tok_1', gateway: 'stripe', raw: {} })
      };

      const { result } = renderHook(() => useCardForm({ adapter: mockAdapter }));

      expect(result.current.values).toBeDefined();
      expect(result.current.brand).toBeDefined();
      expect(result.current.errors).toBeDefined();
      expect(result.current.isTokenizing).toBeDefined();
      expect(result.current.isProcessing).toBeDefined();
      expect(result.current.isSuccess).toBeDefined();
      expect(result.current.paymentError).toBeDefined();
      expect(result.current.isFlipped).toBeDefined();
      expect(result.current.handleChange).toBeDefined();
      expect(result.current.handleBlur).toBeDefined();
      expect(result.current.handleCvcFocus).toBeDefined();
      expect(result.current.handleCvcBlur).toBeDefined();
      expect(result.current.handleSubmit).toBeDefined();
    });

    it('should initialize with default values', () => {
      const mockAdapter: PaymentGateway = {
        name: 'Stripe',
        tokenize: async () => ({ id: 'tok_1', gateway: 'stripe', raw: {} })
      };

      const { result } = renderHook(() => useCardForm({ adapter: mockAdapter }));

      expect(result.current.values.number).toBe('');
      expect(result.current.values.expiry).toBe('');
      expect(result.current.values.cvc).toBe('');
      expect(result.current.values.name).toBe('');
    });

    it('should initialize with initialValues', () => {
      const mockAdapter: PaymentGateway = {
        name: 'Stripe',
        tokenize: async () => ({ id: 'tok_1', gateway: 'stripe', raw: {} })
      };

      const { result } = renderHook(() => useCardForm({
        adapter: mockAdapter,
        initialValues: {
          number: '4242',
          name: 'John'
        }
      }));

      expect(result.current.values.number).toBe('4242');
      expect(result.current.values.name).toBe('John');
    });

    it('should have initial state for isTokenizing', () => {
      const mockAdapter: PaymentGateway = {
        name: 'Stripe',
        tokenize: async () => ({ id: 'tok_1', gateway: 'stripe', raw: {} })
      };

      const { result } = renderHook(() => useCardForm({ adapter: mockAdapter }));

      expect(result.current.isTokenizing).toBe(false);
    });

    it('should have initial state for isProcessing', () => {
      const mockAdapter: PaymentGateway = {
        name: 'Stripe',
        tokenize: async () => ({ id: 'tok_1', gateway: 'stripe', raw: {} })
      };

      const { result } = renderHook(() => useCardForm({ adapter: mockAdapter }));

      expect(result.current.isProcessing).toBe(false);
    });

    it('should have initial state for isSuccess', () => {
      const mockAdapter: PaymentGateway = {
        name: 'Stripe',
        tokenize: async () => ({ id: 'tok_1', gateway: 'stripe', raw: {} })
      };

      const { result } = renderHook(() => useCardForm({ adapter: mockAdapter }));

      expect(result.current.isSuccess).toBe(false);
    });

    it('should have initial state for isFlipped', () => {
      const mockAdapter: PaymentGateway = {
        name: 'Stripe',
        tokenize: async () => ({ id: 'tok_1', gateway: 'stripe', raw: {} })
      };

      const { result } = renderHook(() => useCardForm({ adapter: mockAdapter }));

      expect(result.current.isFlipped).toBe(false);
    });

    it('should have initial empty errors', () => {
      const mockAdapter: PaymentGateway = {
        name: 'Stripe',
        tokenize: async () => ({ id: 'tok_1', gateway: 'stripe', raw: {} })
      };

      const { result } = renderHook(() => useCardForm({ adapter: mockAdapter }));

      expect(result.current.errors).toEqual({});
    });

    it('should have initial null paymentError', () => {
      const mockAdapter: PaymentGateway = {
        name: 'Stripe',
        tokenize: async () => ({ id: 'tok_1', gateway: 'stripe', raw: {} })
      };

      const { result } = renderHook(() => useCardForm({ adapter: mockAdapter }));

      expect(result.current.paymentError).toBeNull();
    });
  });

  describe('handleChange function', () => {
    it('should be a function', () => {
      const mockAdapter: PaymentGateway = {
        name: 'Stripe',
        tokenize: async () => ({ id: 'tok_1', gateway: 'stripe', raw: {} })
      };

      const { result } = renderHook(() => useCardForm({ adapter: mockAdapter }));

      expect(typeof result.current.handleChange).toBe('function');
    });
  });

  describe('handleBlur function', () => {
    it('should be a function', () => {
      const mockAdapter: PaymentGateway = {
        name: 'Stripe',
        tokenize: async () => ({ id: 'tok_1', gateway: 'stripe', raw: {} })
      };

      const { result } = renderHook(() => useCardForm({ adapter: mockAdapter }));

      expect(typeof result.current.handleBlur).toBe('function');
    });
  });

  describe('handleCvcFocus function', () => {
    it('should be a function', () => {
      const mockAdapter: PaymentGateway = {
        name: 'Stripe',
        tokenize: async () => ({ id: 'tok_1', gateway: 'stripe', raw: {} })
      };

      const { result } = renderHook(() => useCardForm({ adapter: mockAdapter }));

      expect(typeof result.current.handleCvcFocus).toBe('function');
    });
  });

  describe('handleCvcBlur function', () => {
    it('should be a function', () => {
      const mockAdapter: PaymentGateway = {
        name: 'Stripe',
        tokenize: async () => ({ id: 'tok_1', gateway: 'stripe', raw: {} })
      };

      const { result } = renderHook(() => useCardForm({ adapter: mockAdapter }));

      expect(typeof result.current.handleCvcBlur).toBe('function');
    });
  });

  describe('handleSubmit function', () => {
    it('should be a function', () => {
      const mockAdapter: PaymentGateway = {
        name: 'Stripe',
        tokenize: async () => ({ id: 'tok_1', gateway: 'stripe', raw: {} })
      };

      const { result } = renderHook(() => useCardForm({ adapter: mockAdapter }));

      expect(typeof result.current.handleSubmit).toBe('function');
    });
  });

  describe('brand detection', () => {
    it('should detect card brand from number', () => {
      const mockAdapter: PaymentGateway = {
        name: 'Stripe',
        tokenize: async () => ({ id: 'tok_1', gateway: 'stripe', raw: {} })
      };

      const { result } = renderHook(() => useCardForm({
        adapter: mockAdapter,
        initialValues: { number: '4242424242424242' }
      }));

      expect(result.current.brand).toBe('visa');
    });
  });
});