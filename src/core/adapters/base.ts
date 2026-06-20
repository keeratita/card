/**
 * Ensures the connection uses HTTPS to prevent man-in-the-middle attacks.
 * Throws an error only when running in production over HTTP.
 * This check is skipped for localhost and test environments.
 */
export function enforceHttps(): void {
  if (typeof window !== 'undefined' && window.location) {
    const { protocol, hostname } = window.location;
    // Only enforce HTTPS in production (not localhost, 127.0.0.1, or test environments)
    if (protocol === 'http:' && hostname !== 'localhost' && hostname !== '127.0.0.1') {
      throw new Error(
        'SECURITY: Payment operations require HTTPS. Please access the site over a secure connection.',
      );
    }
  }
}

export function toFormUrlEncoded(
  data: Record<string, string | number | undefined>,
): string {
  return Object.entries(data)
    .filter(([_, value]) => value !== undefined)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
    )
    .join('&');
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
