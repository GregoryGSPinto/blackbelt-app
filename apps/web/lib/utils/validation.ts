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

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

export function formatCnpj(value: string): string {
  const digits = onlyDigits(value).slice(0, 14);

  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

export function validateCnpj(value: string): boolean {
  const cnpj = onlyDigits(value);
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;

  let length = 12;
  let numbers = cnpj.slice(0, length);
  let sum = 0;
  let pos = length - 7;

  for (let i = length; i >= 1; i -= 1) {
    sum += Number(numbers[length - i]) * pos;
    pos -= 1;
    if (pos < 2) pos = 9;
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== Number(cnpj[12])) return false;

  length = 13;
  numbers = cnpj.slice(0, length);
  sum = 0;
  pos = length - 7;

  for (let i = length; i >= 1; i -= 1) {
    sum += Number(numbers[length - i]) * pos;
    pos -= 1;
    if (pos < 2) pos = 9;
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  return result === Number(cnpj[13]);
}

export function formatCep(value: string): string {
  const digits = onlyDigits(value).slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function validateCep(value: string): boolean {
  return onlyDigits(value).length === 8;
}

export function formatBrazilianPhone(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);

  if (digits.length <= 2) return digits ? `(${digits}` : '';
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function validateBrazilianMobilePhone(value: string): boolean {
  return onlyDigits(value).length === 11;
}

export function validateAcademyName(value: string): boolean {
  const normalized = sanitizeText(value);
  if (normalized.length < 3) return false;
  return /^[A-Za-zÀ-ÿ\s]+$/.test(normalized);
}

export function validateCityName(value: string): boolean {
  const normalized = sanitizeText(value);
  if (normalized.length < 2 || normalized.length > 60) return false;
  return /^[A-Za-zÀ-ÿ\s'.-]+$/.test(normalized);
}

export function normalizeWebsite(value: string): string {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return '';
  return normalized.startsWith('http://') || normalized.startsWith('https://')
    ? normalized
    : `https://${normalized}`;
}

export function validateWebsite(value: string): boolean {
  const normalized = normalizeWebsite(value);
  if (!normalized) return false;

  try {
    const url = new URL(normalized);
    return Boolean(url.hostname) && url.hostname.includes('.') && !/\s/.test(url.hostname);
  } catch {
    return false;
  }
}
