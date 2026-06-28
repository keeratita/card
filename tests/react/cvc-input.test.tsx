import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CvcInput } from '../../src/react/components/cvc-input';

describe('CvcInput', () => {
  const mockOnChange = vi.fn();
  const mockOnBlur = vi.fn();
  const mockOnFocus = vi.fn();

  const defaultProps = {
    value: '',
    error: null,
    onChange: mockOnChange,
    onBlur: mockOnBlur,
    onFocus: mockOnFocus,
  };

  it('should render with default props', () => {
    const { container } = render(<CvcInput {...defaultProps} />);
    
    expect(screen.getByLabelText(/cvc/i)).toBeDefined();
    expect(container.querySelector('.ios-input-row')).toBeDefined();
  });

  it('should display the input value', () => {
    render(<CvcInput {...defaultProps} value="123" />);
    
    const input = screen.getByLabelText(/cvc/i) as HTMLInputElement;
    expect(input.value).toBe('123');
  });

  it('should call onChange when input changes', () => {
    render(<CvcInput {...defaultProps} />);
    
    const input = screen.getByLabelText(/cvc/i);
    fireEvent.change(input, { target: { value: '123' } });
    
    expect(mockOnChange).toHaveBeenCalled();
  });

  it('should call onBlur when input blurs', () => {
    render(<CvcInput {...defaultProps} />);
    
    const input = screen.getByLabelText(/cvc/i);
    fireEvent.blur(input);
    
    expect(mockOnBlur).toHaveBeenCalled();
  });

  it('should call onFocus when input focuses', () => {
    render(<CvcInput {...defaultProps} />);
    
    const input = screen.getByLabelText(/cvc/i);
    fireEvent.focus(input);
    
    expect(mockOnFocus).toHaveBeenCalled();
  });

  it('should show invalid state when error is provided', () => {
    const { container } = render(
      <CvcInput {...defaultProps} error="Invalid CVC" />
    );
    
    const iosRow = container.querySelector('.ios-input-row');
    expect(iosRow?.classList.contains('invalid')).toBe(true);
  });

  it('should have correct input attributes', () => {
    render(<CvcInput {...defaultProps} />);
    
    const input = screen.getByLabelText(/cvc/i) as HTMLInputElement;
    expect(input.type).toBe('password');
    expect(input.name).toBe('cvc');
    expect(input.autocomplete).toBe('cc-csc');
    expect(input.inputMode).toBe('numeric');
    expect(input.required).toBe(true);
  });

  it('should default maxLength to 3', () => {
    render(<CvcInput {...defaultProps} />);
    
    const input = screen.getByLabelText(/cvc/i) as HTMLInputElement;
    expect(input.maxLength).toBe(3);
  });

  it('should accept custom maxLength for amex', () => {
    render(<CvcInput {...defaultProps} maxLength={4} />);
    
    const input = screen.getByLabelText(/cvc/i) as HTMLInputElement;
    expect(input.maxLength).toBe(4);
  });

  it('should accept custom label', () => {
    render(<CvcInput {...defaultProps} label="Security Code" />);
    
    expect(screen.getByText('Security Code')).toBeDefined();
  });

  it('should accept custom id', () => {
    render(<CvcInput {...defaultProps} id="custom-cvc" />);
    
    const input = document.getElementById('custom-cvc');
    expect(input).toBeDefined();
  });

  it('should hide invalid border when showErrorBorder is false', () => {
    const { container } = render(
      <CvcInput {...defaultProps} error="Invalid" showErrorBorder={false} />
    );
    
    const iosRow = container.querySelector('.ios-input-row');
    expect(iosRow?.classList.contains('invalid')).toBe(false);
  });
});