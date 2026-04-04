import { describe, expect, it, vi } from 'vitest';

describe('legal config', () => {
  it('usa defaults estáveis quando env pública não estiver definida', async () => {
    vi.stubEnv('NEXT_PUBLIC_APP_URL', '');
    vi.resetModules();

    const legal = await import('@/lib/config/legal');

    expect(legal.getPublicAppUrl()).toBe('https://blackbelts.com.br');
    expect(legal.getAccountDeletionUrl()).toBe('https://blackbelts.com.br/excluir-conta');
  });

  it('monta URLs públicas a partir da app url configurada', async () => {
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://blackbelts.com.br/');
    vi.resetModules();

    const legal = await import('@/lib/config/legal');

    expect(legal.getPublicAppUrl()).toBe('https://blackbelts.com.br');
    expect(legal.getPrivacyUrl()).toBe('https://blackbelts.com.br/privacidade');
    expect(legal.getSupportUrl()).toBe('https://blackbelts.com.br/suporte');
  });
});
