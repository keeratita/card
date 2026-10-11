import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CardModal, _closeAllModals } from '../../src/vanilla/modal';
import { CardForm } from '../../src/vanilla/form';
import type { PaymentGateway } from '../../src/core/domain/card';

describe('Vanilla CardModal', () => {
  let mockAdapter: PaymentGateway;

  /** Fill the form rendered inside the modal overlay and submit it. */
  function fillAndSubmitModalForm(): void {
    const formEl = document.querySelector(
      '.modal-overlay .payment-form-el',
    ) as HTMLFormElement;
    const values: Array<[string, string]> = [
      ['.card-number-input', '4242 4242 4242 4242'],
      ['.card-expiry-input', '12 / 30'],
      ['.card-cvc-input', '123'],
      ['.card-name-input', 'John Doe'],
    ];
    for (const [selector, value] of values) {
      (formEl.querySelector(selector) as HTMLInputElement).value = value;
    }
    formEl.dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
  }

  /** Let queued microtasks (tokenize chain) settle. */
  function flush(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 0));
  }

  beforeEach(() => {
    mockAdapter = {
      name: 'Stripe',
      tokenize: async () => ({ id: 'tok_1', gateway: 'stripe', raw: {} })
    };

    // Reset DOM and modal registry before each test
    document.body.innerHTML = '';
    document.body.style.overflow = '';
    document.removeEventListener('keydown', () => {});
    // jsdom implements no Web Animations API; CardForm's gateway-failure
    // path animates the grouped list, so stub the missing method.
    Element.prototype.animate = vi.fn(
      () => ({}),
    ) as unknown as typeof Element.prototype.animate;
  });

  afterEach(() => {
    // Close all tracked modals to clean up registry
    _closeAllModals();
    document.body.innerHTML = '';
    document.body.style.overflow = '';
    document.removeEventListener('keydown', () => {});
  });

  describe('Constructor', () => {
    it('should create CardModal with options', () => {
      expect(() => {
        void new CardModal({ adapter: mockAdapter });
      }).not.toThrow();
      // Construction must produce a mounted overlay, not just an instance
      expect(document.querySelector('.modal-overlay')).not.toBeNull();
    });

    it('should call onSubmit with the tokenized result on successful submit', async () => {
      const onSubmit = vi.fn();
      const modal = new CardModal({
        adapter: mockAdapter,
        onSubmit
      });
      modal.open();

      fillAndSubmitModalForm();
      await flush();

      // The documented contract: the consumer callback receives { token }
      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit).toHaveBeenCalledWith({
        token: { id: 'tok_1', gateway: 'stripe', raw: {} },
      });

      modal.destroy();
    });

    it('should pass onError through to the underlying form on gateway failure', async () => {
      const onError = vi.fn();
      const gatewayError = new Error('vault unreachable');
      const modal = new CardModal({
        adapter: {
          name: 'Stripe',
          tokenize: async () => {
            throw gatewayError;
          },
        },
        onError,
      });
      modal.open();

      fillAndSubmitModalForm();
      await flush();

      expect(onError).toHaveBeenCalledWith(gatewayError);

      modal.destroy();
    });

    it('should create CardModal with preset', () => {
      const modal = new CardModal({ 
        adapter: mockAdapter,
        preset: 'billing'
      });
      
      const overlay = document.querySelector('.modal-overlay');
      expect(overlay).not.toBeNull();
      // The preset must reach the underlying form: billing renders
      // the full address rows.
      expect(overlay?.querySelector('.card-addressLine1-input')).not.toBeNull();
      expect(overlay?.querySelector('.card-postalCode-input')).not.toBeNull();
    });
  });

  describe('DOM Elements', () => {
    it('should create modal overlay element', () => {
      void new CardModal({ adapter: mockAdapter });
      
      // The overlay should be appended to body — querySelector returns null
      // (not undefined) when missing, so toBeDefined() could never fail.
      const overlay = document.querySelector('.modal-overlay');
      expect(overlay).not.toBeNull();
      expect(overlay?.parentElement).toBe(document.body);
    });

    it('should create modal content element', () => {
      new CardModal({ adapter: mockAdapter });
      
      const overlay = document.querySelector('.modal-overlay');
      const content = document.querySelector('.modal-content');
      expect(content).not.toBeNull();
      expect(content?.parentElement).toBe(overlay);
    });

    it('should set role attribute on modal content', () => {
      new CardModal({ adapter: mockAdapter });
      
      const content = document.querySelector('.modal-content');
      expect(content?.getAttribute('role')).toBe('dialog');
    });

    it('should set aria-modal attribute on modal content', () => {
      new CardModal({ adapter: mockAdapter });
      
      const content = document.querySelector('.modal-content');
      expect(content?.getAttribute('aria-modal')).toBe('true');
    });

    it('should set aria-label on modal content', () => {
      new CardModal({ adapter: mockAdapter });
      
      const content = document.querySelector('.modal-content');
      expect(content?.getAttribute('aria-label')).toBe('Credit Card Checkout');
    });

    it('should create close button', () => {
      new CardModal({ adapter: mockAdapter });
      
      const closeBtn = document.querySelector('.modal-close-btn');
      expect(closeBtn).not.toBeNull();
    });

    it('should set aria-label on close button', () => {
      new CardModal({ adapter: mockAdapter });
      
      const closeBtn = document.querySelector('.modal-close-btn') as HTMLButtonElement;
      expect(closeBtn.getAttribute('aria-label')).toBe('Close checkout modal');
    });

    it('should have × text on close button', () => {
      new CardModal({ adapter: mockAdapter });
      
      const closeBtn = document.querySelector('.modal-close-btn') as HTMLButtonElement;
      expect(closeBtn.textContent).toBe('×');
    });
  });

  describe('open method', () => {
    let modal: CardModal;

    beforeEach(() => {
      modal = new CardModal({ adapter: mockAdapter });
    });

    it('should add active class to overlay when opened', () => {
      modal.open();
      
      const overlay = document.querySelector('.modal-overlay');
      expect(overlay?.classList.contains('active')).toBe(true);
    });

    it('should set body overflow to hidden when opened', () => {
      modal.open();
      
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should set body overflow to hidden and overlay active when opened', () => {
      expect(document.body.style.overflow).toBe('');
      const overlay = document.querySelector('.modal-overlay');
      expect(overlay?.classList.contains('active')).toBe(false);

      modal.open();

      expect(document.body.style.overflow).toBe('hidden');
      expect(overlay?.classList.contains('active')).toBe(true);
    });

    it('should not open if already active (idempotent)', () => {
      const overlay = document.querySelector('.modal-overlay') as HTMLDivElement;
      modal.open();
      const activeBefore = overlay.classList.contains('active');

      modal.open();

      // Should still be active (no duplicate effects)
      expect(overlay.classList.contains('active')).toBe(activeBefore);
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should close modal when pressing Escape key', () => {
      modal.open();
      
      // Get the overlay element
      const overlay = document.querySelector('.modal-overlay');
      
      // Verify modal is open
      expect(document.body.style.overflow).toBe('hidden');
      expect(overlay?.classList.contains('active')).toBe(true);
      
      // Dispatch escape key event
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(escapeEvent);
      
      // Modal should close on escape
      expect(overlay?.classList.contains('active')).toBe(false);
    });
  });

  describe('close method', () => {
    let modal: CardModal;
    
    beforeEach(() => {
      modal = new CardModal({ adapter: mockAdapter });
      modal.open();
    });
    
    it('should remove active class from overlay when closed', () => {
      modal.close();
      
      const overlay = document.querySelector('.modal-overlay');
      expect(overlay?.classList.contains('active')).toBe(false);
    });

    it('should restore body overflow and remove active class when closed', () => {
      expect(document.body.style.overflow).toBe('hidden');
      const overlay = document.querySelector('.modal-overlay');
      expect(overlay?.classList.contains('active')).toBe(true);

      modal.close();

      expect(document.body.style.overflow).toBe('');
      expect(overlay?.classList.contains('active')).toBe(false);
    });

    it('should be a no-op if not active (count unchanged)', () => {
      // Create a new modal instance that was never opened
      const modal2 = new CardModal({ adapter: mockAdapter });
      // Close should not throw and should leave state unchanged
      expect(() => modal2.close()).not.toThrow();
    });

    it('should remove the keydown listeners added on open when closed', () => {
      // Close the beforeEach-opened modal so the registry is clean, then
      // install spies BEFORE opening a fresh modal
      modal.close();

      const added: Array<[string, unknown]> = [];
      const addSpy = vi
        .spyOn(document, 'addEventListener')
        .mockImplementation(((type: string, handler: EventListenerOrEventListenerObject) => {
          added.push([type, handler]);
        }) as typeof document.addEventListener);
      const removeSpy = vi
        .spyOn(document, 'removeEventListener')
        .mockImplementation(((type: string, handler: EventListenerOrEventListenerObject) => {
          const idx = added.findIndex(([t, h]) => t === type && h === handler);
          if (idx >= 0) added.splice(idx, 1);
        }) as typeof document.removeEventListener);

      try {
        const freshModal = new CardModal({ adapter: mockAdapter });
        freshModal.open();
        expect(added.length).toBeGreaterThan(0);

        freshModal.close();

        // Every keydown listener registered by open() must be removed on close
        expect(added).toHaveLength(0);
      } finally {
        addSpy.mockRestore();
        removeSpy.mockRestore();
      }
    });

    it('should remove the old focus-trap listener when a non-last modal closes', () => {
      const modal2 = new CardModal({ adapter: mockAdapter });

      const removed: Array<[string, unknown]> = [];
      const removeSpy = vi
        .spyOn(document, 'removeEventListener')
        .mockImplementation(((type: string, handler: EventListenerOrEventListenerObject) => {
          removed.push([type, handler]);
        }) as typeof document.removeEventListener);

      try {
        modal.open();
        modal2.open();
        modal.close();

        const escapeRemovals = removed.filter(([t]) => t === 'keydown');
        expect(escapeRemovals.length).toBeGreaterThanOrEqual(2);
      } finally {
        removeSpy.mockRestore();
      }

      modal2.close();
    });
  });

  describe('destroy method', () => {
    let modal: CardModal;
    
    beforeEach(() => {
      modal = new CardModal({ adapter: mockAdapter });
    });
    
    it('should remove overlay from DOM', () => {
      modal.destroy();
      
      const overlay = document.querySelector('.modal-overlay');
      expect(overlay).toBeNull();
    });

    it('should close modal before destroying', () => {
      modal.open();
      modal.destroy();
      
      const overlay = document.querySelector('.modal-overlay');
      expect(overlay).toBeNull();
    });
  });

  describe('getFormInstance method', () => {
    let modal: CardModal;
    
    beforeEach(() => {
      modal = new CardModal({ adapter: mockAdapter });
    });
    
    it('should return CardForm instance', () => {
      const form = modal.getFormInstance();

      expect(form).toBeInstanceOf(CardForm);
      // It is the form rendered inside the modal, not a detached copy:
      // the overlay holds exactly one payment form wired to this instance.
      const overlay = document.querySelector('.modal-overlay') as HTMLElement;
      expect(overlay.querySelectorAll('.payment-form-el')).toHaveLength(1);
    });
  });

  describe('Backdrop click', () => {
    let modal: CardModal;
    
    beforeEach(() => {
      modal = new CardModal({ adapter: mockAdapter });
      modal.open();
    });
    
    it('should close modal when clicking outside content', () => {
      const overlay = document.querySelector('.modal-overlay') as HTMLDivElement;
      overlay.click();
      
      expect(overlay.classList.contains('active')).toBe(false);
    });

    it('should not close modal when clicking on content', () => {
      const content = document.querySelector('.modal-content') as HTMLDivElement;
      content.click();
      
      const overlay = document.querySelector('.modal-overlay') as HTMLDivElement;
      expect(overlay.classList.contains('active')).toBe(true);
    });
  });

  describe('Close button click', () => {
    let modal: CardModal;
    
    beforeEach(() => {
      modal = new CardModal({ adapter: mockAdapter });
      modal.open();
    });
    
    it('should close modal when clicking close button', () => {
      const closeBtn = document.querySelector('.modal-close-btn') as HTMLButtonElement;
      closeBtn.click();
      
      const overlay = document.querySelector('.modal-overlay') as HTMLDivElement;
      expect(overlay.classList.contains('active')).toBe(false);
    });
  });

  describe('Escape key', () => {
    let modal: CardModal;

    beforeEach(() => {
      modal = new CardModal({ adapter: mockAdapter });
      modal.open();
    });

    afterEach(() => {
      modal.close();
    });
    
    it('should close modal when pressing Escape', () => {
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(escapeEvent);
      
      const overlay = document.querySelector('.modal-overlay') as HTMLDivElement;
      expect(overlay.classList.contains('active')).toBe(false);
    });

    it('should not close modal when pressing other keys', () => {
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      document.dispatchEvent(enterEvent);
      
      const overlay = document.querySelector('.modal-overlay') as HTMLDivElement;
      expect(overlay.classList.contains('active')).toBe(true);
    });
  });

  describe('Multiple modals', () => {
    it('should track multiple modal instances independently', () => {
      const modal1 = new CardModal({ adapter: mockAdapter });
      const modal2 = new CardModal({ adapter: mockAdapter });
      const overlay = document.querySelector('.modal-overlay') as HTMLDivElement;

      modal1.open();
      expect(document.body.style.overflow).toBe('hidden');
      expect(overlay.classList.contains('active')).toBe(true);

      // Open a second modal — state should still be active + hidden
      modal2.open();
      expect(document.body.style.overflow).toBe('hidden');
      // Note: second modal also appends to body, so we now have two overlays
      const overlays = document.querySelectorAll('.modal-overlay');
      expect(overlays.length).toBe(2);
      // The overlay from modal2 should also be active
      expect(overlays[1].classList.contains('active')).toBe(true);

      // Close first modal — second should remain open
      modal1.close();
      expect(document.body.style.overflow).toBe('hidden');
      expect(overlays[1].classList.contains('active')).toBe(true);

      // Close second modal — everything should be restored
      modal2.close();
      expect(document.body.style.overflow).toBe('');
      expect(overlays[1].classList.contains('active')).toBe(false);
    });

    it('should restore body overflow only after last modal closes', () => {
      const modal1 = new CardModal({ adapter: mockAdapter });
      const modal2 = new CardModal({ adapter: mockAdapter });
      
      modal1.open();
      expect(document.body.style.overflow).toBe('hidden');
      
      modal2.open();
      expect(document.body.style.overflow).toBe('hidden');
      
      modal1.close();
      // First modal closes but second is still open, so overflow should remain hidden
      expect(document.body.style.overflow).toBe('hidden');
      
      modal2.close();
      // Last modal closes, so overflow should be restored to initial state ('')
      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('onSubmit interception', () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    it('should call the consumer onSubmit with { token } after tokenization', async () => {
      vi.useFakeTimers();
      const onSubmit = vi.fn();
      const modal = new CardModal({
        adapter: mockAdapter,
        onSubmit
      });

      modal.open();
      fillAndSubmitModalForm();
      // Flush the tokenize promise chain
      await vi.advanceTimersByTimeAsync(0);

      // The modal intercepts onSubmit but must still forward the payload
      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(onSubmit).toHaveBeenCalledWith({
        token: { id: 'tok_1', gateway: 'stripe', raw: {} },
      });

      modal.destroy();
    });

    it('should keep the modal open until the host callback settles, then close it', async () => {
      vi.useFakeTimers();
      let resolveHost!: () => void;
      const onSubmit = vi.fn(
        () =>
          new Promise<void>((resolve) => {
            resolveHost = resolve;
          }),
      );
      const modal = new CardModal({
        adapter: mockAdapter,
        onSubmit
      });

      modal.open();
      const overlay = document.querySelector('.modal-overlay') as HTMLDivElement;

      fillAndSubmitModalForm();
      // Past the 1.5s close delay — but the host callback is still pending,
      // so the interception must await it instead of closing.
      await vi.advanceTimersByTimeAsync(2000);
      expect(onSubmit).toHaveBeenCalledTimes(1);
      expect(overlay.classList.contains('active')).toBe(true);
      expect(document.body.style.overflow).toBe('hidden');

      resolveHost();
      await vi.advanceTimersByTimeAsync(1500);
      expect(overlay.classList.contains('active')).toBe(false);
      expect(document.body.style.overflow).toBe('');

      modal.destroy();
    });
  });
});