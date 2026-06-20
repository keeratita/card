import { CardForm } from './form';
import { CardFormOptions } from '../core/domain/card';

/** Global counter and overflow stack shared across all CardModal instances. */
const _modalOpenCount = { value: 0 };
const _savedBodyOverflowStack: string[] = [];

/** @internal Test-only reset — clears the module-level counter and overflow stack. */
export function _resetModalGlobals(): void {
  _modalOpenCount.value = 0;
  _savedBodyOverflowStack.length = 0;
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
    // Create overlay container
    this.overlayEl = document.createElement('div');
    this.overlayEl.className = 'modal-overlay';

    // Create modal dialog content area
    const contentEl = document.createElement('div');
    contentEl.className = 'modal-content';
    contentEl.setAttribute('role', 'dialog');
    contentEl.setAttribute('aria-modal', 'true');
    contentEl.setAttribute('aria-label', 'Credit Card Checkout');

    // Create close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'modal-close-btn';
    closeBtn.textContent = '×';
    closeBtn.setAttribute('aria-label', 'Close checkout modal');

    // Placeholder to render the CardForm inside
    const formPlaceholder = document.createElement('div');

    contentEl.appendChild(closeBtn);
    contentEl.appendChild(formPlaceholder);
    this.overlayEl.appendChild(contentEl);
    document.body.appendChild(this.overlayEl);

    // Intercept onSubmit to close modal 1.5s after success
    const originalOnSubmit = this.options.onSubmit;
    const interceptedOptions: CardFormOptions = {
      ...this.options,
      onSubmit: async (data) => {
        if (originalOnSubmit) {
          const result = originalOnSubmit(data);
          if (result instanceof Promise) {
            await result;
          }
        }
        setTimeout(() => {
          this.close();
        }, 1500);
      },
    };

    this.formInstance = new CardForm(formPlaceholder, interceptedOptions);

    // Close on clicking backdrop
    this.overlayEl.addEventListener('click', (e) => {
      if (e.target === this.overlayEl) {
        this.close();
      }
    });

    // Close on clicking close button
    const closeBtnEl = this.overlayEl.querySelector('.modal-close-btn');
    if (closeBtnEl) {
      closeBtnEl.addEventListener('click', () => {
        this.close();
      });
    }

    // Bind accessibility keyboard handlers
    this.handleEscape = this._handleEscape.bind(this);
    this.handleFocusTrap = this._handleFocusTrap.bind(this);
  }

  public open(): void {
    if (this.overlayEl.classList.contains('active')) return;

    // Save the element that had focus before opening (for restoration on close)
    this.previousFocus = document.activeElement as HTMLElement;

    const overflow = document.body.style.overflow;
    _savedBodyOverflowStack[_modalOpenCount.value] = overflow;
    _modalOpenCount.value += 1;

    this.overlayEl.classList.add('active');
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', this.handleEscape);
    document.addEventListener('keydown', this.handleFocusTrap);

    // Move focus to first focusable element in modal
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
    _modalOpenCount.value -= 1;

    if (_modalOpenCount.value <= 0) {
      _modalOpenCount.value = 0;
      // No more open modals — restore original overflow
      document.body.style.overflow = _savedBodyOverflowStack[0] || '';
      _savedBodyOverflowStack.length = 0;
      document.removeEventListener('keydown', this.handleFocusTrap);
    } else {
      // Another modal is still open — restore its overflow setting
      document.body.style.overflow = _savedBodyOverflowStack[_modalOpenCount.value] || 'hidden';
    }

    document.removeEventListener('keydown', this.handleEscape);

    // Restore focus to the element that triggered the modal
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
      // Shift+Tab: if on first element, wrap to last
      if (document.activeElement === firstFocusable) {
        e.preventDefault();
        lastFocusable.focus();
      }
    } else {
      // Tab: if on last element, wrap to first
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
