import { Directive, inject, ElementRef, input } from '@angular/core';
import {
  handleCardNumberInput,
  handleExpiryInput,
  handleCvcInput,
} from './directive-helpers';

/**
 * Angular directive to automatically format card numbers with correct spacing (e.g. 4-6-5 for Amex, 4-4-4-4 for standard).
 * Uses the modern `host` binding object and `inject()` instead of @HostListener decorators / constructor DI.
 */
@Directive({
  selector: '[kgCardNumber]',
  // Explicitly standalone — see CountrySelectComponent note: esbuild-emitted
  // decorators require the flag for consumer AOT builds.
  standalone: true,
  host: {
    '(input)': 'onInput()',
  },
})
export class CardNumberDirective {
  private readonly el = inject(ElementRef<HTMLInputElement>);

  onInput(): void {
    handleCardNumberInput(this.el.nativeElement);
  }
}

/**
 * Angular directive to automatically format card expiry inputs to MM / YY layout.
 * Uses the modern `host` binding object and `inject()` instead of @HostListener decorators / constructor DI.
 */
@Directive({
  selector: '[kgCardExpiry]',
  standalone: true,
  host: {
    '(input)': 'onInput()',
  },
})
export class CardExpiryDirective {
  private readonly el = inject(ElementRef<HTMLInputElement>);

  onInput(): void {
    handleExpiryInput(this.el.nativeElement);
  }
}

/**
 * Angular directive to automatically mask CVC input fields, validating length dynamically based on card brand.
 * Uses signal-based `input()` and modern `host`/`inject()` APIs instead of @Input/@HostListener/constructor DI.
 */
@Directive({
  selector: '[kgCardCvc]',
  standalone: true,
  host: {
    '(input)': 'onInput()',
  },
})
export class CardCvcDirective {
  cardNumber = input<string>('');

  private readonly el = inject(ElementRef<HTMLInputElement>);

  onInput(): void {
    handleCvcInput(this.el.nativeElement, this.cardNumber());
  }
}
