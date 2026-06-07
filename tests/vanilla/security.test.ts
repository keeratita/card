import { describe, it, expect } from 'vitest';
import { escapeHtml, sanitizeOptionalFields } from '../../src/vanilla/internal/security';

describe('Vanilla Security Guards', () => {
  it('escapes html-special characters to prevent XSS injection', () => {
    const input = `<img src=x onerror=alert("xss")>&'"`;
    expect(escapeHtml(input)).toBe('&lt;img src=x onerror=alert(&quot;xss&quot;)&gt;&amp;&#39;&quot;');
  });

  it('removes unknown optional fields provided at runtime', () => {
    const fields = sanitizeOptionalFields([
      'email',
      '__proto__',
      'postalCode',
      '<script>alert(1)</script>',
      'email'
    ]);

    expect(fields).toEqual(['email', 'postalCode']);
  });
});
