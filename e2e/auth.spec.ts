import { test, expect } from '@playwright/test';

test.describe('Autenticação', () => {
  test('deve fazer login como admin e ver o dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@guerreiros.com');
    await page.fill('input[type="password"]', 'BlackBelt@2026');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/selecionar-perfil|\/admin/);
  });

  test('deve rejeitar credenciais inválidas', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'invalid@test.com');
    await page.fill('input[type="password"]', 'wrong');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Credenciais inválidas')).toBeVisible();
  });

  test('deve redirecionar para login quando não autenticado', async ({ page }) => {
    await page.goto('/admin');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@guerreiros.com');
    await page.fill('input[type="password"]', 'BlackBelt@2026');
    await page.click('button[type="submit"]');
  });

  test('deve exibir sidebar com itens de navegação', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.locator('text=Dashboard')).toBeVisible();
    await expect(page.locator('text=Alunos')).toBeVisible();
    await expect(page.locator('text=Turmas')).toBeVisible();
  });
});
