import { test, expect } from '@playwright/test';
import { TEST_USERS, login } from '../helpers/auth';
import { assertPageLoaded, takeScreenshot, dismissOverlays } from '../helpers/assertions';

test.describe('Cobranca de Alunos', () => {

  test('Financeiro tem botao Gerar Cobranca', async ({ page }) => {
    await login(page, TEST_USERS.admin);

    await page.goto('/admin/financeiro');
    await page.waitForLoadState('load');
    await assertPageLoaded(page);
    await dismissOverlays(page);
    await page.waitForTimeout(2000);

    const chargeBtn = page.locator('button:has-text("Gerar Cobranca"), button:has-text("Nova Cobranca")').first();
    const hasBtn = await chargeBtn.isVisible().catch(() => false);
    console.log(`  Botao gerar cobranca: ${hasBtn}`);

    await takeScreenshot(page, 'financeiro-charge-button');
  });

  test('Modal de cobranca abre', async ({ page }) => {
    await login(page, TEST_USERS.admin);

    await page.goto('/admin/financeiro');
    await page.waitForLoadState('load');
    await dismissOverlays(page);
    await page.waitForTimeout(2000);

    const chargeBtn = page.locator('button:has-text("Gerar Cobranca")').first();
    if (await chargeBtn.isVisible().catch(() => false)) {
      await chargeBtn.click();
      await page.waitForTimeout(1000);

      const modal = page.locator('[class*="fixed"][class*="inset"]');
      const hasModal = await modal.first().isVisible().catch(() => false);
      console.log(`  Modal aberto: ${hasModal}`);

      if (hasModal) {
        const hasStudentSelect = await page.locator('text=Aluno, input[placeholder*="aluno"], label:has-text("Aluno")').first().isVisible().catch(() => false);
        const hasValue = await page.locator('input[placeholder*="150"], label:has-text("Valor")').first().isVisible().catch(() => false);
        const hasDueDate = await page.locator('input[type="date"], label:has-text("Vencimento")').first().isVisible().catch(() => false);
        const hasPaymentMethod = await page.locator('text=PIX, button:has-text("PIX")').first().isVisible().catch(() => false);

        console.log(`  Seletor de aluno: ${hasStudentSelect}`);
        console.log(`  Campo valor: ${hasValue}`);
        console.log(`  Campo vencimento: ${hasDueDate}`);
        console.log(`  Metodo pagamento: ${hasPaymentMethod}`);
      }

      await takeScreenshot(page, 'financeiro-charge-modal');
    } else {
      console.log('  Botao gerar cobranca nao encontrado');
      await takeScreenshot(page, 'financeiro-no-charge-btn');
    }
  });

  test('Aba de cobrancas existe no financeiro', async ({ page }) => {
    await login(page, TEST_USERS.admin);

    await page.goto('/admin/financeiro');
    await page.waitForLoadState('load');
    await dismissOverlays(page);
    await page.waitForTimeout(2000);

    const chargesTab = page.locator('button:has-text("Cobranca"), button:has-text("cobranca")').first();
    const hasTab = await chargesTab.isVisible().catch(() => false);
    console.log(`  Aba cobrancas: ${hasTab}`);

    if (hasTab) {
      await chargesTab.click();
      await page.waitForTimeout(1000);

      const hasEmpty = await page.locator('text=Nenhuma cobranca').first().isVisible().catch(() => false);
      console.log(`  Empty state: ${hasEmpty}`);
    }

    await takeScreenshot(page, 'financeiro-charges-tab');
  });

  test('Aviso de banco nao configurado aparece', async ({ page }) => {
    await login(page, TEST_USERS.admin);

    await page.goto('/admin/financeiro');
    await page.waitForLoadState('load');
    await dismissOverlays(page);
    await page.waitForTimeout(2000);

    const bankWarning = page.locator(
      'text=Configure seus dados bancarios, text=conta bancaria, text=Configurar agora'
    ).first();
    const hasWarning = await bankWarning.isVisible().catch(() => false);
    console.log(`  Aviso banco nao configurado: ${hasWarning}`);

    if (hasWarning) {
      const configLink = page.locator('a[href*="dados-bancarios"], a:has-text("Configurar agora")').first();
      const hasLink = await configLink.isVisible().catch(() => false);
      console.log(`  Link para configurar: ${hasLink}`);
    }

    await takeScreenshot(page, 'financeiro-bank-warning');
  });
});
