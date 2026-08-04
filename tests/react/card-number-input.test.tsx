import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CardNumberInput } from '../../src/react/components/card-number-input';

describe('CardNumberInput', () => {
  const mockOnChange = vi.fn();
  const mockOnBlur = vi.fn();

  const defaultProps = {
    value: '',
    error: null,
    onChange: mockOnChange,
    onBlur: mockOnBlur,
  };

  it('should render with default props', () => {
    const { container } = render(<CardNumberInput {...defaultProps} />);
    
    expect(screen.getByLabelText(/card number/i)).toBeDefined();
    expect(container.querySelector('.ios-input-row')).toBeDefined();
  });

  it('should display the input value', () => {
    render(<CardNumberInput {...defaultProps} value="4242 4242 4242 4242" />);
    
    const input = screen.getByLabelText(/card number/i) as HTMLInputElement;
    expect(input.value).toBe('4242 4242 4242 4242');
  });

  it('should show placeholder when no value', () => {
    render(<CardNumberInput {...defaultProps} />);
    
    const input = screen.getByLabelText(/card number/i) as HTMLInputElement;
    expect(input.placeholder).toBe('•••• •••• •••• ••••');
  });

  it('should call onChange when input changes', () => {
    render(<CardNumberInput {...defaultProps} />);
    
    const input = screen.getByLabelText(/card number/i);
    fireEvent.change(input, { target: { value: '4242' } });
    
    expect(mockOnChange).toHaveBeenCalled();
  });

  it('should call onBlur when input blurs', () => {
    render(<CardNumberInput {...defaultProps} />);
    
    const input = screen.getByLabelText(/card number/i);
    fireEvent.blur(input);
    
    expect(mockOnBlur).toHaveBeenCalled();
  });

  it('should show invalid state when error is provided', () => {
    const { container } = render(
      <CardNumberInput {...defaultProps} error="Invalid card number" />
    );
    
    const iosRow = container.querySelector('.ios-input-row');
    expect(iosRow?.classList.contains('invalid')).toBe(true);
  });

  it('should not show invalid state when no error', () => {
    const { container } = render(<CardNumberInput {...defaultProps} error={null} />);
    
    const iosRow = container.querySelector('.ios-input-row');
    expect(iosRow?.classList.contains('invalid')).toBe(false);
  });

  it('should have correct input attributes', () => {
    render(<CardNumberInput {...defaultProps} />);
    
    const input = screen.getByLabelText(/card number/i) as HTMLInputElement;
    expect(input.type).toBe('text');
    expect(input.name).toBe('number');
    expect(input.autocomplete).toBe('cc-number');
    expect(input.inputMode).toBe('numeric');
    expect(input.required).toBe(true);
    // 23 = 19 digits + 4 spaces, so 19-digit cards aren't truncated by maxLength
    expect(input.maxLength).toBe(23);
  });

  it('should accept custom label', () => {
    render(<CardNumberInput {...defaultProps} label="Payment Card" />);
    
    expect(screen.getByText('Payment Card')).toBeDefined();
  });

  it('should accept custom placeholder', () => {
    render(<CardNumberInput {...defaultProps} placeholder="Enter card" />);
    
    const input = screen.getByLabelText(/card number/i) as HTMLInputElement;
    expect(input.placeholder).toBe('Enter card');
  });

  it('should accept custom id', () => {
    render(<CardNumberInput {...defaultProps} id="custom-card-number" />);
    
    const input = document.getElementById('custom-card-number');
    expect(input).toBeDefined();
  });

  it('should accept custom className', () => {
    const { container } = render(
      <CardNumberInput {...defaultProps} className="custom-class" />
    );
    
    const iosRow = container.querySelector('.ios-input-row');
    expect(iosRow?.classList.contains('custom-class')).toBe(true);
  });

  it('should hide invalid border when showErrorBorder is false', () => {
    const { container } = render(
      <CardNumberInput {...defaultProps} error="Invalid" showErrorBorder={false} />
    );
    
    const iosRow = container.querySelector('.ios-input-row');
    expect(iosRow?.classList.contains('invalid')).toBe(false);
  });
});