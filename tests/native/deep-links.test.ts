import { describe, expect, it } from 'vitest';
import { resolveDeepLinkPath } from '@/lib/native/deep-links';

describe('resolveDeepLinkPath', () => {
  it('preserva query string e hash em URLs web', () => {
    expect(
      resolveDeepLinkPath('https://blackbelts.com.br/redefinir-senha?source=email#access_token=abc'),
    ).toBe('/redefinir-senha?source=email#access_token=abc');
  });

  it('converte custom scheme em rota interna navegável', () => {
    expect(
      resolveDeepLinkPath('blackbelt://auth/callback?invite_token=token-123'),
    ).toBe('/auth/callback?invite_token=token-123');
  });

  it('usa rota embutida no hash quando necessário', () => {
    expect(
      resolveDeepLinkPath('blackbelt://localhost#/convite/token-456'),
    ).toBe('/convite/token-456');
  });
});
