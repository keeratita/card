import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CardForm } from '../../src/vanilla/form';
import type { CardFormOptions, PaymentGateway, Token } from '../../src/core/domain/card';

describe('Vanilla CardForm', () => {
  let mockAdapter: PaymentGateway;

  beforeEach(() => {
    mockAdapter = {
      name: 'Stripe',
      tokenize: async () => ({ id: 'tok_1', gateway: 'stripe', raw: {} })
    };

    // Setup DOM
    document.body.innerHTML = '<div id="card-form-container"></div>';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('Constructor', () => {
    it('should create CardForm with string selector', () => {
      expect(() => {
        new CardForm('#card-form-container', { adapter: mockAdapter });
      }).not.toThrow();
    });

    it('should create CardForm with HTMLElement', () => {
      const container = document.getElementById('card-form-container')!;
      expect(() => {
        new CardForm(container, { adapter: mockAdapter });
      }).not.toThrow();
    });

    it('should throw error when string selector not found', () => {
      expect(() => {
        new CardForm('#non-existent-selector', { adapter: mockAdapter });
      }).toThrow('Container element not found');
    });

    it('should initialize with default preset', () => {
      const form = new CardForm('#card-form-container', { adapter: mockAdapter });
      expect(form).toBeDefined();
    });

    it('should initialize with custom submitButtonText', () => {
      const options: CardFormOptions = {
        adapter: mockAdapter,
        submitButtonText: 'Pay Now'
      };
      const form = new CardForm('#card-form-container', options);
      expect(form).toBeDefined();
    });

    it('should initialize with custom cardLabel', () => {
      const options: CardFormOptions = {
        adapter: mockAdapter,
        cardLabel: 'Custom Payment Gateway'
      };
      const form = new CardForm('#card-form-container', options);
      expect(form).toBeDefined();
    });

    it('should initialize with preset', () => {
      const options: CardFormOptions = {
        adapter: mockAdapter,
        preset: 'billing'
      };
      const form = new CardForm('#card-form-container', options);
      expect(form).toBeDefined();
    });

    it('should initialize with fields', () => {
      const options: CardFormOptions = {
        adapter: mockAdapter,
        fields: ['phone', 'email']
      };
      const form = new CardForm('#card-form-container', options);
      expect(form).toBeDefined();
    });
  });

  describe('Rendered HTML', () => {
    it('should render card container wrapper', () => {
      new CardForm('#card-form-container', { adapter: mockAdapter });
      
      const container = document.querySelector('.kg-card-container');
      expect(container).toBeDefined();
    });

    it('should render card perspective', () => {
      new CardForm('#card-form-container', { adapter: mockAdapter });
      
      const perspective = document.querySelector('.card-perspective');
      expect(perspective).toBeDefined();
    });

    it('should render card inner element', () => {
      new CardForm('#card-form-container', { adapter: mockAdapter });
      
      const cardInner = document.querySelector('.card-inner');
      expect(cardInner).toBeDefined();
    });

    it('should render card front', () => {
      new CardForm('#card-form-container', { adapter: mockAdapter });
      
      const cardFront = document.querySelector('.card-front');
      expect(cardFront).toBeDefined();
    });

    it('should render card back', () => {
      new CardForm('#card-form-container', { adapter: mockAdapter });
      
      const cardBack = document.querySelector('.card-back');
      expect(cardBack).toBeDefined();
    });

    it('should render card chip', () => {
      new CardForm('#card-form-container', { adapter: mockAdapter });
      
      const cardChip = document.querySelector('.card-chip');
      expect(cardChip).toBeDefined();
    });

    it('should render card number display', () => {
      new CardForm('#card-form-container', { adapter: mockAdapter });
      
      const cardNumberDisplay = document.querySelector('.card-number-display');
      expect(cardNumberDisplay).toBeDefined();
    });

    it('should render card footer', () => {
      new CardForm('#card-form-container', { adapter: mockAdapter });
      
      const cardFooter = document.querySelector('.card-footer');
      expect(cardFooter).toBeDefined();
    });

    it('should render card brand logo container', () => {
      new CardForm('#card-form-container', { adapter: mockAdapter });
      
      const cardBrandLogo = document.querySelector('.card-brand-logo');
      expect(cardBrandLogo).toBeDefined();
    });

    it('should render card magnetic strip on back', () => {
      new CardForm('#card-form-container', { adapter: mockAdapter });
      
      const magneticStrip = document.querySelector('.card-magnetic-strip');
      expect(magneticStrip).toBeDefined();
    });

    it('should render card signature area', () => {
      new CardForm('#card-form-container', { adapter: mockAdapter });
      
      const signatureArea = document.querySelector('.card-signature-area');
      expect(signatureArea).toBeDefined();
    });

    it('should render card CVC display', () => {
      new CardForm('#card-form-container', { adapter: mockAdapter });
      
      const cvcDisplay = document.querySelector('.card-cvc-display');
      expect(cvcDisplay).toBeDefined();
    });

    it('should render payment form', () => {
      new CardForm('#card-form-container', { adapter: mockAdapter });
      
      const form = document.querySelector('.payment-form-el');
      expect(form).toBeDefined();
    });

    it('should render card number input', () => {
      new CardForm('#card-form-container', { adapter: mockAdapter });
      
      const numberInput = document.querySelector('.card-number-input');
      expect(numberInput).toBeDefined();
    });

    it('should render card expiry input', () => {
      new CardForm('#card-form-container', { adapter: mockAdapter });
      
      const expiryInput = document.querySelector('.card-expiry-input');
      expect(expiryInput).toBeDefined();
    });

    it('should render card CVC input', () => {
      new CardForm('#card-form-container', { adapter: mockAdapter });
      
      const cvcInput = document.querySelector('.card-cvc-input');
      expect(cvcInput).toBeDefined();
    });

    it('should render card name input', () => {
      new CardForm('#card-form-container', { adapter: mockAdapter });
      
      const nameInput = document.querySelector('.card-name-input');
      expect(nameInput).toBeDefined();
    });

    it('should render submit button', () => {
      new CardForm('#card-form-container', { adapter: mockAdapter });
      
      const submitBtn = document.querySelector('.submit-btn');
      expect(submitBtn).toBeDefined();
    });

    it('should render spinner', () => {
      new CardForm('#card-form-container', { adapter: mockAdapter });
      
      const spinner = document.querySelector('.btn-spinner');
      expect(spinner).toBeDefined();
    });

    it('should render validation error message', () => {
      new CardForm('#card-form-container', { adapter: mockAdapter });
      
      const errorMsg = document.querySelector('.validation-error-msg');
      expect(errorMsg).toBeDefined();
    });

    it('should render status panel', () => {
      new CardForm('#card-form-container', { adapter: mockAdapter });
      
      const statusPanel = document.querySelector('.status-panel');
      expect(statusPanel).toBeDefined();
    });
  });

  describe('Input attributes', () => {
    it('should have correct autocomplete attribute on number input', () => {
      new CardForm('#card-form-container', { adapter: mockAdapter });
      
      const numberInput = document.querySelector('.card-number-input') as HTMLInputElement;
      expect(numberInput.autocomplete).toBe('cc-number');
    });

    it('should have correct autocomplete attribute on expiry input', () => {
      new CardForm('#card-form-container', { adapter: mockAdapter });
      
      const expiryInput = document.querySelector('.card-expiry-input') as HTMLInputElement;
      expect(expiryInput.autocomplete).toBe('cc-exp');
    });

    it('should have correct autocomplete attribute on CVC input', () => {
      new CardForm('#card-form-container', { adapter: mockAdapter });
      
      const cvcInput = document.querySelector('.card-cvc-input') as HTMLInputElement;
      expect(cvcInput.autocomplete).toBe('cc-csc');
    });

    it('should have correct autocomplete attribute on name input', () => {
      new CardForm('#card-form-container', { adapter: mockAdapter });
      
      const nameInput = document.querySelector('.card-name-input') as HTMLInputElement;
      expect(nameInput.autocomplete).toBe('cc-name');
    });

    it('should have inputmode numeric on number input', () => {
      new CardForm('#card-form-container', { adapter: mockAdapter });
      
      const numberInput = document.querySelector('.card-number-input') as HTMLInputElement;
      expect(numberInput.inputMode).toBe('numeric');
    });

    it('should have inputmode numeric on expiry input', () => {
      new CardForm('#card-form-container', { adapter: mockAdapter });
      
      const expiryInput = document.querySelector('.card-expiry-input') as HTMLInputElement;
      expect(expiryInput.inputMode).toBe('numeric');
    });

    it('should have inputmode numeric on CVC input', () => {
      new CardForm('#card-form-container', { adapter: mockAdapter });
      
      const cvcInput = document.querySelector('.card-cvc-input') as HTMLInputElement;
      expect(cvcInput.inputMode).toBe('numeric');
    });

    it('should have required attribute on number input', () => {
      new CardForm('#card-form-container', { adapter: mockAdapter });
      
      const numberInput = document.querySelector('.card-number-input') as HTMLInputElement;
      expect(numberInput.required).toBe(true);
    });

    it('should have required attribute on expiry input', () => {
      new CardForm('#card-form-container', { adapter: mockAdapter });
      
      const expiryInput = document.querySelector('.card-expiry-input') as HTMLInputElement;
      expect(expiryInput.required).toBe(true);
    });

    it('should have required attribute on CVC input', () => {
      new CardForm('#card-form-container', { adapter: mockAdapter });
      
      const cvcInput = document.querySelector('.card-cvc-input') as HTMLInputElement;
      expect(cvcInput.required).toBe(true);
    });

    it('should have required attribute on name input', () => {
      new CardForm('#card-form-container', { adapter: mockAdapter });
      
      const nameInput = document.querySelector('.card-name-input') as HTMLInputElement;
      expect(nameInput.required).toBe(true);
    });

    it('should have maxlength 4 on CVC input', () => {
      new CardForm('#card-form-container', { adapter: mockAdapter });
      
      const cvcInput = document.querySelector('.card-cvc-input') as HTMLInputElement;
      expect(cvcInput.maxLength).toBe(4);
    });
  });

  describe('Optional fields with preset', () => {
    it('should render postalCode field with us preset', () => {
      new CardForm('#card-form-container', { 
        adapter: mockAdapter,
        preset: 'us'
      });
      
      const postalCodeInput = document.querySelector('.card-postalCode-input');
      expect(postalCodeInput).toBeDefined();
    });

    it('should render billing address fields with billing preset', () => {
      new CardForm('#card-form-container', { 
        adapter: mockAdapter,
        preset: 'billing'
      });
      
      expect(document.querySelector('.card-addressLine1-input')).toBeDefined();
      expect(document.querySelector('.card-city-input')).toBeDefined();
      expect(document.querySelector('.card-state-input')).toBeDefined();
      expect(document.querySelector('.card-postalCode-input')).toBeDefined();
      expect(document.querySelector('.card-country-input')).toBeDefined();
    });

    it('should render contact fields with contact preset', () => {
      new CardForm('#card-form-container', { 
        adapter: mockAdapter,
        preset: 'contact'
      });
      
      expect(document.querySelector('.card-phone-input')).toBeDefined();
      expect(document.querySelector('.card-email-input')).toBeDefined();
    });
  });

  describe('Custom submit button text', () => {
    it('should use custom submit button text', () => {
      new CardForm('#card-form-container', { 
        adapter: mockAdapter,
        submitButtonText: 'Complete Purchase'
      });
      
      const submitBtn = document.querySelector('.submit-btn') as HTMLButtonElement;
      expect(submitBtn.textContent).toContain('Complete Purchase');
    });

    it('should use default submit button text when not provided', () => {
      new CardForm('#card-form-container', { adapter: mockAdapter });
      
      const submitBtn = document.querySelector('.submit-btn') as HTMLButtonElement;
      expect(submitBtn.textContent).toContain('Pay Now');
    });
  });

  describe('Custom card label', () => {
    it('should use custom card label', () => {
      new CardForm('#card-form-container', { 
        adapter: mockAdapter,
        cardLabel: 'PayPal'
      });
      
      const cardLabel = document.querySelector('.card-gateway-label');
      expect(cardLabel?.textContent).toBe('PayPal');
    });

    it('should use adapter name as card label when not provided', () => {
      new CardForm('#card-form-container', { adapter: mockAdapter });
      
      const cardLabel = document.querySelector('.card-gateway-label');
      expect(cardLabel?.textContent).toBe('STRIPE');
    });
  });

  describe('Submit lifecycle', () => {
    function fillForm(formEl: HTMLFormElement): void {
      const numInput = formEl.querySelector('.card-number-input') as HTMLInputElement;
      const expInput = formEl.querySelector('.card-expiry-input') as HTMLInputElement;
      const cvcInput = formEl.querySelector('.card-cvc-input') as HTMLInputElement;
      const nameInput = formEl.querySelector('.card-name-input') as HTMLInputElement;
      numInput.value = '4242 4242 4242 4242';
      expInput.value = '12 / 30';
      cvcInput.value = '123';
      nameInput.value = 'John Doe';
    }

    function submit(formEl: HTMLFormElement): void {
      formEl.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    }

    it('should ignore re-entrant submits while tokenizing', async () => {
      let resolveTokenize!: (token: Token) => void;
      const tokenize = vi.fn(
        () =>
          new Promise<Token>((resolve) => {
            resolveTokenize = resolve;
          }),
      );
      new CardForm('#card-form-container', {
        adapter: { name: 'Stripe', tokenize },
      });
      const formEl = document.querySelector(
        '.payment-form-el',
      ) as HTMLFormElement;
      fillForm(formEl);

      submit(formEl);
      submit(formEl);

      // The guard is set synchronously, so the second submit never reaches
      // the adapter
      expect(tokenize).toHaveBeenCalledTimes(1);

      resolveTokenize({ id: 'tok_1', gateway: 'stripe', raw: {} });
      await new Promise((r) => setTimeout(r, 0));
    });

    it('should clear the CVC input after a successful tokenization', async () => {
      new CardForm('#card-form-container', { adapter: mockAdapter });
      const formEl = document.querySelector(
        '.payment-form-el',
      ) as HTMLFormElement;
      fillForm(formEl);

      submit(formEl);
      await new Promise((r) => setTimeout(r, 0));

      const cvcInput = formEl.querySelector('.card-cvc-input') as HTMLInputElement;
      const numInput = formEl.querySelector('.card-number-input') as HTMLInputElement;
      expect(cvcInput.value).toBe('');
      expect(numInput.value).toContain('4242');
      expect(numInput.value).toContain('••••');
    });
  });

  describe('Inline field error messages', () => {
    it('renders the inline error for an invalid optional field (email)', () => {
      new CardForm('#card-form-container', {
        adapter: mockAdapter,
        fields: ['email'],
      });
      const formEl = document.querySelector(
        '.payment-form-el',
      ) as HTMLFormElement;

      const numInput = formEl.querySelector('.card-number-input') as HTMLInputElement;
      const expInput = formEl.querySelector('.card-expiry-input') as HTMLInputElement;
      const cvcInput = formEl.querySelector('.card-cvc-input') as HTMLInputElement;
      const nameInput = formEl.querySelector('.card-name-input') as HTMLInputElement;
      const emailInput = formEl.querySelector('.card-email-input') as HTMLInputElement;
      numInput.value = '4242 4242 4242 4242';
      expInput.value = '12 / 30';
      cvcInput.value = '123';
      nameInput.value = 'John Doe';
      emailInput.value = 'not-an-email';

      formEl.dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true }),
      );

      // The optional-field error span must be populated (was never matched
      // when the lookup used `#<fieldId>-error` instead of `#card-<fieldId>-error`)
      const errorEl = document.getElementById('card-email-error');
      expect(errorEl).not.toBeNull();
      expect(errorEl?.textContent).toContain('email');

      // And the row must be flagged invalid
      expect(emailInput.closest('.ios-input-row')?.classList.contains('invalid')).toBe(
        true,
      );
    });

    it('keeps the inline error empty once the optional field is valid', () => {
      new CardForm('#card-form-container', {
        adapter: mockAdapter,
        fields: ['email'],
      });
      const formEl = document.querySelector(
        '.payment-form-el',
      ) as HTMLFormElement;
      const emailInput = formEl.querySelector('.card-email-input') as HTMLInputElement;
      emailInput.value = 'a@b.com';

      formEl.dispatchEvent(
        new Event('submit', { bubbles: true, cancelable: true }),
      );

      const errorEl = document.getElementById('card-email-error');
      expect(errorEl?.textContent).toBe('');
    });
  });
});