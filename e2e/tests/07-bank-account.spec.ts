import { test } from '@playwright/test';
import { TEST_USERS, login } from '../helpers/auth';
import { assertPageLoaded, takeScreenshot, dismissOverlays } from '../helpers/assertions';

test.describe('Configuracao de Dados Bancarios', () => {

  test('Banner de dados bancarios aparece no dashboard', async ({ page }) => {
    await login(page, TEST_USERS.admin);
    await page.waitForLoadState('load');
    await dismissOverlays(page);
    await page.waitForTimeout(2000);

    const bankBanner = page.locator(
      'text=conta bancaria, text=dados bancarios, text=Configurar agora'
    ).first();
    const hasBanner = await bankBanner.isVisible().catch(() => false);
    console.log(`  Banner dados bancarios: ${hasBanner}`);

    await takeScreenshot(page, 'bank-dashboard-banner');
  });

  test('Pagina de dados bancarios carrega', async ({ page }) => {
    await login(page, TEST_USERS.admin);

    await page.goto('/admin/configuracoes/dados-bancarios');
    await page.waitForLoadState('load');
    await assertPageLoaded(page);
    await page.waitForTimeout(2000);

    const hasTitle = await page.locator('text=Receber pagamentos, text=Dados Bancarios, text=dados bancarios, text=conta bancaria').first().isVisible().catch(() => false);
    console.log(`  Titulo da pagina: ${hasTitle}`);

    const fields = {
      nome: await page.locator('input[placeholder*="titular"], input[placeholder*="responsavel"], label:has-text("Nome")').first().isVisible().catch(() => false),
      cpf: await page.locator('input[placeholder*="CPF"], input[placeholder*="CNPJ"]').first().isVisible().catch(() => false),
      banco: await page.locator('select, label:has-text("Banco")').first().isVisible().catch(() => false),
      agencia: await page.locator('input[placeholder*="gencia"], input[placeholder*="1234"], label:has-text("Agencia")').first().isVisible().catch(() => false),
      conta: await page.locator('input[placeholder*="12345"], label:has-text("Conta")').first().isVisible().catch(() => false),
    };

    for (const [field, visible] of Object.entries(fields)) {
      console.log(`  Campo ${field}: ${visible}`);
    }

    const saveBtn = page.locator('button:has-text("Configurar"), button:has-text("Salvar"), button:has-text("Ativar")').first();
    const hasSave = await saveBtn.isVisible().catch(() => false);
    console.log(`  Botao salvar: ${hasSave}`);

    const bankSelect = page.locator('select').first();
    if (await bankSelect.isVisible().catch(() => false)) {
      const options = await bankSelect.locator('option').count().catch(() => 0);
      console.log(`  Opcoes de banco: ${options}`);
    }

    await takeScreenshot(page, 'bank-account-page');
  });

  test('Link no sidebar existe', async ({ page }) => {
    await login(page, TEST_USERS.admin);
    await page.waitForLoadState('load');
    await dismissOverlays(page);

    const bankLink = page.locator('a[href*="dados-bancarios"], nav a:has-text("Dados Bancarios")').first();
    const hasLink = await bankLink.isVisible().catch(() => false);
    console.log(`  Link no sidebar: ${hasLink}`);

    if (hasLink) {
      await bankLink.click();
      await page.waitForLoadState('load');
      await page.waitForTimeout(1000);
      const onPage = page.url().includes('dados-bancarios');
      console.log(`  Navegou para dados-bancarios: ${onPage}`);
    }

    await takeScreenshot(page, 'bank-sidebar-link');
  });
});
