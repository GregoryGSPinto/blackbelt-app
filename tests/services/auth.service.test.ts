import { describe, it, expect, vi, beforeAll } from 'vitest';

// Garante que isMock() retorna true
beforeAll(() => {
  vi.stubEnv('NEXT_PUBLIC_USE_MOCK', 'true');
});

describe('auth.service', () => {
  // ── login ──────────────────────────────────────────────────

  describe('login', () => {
    it('retorna tokens e perfis com credenciais válidas', async () => {
      const { login } = await import('@/lib/api/auth.service');

      const result = await login({
        email: 'admin@blackbelt.com',
        password: 'senha123',
      });

      expect(result.accessToken).toBeDefined();
      expect(result.accessToken.length).toBeGreaterThan(0);
      expect(result.refreshToken).toBeDefined();
      expect(result.refreshToken.length).toBeGreaterThan(0);
      expect(result.profiles).toBeInstanceOf(Array);
      expect(result.profiles.length).toBeGreaterThanOrEqual(1);
    });

    it('retorna perfis com campos obrigatórios preenchidos', async () => {
      const { login } = await import('@/lib/api/auth.service');

      const result = await login({
        email: 'admin@blackbelt.com',
        password: 'senha123',
      });

      const profile = result.profiles[0];
      expect(profile.id).toBeDefined();
      expect(profile.user_id).toBeDefined();
      expect(profile.role).toBeDefined();
      expect(profile.display_name).toBeDefined();
    });

    it('lança erro com credenciais inválidas', async () => {
      const { login } = await import('@/lib/api/auth.service');

      await expect(
        login({ email: 'invalido@email.com', password: 'errada' }),
      ).rejects.toThrow();
    });

    it('lança erro com senha incorreta para email válido', async () => {
      const { login } = await import('@/lib/api/auth.service');

      await expect(
        login({ email: 'admin@blackbelt.com', password: 'errada' }),
      ).rejects.toThrow();
    });

    it('retorna múltiplos perfis para usuário multi-perfil', async () => {
      const { login } = await import('@/lib/api/auth.service');

      const result = await login({
        email: 'multiperfil@blackbelt.com',
        password: 'senha123',
      });

      expect(result.profiles.length).toBeGreaterThanOrEqual(2);
    });
  });

  // ── register ───────────────────────────────────────────────

  describe('register', () => {
    it('cria novo usuário com dados válidos', async () => {
      const { register } = await import('@/lib/api/auth.service');

      const result = await register({
        name: 'Novo Aluno',
        email: `novo-${Date.now()}@blackbelt.com`,
        password: 'senha123',
      });

      expect(result.user).toBeDefined();
      expect(result.user.id).toBeDefined();
      expect(result.user.email).toContain('@');
      expect(result.profile).toBeDefined();
      expect(result.profile.display_name).toBe('Novo Aluno');
    });

    it('lança erro ao registrar email já existente', async () => {
      const { register } = await import('@/lib/api/auth.service');

      await expect(
        register({
          name: 'Duplicado',
          email: 'admin@blackbelt.com',
          password: 'senha123',
        }),
      ).rejects.toThrow();
    });
  });

  // ── logout ─────────────────────────────────────────────────

  describe('logout', () => {
    it('executa sem erro', async () => {
      const { logout } = await import('@/lib/api/auth.service');
      await expect(logout()).resolves.toBeUndefined();
    });
  });
});
