export interface Token {
  id: string;
  gateway: 'stripe' | 'omise';
  raw: any; // Raw JSON response payload returned by the gateway vault
}
