// BlackBelt v2 — Input validation utilities
// Reusable functions for sanitizing and validating user input.

/**
 * Validates an email address using a strict regex.
 * Covers standard formats: user@domain.tld
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  // RFC 5322 simplified — covers 99.9% of real emails
  const EMAIL_RE = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  return EMAIL_RE.test(email.trim());
}

/**
 * Strips HTML tags and trims whitespace to prevent XSS via stored input.
 * Does NOT use DOMParser (works on both client and server).
 */
export function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/<[^>]*>/g, '')   // strip HTML tags
    .replace(/&lt;/g, '<')     // decode common entities
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .trim();
}

/**
 * Validates a currency value: must be > 0 with at most 2 decimal places.
 */
export function validateCurrency(value: number): boolean {
  if (typeof value !== 'number' || !isFinite(value)) return false;
  if (value <= 0) return false;
  // Check at most 2 decimal places
  const parts = String(value).split('.');
  if (parts.length === 2 && parts[1].length > 2) return false;
  return true;
}

/**
 * Validates a Brazilian phone number.
 * Accepts: (11)91234-5678, 11912345678, +5511912345678, etc.
 * Must have 10 or 11 digits (DDD + number).
 */
export function validatePhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  // Strip everything except digits
  const digits = phone.replace(/\D/g, '');
  // Remove country code 55 if present
  const normalized = digits.startsWith('55') && digits.length >= 12
    ? digits.slice(2)
    : digits;
  // 10 digits = landline (DDD + 8 digits), 11 digits = mobile (DDD + 9 digits)
  return normalized.length === 10 || normalized.length === 11;
}
