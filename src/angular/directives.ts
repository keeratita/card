import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { handleCardNumberInput, handleExpiryInput, handleCvcInput } from './directive-helpers';

/**
 * Angular directive to automatically format card numbers with correct spacing (e.g. 4-6-5 for Amex, 4-4-4-4 for standard).
 */
@Directive({
  selector: '[kgCardNumber]',
  standalone: true
})
export class CardNumberDirective {
  constructor(private el: ElementRef<HTMLInputElement>) {}

  @HostListener('input')
  onInput(): void {
    handleCardNumberInput(this.el.nativeElement);
  }
}

/**
 * Angular directive to automatically format card expiry inputs to MM / YY layout.
 */
@Directive({
  selector: '[kgCardExpiry]',
  standalone: true
})
export class CardExpiryDirective {
  constructor(private el: ElementRef<HTMLInputElement>) {}

  @HostListener('input')
  onInput(): void {
    handleExpiryInput(this.el.nativeElement);
  }
}

/**
 * Angular directive to automatically mask CVC input fields, validating length dynamically based on card brand.
 */
@Directive({
  selector: '[kgCardCvc]',
  standalone: true
})
export class CardCvcDirective {
  /**
   * Reference value or control string of the card number to dynamically restrict length (3 vs 4 digits).
   */
  @Input('kgCardCvcNumber') cardNumber: string = '';

  constructor(private el: ElementRef<HTMLInputElement>) {}

  @HostListener('input')
  onInput(): void {
    handleCvcInput(this.el.nativeElement, this.cardNumber);
  }
}
