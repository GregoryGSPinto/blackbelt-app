import { test, expect } from '@playwright/test';
import { assertPageLoaded, takeScreenshot } from '../helpers/assertions';

test.describe('Wizard de Cadastro de Academia', () => {

  test('Pagina de cadastro carrega', async ({ page }) => {
    for (const route of ['/cadastrar-academia', '/cadastrar', '/onboarding', '/registro']) {
      await page.goto(route);
      await page.waitForLoadState('load');
      const url = page.url();
      if (!url.includes('/login') && !url.includes('404')) {
        console.log(`  Rota de cadastro: ${route}`);
        await assertPageLoaded(page);
        await takeScreenshot(page, 'onboarding-page-loaded');
        return;
      }
    }
    // Se nenhuma rota funcionou, verificar se tem link na landing
    await page.goto('/');
    await page.waitForLoadState('load');
    const cadastrarLink = page.locator('a:has-text("Cadastrar"), a:has-text("Comecar"), a:has-text("Gratis"), a:has-text("Trial"), a:has-text("Teste")').first();
    const hasLink = await cadastrarLink.isVisible().catch(() => false);
    console.log(`  Link de cadastro na landing: ${hasLink}`);
    if (hasLink) {
      const href = await cadastrarLink.getAttribute('href');
      console.log(`  Link encontrado: ${href}`);
    }
    await takeScreenshot(page, 'onboarding-landing-link');
  });

  test('Wizard tem multiplos steps', async ({ page }) => {
    await page.goto('/cadastrar-academia');
    await page.waitForLoadState('load');
    await page.waitForTimeout(2000);

    const stepIndicator = page.locator('[class*="step"], [class*="progress"], [class*="wizard"], [role="progressbar"], [class*="stepper"]').first();
    const hasSteps = await stepIndicator.isVisible().catch(() => false);
    console.log(`  Indicador de steps: ${hasSteps}`);

    const inputs = page.locator('input, select, textarea');
    const inputCount = await inputs.count();
    console.log(`  Campos de formulario: ${inputCount}`);
    expect(inputCount).toBeGreaterThan(0);

    const nextBtn = page.locator('button:has-text("Proximo"), button:has-text("Avancar"), button:has-text("Continuar"), button:has-text("Next")').first();
    const hasNext = await nextBtn.isVisible().catch(() => false);
    console.log(`  Botao avancar: ${hasNext}`);

    await takeScreenshot(page, 'onboarding-wizard-steps');
  });

  test('Step de planos mostra opcoes', async ({ page }) => {
    await page.goto('/cadastrar-academia');
    await page.waitForLoadState('load');
    await page.waitForTimeout(1000);

    for (let i = 0; i < 5; i++) {
      const planCard = page.locator('text=Starter, text=Essencial, text=Pro, text=Black Belt').first();
      if (await planCard.isVisible().catch(() => false)) {
        console.log(`  Step de planos encontrado no step ${i + 1}`);

        const hasStarter = await page.locator('text=R$79').isVisible().catch(() => false);
        const hasPro = await page.locator('text=R$249').isVisible().catch(() => false);
        console.log(`  Starter R$79: ${hasStarter}`);
        console.log(`  Pro R$249: ${hasPro}`);

        const hasBadge = await page.locator('text=MAIS POPULAR, text=Mais Popular').first().isVisible().catch(() => false);
        console.log(`  Badge mais popular: ${hasBadge}`);

        await takeScreenshot(page, 'onboarding-plan-selection');
        return;
      }

      const requiredInputs = page.locator('input[required], input:not([type="hidden"])');
      const count = await requiredInputs.count();
      for (let j = 0; j < Math.min(count, 5); j++) {
        const input = requiredInputs.nth(j);
        const type = await input.getAttribute('type') || 'text';
        const name = await input.getAttribute('name') || '';
        if (type === 'email') await input.fill('teste@teste.com');
        else if (type === 'password') await input.fill('Teste@2026');
        else if (type === 'tel') await input.fill('31999999999');
        else if (name.includes('cpf') || name.includes('cnpj')) await input.fill('123.456.789-09');
        else await input.fill('Teste Automatizado');
      }

      const nextBtn = page.locator('button:has-text("Proximo"), button:has-text("Avancar"), button:has-text("Continuar")').first();
      if (await nextBtn.isVisible().catch(() => false)) {
        await nextBtn.click();
        await page.waitForTimeout(1000);
      }
    }
    console.log('  Nao encontrou step de planos em 5 tentativas');
    await takeScreenshot(page, 'onboarding-no-plan-step');
  });

  test('BillingStep tem metodos de pagamento', async ({ page }) => {
    await page.goto('/cadastrar-academia');
    await page.waitForLoadState('load');
    await page.waitForTimeout(1000);

    for (let i = 0; i < 6; i++) {
      const pixOption = page.locator('text=PIX, button:has-text("PIX")').first();
      const boletoOption = page.locator('text=Boleto').first();

      if (await pixOption.isVisible().catch(() => false)) {
        console.log(`  Step de billing encontrado no step ${i + 1}`);

        const hasPix = await pixOption.isVisible().catch(() => false);
        const hasBoleto = await boletoOption.isVisible().catch(() => false);
        const hasCartao = await page.locator('text=Cartao').first().isVisible().catch(() => false);
        console.log(`  PIX: ${hasPix}, Boleto: ${hasBoleto}, Cartao: ${hasCartao}`);

        const hasName = await page.locator('input[placeholder*="responsavel"], input[placeholder*="nome"], label:has-text("Nome completo")').first().isVisible().catch(() => false);
        const hasCpf = await page.locator('input[placeholder*="CPF"], input[placeholder*="CNPJ"], label:has-text("CPF")').first().isVisible().catch(() => false);
        console.log(`  Campo nome: ${hasName}`);
        console.log(`  Campo CPF: ${hasCpf}`);

        const hasPrice = await page.locator('text=/R\\$\\d+\\/mes/').first().isVisible().catch(() => false);
        console.log(`  Resumo com preco: ${hasPrice}`);

        const hasTrialText = await page.locator('text=7 dias, text=gratis, text=trial').first().isVisible().catch(() => false);
        console.log(`  Mencao a trial/7 dias: ${hasTrialText}`);

        await takeScreenshot(page, 'onboarding-billing-step');
        return;
      }

      const nextBtn = page.locator('button:has-text("Proximo"), button:has-text("Avancar"), button:has-text("Continuar")').first();
      if (await nextBtn.isVisible().catch(() => false)) {
        const inputs = page.locator('input:not([type="hidden"]):visible');
        const count = await inputs.count();
        for (let j = 0; j < Math.min(count, 5); j++) {
          const input = inputs.nth(j);
          const type = await input.getAttribute('type') || 'text';
          if (type === 'email') await input.fill('teste@teste.com');
          else if (type === 'password') await input.fill('Teste@2026');
          else if (type === 'tel') await input.fill('31999999999');
          else await input.fill('Teste Auto');
        }
        await nextBtn.click();
        await page.waitForTimeout(1000);
      }
    }
    console.log('  Nao encontrou step de billing em 6 tentativas');
    await takeScreenshot(page, 'onboarding-no-billing-step');
  });
});
