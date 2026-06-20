/**
 * Sanitize input: remove null bytes and dangerous control characters.
 * Prevents injection attacks by stripping characters that can interfere
 * with string parsing, HTML rendering, and regex matching.
 *
 * @param value - The raw string to sanitize
 * @returns The sanitized string with control characters removed
 */
export function sanitizeInput(value: string): string {
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}
