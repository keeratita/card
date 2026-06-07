export function toFormUrlEncoded(data: Record<string, string | number | undefined>): string {
  return Object.entries(data)
    .filter(([_, value]) => value !== undefined)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');
}
export class PaymentGatewayError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly raw?: any
  ) {
    super(message);
    this.name = 'PaymentGatewayError';
  }
}
export class NetworkError extends PaymentGatewayError {
  constructor(message: string, raw?: any) {
    super(message, 'network_error', raw);
    this.name = 'NetworkError';
  }
}
export class ApiValidationError extends PaymentGatewayError {
  constructor(message: string, code?: string, raw?: any) {
    super(message, code || 'validation_error', raw);
    this.name = 'ApiValidationError';
  }
}
