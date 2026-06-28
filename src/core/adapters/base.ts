const HTTPS_ERROR_MESSAGE =
  'SECURITY: Payment operations require HTTPS. Please access the site over a secure connection.';

export function enforceHttps(): void {
  if (typeof window === 'undefined' || !window.location) return;
  const { protocol, hostname } = window.location;
  if (protocol === 'http:' && hostname !== 'localhost' && hostname !== '127.0.0.1') {
    throw new Error(HTTPS_ERROR_MESSAGE);
  }
}

export function toFormUrlEncoded(
  data: Record<string, string | number | undefined>,
): string {
  return Object.entries(data)
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');
}

export const DEFAULT_TIMEOUT_MS = 30_000;

export async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

export function normalizeNetworkError(error: unknown): Error {
  if (error instanceof Error) return error;
  if (error instanceof DOMException && error.name === 'AbortError') {
    return new Error('Request timed out.');
  }
  return new Error('Network connection failed.');
}
export class PaymentGatewayError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly raw?: unknown,
  ) {
    super(message);
    this.name = 'PaymentGatewayError';
  }
}
export class NetworkError extends PaymentGatewayError {
  constructor(message: string, raw?: unknown) {
    super(message, 'network_error', raw);
    this.name = 'NetworkError';
  }
}
export class ApiValidationError extends PaymentGatewayError {
  constructor(message: string, code?: string, raw?: unknown) {
    super(message, code || 'validation_error', raw);
    this.name = 'ApiValidationError';
  }
}
