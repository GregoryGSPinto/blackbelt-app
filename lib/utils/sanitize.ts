// ============================================================
// BlackBelt v2 — Input Sanitization (F8)
// Sanitizar e validar inputs antes de salvar no banco.
// ============================================================

/**
 * Sanitiza texto generico:
 * - Trim whitespace
 * - Remove tags HTML (prevencao XSS)
 * - Remove caracteres perigosos
 * - Limita tamanho
 */
export function sanitizeInput(input: string, maxLength = 1000): string {
  return input
    .trim()
    .replace(/<[^>]*>/g, '') // remover HTML tags
    .replace(/[<>'"]/g, '')  // remover caracteres perigosos
    .slice(0, maxLength);
}

/**
 * Sanitiza email: trim + lowercase.
 */
export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Sanitiza telefone: mantem apenas numeros, parenteses, hifen, espaco e +.
 */
export function sanitizePhone(phone: string): string {
  return phone.replace(/[^0-9()\-\s+]/g, '').trim();
}

/**
 * Sanitiza CPF: mantem apenas numeros, pontos e hifen.
 */
export function sanitizeCPF(cpf: string): string {
  return cpf.replace(/[^0-9.\-]/g, '').trim();
}

/**
 * Valida formato de email.
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Valida telefone brasileiro (10 ou 11 digitos).
 */
export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length === 10 || digits.length === 11;
}

/**
 * Valida CPF com verificacao de digitos verificadores.
 */
export function isValidCPF(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '');

  if (digits.length !== 11) return false;

  // Rejeitar digitos repetidos (ex: 111.111.111-11)
  if (/^(\d)\1+$/.test(digits)) return false;

  // Validacao do primeiro digito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits[i]) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  if (remainder !== parseInt(digits[9])) return false;

  // Validacao do segundo digito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(digits[i]) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10) remainder = 0;
  return remainder === parseInt(digits[10]);
}
