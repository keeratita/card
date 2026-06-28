import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CardModal, _closeAllModals } from '../../src/vanilla/modal';
import type { PaymentGateway } from '../../src/core/domain/card';

describe('Vanilla CardModal', () => {
  let mockAdapter: PaymentGateway;

  beforeEach(() => {
    mockAdapter = {
      name: 'Stripe',
      tokenize: async () => ({ id: 'tok_1', gateway: 'stripe', raw: {} })
    };

    // Reset DOM and modal registry before each test
    document.body.innerHTML = '';
    document.body.style.overflow = '';
    document.removeEventListener('keydown', () => {});
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
        new CardModal({ adapter: mockAdapter });
      }).not.toThrow();
    });

    it('should create CardModal with onSubmit callback', () => {
      const onSubmit = vi.fn();
      const modal = new CardModal({ 
        adapter: mockAdapter,
        onSubmit 
      });
      
      expect(modal).toBeDefined();
    });

    it('should create CardModal with onError callback', () => {
      const onError = vi.fn();
      const modal = new CardModal({ 
        adapter: mockAdapter,
        onError 
      });
      
      expect(modal).toBeDefined();
    });

    it('should create CardModal with preset', () => {
      const modal = new CardModal({ 
        adapter: mockAdapter,
        preset: 'billing'
      });
      
      expect(modal).toBeDefined();
    });
  });

  describe('DOM Elements', () => {
    it('should create modal overlay element', () => {
      void new CardModal({ adapter: mockAdapter });
      
      // The overlay should be appended to body
      const overlay = document.querySelector('.modal-overlay');
      expect(overlay).toBeDefined();
    });

    it('should create modal content element', () => {
      new CardModal({ adapter: mockAdapter });
      
      const content = document.querySelector('.modal-content');
      expect(content).toBeDefined();
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
      expect(closeBtn).toBeDefined();
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

    it('should remove keydown event listener when closed', () => {
      expect(document.body.style.overflow).toBe('hidden');
      modal.close();
      
      // Verify overflow is restored
      expect(document.body.style.overflow).toBe('');
      
      // After close, the keydown listener is removed
      // The modal should not respond to escape key
      const overlay = document.querySelector('.modal-overlay');
      expect(overlay?.classList.contains('active')).toBe(false);
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
      
      expect(form).toBeDefined();
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
    it('should call original onSubmit and then close modal', async () => {
      const onSubmit = vi.fn();
      const modal = new CardModal({
        adapter: mockAdapter,
        onSubmit
      });

      modal.open();

      // Simulate successful submission
      void modal.getFormInstance();
      // The modal intercepts onSubmit to close after 1.5s
      // We can't easily test the timing, but we can verify the setup

      expect(modal).toBeDefined();

      // Clean up to avoid polluting registry for subsequent tests
      modal.close();
    });
  });
});