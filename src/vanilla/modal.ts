import { CardForm } from './form';
import { CardFormOptions } from '../core/domain/card';
import { isThenable } from '../core/form/is-thenable';

const MODAL_CLOSE_DELAY_MS = 1500;

/** Singleton registry for managing stacked modals (overflow + focus restoration). */
const modalRegistry: Map<CardModal, string> = new Map();

/** @internal Close and remove all tracked modals. Used by tests to reset state. */
export function _closeAllModals(): void {
  for (const modal of modalRegistry.keys()) {
    modal.close();
  }
}

export class CardModal {
  private overlayEl!: HTMLDivElement;
  private formInstance!: CardForm;
  private readonly options: CardFormOptions;
  private previousFocus: HTMLElement | null = null;
  private handleEscape!: (e: KeyboardEvent) => void;
  private handleFocusTrap!: (e: KeyboardEvent) => void;

  constructor(options: CardFormOptions) {
    this.options = options;
    this.init();
  }

  private init(): void {
    this.overlayEl = document.createElement('div');
    this.overlayEl.className = 'modal-overlay';

    const contentEl = document.createElement('div');
    contentEl.className = 'modal-content';
    contentEl.setAttribute('role', 'dialog');
    contentEl.setAttribute('aria-modal', 'true');
    contentEl.setAttribute('aria-label', 'Credit Card Checkout');

    const closeBtn = document.createElement('button');
    closeBtn.className = 'modal-close-btn';
    closeBtn.textContent = '\u00D7';
    closeBtn.setAttribute('aria-label', 'Close checkout modal');

    const formPlaceholder = document.createElement('div');

    contentEl.appendChild(closeBtn);
    contentEl.appendChild(formPlaceholder);
    this.overlayEl.appendChild(contentEl);
    document.body.appendChild(this.overlayEl);

    const originalOnSubmit = this.options.onSubmit;
    const interceptedOptions: CardFormOptions = {
      ...this.options,
      onSubmit: async (data) => {
        if (originalOnSubmit) {
          const result = originalOnSubmit(data);
          // Await thenables (incl. cross-realm promises) so the double-loading
          // lifecycle waits for the host backend
          if (isThenable(result)) {
            await result;
          }
        }
        setTimeout(() => this.close(), MODAL_CLOSE_DELAY_MS);
      },
    };

    this.formInstance = new CardForm(formPlaceholder, interceptedOptions);

    this.overlayEl.addEventListener('click', (e) => {
      if (e.target === this.overlayEl) {
        this.close();
      }
    });

    const closeBtnEl = this.overlayEl.querySelector('.modal-close-btn');
    if (closeBtnEl) {
      closeBtnEl.addEventListener('click', () => this.close());
    }

    this.handleEscape = this._handleEscape.bind(this);
    this.handleFocusTrap = this._handleFocusTrap.bind(this);
  }

  public open(): void {
    if (this.overlayEl.classList.contains('active')) return;

    this.previousFocus = document.activeElement as HTMLElement;

    // Share overflow state with registry for stacking support
    const currentOverflow = document.body.style.overflow;
    const myOverflow = currentOverflow;
    const openCount = modalRegistry.size;

    modalRegistry.set(this, myOverflow);
    // First open modal sets overflow to hidden; subsequent modals share it
    if (openCount === 0) {
      document.body.style.overflow = 'hidden';
    }

    this.overlayEl.classList.add('active');
    document.addEventListener('keydown', this.handleEscape);
    document.addEventListener('keydown', this.handleFocusTrap);

    requestAnimationFrame(() => {
      const firstInput = this.overlayEl.querySelector('input, button');
      if (firstInput && (firstInput as HTMLElement).focus) {
        (firstInput as HTMLElement).focus();
      }
    });
  }

  public close(): void {
    if (!this.overlayEl.classList.contains('active')) return;

    this.overlayEl.classList.remove('active');
    modalRegistry.delete(this);

    // Always remove both listeners when this modal closes
    document.removeEventListener('keydown', this.handleEscape);
    document.removeEventListener('keydown', this.handleFocusTrap);

    // Restore overflow when last modal closes
    if (modalRegistry.size === 0) {
      document.body.style.overflow = '';
    }

    if (this.previousFocus && (this.previousFocus as HTMLElement).focus) {
      (this.previousFocus as HTMLElement).focus();
      this.previousFocus = null;
    }
  }

  public destroy(): void {
    document.removeEventListener('keydown', this.handleEscape);
    document.removeEventListener('keydown', this.handleFocusTrap);

    this.close();
    this.overlayEl.remove();
    this.formInstance.destroy();
  }

  private _handleEscape(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      this.close();
    }
  }

  private _handleFocusTrap(e: KeyboardEvent): void {
    if (e.key !== 'Tab') return;

    const focusable = this.overlayEl.querySelectorAll(
      'input, button, [tabindex]:not([tabindex="-1"])',
    );
    if (focusable.length === 0) return;

    const firstFocusable = focusable[0] as HTMLElement;
    const lastFocusable = focusable[focusable.length - 1] as HTMLElement;

    if (e.shiftKey) {
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        e.preventDefault();
        firstFocusable.focus();
      }
    }
  }

  public getFormInstance(): CardForm {
    return this.formInstance;
  }
}
