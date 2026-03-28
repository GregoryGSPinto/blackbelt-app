import { test } from '@playwright/test';
import { TEST_USERS, login } from '../helpers/auth';
import { assertPageLoaded, takeScreenshot, dismissOverlays } from '../helpers/assertions';

test.describe('Fluxo Admin Completo — Ponta a Ponta', () => {

  test('Admin: dashboard → alunos → financeiro → dados bancarios', async ({ page }) => {
    await login(page, TEST_USERS.admin);
    await page.waitForLoadState('load');
    await dismissOverlays(page);

    // 1. Dashboard carrega
    await assertPageLoaded(page);
    console.log('  Dashboard carregou');
    await takeScreenshot(page, 'flow-admin-1-dashboard');

    // 2. Navegar pra alunos
    await page.goto('/admin/alunos');
    await page.waitForLoadState('load');
    await assertPageLoaded(page);
    console.log('  Lista de alunos carregou');
    await takeScreenshot(page, 'flow-admin-2-alunos');

    // 3. Navegar pro financeiro
    await page.goto('/admin/financeiro');
    await page.waitForLoadState('load');
    await assertPageLoaded(page);

    const chargeBtn = await page.locator('button:has-text("Gerar Cobranca")').first().isVisible().catch(() => false);
    console.log(`  Financeiro carregou (botao cobranca: ${chargeBtn})`);
    await takeScreenshot(page, 'flow-admin-3-financeiro');

    // 4. Navegar pra dados bancarios
    await page.goto('/admin/configuracoes/dados-bancarios');
    await page.waitForLoadState('load');
    await assertPageLoaded(page);

    const hasBankForm = await page.locator('input, select').count();
    console.log(`  Dados bancarios carregou (${hasBankForm} campos)`);
    await takeScreenshot(page, 'flow-admin-4-dados-bancarios');

    // 5. Navegar pro plano
    await page.goto('/admin/plano');
    await page.waitForLoadState('load');
    await assertPageLoaded(page);
    console.log('  Pagina de plano carregou');
    await takeScreenshot(page, 'flow-admin-5-plano');

    // 6. Verificar configuracoes
    await page.goto('/admin/configuracoes');
    await page.waitForLoadState('load');
    await assertPageLoaded(page);
    console.log('  Configuracoes carregou');
    await takeScreenshot(page, 'flow-admin-6-configuracoes');
  });

  test('Responsavel: dashboard → pagamentos → agenda', async ({ page }) => {
    await login(page, TEST_USERS.responsavel);
    await page.waitForLoadState('load');
    await dismissOverlays(page);

    // 1. Dashboard
    await assertPageLoaded(page);
    console.log('  Dashboard responsavel carregou');

    // 2. Pagamentos
    await page.goto('/parent/pagamentos');
    await page.waitForLoadState('load');
    await assertPageLoaded(page);
    console.log('  Pagamentos carregou');

    // 3. Agenda
    await page.goto('/parent/agenda');
    await page.waitForLoadState('load');
    await assertPageLoaded(page);
    console.log('  Agenda carregou');

    await takeScreenshot(page, 'flow-responsavel-completo');
  });

  test('Aluno: dashboard → configuracoes com excluir conta', async ({ page }) => {
    await login(page, TEST_USERS.aluno_adulto);
    await page.waitForLoadState('load');
    await dismissOverlays(page);

    // 1. Dashboard
    await assertPageLoaded(page);
    console.log('  Dashboard aluno carregou');

    // 2. Configuracoes
    await page.goto('/dashboard/configuracoes');
    await page.waitForLoadState('load');
    await assertPageLoaded(page);

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    const hasDelete = await page.locator('text=Excluir, text=excluir, text=Zona de Perigo').first().isVisible().catch(() => false);
    console.log(`  Configuracoes carregou (excluir conta: ${hasDelete})`);

    await takeScreenshot(page, 'flow-aluno-configuracoes');
  });
});
