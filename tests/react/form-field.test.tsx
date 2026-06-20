import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FormField } from '../../src/react/form-field';
import type { CardFormValues } from '../../src/react/useCardForm';

describe('FormField', () => {
  const createMockProps = (overrides = {}) => ({
    values: {
      number: '',
      expiry: '',
      cvc: '',
      name: '',
    } as CardFormValues,
    errors: {},
    handleChange: vi.fn((e: any) => { void e; }),
    handleBlur: vi.fn((e: any) => { void e; }),
    ...overrides,
  });

  describe('rendering', () => {
    it('should render a label with the field name', () => {
      const props = createMockProps();
      render(<FormField name="number" {...props} />);
      expect(screen.getByText('Card Number')).toBeDefined();
    });

    it('should render a custom label when provided', () => {
      const props = createMockProps();
      render(<FormField name="number" {...props} label="My Card" />);
      expect(screen.getByText('My Card')).toBeDefined();
    });

    it('should render an input with the correct name attribute', () => {
      const props = createMockProps();
      render(<FormField name="number" {...props} />);
      const input = document.querySelector('[name="number"]');
      expect(input).toBeDefined();
    });

    it('should render an input with the correct id', () => {
      const props = createMockProps();
      render(<FormField name="number" {...props} />);
      const input = document.querySelector('[id="card-number"]');
      expect(input).toBeDefined();
    });

    it('should render an input linked to the label via htmlFor', () => {
      const props = createMockProps();
      render(<FormField name="number" {...props} />);
      const label = document.querySelector('label[for="card-number"]');
      expect(label).toBeDefined();
    });

    it('should render with the correct placeholder', () => {
      const props = createMockProps();
      render(<FormField name="number" {...props} />);
      const input = document.querySelector('[name="number"]') as HTMLInputElement;
      expect(input.placeholder).toBe('4242 4242 4242 4242');
    });

    it('should use a custom placeholder when provided', () => {
      const props = createMockProps();
      render(<FormField name="number" {...props} placeholder="Enter card" />);
      const input = document.querySelector('[name="number"]') as HTMLInputElement;
      expect(input.placeholder).toBe('Enter card');
    });

    it('should render the correct input type for card number', () => {
      const props = createMockProps();
      render(<FormField name="number" {...props} />);
      const input = document.querySelector('[name="number"]') as HTMLInputElement;
      expect(input.type).toBe('text');
    });

    it('should render the correct input type for CVC (password)', () => {
      const props = createMockProps();
      render(<FormField name="cvc" {...props} />);
      const input = document.querySelector('[name="cvc"]') as HTMLInputElement;
      expect(input.type).toBe('password');
    });

    it('should allow overriding the input type', () => {
      const props = createMockProps();
      render(<FormField name="cvc" {...props} type="text" />);
      const input = document.querySelector('[name="cvc"]') as HTMLInputElement;
      expect(input.type).toBe('text');
    });

    it('should render the correct input type for expiry', () => {
      const props = createMockProps();
      render(<FormField name="expiry" {...props} />);
      const input = document.querySelector('[name="expiry"]') as HTMLInputElement;
      expect(input.type).toBe('text');
    });

    it('should render the correct input type for name', () => {
      const props = createMockProps();
      render(<FormField name="name" {...props} />);
      const input = document.querySelector('[name="name"]') as HTMLInputElement;
      expect(input.type).toBe('text');
    });

    it('should render the correct input type for email', () => {
      const props = createMockProps({
        values: { ...createMockProps().values, email: 'test@example.com' } as CardFormValues,
      });
      render(<FormField name="email" {...props} />);
      const input = document.querySelector('[name="email"]') as HTMLInputElement;
      expect(input.type).toBe('email');
    });

    it('should render the correct input type for phone', () => {
      const props = createMockProps({
        values: { ...createMockProps().values, phone: '1234567890' } as CardFormValues,
      });
      render(<FormField name="phone" {...props} />);
      const input = document.querySelector('[name="phone"]') as HTMLInputElement;
      expect(input.type).toBe('tel');
    });

    it('should show required asterisk by default', () => {
      const props = createMockProps();
      render(<FormField name="number" {...props} />);
      expect(screen.getByText('*')).toBeDefined();
    });

    it('should not show required asterisk when required is false', () => {
      const props = createMockProps();
      render(<FormField name="number" {...props} required={false} />);
      expect(screen.queryByText('*')).toBeNull();
    });

    it('should apply custom className', () => {
      const props = createMockProps();
      const { container } = render(<FormField name="number" {...props} className="my-custom-class" />);
      const field = container.querySelector('.form-field');
      expect(field?.classList.contains('my-custom-class')).toBe(true);
    });

    it('should render with values from form state', () => {
      const props = createMockProps({
        values: { number: '4242 4242 4242 4242', expiry: '', cvc: '', name: '' } as CardFormValues,
      });
      render(<FormField name="number" {...props} />);
      const input = document.querySelector('[name="number"]') as HTMLInputElement;
      expect(input.value).toBe('4242 4242 4242 4242');
    });
  });

  describe('input attributes', () => {
    it('should have inputMode numeric for card number', () => {
      const props = createMockProps();
      render(<FormField name="number" {...props} />);
      const input = document.querySelector('[name="number"]') as HTMLInputElement;
      expect(input.inputMode).toBe('numeric');
    });

    it('should have inputMode numeric for expiry', () => {
      const props = createMockProps();
      render(<FormField name="expiry" {...props} />);
      const input = document.querySelector('[name="expiry"]') as HTMLInputElement;
      expect(input.inputMode).toBe('numeric');
    });

    it('should have inputMode numeric for CVC', () => {
      const props = createMockProps();
      render(<FormField name="cvc" {...props} />);
      const input = document.querySelector('[name="cvc"]') as HTMLInputElement;
      expect(input.inputMode).toBe('numeric');
    });

    it('should have inputMode tel for phone', () => {
      const props = createMockProps({
        values: { ...createMockProps().values, phone: '1234567890' } as CardFormValues,
      });
      render(<FormField name="phone" {...props} />);
      const input = document.querySelector('[name="phone"]') as HTMLInputElement;
      expect(input.inputMode).toBe('tel');
    });

    it('should allow overriding inputMode', () => {
      const props = createMockProps();
      render(<FormField name="number" {...props} inputMode="text" />);
      const input = document.querySelector('[name="number"]') as HTMLInputElement;
      expect(input.inputMode).toBe('text');
    });

    it('should have correct autoComplete for card number', () => {
      const props = createMockProps();
      render(<FormField name="number" {...props} />);
      const input = document.querySelector('[name="number"]') as HTMLInputElement;
      expect(input.autocomplete).toBe('cc-number');
    });

    it('should have correct autoComplete for expiry', () => {
      const props = createMockProps();
      render(<FormField name="expiry" {...props} />);
      const input = document.querySelector('[name="expiry"]') as HTMLInputElement;
      expect(input.autocomplete).toBe('cc-exp');
    });

    it('should have correct autoComplete for CVC', () => {
      const props = createMockProps();
      render(<FormField name="cvc" {...props} />);
      const input = document.querySelector('[name="cvc"]') as HTMLInputElement;
      expect(input.autocomplete).toBe('cc-csc');
    });

    it('should have correct autoComplete for name', () => {
      const props = createMockProps();
      render(<FormField name="name" {...props} />);
      const input = document.querySelector('[name="name"]') as HTMLInputElement;
      expect(input.autocomplete).toBe('cc-name');
    });

    it('should allow overriding autoComplete', () => {
      const props = createMockProps();
      render(<FormField name="number" {...props} autoComplete="off" />);
      const input = document.querySelector('[name="number"]') as HTMLInputElement;
      expect(input.autocomplete).toBe('off');
    });

    it('should have maxLength 4 for CVC by default', () => {
      const props = createMockProps();
      render(<FormField name="cvc" {...props} />);
      const input = document.querySelector('[name="cvc"]') as HTMLInputElement;
      expect(input.maxLength).toBe(4);
    });

    it('should allow overriding maxLength', () => {
      const props = createMockProps();
      render(<FormField name="cvc" {...props} maxLength={3} />);
      const input = document.querySelector('[name="cvc"]') as HTMLInputElement;
      expect(input.maxLength).toBe(3);
    });

    it('should be required by default', () => {
      const props = createMockProps();
      render(<FormField name="number" {...props} />);
      const input = document.querySelector('[name="number"]') as HTMLInputElement;
      expect(input.required).toBe(true);
    });

    it('should not be required when required is false', () => {
      const props = createMockProps();
      render(<FormField name="number" {...props} required={false} />);
      const input = document.querySelector('[name="number"]') as HTMLInputElement;
      expect(input.required).toBe(false);
    });
  });

  describe('validation display', () => {
    it('should not show error when there is no error', () => {
      const props = createMockProps();
      const { container } = render(<FormField name="number" {...props} />);
      const errorEl = container.querySelector('.form-field__error');
      expect(errorEl).toBeNull();
    });

    it('should show error message when there is an error', () => {
      const props = createMockProps({
        errors: { number: 'Invalid card number' },
      });
      render(<FormField name="number" {...props} />);
      expect(screen.getByText('Invalid card number')).toBeDefined();
    });

    it('should apply error class when there is an error', () => {
      const props = createMockProps({
        errors: { number: 'Invalid card number' },
      });
      const { container } = render(<FormField name="number" {...props} />);
      const field = container.querySelector('.form-field');
      expect(field?.classList.contains('form-field--error')).toBe(true);
    });

    it('should not apply error class when there is no error', () => {
      const props = createMockProps();
      const { container } = render(<FormField name="number" {...props} />);
      const field = container.querySelector('.form-field');
      expect(field?.classList.contains('form-field--error')).toBe(false);
    });

    it('should use custom error message when provided', () => {
      const props = createMockProps({
        errors: { number: 'Invalid card number' },
      });
      render(<FormField name="number" {...props} errorMessage="Please enter a valid card number" />);
      expect(screen.getByText('Please enter a valid card number')).toBeDefined();
      expect(screen.queryByText('Invalid card number')).toBeNull();
    });

    it('should hide error message when showErrorMessage is false', () => {
      const props = createMockProps({
        errors: { number: 'Invalid card number' },
      });
      const { container } = render(<FormField name="number" {...props} showErrorMessage={false} />);
      const errorEl = container.querySelector('.form-field__error');
      expect(errorEl).toBeNull();
      expect(screen.queryByText('Invalid card number')).toBeNull();
    });

    it('should not show error border when showErrorBorder is false', () => {
      const props = createMockProps({
        errors: { number: 'Invalid card number' },
      });
      const { container } = render(<FormField name="number" {...props} showErrorBorder={false} />);
      const field = container.querySelector('.form-field');
      expect(field?.classList.contains('form-field--error')).toBe(false);
    });

    it('should show error for expiry field', () => {
      const props = createMockProps({
        errors: { expiry: 'Invalid expiry date' },
      });
      render(<FormField name="expiry" {...props} />);
      expect(screen.getByText('Invalid expiry date')).toBeDefined();
    });

    it('should show error for CVC field', () => {
      const props = createMockProps({
        errors: { cvc: 'Invalid CVC' },
      });
      render(<FormField name="cvc" {...props} />);
      expect(screen.getByText('Invalid CVC')).toBeDefined();
    });

    it('should show error for name field', () => {
      const props = createMockProps({
        errors: { name: 'Name is required' },
      });
      render(<FormField name="name" {...props} />);
      expect(screen.getByText('Name is required')).toBeDefined();
    });
  });

  describe('event handlers', () => {
    it('should call handleChange on input change', () => {
      const handleChange = vi.fn();
      const props = createMockProps({ handleChange });
      render(<FormField name="number" {...props} />);
      const input = document.querySelector('[name="number"]') as HTMLInputElement;
      fireEvent.change(input, { target: { value: '4' } });
      expect(handleChange).toHaveBeenCalled();
    });

    it('should call handleBlur on blur', () => {
      const handleBlur = vi.fn();
      const props = createMockProps({ handleBlur });
      render(<FormField name="number" {...props} />);
      const input = document.querySelector('[name="number"]') as HTMLInputElement;
      fireEvent.blur(input);
      expect(handleBlur).toHaveBeenCalled();
    });

    it('should call handleCvcFocus when CVC is focused', () => {
      const handleCvcFocus = vi.fn();
      const props = createMockProps({ handleCvcFocus });
      render(<FormField name="cvc" {...props} handleCvcFocus={handleCvcFocus} />);
      const input = document.querySelector('[name="cvc"]') as HTMLInputElement;
      fireEvent.focus(input);
      expect(handleCvcFocus).toHaveBeenCalled();
    });

    it('should not call handleCvcFocus for non-CVC fields', () => {
      const handleCvcFocus = vi.fn();
      const props = createMockProps({ handleCvcFocus });
      render(<FormField name="number" {...props} handleCvcFocus={handleCvcFocus} />);
      const input = document.querySelector('[name="number"]') as HTMLInputElement;
      fireEvent.focus(input);
      expect(handleCvcFocus).not.toHaveBeenCalled();
    });

    it('should call handleCvcBlur when CVC is blurred', () => {
      const handleCvcBlur = vi.fn();
      const props = createMockProps({ handleCvcBlur });
      render(<FormField name="cvc" {...props} handleCvcBlur={handleCvcBlur} />);
      const input = document.querySelector('[name="cvc"]') as HTMLInputElement;
      fireEvent.blur(input);
      expect(handleCvcBlur).toHaveBeenCalled();
    });

    it('should not call handleCvcBlur for non-CVC fields', () => {
      const handleCvcBlur = vi.fn();
      const props = createMockProps({ handleCvcBlur });
      render(<FormField name="number" {...props} handleCvcBlur={handleCvcBlur} />);
      const input = document.querySelector('[name="number"]') as HTMLInputElement;
      fireEvent.blur(input);
      expect(handleCvcBlur).not.toHaveBeenCalled();
    });

    it('should call both handleBlur and handleCvcBlur on CVC blur', () => {
      const handleBlur = vi.fn();
      const handleCvcBlur = vi.fn();
      const props = createMockProps({ handleBlur, handleCvcBlur });
      render(<FormField name="cvc" {...props} handleCvcBlur={handleCvcBlur} />);
      const input = document.querySelector('[name="cvc"]') as HTMLInputElement;
      fireEvent.blur(input);
      expect(handleBlur).toHaveBeenCalled();
      expect(handleCvcBlur).toHaveBeenCalled();
    });
  });

  describe('field-specific defaults', () => {
    it('should render expiry with correct defaults', () => {
      const props = createMockProps();
      render(<FormField name="expiry" {...props} />);
      expect(screen.getByText('Expiry Date')).toBeDefined();
      const input = document.querySelector('[name="expiry"]') as HTMLInputElement;
      expect(input.placeholder).toBe('MM / YY');
      expect(input.inputMode).toBe('numeric');
    });

    it('should render CVC with correct defaults', () => {
      const props = createMockProps();
      render(<FormField name="cvc" {...props} />);
      expect(screen.getByText('CVC')).toBeDefined();
      const input = document.querySelector('[name="cvc"]') as HTMLInputElement;
      expect(input.placeholder).toBe('123');
      expect(input.type).toBe('password');
    });

    it('should render name with correct defaults', () => {
      const props = createMockProps();
      render(<FormField name="name" {...props} />);
      expect(screen.getByText('Cardholder Name')).toBeDefined();
      const input = document.querySelector('[name="name"]') as HTMLInputElement;
      expect(input.placeholder).toBe('Full Name');
    });

    it('should render addressLine1 with correct defaults', () => {
      const props = createMockProps({
        values: { ...createMockProps().values, addressLine1: '123 Main St' } as CardFormValues,
      });
      render(<FormField name="addressLine1" {...props} />);
      expect(screen.getByText('Address Line 1')).toBeDefined();
      const input = document.querySelector('[name="addressLine1"]') as HTMLInputElement;
      expect(input.placeholder).toBe('123 Main St');
    });

    it('should render postalCode with correct defaults', () => {
      const props = createMockProps({
        values: { ...createMockProps().values, postalCode: '12345' } as CardFormValues,
      });
      render(<FormField name="postalCode" {...props} />);
      expect(screen.getByText('Postal Code')).toBeDefined();
      const input = document.querySelector('[name="postalCode"]') as HTMLInputElement;
      expect(input.placeholder).toBe('12345');
      expect(input.inputMode).toBe('numeric');
    });

    it('should render country with correct defaults', () => {
      const props = createMockProps({
        values: { ...createMockProps().values, country: 'US' } as CardFormValues,
      });
      render(<FormField name="country" {...props} />);
      expect(screen.getByText('Country')).toBeDefined();
      const input = document.querySelector('[name="country"]') as HTMLInputElement;
      expect(input.placeholder).toBe('Select country');
    });

    it('should render email with correct defaults', () => {
      const props = createMockProps({
        values: { ...createMockProps().values, email: 'test@example.com' } as CardFormValues,
      });
      render(<FormField name="email" {...props} />);
      expect(screen.getByText('Email')).toBeDefined();
      const input = document.querySelector('[name="email"]') as HTMLInputElement;
      expect(input.placeholder).toBe('email@example.com');
      expect(input.type).toBe('email');
    });

    it('should render phone with correct defaults', () => {
      const props = createMockProps({
        values: { ...createMockProps().values, phone: '1234567890' } as CardFormValues,
      });
      render(<FormField name="phone" {...props} />);
      expect(screen.getByText('Phone')).toBeDefined();
      const input = document.querySelector('[name="phone"]') as HTMLInputElement;
      expect(input.placeholder).toBe('+1234567890');
      expect(input.type).toBe('tel');
    });
  });

  describe('error object types', () => {
    it('should not show error when error is null', () => {
      const props = createMockProps({
        errors: { number: null },
      });
      const { container } = render(<FormField name="number" {...props} />);
      const errorEl = container.querySelector('.form-field__error');
      expect(errorEl).toBeNull();
    });

    it('should not apply error class when error is null', () => {
      const props = createMockProps({
        errors: { number: null },
      });
      const { container } = render(<FormField name="number" {...props} />);
      const field = container.querySelector('.form-field');
      expect(field?.classList.contains('form-field--error')).toBe(false);
    });
  });
});