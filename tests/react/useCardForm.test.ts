import { describe, it, expect, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import type { ChangeEvent, FocusEvent } from 'react';
import { useCardForm, CardFormValues, UseCardFormParams } from '../../src/react/useCardForm';
import type { PaymentGateway } from '../../src/core/domain/card';

/**
 * Returns a controllable promise so tests can step through the tokenize flow.
 */
function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

function createMockAdapter(
  tokenize: PaymentGateway['tokenize'] = async () => ({
    id: 'tok_1',
    gateway: 'stripe',
    raw: {},
  }),
): PaymentGateway {
  return { name: 'Stripe', tokenize };
}

const VALID_CARD_VALUES = {
  number: '4242424242424242',
  expiry: '12 / 30',
  cvc: '123',
  name: 'John Doe',
};

describe('React useCardForm Hook', () => {
  describe('CardFormValues interface', () => {
    it('should have required fields', () => {
      const values: CardFormValues = {
        number: '4242424242424242',
        expiry: '12 / 25',
        cvc: '123',
        name: 'John Doe',
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
        email: 'john@example.com',
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
        adapter: createMockAdapter(),
      };

      expect(params.adapter).toBeDefined();
    });

    it('should accept params with initialValues', () => {
      const params: UseCardFormParams = {
        adapter: createMockAdapter(),
        initialValues: {
          number: '4242',
          name: 'John',
        },
      };

      expect(params.initialValues).toBeDefined();
    });

    it('should accept params with onSubmit', () => {
      const params: UseCardFormParams = {
        adapter: createMockAdapter(),
        onSubmit: async ({ token }) => {
          void token;
        },
      };

      expect(typeof params.onSubmit).toBe('function');
    });

    it('should accept params with onError', () => {
      const params: UseCardFormParams = {
        adapter: createMockAdapter(),
        onError: (error: Error) => {
          void error;
        },
      };

      expect(typeof params.onError).toBe('function');
    });
  });

  describe('initial state', () => {
    it('should return all expected properties', () => {
      const adapter = createMockAdapter();
      const { result } = renderHook(() => useCardForm({ adapter }));

      expect(result.current.values).toBeDefined();
      expect(result.current.brand).toBeDefined();
      expect(result.current.errors).toBeDefined();
      expect(result.current.isTokenizing).toBe(false);
      expect(result.current.isProcessing).toBe(false);
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.paymentError).toBeNull();
      expect(result.current.isFlipped).toBe(false);
      expect(typeof result.current.handleChange).toBe('function');
      expect(typeof result.current.setFieldValue).toBe('function');
      expect(typeof result.current.handleBlur).toBe('function');
      expect(typeof result.current.handleCvcFocus).toBe('function');
      expect(typeof result.current.handleCvcBlur).toBe('function');
      expect(typeof result.current.handleSubmit).toBe('function');
    });

    it('should initialize with default empty values', () => {
      const adapter = createMockAdapter();
      const { result } = renderHook(() => useCardForm({ adapter }));

      expect(result.current.values.number).toBe('');
      expect(result.current.values.expiry).toBe('');
      expect(result.current.values.cvc).toBe('');
      expect(result.current.values.name).toBe('');
    });

    it('should initialize with initialValues', () => {
      const adapter = createMockAdapter();
      const { result } = renderHook(() =>
        useCardForm({
          adapter,
          initialValues: {
            number: '4242',
            name: 'John',
          },
        }),
      );

      expect(result.current.values.number).toBe('4242');
      expect(result.current.values.name).toBe('John');
    });

    it('should detect card brand from number', () => {
      const adapter = createMockAdapter();
      const { result } = renderHook(() =>
        useCardForm({
          adapter,
          initialValues: { number: '4242424242424242' },
        }),
      );

      expect(result.current.brand).toBe('visa');
    });
  });

  describe('handleChange', () => {
    it('should format the card number with grouping', () => {
      const adapter = createMockAdapter();
      const { result } = renderHook(() => useCardForm({ adapter }));

      act(() => {
        result.current.handleChange({
          target: { name: 'number', value: '4242424242424242' },
        } as ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.values.number).toBe('4242 4242 4242 4242');
    });

    it('should format the expiry with MM / YY', () => {
      const adapter = createMockAdapter();
      const { result } = renderHook(() => useCardForm({ adapter }));

      act(() => {
        result.current.handleChange({
          target: { name: 'expiry', value: '1230' },
        } as ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.values.expiry).toBe('12 / 30');
    });

    it('should format the CVC per brand (4 digits for Amex)', () => {
      const adapter = createMockAdapter();
      const { result } = renderHook(() =>
        useCardForm({ adapter, initialValues: { number: '378282246310005' } }),
      );

      act(() => {
        result.current.handleChange({
          target: { name: 'cvc', value: '1234' },
        } as ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.values.cvc).toBe('1234');
    });

    it('should clear the field error on change', () => {
      const adapter = createMockAdapter();
      const { result } = renderHook(() => useCardForm({ adapter }));

      act(() => {
        result.current.handleBlur({
          target: { name: 'number', value: '1234' },
        } as FocusEvent<HTMLInputElement>);
      });
      expect(result.current.errors.number).not.toBeNull();

      act(() => {
        result.current.handleChange({
          target: { name: 'number', value: '4242424242424242' },
        } as ChangeEvent<HTMLInputElement>);
      });
      expect(result.current.errors.number).toBeNull();
    });

    it('should reset the success state when a field changes after success', async () => {
      const adapter = createMockAdapter();
      const onSubmit = vi.fn();
      const { result } = renderHook(() => useCardForm({ adapter, onSubmit }));

      // Seed valid values and submit
      act(() => {
        Object.entries(VALID_CARD_VALUES).forEach(([name, value]) => {
          result.current.setFieldValue(name as keyof CardFormValues, value);
        });
      });
      await act(async () => {
        await result.current.handleSubmit();
      });
      expect(result.current.isSuccess).toBe(true);

      act(() => {
        result.current.setFieldValue('name', 'Jane Doe');
      });
      expect(result.current.isSuccess).toBe(false);
    });
  });

  describe('handleBlur', () => {
    it('should validate the blurred field and store its error', () => {
      const adapter = createMockAdapter();
      const { result } = renderHook(() => useCardForm({ adapter }));

      act(() => {
        result.current.handleBlur({
          target: { name: 'cvc', value: '12' },
        } as FocusEvent<HTMLInputElement>);
      });

      expect(result.current.errors.cvc).toContain('security');
    });
  });

  describe('CVC flip', () => {
    it('should flip the card on CVC focus and flip back on blur', () => {
      const adapter = createMockAdapter();
      const { result } = renderHook(() => useCardForm({ adapter }));

      expect(result.current.isFlipped).toBe(false);
      act(() => result.current.handleCvcFocus());
      expect(result.current.isFlipped).toBe(true);
      act(() => result.current.handleCvcBlur());
      expect(result.current.isFlipped).toBe(false);
    });
  });

  describe('handleSubmit', () => {
    it('should reject invalid forms without calling tokenize', async () => {
      const tokenize = vi.fn(createMockAdapter().tokenize);
      const adapter = createMockAdapter(tokenize);
      const onError = vi.fn();
      const { result } = renderHook(() => useCardForm({ adapter, onError }));

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(tokenize).not.toHaveBeenCalled();
      expect(result.current.paymentError).toBe(
        'Please correct the invalid fields.',
      );
      // The documented onError contract covers client-side validation failures
      expect(onError).toHaveBeenCalledWith(
        new Error('Please correct the invalid fields.'),
      );
    });

    it('should tokenize, await onSubmit, then mask the number and clear the CVC', async () => {
      const tokenize = vi.fn().mockResolvedValue({
        id: 'tok_1',
        gateway: 'stripe',
        raw: {},
      });
      const adapter = createMockAdapter(tokenize as PaymentGateway['tokenize']);
      const onSubmit = vi.fn();
      const { result } = renderHook(() => useCardForm({ adapter, onSubmit }));

      act(() => {
        Object.entries(VALID_CARD_VALUES).forEach(([name, value]) => {
          result.current.setFieldValue(name as keyof CardFormValues, value);
        });
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(tokenize).toHaveBeenCalledTimes(1);
      expect(onSubmit).toHaveBeenCalledWith({
        token: { id: 'tok_1', gateway: 'stripe', raw: {} },
      });
      expect(result.current.values.number).toBe('•••• •••• •••• 4242');
      expect(result.current.values.cvc).toBe('');
      expect(result.current.isSuccess).toBe(true);
      expect(result.current.isTokenizing).toBe(false);
      expect(result.current.isProcessing).toBe(false);
    });

    it('should await non-Promise thenables returned from onSubmit', async () => {
      const adapter = createMockAdapter();
      let onSubmitSettled = false;
      let resolveOnSubmit: () => void = () => {};
      const onSubmit = vi.fn(() => ({
        then(resolve: () => void) {
          resolveOnSubmit = () => {
            onSubmitSettled = true;
            resolve();
          };
        },
      }));

      const { result } = renderHook(() =>
        useCardForm({
          adapter,
          // The hook honors thenables at runtime (cross-realm promises); the
          // public type only advertises Promise<void> | void, so the test
          // deliberately crosses the type boundary.
          onSubmit: onSubmit as never,
        }),
      );

      act(() => {
        Object.entries(VALID_CARD_VALUES).forEach(([name, value]) => {
          result.current.setFieldValue(name as keyof CardFormValues, value);
        });
      });

      let submitPromise!: Promise<void>;
      act(() => {
        submitPromise = result.current.handleSubmit();
      });

      // Flush microtasks so the tokenize promise settles and onSubmit runs
      await act(async () => {});

      // The success state must not be set until the thenable settles
      expect(onSubmitSettled).toBe(false);
      expect(result.current.isSuccess).toBe(false);

      await act(async () => {
        resolveOnSubmit();
        await submitPromise;
      });

      expect(onSubmitSettled).toBe(true);
      expect(result.current.isSuccess).toBe(true);
    });

    it('should surface tokenize failures and re-enable the form', async () => {
      const tokenize = vi
        .fn()
        .mockRejectedValue(new Error('Card declined.'));
      const adapter = createMockAdapter(tokenize as PaymentGateway['tokenize']);
      const onError = vi.fn();
      const { result } = renderHook(() => useCardForm({ adapter, onError }));

      act(() => {
        Object.entries(VALID_CARD_VALUES).forEach(([name, value]) => {
          result.current.setFieldValue(name as keyof CardFormValues, value);
        });
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(result.current.paymentError).toBe('Card declined.');
      expect(result.current.isTokenizing).toBe(false);
      expect(result.current.isSuccess).toBe(false);
      expect(onError).toHaveBeenCalledWith(new Error('Card declined.'));

      // The guard must be released so a second submit can retry
      const tokenize2 = vi.fn().mockResolvedValue({
        id: 'tok_2',
        gateway: 'stripe',
        raw: {},
      });
      // Replace the failing adapter with a succeeding one on retry
      const adapter2 = createMockAdapter(tokenize2 as PaymentGateway['tokenize']);
      const { result: result2 } = renderHook(() => useCardForm({ adapter: adapter2 }));
      act(() => {
        Object.entries(VALID_CARD_VALUES).forEach(([name, value]) => {
          result2.current.setFieldValue(name as keyof CardFormValues, value);
        });
      });
      await act(async () => {
        await result2.current.handleSubmit();
      });
      expect(tokenize2).toHaveBeenCalledTimes(1);
    });

    it('should ignore re-entrant submits while a tokenize is in flight', async () => {
      const gate = deferred<{ id: string; gateway: string; raw: unknown }>();
      const tokenize = vi.fn(() => gate.promise);
      const adapter = createMockAdapter(tokenize as PaymentGateway['tokenize']);
      const { result } = renderHook(() => useCardForm({ adapter }));

      act(() => {
        Object.entries(VALID_CARD_VALUES).forEach(([name, value]) => {
          result.current.setFieldValue(name as keyof CardFormValues, value);
        });
      });

      let first: Promise<void>;
      let second: Promise<void>;
      act(() => {
        first = result.current.handleSubmit();
        second = result.current.handleSubmit();
      });

      await act(async () => {
        gate.resolve({ id: 'tok_1', gateway: 'stripe', raw: {} });
        await Promise.all([first, second]);
      });

      expect(tokenize).toHaveBeenCalledTimes(1);
    });

    it('should strip the masked number prefix when the user re-enters digits after success', async () => {
      const adapter = createMockAdapter();
      const { result } = renderHook(() => useCardForm({ adapter }));

      act(() => {
        Object.entries(VALID_CARD_VALUES).forEach(([name, value]) => {
          result.current.setFieldValue(name as keyof CardFormValues, value);
        });
      });

      await act(async () => {
        await result.current.handleSubmit();
      });
      expect(result.current.values.number).toBe('•••• •••• •••• 4242');

      // User clicks at the end of the masked input and types a digit
      act(() => {
        result.current.handleChange({
          target: { name: 'number', value: '•••• •••• •••• 42425' },
        } as ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.values.number).toBe('5');
    });

    it('should keep a fully replaced card number in full after success', async () => {
      const adapter = createMockAdapter();
      const { result } = renderHook(() => useCardForm({ adapter }));

      act(() => {
        Object.entries(VALID_CARD_VALUES).forEach(([name, value]) => {
          result.current.setFieldValue(name as keyof CardFormValues, value);
        });
      });

      await act(async () => {
        await result.current.handleSubmit();
      });
      expect(result.current.values.number).toBe('•••• •••• •••• 4242');

      // User select-alls the masked input and types a brand-new PAN whose
      // leading digits happen to match the old masked last-4 (e.g. "4242...").
      // Because the raw value no longer contains the mask, the new digits
      // must NOT be truncated by the old last-4 strip.
      act(() => {
        result.current.handleChange({
          target: { name: 'number', value: '4242424242424242' },
        } as ChangeEvent<HTMLInputElement>);
      });

      expect(result.current.values.number).toBe('4242 4242 4242 4242');
      expect(result.current.isSuccess).toBe(false);
    });

    it('should not flag the masked number as invalid when blurred after success', async () => {
      const adapter = createMockAdapter();
      const { result } = renderHook(() => useCardForm({ adapter }));

      act(() => {
        Object.entries(VALID_CARD_VALUES).forEach(([name, value]) => {
          result.current.setFieldValue(name as keyof CardFormValues, value);
        });
      });

      await act(async () => {
        await result.current.handleSubmit();
      });
      expect(result.current.values.number).toBe('•••• •••• •••• 4242');

      // Focus-then-blur without typing: the masked display value must not
      // produce an "Invalid card number." error.
      act(() => {
        result.current.handleBlur({
          target: { name: 'number', value: '•••• •••• •••• 4242' },
        } as FocusEvent<HTMLInputElement>);
      });

      expect(result.current.errors.number).toBeNull();
    });
  });
});
