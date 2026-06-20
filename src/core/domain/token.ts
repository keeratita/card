export interface Token {
  id: string;
  gateway: 'stripe' | 'omise';
  raw: unknown; // Raw JSON response payload returned by the gateway vault
}
