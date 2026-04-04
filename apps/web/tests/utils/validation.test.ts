import { describe, expect, it } from 'vitest';
import {
  formatBrazilianPhone,
  formatCep,
  formatCnpj,
  normalizeWebsite,
  validateAcademyName,
  validateBrazilianMobilePhone,
  validateCep,
  validateCityName,
  validateCnpj,
  validateWebsite,
} from '@/lib/utils/validation';

describe('validation utils', () => {
  it('formats cnpj safely while typing', () => {
    expect(formatCnpj('12345678000195')).toBe('12.345.678/0001-95');
    expect(formatCnpj('12a345678000195999')).toBe('12.345.678/0001-95');
  });

  it('validates cnpj checksum', () => {
    expect(validateCnpj('12.345.678/0001-95')).toBe(true);
    expect(validateCnpj('11.111.111/1111-11')).toBe(false);
  });

  it('formats and validates brazilian phone', () => {
    expect(formatBrazilianPhone('11987654321')).toBe('(11) 98765-4321');
    expect(validateBrazilianMobilePhone('(11) 98765-4321')).toBe(true);
    expect(validateBrazilianMobilePhone('(11) 9876-4321')).toBe(false);
  });

  it('formats and validates cep', () => {
    expect(formatCep('30123456')).toBe('30123-456');
    expect(validateCep('30123-456')).toBe(true);
    expect(validateCep('3012')).toBe(false);
  });

  it('normalizes and validates website', () => {
    expect(normalizeWebsite('academia.com.br')).toBe('https://academia.com.br');
    expect(validateWebsite('academia.com.br')).toBe(true);
    expect(validateWebsite('texto solto')).toBe(false);
  });

  it('validates academy and city names', () => {
    expect(validateAcademyName('Academia Central')).toBe(true);
    expect(validateAcademyName('Academia 123')).toBe(false);
    expect(validateCityName('Belo Horizonte')).toBe(true);
    expect(validateCityName('BH 123')).toBe(false);
  });
});
