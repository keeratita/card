import { describe, it, expect, vi } from 'vitest';
import {
  handleCardNumberInput,
  handleExpiryInput,
  handleCvcInput
} from '../../src/angular/directive-helpers';

describe('Angular Directive Helpers', () => {
  describe('handleCardNumberInput', () => {
    it('should format card number with spaces', () => {
      const inputEl = {
        value: '4242424242424242',
        selectionStart: 16,
        setSelectionRange: vi.fn()
      } as unknown as HTMLInputElement;

      handleCardNumberInput(inputEl);

      expect(inputEl.value).toBe('4242 4242 4242 4242');
    });

    it('should format partial card number', () => {
      const inputEl = {
        value: '4242',
        selectionStart: 4,
        setSelectionRange: vi.fn()
      } as unknown as HTMLInputElement;

      handleCardNumberInput(inputEl);

      expect(inputEl.value).toBe('4242');
    });

    it('should format amex card number', () => {
      const inputEl = {
        value: '378282246310005',
        selectionStart: 15,
        setSelectionRange: vi.fn()
      } as unknown as HTMLInputElement;

      handleCardNumberInput(inputEl);

      expect(inputEl.value).toBe('3782 822463 10005');
    });

    it('should handle empty input', () => {
      const inputEl = {
        value: '',
        selectionStart: 0,
        setSelectionRange: vi.fn()
      } as unknown as HTMLInputElement;

      handleCardNumberInput(inputEl);

      expect(inputEl.value).toBe('');
    });

    it('should handle input with spaces already present', () => {
      const inputEl = {
        value: '4242 4242',
        selectionStart: 9,
        setSelectionRange: vi.fn()
      } as unknown as HTMLInputElement;

      handleCardNumberInput(inputEl);

      expect(inputEl.value).toBe('4242 4242');
    });

    it('should handle non-numeric characters', () => {
      const inputEl = {
        value: '4242-4242-4242-4242',
        selectionStart: 20,
        setSelectionRange: vi.fn()
      } as unknown as HTMLInputElement;

      handleCardNumberInput(inputEl);

      expect(inputEl.value).toBe('4242 4242 4242 4242');
    });

    it('should set cursor position after formatting', () => {
      const inputEl = {
        value: '424242',
        selectionStart: 3,
        setSelectionRange: vi.fn()
      } as unknown as HTMLInputElement;

      handleCardNumberInput(inputEl);

      expect(inputEl.setSelectionRange).toHaveBeenCalled();
    });

    it('should handle null selectionStart', () => {
      const inputEl = {
        value: '42424242',
        selectionStart: null,
        setSelectionRange: vi.fn()
      } as unknown as HTMLInputElement;

      handleCardNumberInput(inputEl);

      expect(inputEl.value).toBe('4242 4242');
    });

    it('should format mastercard number', () => {
      const inputEl = {
        value: '5500000000000004',
        selectionStart: 16,
        setSelectionRange: vi.fn()
      } as unknown as HTMLInputElement;

      handleCardNumberInput(inputEl);

      expect(inputEl.value).toBe('5500 0000 0000 0004');
    });

    it('should format discover number', () => {
      const inputEl = {
        value: '6011111111111117',
        selectionStart: 16,
        setSelectionRange: vi.fn()
      } as unknown as HTMLInputElement;

      handleCardNumberInput(inputEl);

      expect(inputEl.value).toBe('6011 1111 1111 1117');
    });
  });

  describe('handleExpiryInput', () => {
    it('should format expiry with slash', () => {
      const inputEl = {
        value: '1225',
        selectionStart: 4,
        setSelectionRange: vi.fn()
      } as unknown as HTMLInputElement;

      handleExpiryInput(inputEl);

      expect(inputEl.value).toBe('12 / 25');
    });

    it('should format partial expiry', () => {
      const inputEl = {
        value: '12',
        selectionStart: 2,
        setSelectionRange: vi.fn()
      } as unknown as HTMLInputElement;

      handleExpiryInput(inputEl);

      expect(inputEl.value).toBe('12');
    });

    it('should handle empty input', () => {
      const inputEl = {
        value: '',
        selectionStart: 0,
        setSelectionRange: vi.fn()
      } as unknown as HTMLInputElement;

      handleExpiryInput(inputEl);

      expect(inputEl.value).toBe('');
    });

    it('should handle expiry with slash already present', () => {
      const inputEl = {
        value: '12 / 25',
        selectionStart: 7,
        setSelectionRange: vi.fn()
      } as unknown as HTMLInputElement;

      handleExpiryInput(inputEl);

      expect(inputEl.value).toBe('12 / 25');
    });

    it('should format single digit month', () => {
      const inputEl = {
        value: '15',
        selectionStart: 2,
        setSelectionRange: vi.fn()
      } as unknown as HTMLInputElement;

      handleExpiryInput(inputEl);

      // Input '15' -> month='15' clamped to '12', returns '12'
      expect(inputEl.value).toBe('12');
    });

    it('should handle three digit input', () => {
      const inputEl = {
        value: '125',
        selectionStart: 3,
        setSelectionRange: vi.fn()
      } as unknown as HTMLInputElement;

      handleExpiryInput(inputEl);

      expect(inputEl.value).toBe('12 / 5');
    });

    it('should handle non-numeric characters', () => {
      const inputEl = {
        value: '12/25',
        selectionStart: 5,
        setSelectionRange: vi.fn()
      } as unknown as HTMLInputElement;

      handleExpiryInput(inputEl);

      expect(inputEl.value).toBe('12 / 25');
    });
  });

  describe('handleCvcInput', () => {
    it('should format standard 3-digit CVC', () => {
      const inputEl = {
        value: '123',
        selectionStart: 3,
        setSelectionRange: vi.fn()
      } as unknown as HTMLInputElement;

      handleCvcInput(inputEl, '4242424242424242');

      expect(inputEl.value).toBe('123');
    });

    it('should format amex 4-digit CVC', () => {
      const inputEl = {
        value: '1234',
        selectionStart: 4,
        setSelectionRange: vi.fn()
      } as unknown as HTMLInputElement;

      handleCvcInput(inputEl, '378282246310005');

      expect(inputEl.value).toBe('1234');
    });

    it('should truncate CVC to max length for standard card', () => {
      const inputEl = {
        value: '12345',
        selectionStart: 5,
        setSelectionRange: vi.fn()
      } as unknown as HTMLInputElement;

      handleCvcInput(inputEl, '4242424242424242');

      expect(inputEl.value).toBe('123');
    });

    it('should truncate CVC to max length for amex card', () => {
      const inputEl = {
        value: '12345',
        selectionStart: 5,
        setSelectionRange: vi.fn()
      } as unknown as HTMLInputElement;

      handleCvcInput(inputEl, '378282246310005');

      expect(inputEl.value).toBe('1234');
    });

    it('should handle empty CVC', () => {
      const inputEl = {
        value: '',
        selectionStart: 0,
        setSelectionRange: vi.fn()
      } as unknown as HTMLInputElement;

      handleCvcInput(inputEl, '4242424242424242');

      expect(inputEl.value).toBe('');
    });

    it('should handle partial CVC', () => {
      const inputEl = {
        value: '12',
        selectionStart: 2,
        setSelectionRange: vi.fn()
      } as unknown as HTMLInputElement;

      handleCvcInput(inputEl, '4242424242424242');

      expect(inputEl.value).toBe('12');
    });

    it('should handle non-numeric CVC characters', () => {
      const inputEl = {
        value: '1a2b',
        selectionStart: 4,
        setSelectionRange: vi.fn()
      } as unknown as HTMLInputElement;

      handleCvcInput(inputEl, '4242424242424242');

      expect(inputEl.value).toBe('12');
    });

    it('should handle unknown card brand (defaults to 3 digits)', () => {
      const inputEl = {
        value: '1234',
        selectionStart: 4,
        setSelectionRange: vi.fn()
      } as unknown as HTMLInputElement;

      handleCvcInput(inputEl, '1234567890123456');

      expect(inputEl.value).toBe('123');
    });
  });
});