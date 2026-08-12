import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createEnvironmentInjector,
  ElementRef,
} from '@angular/core';
import {
  CardNumberDirective,
  CardExpiryDirective,
  CardCvcDirective,
} from '../../src/angular/directives';
import { handleCardNumberInput, handleExpiryInput, handleCvcInput } from '../../src/angular/directive-helpers';

// Mock directive helpers first
vi.mock('../../src/angular/directive-helpers', () => ({
  handleCardNumberInput: vi.fn(),
  handleExpiryInput: vi.fn(),
  handleCvcInput: vi.fn(),
}));

const mockHandleCardNumberInput = vi.mocked(handleCardNumberInput);
const mockHandleExpiryInput = vi.mocked(handleExpiryInput);
const mockHandleCvcInput = vi.mocked(handleCvcInput);

/**
 * Instantiates a directive inside a real injection context so signal-based
 * APIs (`inject()`, `input()`) work — the modern alternative to mocking
 * @angular/core.
 */
function createDirective<T>(DirectiveClass: new () => T, nativeElement: HTMLInputElement): T {
  const injector = createEnvironmentInjector(
    [{ provide: ElementRef, useValue: new ElementRef(nativeElement) }],
    null,
  );
  return injector.runInContext(() => new DirectiveClass());
}

describe('Angular Directives', () => {
  let nativeElement: HTMLInputElement;

  beforeEach(() => {
    nativeElement = document.createElement('input');
    mockHandleCardNumberInput.mockClear();
    mockHandleExpiryInput.mockClear();
    mockHandleCvcInput.mockClear();
  });

  describe('CardNumberDirective', () => {
    it('should be created', () => {
      const directive = createDirective(CardNumberDirective, nativeElement);
      expect(directive).toBeDefined();
    });

    it('should have onInput method', () => {
      const directive = createDirective(CardNumberDirective, nativeElement);
      expect(typeof directive.onInput).toBe('function');
    });

    it('should call handleCardNumberInput on onInput', () => {
      const directive = createDirective(CardNumberDirective, nativeElement);
      directive.onInput();
      expect(mockHandleCardNumberInput).toHaveBeenCalledWith(nativeElement);
    });
  });

  describe('CardExpiryDirective', () => {
    let directive: CardExpiryDirective;

    beforeEach(() => {
      directive = createDirective(CardExpiryDirective, nativeElement);
    });

    it('should be created', () => {
      expect(directive).toBeDefined();
    });

    it('should have onInput method', () => {
      expect(typeof directive.onInput).toBe('function');
    });

    it('should call handleExpiryInput on onInput', () => {
      directive.onInput();
      expect(mockHandleExpiryInput).toHaveBeenCalledWith(nativeElement);
    });
  });

  describe('CardCvcDirective', () => {
    let directive: CardCvcDirective;

    beforeEach(() => {
      directive = createDirective(CardCvcDirective, nativeElement);
    });

    it('should be created', () => {
      expect(directive).toBeDefined();
    });

    it('should have cardNumber property (signal input)', () => {
      expect(directive.cardNumber).toBeDefined();
    });

    it('should have onInput method', () => {
      expect(typeof directive.onInput).toBe('function');
    });

    it('should call handleCvcInput on onInput', () => {
      directive.onInput();
      expect(mockHandleCvcInput).toHaveBeenCalled();
    });
  });
});
