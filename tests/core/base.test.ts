import { describe, it, expect } from 'vitest';
import {
  toFormUrlEncoded,
  PaymentGatewayError,
  NetworkError,
  ApiValidationError
} from '../../src/core/adapters/base';

describe('Adapter Base Utilities', () => {
  describe('toFormUrlEncoded', () => {
    it('should encode keys and values for x-www-form-urlencoded payloads', () => {
      const encoded = toFormUrlEncoded({
        'card[name]': 'John Doe',
        amount: 1000,
        note: 'A&B'
      });

      expect(encoded).toContain('card%5Bname%5D=John%20Doe');
      expect(encoded).toContain('amount=1000');
      expect(encoded).toContain('note=A%26B');
    });

    it('should exclude undefined values from payload', () => {
      const encoded = toFormUrlEncoded({
        keep: 'yes',
        drop: undefined
      });

      const params = new URLSearchParams(encoded);
      expect(params.get('keep')).toBe('yes');
      expect(params.has('drop')).toBe(false);
    });
  });

  describe('PaymentGatewayError hierarchy', () => {
    it('should construct base errors with message, code, and raw payload', () => {
      const error = new PaymentGatewayError('Gateway failed', 'gateway_error', { detail: 'x' });

      expect(error.name).toBe('PaymentGatewayError');
      expect(error.message).toBe('Gateway failed');
      expect(error.code).toBe('gateway_error');
      expect(error.raw).toEqual({ detail: 'x' });
    });

    it('should construct NetworkError with fixed code', () => {
      const error = new NetworkError('offline');

      expect(error.name).toBe('NetworkError');
      expect(error.code).toBe('network_error');
    });

    it('should default ApiValidationError code when omitted', () => {
      const error = new ApiValidationError('invalid request');

      expect(error.name).toBe('ApiValidationError');
      expect(error.code).toBe('validation_error');
    });
  });
});
