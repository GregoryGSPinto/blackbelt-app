import { test, expect } from '@playwright/test';

test.describe('Onboarding — Cadastrar Academia', () => {
  test('completes the full academy registration wizard', async ({ page }) => {
    const timestamp = Date.now();
    const academyName = `Teste Auto ${timestamp}`;
    const adminEmail = `teste-${timestamp}@teste.com`;

    await page.goto('/cadastrar-academia');

    // ── Step 1: Academy Data ────────────────────────────────────
    await expect(page.getByText('Dados da Academia')).toBeVisible();

    await page.getByPlaceholder('Ex: Academia Guerreiros BJJ').fill(academyName);
    await page.getByPlaceholder('(11) 99999-9999').first().fill('(11) 99999-9999');
    await page.getByPlaceholder('Belo Horizonte').fill('São Paulo');

    // Select state
    await page.locator('select').selectOption('SP');

    await page.getByRole('button', { name: 'Próximo' }).click();

    // ── Step 2: Academy Details ─────────────────────────────────
    await expect(page.getByText('Detalhes da Academia')).toBeVisible();

    // Select at least one modality
    await page.getByText('Jiu-Jitsu').click();

    await page.getByRole('button', { name: 'Próximo' }).click();

    // ── Step 3: Admin Data ──────────────────────────────────────
    await expect(page.getByText('Dados do Administrador')).toBeVisible();

    await page.getByPlaceholder('Seu nome completo').fill('Teste Automatizado');
    await page.getByPlaceholder('seu@email.com').fill(adminEmail);
    await page.getByPlaceholder('Mínimo 6 caracteres').fill('Teste@2026');
    await page.getByPlaceholder('Repita a senha').fill('Teste@2026');

    await page.getByRole('button', { name: 'Próximo' }).click();

    // ── Step 4: Plan Selection ──────────────────────────────────
    await expect(page.getByText('Escolha seu Plano')).toBeVisible();

    // Pro should be pre-selected
    await page.getByRole('button', { name: 'Próximo' }).click();

    // ── Step 5: Confirmation ────────────────────────────────────
    await expect(page.getByText('Confirmação')).toBeVisible();
    await expect(page.getByText(academyName)).toBeVisible();
    await expect(page.getByText(adminEmail)).toBeVisible();

    // Submit
    await page.getByRole('button', { name: 'Criar Minha Academia' }).click();

    // ── Verify redirect to setup wizard ─────────────────────────
    await page.waitForURL(/\/(admin|setup-wizard)/, { timeout: 15000 });
    expect(page.url()).toMatch(/\/(admin|setup-wizard)/);
  });
});

test.describe('Onboarding — Cadastro de Aluno', () => {
  test('student registration page loads and validates', async ({ page }) => {
    await page.goto('/cadastro');

    // Step 1 should be visible
    await expect(page.getByText('Nome completo')).toBeVisible();
    await expect(page.getByText('Email')).toBeVisible();
    await expect(page.getByText('Data de nascimento')).toBeVisible();

    // Try to advance without filling — should show errors
    await page.getByRole('button', { name: 'Continuar' }).click();
    await expect(page.getByText('obrigatorio').first()).toBeVisible();
  });
});
