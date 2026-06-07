import { CardForm } from './form';
import { CardFormOptions } from '../core/domain/card';

export class CardModal {
  private overlayEl!: HTMLDivElement;
  private formInstance!: CardForm;
  private readonly options: CardFormOptions;
  private savedBodyOverflow: string = '';

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
      }
    };

    this.formInstance = new CardForm(formPlaceholder, interceptedOptions);

    // Close on clicking backdrop
    this.overlayEl.addEventListener('click', (e) => {
      if (e.target === this.overlayEl) {
        this.close();
      }
    });

    // Close on clicking close button
    closeBtn.addEventListener('click', () => {
      this.close();
    });

    // Bind accessibility keyboard handler
    this.handleEscape = this.handleEscape.bind(this);
  }

  public open(): void {
    this.savedBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    this.overlayEl.classList.add('active');
    document.addEventListener('keydown', this.handleEscape);
  }

  public close(): void {
    this.overlayEl.classList.remove('active');
    document.body.style.overflow = this.savedBodyOverflow;
    document.removeEventListener('keydown', this.handleEscape);
  }

  public destroy(): void {
    this.close();
    this.overlayEl.remove();
  }

  private handleEscape(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      this.close();
    }
  }

  public getFormInstance(): CardForm {
    return this.formInstance;
  }
}
