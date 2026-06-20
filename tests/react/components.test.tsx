import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CreditCardPreview, CardForm } from '../../src/react/components';
import { useCardForm, CardFormValues, UseCardFormParams } from '../../src/react/useCardForm';
import type { PaymentGateway, Token } from '../../src/core/domain/card';

// Mock useCardForm hook
vi.mock('../../src/react/useCardForm', () => ({
  useCardForm: vi.fn(),
}));

describe('React Components', () => {
  describe('CreditCardPreview', () => {
    it('should render with all props', () => {
      render(
        <CreditCardPreview
          number="4242 4242 4242 4242"
          expiry="12 / 25"
          cvc="123"
          name="John Doe"
          brand="visa"
          isFlipped={false}
          cardLabel="VISA"
        />
      );

      expect(screen.getByText('4242 4242 4242 4242')).toBeDefined();
    });

    it('should show card number', () => {
      render(
        <CreditCardPreview
          number="4242 4242 4242 4242"
          expiry="12 / 25"
          cvc="123"
          name="John Doe"
          brand="visa"
          isFlipped={false}
        />
      );

      expect(screen.getByText('4242 4242 4242 4242')).toBeDefined();
    });

    it('should show placeholder when no number', () => {
      render(
        <CreditCardPreview
          number=""
          expiry="12 / 25"
          cvc="123"
          name="John Doe"
          brand="visa"
          isFlipped={false}
        />
      );

      expect(screen.getByText(/•••• •••• •••• ••••/)).toBeDefined();
    });

    it('should show cardholder name in uppercase', () => {
      render(
        <CreditCardPreview
          number="4242 4242 4242 4242"
          expiry="12 / 25"
          cvc="123"
          name="John Doe"
          brand="visa"
          isFlipped={false}
        />
      );

      expect(screen.getByText('JOHN DOE')).toBeDefined();
    });

    it('should show placeholder when no name', () => {
      render(
        <CreditCardPreview
          number="4242 4242 4242 4242"
          expiry="12 / 25"
          cvc="123"
          name=""
          brand="visa"
          isFlipped={false}
        />
      );

      expect(screen.getByText(/name/i)).toBeDefined();
    });

    it('should show expiry', () => {
      render(
        <CreditCardPreview
          number="4242 4242 4242 4242"
          expiry="12 / 25"
          cvc="123"
          name="John Doe"
          brand="visa"
          isFlipped={false}
        />
      );

      expect(screen.getByText('12 / 25')).toBeDefined();
    });

    it('should show placeholder when no expiry', () => {
      render(
        <CreditCardPreview
          number="4242 4242 4242 4242"
          expiry=""
          cvc="123"
          name="John Doe"
          brand="visa"
          isFlipped={false}
        />
      );

      expect(screen.getByText('MM/YY')).toBeDefined();
    });

    it('should show CVC with bullets when flipped', () => {
      render(
        <CreditCardPreview
          number="4242 4242 4242 4242"
          expiry="12 / 25"
          cvc="123"
          name="John Doe"
          brand="visa"
          isFlipped={true}
        />
      );

      // CVC should show "•••" for 3 digit cvc
      expect(screen.getByText('•••')).toBeDefined();
    });

    it('should show CVC placeholder when empty', () => {
      render(
        <CreditCardPreview
          number="4242 4242 4242 4242"
          expiry="12 / 25"
          cvc=""
          name="John Doe"
          brand="visa"
          isFlipped={true}
        />
      );

      expect(screen.getByText(/•{3}/)).toBeDefined();
    });

    it('should render brand logo SVG', () => {
      const { container } = render(
        <CreditCardPreview
          number="4242 4242 4242 4242"
          expiry="12 / 25"
          cvc="123"
          name="John Doe"
          brand="visa"
          isFlipped={false}
        />
      );

      const svg = container.querySelector('.brand-logo');
      expect(svg).toBeDefined();
    });

    it('should apply flipped class when isFlipped is true', () => {
      const { container } = render(
        <CreditCardPreview
          number="4242 4242 4242 4242"
          expiry="12 / 25"
          cvc="123"
          name="John Doe"
          brand="visa"
          isFlipped={true}
        />
      );

      const inner = container.querySelector('.card-inner');
      expect(inner?.classList.contains('flipped')).toBe(true);
    });

    it('should not apply flipped class when isFlipped is false', () => {
      const { container } = render(
        <CreditCardPreview
          number="4242 4242 4242 4242"
          expiry="12 / 25"
          cvc="123"
          name="John Doe"
          brand="visa"
          isFlipped={false}
        />
      );

      const inner = container.querySelector('.card-inner');
      expect(inner?.classList.contains('flipped')).toBe(false);
    });

    it('should show card label when provided', () => {
      render(
        <CreditCardPreview
          number="4242 4242 4242 4242"
          expiry="12 / 25"
          cvc="123"
          name="John Doe"
          brand="visa"
          isFlipped={false}
          cardLabel="MY BANK"
        />
      );

      expect(screen.getByText('MY BANK')).toBeDefined();
    });

    it('should render card front elements', () => {
      const { container } = render(
        <CreditCardPreview
          number="4242 4242 4242 4242"
          expiry="12 / 25"
          cvc="123"
          name="John Doe"
          brand="visa"
          isFlipped={false}
        />
      );

      expect(container.querySelector('.card-front')).toBeDefined();
      expect(container.querySelector('.card-chip')).toBeDefined();
    });

    it('should render card back elements when flipped', () => {
      const { container } = render(
        <CreditCardPreview
          number="4242 4242 4242 4242"
          expiry="12 / 25"
          cvc="123"
          name="John Doe"
          brand="visa"
          isFlipped={true}
        />
      );

      expect(container.querySelector('.card-back')).toBeDefined();
      expect(container.querySelector('.card-magnetic-strip')).toBeDefined();
    });
  });

  describe('CardForm', () => {
    const createMockUseCardFormReturn = (overrides = {}) => ({
      values: {
        number: '',
        expiry: '',
        cvc: '',
        name: '',
      },
      brand: 'visa',
      errors: {},
      isTokenizing: false,
      isProcessing: false,
      isSuccess: false,
      paymentError: null,
      isFlipped: false,
      handleChange: vi.fn((e: any) => { void e; }),
      handleBlur: vi.fn((e: any) => { void e; }),
      handleCvcFocus: vi.fn(),
      handleCvcBlur: vi.fn(),
      handleSubmit: vi.fn((e?: any) => { void e; }),
      ...overrides,
    });

    const mockUseCardFormReturn = createMockUseCardFormReturn();

    beforeEach(() => {
      vi.clearAllMocks();
      (useCardForm as vi.Mock).mockReturnValue(mockUseCardFormReturn);
    });

    it('should render with adapter prop', () => {
      (useCardForm as vi.Mock).mockReturnValue({
        ...mockUseCardFormReturn,
        brand: 'visa',
      });

      const { container } = render(
        <CardForm
          adapter={{ name: 'Stripe', tokenize: async () => ({ id: 'tok_1', gateway: 'stripe', raw: {} } as Token) }}
          onSubmit={() => {}}
        />
      );

      // CardForm should render a form element
      const form = container.querySelector('form');
      expect(form).toBeDefined();
    });

    it('should render card number input', () => {
      (useCardForm as vi.Mock).mockReturnValue({
        ...mockUseCardFormReturn,
        brand: 'visa',
      });

      render(
        <CardForm
          adapter={{ name: 'Stripe', tokenize: async () => ({ id: 'tok_1', gateway: 'stripe', raw: {} } as Token) }}
          onSubmit={() => {}}
        />
      );

      expect(screen.getByLabelText(/card number/i)).toBeDefined();
    });

    it('should render expiry input', () => {
      (useCardForm as vi.Mock).mockReturnValue({
        ...mockUseCardFormReturn,
        brand: 'visa',
      });

      render(
        <CardForm
          adapter={{ name: 'Stripe', tokenize: async () => ({ id: 'tok_1', gateway: 'stripe', raw: {} } as Token) }}
          onSubmit={() => {}}
        />
      );

      expect(screen.getByLabelText(/expires/i)).toBeDefined();
    });

    it('should render cvc input', () => {
      (useCardForm as vi.Mock).mockReturnValue({
        ...mockUseCardFormReturn,
        brand: 'visa',
      });

      render(
        <CardForm
          adapter={{ name: 'Stripe', tokenize: async () => ({ id: 'tok_1', gateway: 'stripe', raw: {} } as Token) }}
          onSubmit={() => {}}
        />
      );

      expect(screen.getByLabelText(/cvc/i)).toBeDefined();
    });

    it('should render name input', () => {
      (useCardForm as vi.Mock).mockReturnValue({
        ...mockUseCardFormReturn,
        brand: 'visa',
      });

      render(
        <CardForm
          adapter={{ name: 'Stripe', tokenize: async () => ({ id: 'tok_1', gateway: 'stripe', raw: {} } as Token) }}
          onSubmit={() => {}}
        />
      );

      expect(screen.getByLabelText(/cardholder/i)).toBeDefined();
    });

    it('should render submit button with default text', () => {
      (useCardForm as vi.Mock).mockReturnValue({
        ...mockUseCardFormReturn,
        brand: 'visa',
      });

      render(
        <CardForm
          adapter={{ name: 'Stripe', tokenize: async () => ({ id: 'tok_1', gateway: 'stripe', raw: {} } as Token) }}
          onSubmit={() => {}}
        />
      );

      // Default button text is "Pay Now" from CARD_FORM_TEXT_EN
      expect(screen.getByRole('button')).toBeDefined();
    });

    it('should render submit button with custom text', () => {
      (useCardForm as vi.Mock).mockReturnValue({
        ...mockUseCardFormReturn,
        brand: 'visa',
      });

      render(
        <CardForm
          adapter={{ name: 'Stripe', tokenize: async () => ({ id: 'tok_1', gateway: 'stripe', raw: {} } as Token) }}
          submitButtonText="Continue"
          onSubmit={() => {}}
        />
      );

      const button = screen.getByRole('button');
      expect(button.textContent).toContain('Continue');
    });

    it('should render card preview', () => {
      (useCardForm as vi.Mock).mockReturnValue({
        ...mockUseCardFormReturn,
        brand: 'visa',
      });

      const { container } = render(
        <CardForm
          adapter={{ name: 'Stripe', tokenize: async () => ({ id: 'tok_1', gateway: 'stripe', raw: {} } as Token) }}
          onSubmit={() => {}}
        />
      );

      expect(container.querySelector('.card-perspective')).toBeDefined();
    });

    it('should pass form values to card preview', () => {
      (useCardForm as vi.Mock).mockReturnValue({
        ...mockUseCardFormReturn,
        values: {
          number: '4242 4242 4242 4242',
          expiry: '12 / 25',
          cvc: '123',
          name: 'John Doe',
        },
        brand: 'visa',
      });

      const { container } = render(
        <CardForm
          adapter={{ name: 'Stripe', tokenize: async () => ({ id: 'tok_1', gateway: 'stripe', raw: {} } as Token) }}
          onSubmit={() => {}}
        />
      );

      expect(container.querySelector('.card-num-preview')).toBeDefined();
    });

    it('should call handleSubmit on form submit', () => {
      const mockHandleSubmit = vi.fn();
      (useCardForm as vi.Mock).mockReturnValue({
        ...mockUseCardFormReturn,
        handleSubmit: mockHandleSubmit,
        brand: 'visa',
      });

      render(
        <CardForm
          adapter={{ name: 'Stripe', tokenize: async () => ({ id: 'tok_1', gateway: 'stripe', raw: {} } as Token) }}
          onSubmit={() => {}}
        />
      );

      const form = document.querySelector('form');
      if (form) {
        fireEvent.submit(form);
      }

      expect(mockHandleSubmit).toHaveBeenCalled();
    });

    it('should show validation errors when present', () => {
      (useCardForm as vi.Mock).mockReturnValue({
        ...mockUseCardFormReturn,
        errors: { number: 'Invalid card number' },
        brand: 'visa',
      });

      render(
        <CardForm
          adapter={{ name: 'Stripe', tokenize: async () => ({ id: 'tok_1', gateway: 'stripe', raw: {} } as Token) }}
          onSubmit={() => {}}
        />
      );

      expect(screen.getByText(/Please correct the invalid fields/i)).toBeDefined();
    });

    it('should show payment error when present', () => {
      (useCardForm as vi.Mock).mockReturnValue({
        ...mockUseCardFormReturn,
        paymentError: 'Payment failed',
        brand: 'visa',
      });

      render(
        <CardForm
          adapter={{ name: 'Stripe', tokenize: async () => ({ id: 'tok_1', gateway: 'stripe', raw: {} } as Token) }}
          onSubmit={() => {}}
        />
      );

      expect(screen.getByText('Payment failed')).toBeDefined();
    });

    it('should disable submit button while tokenizing', () => {
      (useCardForm as vi.Mock).mockReturnValue({
        ...mockUseCardFormReturn,
        isTokenizing: true,
        brand: 'visa',
      });

      render(
        <CardForm
          adapter={{ name: 'Stripe', tokenize: async () => ({ id: 'tok_1', gateway: 'stripe', raw: {} } as Token) }}
          onSubmit={() => {}}
        />
      );

      const button = screen.getByRole('button');
      expect(button.disabled).toBe(true);
    });

    it('should disable submit button while processing', () => {
      (useCardForm as vi.Mock).mockReturnValue({
        ...mockUseCardFormReturn,
        isProcessing: true,
        brand: 'visa',
      });

      render(
        <CardForm
          adapter={{ name: 'Stripe', tokenize: async () => ({ id: 'tok_1', gateway: 'stripe', raw: {} } as Token) }}
          onSubmit={() => {}}
        />
      );

      const button = screen.getByRole('button');
      expect(button.disabled).toBe(true);
    });

    it('should disable submit button on success', () => {
      (useCardForm as vi.Mock).mockReturnValue({
        ...mockUseCardFormReturn,
        isSuccess: true,
        brand: 'visa',
      });

      render(
        <CardForm
          adapter={{ name: 'Stripe', tokenize: async () => ({ id: 'tok_1', gateway: 'stripe', raw: {} } as Token) }}
          onSubmit={() => {}}
        />
      );

      const button = screen.getByRole('button');
      expect(button.disabled).toBe(true);
    });

    it('should show success state', () => {
      (useCardForm as vi.Mock).mockReturnValue({
        ...mockUseCardFormReturn,
        isSuccess: true,
        brand: 'visa',
      });

      render(
        <CardForm
          adapter={{ name: 'Stripe', tokenize: async () => ({ id: 'tok_1', gateway: 'stripe', raw: {} } as Token) }}
          onSubmit={() => {}}
        />
      );

      expect(screen.getByText('Payment Success!')).toBeDefined();
    });

    it('should show tokenizing state', () => {
      (useCardForm as vi.Mock).mockReturnValue({
        ...mockUseCardFormReturn,
        isTokenizing: true,
        brand: 'visa',
      });

      render(
        <CardForm
          adapter={{ name: 'Stripe', tokenize: async () => ({ id: 'tok_1', gateway: 'stripe', raw: {} } as Token) }}
          onSubmit={() => {}}
        />
      );

      expect(screen.getByText(/tokenizing/i)).toBeDefined();
    });

    it('should show processing state', () => {
      (useCardForm as vi.Mock).mockReturnValue({
        ...mockUseCardFormReturn,
        isProcessing: true,
        brand: 'visa',
      });

      render(
        <CardForm
          adapter={{ name: 'Stripe', tokenize: async () => ({ id: 'tok_1', gateway: 'stripe', raw: {} } as Token) }}
          onSubmit={() => {}}
        />
      );

      expect(screen.getByText(/processing/i)).toBeDefined();
    });

    it('should render with cardLabel', () => {
      (useCardForm as vi.Mock).mockReturnValue({
        ...mockUseCardFormReturn,
        brand: 'visa',
      });

      const { container } = render(
        <CardForm
          adapter={{ name: 'Stripe', tokenize: async () => ({ id: 'tok_1', gateway: 'stripe', raw: {} } as Token) }}
          cardLabel="MY BANK"
          onSubmit={() => {}}
        />
      );

      expect(container.querySelector('.card-gateway-label')).toBeDefined();
    });

    it('should render country autocomplete when country is in preset', () => {
      (useCardForm as vi.Mock).mockReturnValue({
        ...mockUseCardFormReturn,
        brand: 'visa',
      });

      render(
        <CardForm
          adapter={{ name: 'Stripe', tokenize: async () => ({ id: 'tok_1', gateway: 'stripe', raw: {} } as Token) }}
          preset="full"
          onSubmit={() => {}}
        />
      );

      const countryAutocomplete = document.querySelector('.country-autocomplete-wrapper');
      expect(countryAutocomplete).toBeDefined();
    });

    it('should render with custom initialValues', () => {
      (useCardForm as vi.Mock).mockReturnValue({
        ...mockUseCardFormReturn,
        values: {
          number: '4242',
          expiry: '',
          cvc: '',
          name: 'John',
        },
        brand: 'visa',
      });

      render(
        <CardForm
          adapter={{ name: 'Stripe', tokenize: async () => ({ id: 'tok_1', gateway: 'stripe', raw: {} } as Token) }}
          initialValues={{ number: '4242', name: 'John' }}
          onSubmit={() => {}}
        />
      );

      const nameInput = screen.getByLabelText(/cardholder/i) as HTMLInputElement;
      expect(nameInput.value).toBe('John');
    });

    it('should mark invalid fields with invalid class', () => {
      (useCardForm as vi.Mock).mockReturnValue({
        ...mockUseCardFormReturn,
        errors: { number: 'Invalid' },
        brand: 'visa',
      });

      const { container } = render(
        <CardForm
          adapter={{ name: 'Stripe', tokenize: async () => ({ id: 'tok_1', gateway: 'stripe', raw: {} } as Token) }}
          onSubmit={() => {}}
        />
      );

      const formField = container.querySelector('.form-field--error');
      expect(formField).toBeDefined();
    });

    it('should have correct input attributes for card number', () => {
      (useCardForm as vi.Mock).mockReturnValue({
        ...mockUseCardFormReturn,
        brand: 'visa',
      });

      render(
        <CardForm
          adapter={{ name: 'Stripe', tokenize: async () => ({ id: 'tok_1', gateway: 'stripe', raw: {} } as Token) }}
          onSubmit={() => {}}
        />
      );

      const numberInput = document.querySelector('[name="number"]') as HTMLInputElement;
      expect(numberInput.type).toBe('text');
      expect(numberInput.autocomplete).toBe('cc-number');
      expect(numberInput.inputMode).toBe('numeric');
      expect(numberInput.required).toBe(true);
    });

    it('should have correct input attributes for expiry', () => {
      (useCardForm as vi.Mock).mockReturnValue({
        ...mockUseCardFormReturn,
        brand: 'visa',
      });

      render(
        <CardForm
          adapter={{ name: 'Stripe', tokenize: async () => ({ id: 'tok_1', gateway: 'stripe', raw: {} } as Token) }}
          onSubmit={() => {}}
        />
      );

      const expiryInput = document.querySelector('[name="expiry"]') as HTMLInputElement;
      expect(expiryInput.autocomplete).toBe('cc-exp');
      expect(expiryInput.inputMode).toBe('numeric');
      expect(expiryInput.required).toBe(true);
    });

    it('should have correct input attributes for cvc', () => {
      (useCardForm as vi.Mock).mockReturnValue({
        ...mockUseCardFormReturn,
        brand: 'visa',
      });

      render(
        <CardForm
          adapter={{ name: 'Stripe', tokenize: async () => ({ id: 'tok_1', gateway: 'stripe', raw: {} } as Token) }}
          onSubmit={() => {}}
        />
      );

      const cvcInput = document.querySelector('[name="cvc"]') as HTMLInputElement;
      expect(cvcInput.type).toBe('password');
      expect(cvcInput.autocomplete).toBe('cc-csc');
      // visa brand has maxLength 3, amex has 4
      expect(cvcInput.maxLength).toBe(3);
      expect(cvcInput.inputMode).toBe('numeric');
      expect(cvcInput.required).toBe(true);
    });

    it('should have correct input attributes for name', () => {
      (useCardForm as vi.Mock).mockReturnValue({
        ...mockUseCardFormReturn,
        brand: 'visa',
      });

      render(
        <CardForm
          adapter={{ name: 'Stripe', tokenize: async () => ({ id: 'tok_1', gateway: 'stripe', raw: {} } as Token) }}
          onSubmit={() => {}}
        />
      );

      const nameInput = document.querySelector('[name="name"]') as HTMLInputElement;
      expect(nameInput.autocomplete).toBe('cc-name');
      expect(nameInput.required).toBe(true);
    });
  });
});