import { describe, expect, it, vi } from 'vitest';

describe('legal config', () => {
  it('usa defaults estáveis quando env pública não estiver definida', async () => {
    vi.stubEnv('NEXT_PUBLIC_APP_URL', '');
    vi.resetModules();

    const legal = await import('@/lib/config/legal');

    expect(legal.getPublicAppUrl()).toBe('https://blackbeltv2.vercel.app');
    expect(legal.getAccountDeletionUrl()).toBe('https://blackbeltv2.vercel.app/excluir-conta');
  });

  it('monta URLs públicas a partir da app url configurada', async () => {
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://blackbeltv2.vercel.app/');
    vi.resetModules();

    const legal = await import('@/lib/config/legal');

    expect(legal.getPublicAppUrl()).toBe('https://blackbeltv2.vercel.app');
    expect(legal.getPrivacyUrl()).toBe('https://blackbeltv2.vercel.app/privacidade');
    expect(legal.getSupportUrl()).toBe('https://blackbeltv2.vercel.app/suporte');
  });
});
