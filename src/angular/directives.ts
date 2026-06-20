import { Directive, ElementRef, input } from '@angular/core';
import {
  handleCardNumberInput,
  handleExpiryInput,
  handleCvcInput,
} from './directive-helpers';

/**
 * Angular directive to automatically format card numbers with correct spacing (e.g. 4-6-5 for Amex, 4-4-4-4 for standard).
 * Uses Angular v20+ host binding syntax instead of @HostListener decorator.
 */
@Directive({
  selector: '[kgCardNumber]',
  standalone: true,
  host: {
    '(input)': 'onInput()',
  },
})
export class CardNumberDirective {
  constructor(private el: ElementRef<HTMLInputElement>) {}

  onInput(): void {
    handleCardNumberInput(this.el.nativeElement);
  }
}

/**
 * Angular directive to automatically format card expiry inputs to MM / YY layout.
 * Uses Angular v20+ host binding syntax instead of @HostListener decorator.
 */
@Directive({
  selector: '[kgCardExpiry]',
  standalone: true,
  host: {
    '(input)': 'onInput()',
  },
})
export class CardExpiryDirective {
  constructor(private el: ElementRef<HTMLInputElement>) {}

  onInput(): void {
    handleExpiryInput(this.el.nativeElement);
  }
}

/**
 * Angular directive to automatically mask CVC input fields, validating length dynamically based on card brand.
 * Uses Angular v20+ input() signal and host binding syntax instead of @Input and @HostListener decorators.
 */
@Directive({
  selector: '[kgCardCvc]',
  standalone: true,
  host: {
    '(input)': 'onInput()',
  },
})
export class CardCvcDirective {
  /**
   * Reference value or control string of the card number to dynamically restrict length (3 vs 4 digits).
   * Using Angular v20+ input() signal API.
   */
  cardNumber = input<string>('');

  constructor(private el: ElementRef<HTMLInputElement>) {}

  onInput(): void {
    handleCvcInput(this.el.nativeElement, this.cardNumber());
  }
}