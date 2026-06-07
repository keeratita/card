import { describe, it, expect } from 'vitest';
import { detectCardBrand } from '../../src/core/domain/brand';

describe('Card Brand Detection', () => {
  it('should detect Visa cards starting with 4', () => {
    expect(detectCardBrand('4111111111111111')).toBe('visa');
    expect(detectCardBrand('4222 2222 2222 2222')).toBe('visa');
  });

  it('should detect Mastercard starting with 51-55 or 22-27', () => {
    expect(detectCardBrand('5111111111111111')).toBe('mastercard');
    expect(detectCardBrand('5555 5555 5555 5555')).toBe('mastercard');
    expect(detectCardBrand('2221000000000000')).toBe('mastercard');
  });

  it('should detect Amex cards starting with 34 or 37', () => {
    expect(detectCardBrand('341111111111111')).toBe('amex');
    expect(detectCardBrand('3777 7777 7777 777')).toBe('amex');
  });

  it('should detect JCB cards starting with 35', () => {
    expect(detectCardBrand('3528111111111111')).toBe('jcb');
  });

  it('should return unknown for unrecognized patterns', () => {
    expect(detectCardBrand('6011111111111111')).toBe('unknown');
    expect(detectCardBrand('')).toBe('unknown');
  });
});
