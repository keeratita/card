/**
 * Type guard for async-capable return values (Promises and thenables).
 * Centralized so the submit lifecycle can await host `onSubmit` callbacks
 * consistently across framework bindings, including cross-realm promises.
 */
export function isThenable(value: unknown): value is PromiseLike<unknown> {
  return (
    value !== null &&
    (typeof value === 'object' || typeof value === 'function') &&
    typeof (value as { then?: unknown }).then === 'function'
  );
}
