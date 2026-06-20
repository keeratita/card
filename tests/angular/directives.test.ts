import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { handleCardNumberInput, handleExpiryInput, handleCvcInput } from '../../src/angular/directive-helpers';

// Mock directive helpers first
const mockHandleCardNumberInput = vi.fn();
const mockHandleExpiryInput = vi.fn();
const mockHandleCvcInput = vi.fn();

vi.mock('../../src/angular/directive-helpers', () => ({
  handleCardNumberInput: mockHandleCardNumberInput,
  handleExpiryInput: mockHandleExpiryInput,
  handleCvcInput: mockHandleCvcInput
}));

// Store the original input function
let OriginalInput: typeof import('@angular/core').input | undefined;

describe('Angular Directives', () => {
  let CardNumberDirective: any;
  let CardExpiryDirective: any;
  let CardCvcDirective: any;

  beforeAll(async () => {
    // Save original input function and replace with a mock that returns a function
    const angularCore = await vi.importActual<typeof import('@angular/core')>('@angular/core');
    OriginalInput = angularCore.input;

    // Replace input() with a simple function that returns a signal-like function
    // This is needed because CardCvcDirective uses input() which requires injection context
    vi.doMock('@angular/core', async () => {
      const actual = await vi.importActual<typeof import('@angular/core')>('@angular/core');
      return {
        ...actual,
        input: vi.fn((defaultVal: string) => () => defaultVal),
      };
    });

    // Now import the directives - they will use our mocked input()
    const mod = await import('../../src/angular/directives');
    CardNumberDirective = mod.CardNumberDirective;
    CardExpiryDirective = mod.CardExpiryDirective;
    CardCvcDirective = mod.CardCvcDirective;
  });

  describe('CardNumberDirective', () => {
    let directive: any;
    let mockNativeElement: HTMLInputElement;

    beforeEach(() => {
      mockNativeElement = document.createElement('input');
      mockHandleCardNumberInput.mockClear();
      mockHandleExpiryInput.mockClear();
      mockHandleCvcInput.mockClear();
    });

    it('should be created', () => {
      const mockElementRef = { nativeElement: mockNativeElement };
      directive = new CardNumberDirective(mockElementRef);
      expect(directive).toBeDefined();
    });

    it('should have onInput method', () => {
      const mockElementRef = { nativeElement: mockNativeElement };
      directive = new CardNumberDirective(mockElementRef);
      expect(typeof directive.onInput).toBe('function');
    });

    it('should call handleCardNumberInput on onInput', () => {
      const mockElementRef = { nativeElement: mockNativeElement };
      directive = new CardNumberDirective(mockElementRef);
      directive.onInput();
      expect(mockHandleCardNumberInput).toHaveBeenCalledWith(mockNativeElement);
    });
  });

  describe('CardExpiryDirective', () => {
    let directive: any;
    let mockNativeElement: HTMLInputElement;

    beforeEach(() => {
      mockNativeElement = document.createElement('input');
      mockHandleCardNumberInput.mockClear();
      mockHandleExpiryInput.mockClear();
      mockHandleCvcInput.mockClear();
      const mockElementRef = { nativeElement: mockNativeElement };
      directive = new CardExpiryDirective(mockElementRef);
    });

    it('should be created', () => {
      expect(directive).toBeDefined();
    });

    it('should have onInput method', () => {
      expect(typeof directive.onInput).toBe('function');
    });

    it('should call handleExpiryInput on onInput', () => {
      directive.onInput();
      expect(mockHandleExpiryInput).toHaveBeenCalledWith(mockNativeElement);
    });
  });

  describe('CardCvcDirective', () => {
    let directive: any;
    let mockNativeElement: HTMLInputElement;

    beforeEach(() => {
      mockNativeElement = document.createElement('input');
      mockHandleCardNumberInput.mockClear();
      mockHandleExpiryInput.mockClear();
      mockHandleCvcInput.mockClear();
      const mockElementRef = { nativeElement: mockNativeElement };
      directive = new CardCvcDirective(mockElementRef);
    });

    it('should be created', () => {
      expect(directive).toBeDefined();
    });

    it('should have cardNumber property', () => {
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

describe('Directive Exports', () => {
  it('should export CardNumberDirective', async () => {
    const mod = await import('../../src/angular/directives');
    expect(mod.CardNumberDirective).toBeDefined();
  });

  it('should export CardExpiryDirective', async () => {
    const mod = await import('../../src/angular/directives');
    expect(mod.CardExpiryDirective).toBeDefined();
  });

  it('should export CardCvcDirective', async () => {
    const mod = await import('../../src/angular/directives');
    expect(mod.CardCvcDirective).toBeDefined();
  });
});