/**
 * Shared hook for payment state management.
 * Replaces: useState<Token> + useState<string> + handleSubmit + handleError
 * Used by: All theme and checkout examples
 */

import { useState } from 'react';
import { Token } from '@keeratita/card';

interface UsePaymentStateReturn {
  token: Token | null;
  error: string | null;
  handleSubmit: (data: { token: Token }) => Promise<void>;
  handleError: (err: Error) => void;
}

export function usePaymentState(): UsePaymentStateReturn {
  const [token, setToken] = useState<Token | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: { token: Token }) => {
    console.log('Token received:', data.token);
    setToken(data.token);
  };

  const handleError = (err: Error) => {
    console.error('Payment error:', err);
    setError(err.message);
  };

  return { token, error, handleSubmit, handleError };
}
