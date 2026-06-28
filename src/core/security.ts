/**
 * Remove null bytes and dangerous control characters from input.
 */
export function sanitizeInput(value: string): string {
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

/**
 * Escape HTML special characters to prevent XSS attacks.
 * Strips null bytes first, then escapes: & < > " '
 */
export function escapeHtml(value: string): string {
  return value
    .replaceAll('\0', '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

