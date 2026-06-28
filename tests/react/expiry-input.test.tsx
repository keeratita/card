import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ExpiryInput } from '../../src/react/components/expiry-input';

describe('ExpiryInput', () => {
  const mockOnChange = vi.fn();
  const mockOnBlur = vi.fn();

  const defaultProps = {
    value: '',
    error: null,
    onChange: mockOnChange,
    onBlur: mockOnBlur,
  };

  it('should render with default props', () => {
    const { container } = render(<ExpiryInput {...defaultProps} />);
    
    expect(screen.getByLabelText(/expires/i)).toBeDefined();
    expect(container.querySelector('.ios-input-row')).toBeDefined();
  });

  it('should display the input value', () => {
    render(<ExpiryInput {...defaultProps} value="12 / 25" />);
    
    const input = screen.getByLabelText(/expires/i) as HTMLInputElement;
    expect(input.value).toBe('12 / 25');
  });

  it('should show placeholder when no value', () => {
    render(<ExpiryInput {...defaultProps} />);
    
    const input = screen.getByLabelText(/expires/i) as HTMLInputElement;
    expect(input.placeholder).toBe('MM / YY');
  });

  it('should call onChange when input changes', () => {
    render(<ExpiryInput {...defaultProps} />);
    
    const input = screen.getByLabelText(/expires/i);
    fireEvent.change(input, { target: { value: '12 / 25' } });
    
    expect(mockOnChange).toHaveBeenCalled();
  });

  it('should call onBlur when input blurs', () => {
    render(<ExpiryInput {...defaultProps} />);
    
    const input = screen.getByLabelText(/expires/i);
    fireEvent.blur(input);
    
    expect(mockOnBlur).toHaveBeenCalled();
  });

  it('should show invalid state when error is provided', () => {
    const { container } = render(
      <ExpiryInput {...defaultProps} error="Invalid expiry" />
    );
    
    const iosRow = container.querySelector('.ios-input-row');
    expect(iosRow?.classList.contains('invalid')).toBe(true);
  });

  it('should have correct input attributes', () => {
    render(<ExpiryInput {...defaultProps} />);
    
    const input = screen.getByLabelText(/expires/i) as HTMLInputElement;
    expect(input.type).toBe('text');
    expect(input.name).toBe('expiry');
    expect(input.autocomplete).toBe('cc-exp');
    expect(input.inputMode).toBe('numeric');
    expect(input.required).toBe(true);
    expect(input.maxLength).toBe(7);
  });

  it('should accept custom label', () => {
    render(<ExpiryInput {...defaultProps} label="Expiration" />);
    
    expect(screen.getByText('Expiration')).toBeDefined();
  });

  it('should accept custom placeholder', () => {
    render(<ExpiryInput {...defaultProps} placeholder="MM/YY" />);
    
    const input = screen.getByLabelText(/expires/i) as HTMLInputElement;
    expect(input.placeholder).toBe('MM/YY');
  });

  it('should accept custom id', () => {
    render(<ExpiryInput {...defaultProps} id="custom-expiry" />);
    
    const input = document.getElementById('custom-expiry');
    expect(input).toBeDefined();
  });

  it('should hide invalid border when showErrorBorder is false', () => {
    const { container } = render(
      <ExpiryInput {...defaultProps} error="Invalid" showErrorBorder={false} />
    );
    
    const iosRow = container.querySelector('.ios-input-row');
    expect(iosRow?.classList.contains('invalid')).toBe(false);
  });
});