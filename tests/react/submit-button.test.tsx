import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SubmitButton } from '../../src/react/components/submit-button';

describe('SubmitButton', () => {
  it('should render with default text', () => {
    render(<SubmitButton />);
    
    expect(screen.getByRole('button')).toBeDefined();
  });

  it('should show default text "Pay Now"', () => {
    render(<SubmitButton />);
    
    const button = screen.getByRole('button');
    expect(button.textContent).toContain('Pay Now');
  });

  it('should show custom text', () => {
    render(<SubmitButton text="Complete Purchase" />);
    
    const button = screen.getByRole('button');
    expect(button.textContent).toContain('Complete Purchase');
  });

  it('should show processing state', () => {
    render(<SubmitButton isSubmitting text="Processing..." />);
    
    const button = screen.getByRole('button');
    expect(button.textContent).toMatch(/processing/i);
  });

  it('should show success state with checkmark', () => {
    render(<SubmitButton isSuccess text="Pay Now" />);
    
    const button = screen.getByRole('button');
    expect(button.textContent).toContain('Payment Success!');
  });

  it('should be disabled when submitting', () => {
    render(<SubmitButton isSubmitting />);
    
    expect(screen.getByRole('button').disabled).toBe(true);
  });

  it('should be disabled when success', () => {
    render(<SubmitButton isSuccess />);
    
    expect(screen.getByRole('button').disabled).toBe(true);
  });

  it('should be disabled when explicitly disabled', () => {
    render(<SubmitButton disabled />);
    
    expect(screen.getByRole('button').disabled).toBe(true);
  });

  it('should not be disabled when idle', () => {
    render(<SubmitButton />);
    
    expect(screen.getByRole('button').disabled).toBe(false);
  });

  it('should have success class when success', () => {
    const { container } = render(<SubmitButton isSuccess />);
    
    const button = screen.getByRole('button');
    expect(button.classList.contains('success')).toBe(true);
  });

  it('should accept custom className', () => {
    const { container } = render(<SubmitButton className="custom-btn" />);
    
    const button = screen.getByRole('button');
    expect(button.classList.contains('custom-btn')).toBe(true);
  });

  it('should accept custom style', () => {
    const { container } = render(
      <SubmitButton style={{ marginTop: '20px' }} />
    );
    
    const button = screen.getByRole('button');
    expect(button.style.marginTop).toBe('20px');
  });

  it('should show spinner when submitting', () => {
    render(<SubmitButton isSubmitting />);
    
    expect(document.querySelector('.spinner')).toBeDefined();
  });

  it('should show checkmark SVG when success', () => {
    const { container } = render(<SubmitButton isSuccess />);
    
    expect(container.querySelector('svg[polyline]')).toBeDefined();
  });
});