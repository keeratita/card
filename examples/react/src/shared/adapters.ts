// Shared adapter instances for examples
// NOTE: Always use your public key (pk_...) — never expose secret keys (sk_...)

import { StripeAdapter, OmiseAdapter } from '@keeratita/card';

/**
 * Stripe adapter instance
 * @see https://dashboard.stripe.com/test/apikeys
 */
export const stripeAdapter = new StripeAdapter({
  publicKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_stripe_integrated_demo_key',
});

/**
 * Omise adapter instance
 * @see https://dashboard.omise.co/test/apikeys
 */
export const omiseAdapter = new OmiseAdapter({
  publicKey: import.meta.env.VITE_OMISE_PUBLIC_KEY || 'pkey_test_omise_integrated_demo_key',
});