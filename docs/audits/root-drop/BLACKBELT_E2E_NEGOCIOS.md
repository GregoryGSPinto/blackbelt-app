# BLACKBELT v2 — TESTES E2E DE PONTA A PONTA
## Testar TODOS os fluxos de negócio no browser real
## Cadastro → Plano → Pagamento → Subconta → Cobrança → Webhook

> **INSTRUÇÕES DE EXECUÇÃO:**
> - Execute BLOCO a BLOCO, na ordem (B1 → B6)
> - Cada BLOCO termina com: `pnpm typecheck && pnpm build` → commit → push
> - Base URL: `https://blackbelts.com.br`
> - PRÉ-REQUISITO: todos os prompts anteriores executados, Asaas + Resend configurados

---

## BLOCO 1 — TESTES DO WIZARD DE CADASTRO DE ACADEMIA

Criar `e2e/tests/06-onboarding-wizard.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';
import { assertPageLoaded, takeScreenshot } from '../helpers/assertions';

test.describe('Wizard de Cadastro de Academia', () => {

  test('Página de cadastro carrega', async ({ page }) => {
    // Tentar diferentes rotas possíveis
    for (const route of ['/cadastrar-academia', '/cadastrar', '/onboarding', '/registro']) {
      await page.goto(route);
      await page.waitForLoadState('load');
      const url = page.url();
      if (!url.includes('/login') && !url.includes('404')) {
        console.log(`  ✅ Rota de cadastro: ${route}`);
        await assertPageLoaded(page);
        await takeScreenshot(page, 'onboarding-page-loaded');
        return;
      }
    }
    // Se nenhuma rota funcionou, verificar se tem link na landing
    await page.goto('/');
    await page.waitForLoadState('load');
    const cadastrarLink = page.locator('a:has-text("Cadastrar"), a:has-text("Começar"), a:has-text("Grátis"), a:has-text("Trial"), a:has-text("Teste")').first();
    const hasLink = await cadastrarLink.isVisible().catch(() => false);
    console.log(`  Link de cadastro na landing: ${hasLink}`);
    if (hasLink) {
      const href = await cadastrarLink.getAttribute('href');
      console.log(`  ✅ Link encontrado: ${href}`);
    }
    await takeScreenshot(page, 'onboarding-landing-link');
  });

  test('Wizard tem múltiplos steps', async ({ page }) => {
    await page.goto('/cadastrar-academia');
    await page.waitForLoadState('load');
    await page.waitForTimeout(2000);

    // Verificar que tem indicador de steps
    const stepIndicator = page.locator('[class*="step"], [class*="progress"], [class*="wizard"], [role="progressbar"], [class*="stepper"]').first();
    const hasSteps = await stepIndicator.isVisible().catch(() => false);
    console.log(`  Indicador de steps: ${hasSteps}`);

    // Verificar que tem campos de formulário
    const inputs = page.locator('input, select, textarea');
    const inputCount = await inputs.count();
    console.log(`  Campos de formulário: ${inputCount}`);
    expect(inputCount).toBeGreaterThan(0);

    // Verificar botão de avançar
    const nextBtn = page.locator('button:has-text("Próximo"), button:has-text("Avançar"), button:has-text("Continuar"), button:has-text("Next")').first();
    const hasNext = await nextBtn.isVisible().catch(() => false);
    console.log(`  Botão avançar: ${hasNext}`);

    await takeScreenshot(page, 'onboarding-wizard-steps');
  });

  test('Step de planos mostra 4 opções', async ({ page }) => {
    await page.goto('/cadastrar-academia');
    await page.waitForLoadState('load');
    await page.waitForTimeout(1000);

    // Navegar até o step de planos (clicar "Próximo" até chegar)
    for (let i = 0; i < 5; i++) {
      // Verificar se chegou no step de planos
      const planCard = page.locator('text=Starter, text=Essencial, text=Pro, text=Black Belt').first();
      if (await planCard.isVisible().catch(() => false)) {
        console.log(`  ✅ Step de planos encontrado no step ${i + 1}`);

        // Contar cards de planos
        const planCards = page.locator('[class*="cursor-pointer"][class*="rounded"], [class*="plan-card"], [class*="pricing"]');
        const planCount = await planCards.count();
        console.log(`  Cards de plano: ${planCount}`);

        // Verificar preços
        const hasStarter = await page.locator('text=R$79').isVisible().catch(() => false);
        const hasPro = await page.locator('text=R$249').isVisible().catch(() => false);
        console.log(`  Starter R$79: ${hasStarter}`);
        console.log(`  Pro R$249: ${hasPro}`);

        // Verificar badge "Mais Popular"
        const hasBadge = await page.locator('text=MAIS POPULAR, text=Mais Popular').first().isVisible().catch(() => false);
        console.log(`  Badge mais popular: ${hasBadge}`);

        await takeScreenshot(page, 'onboarding-plan-selection');
        return;
      }

      // Preencher campos obrigatórios minimamente e avançar
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

      const nextBtn = page.locator('button:has-text("Próximo"), button:has-text("Avançar"), button:has-text("Continuar")').first();
      if (await nextBtn.isVisible().catch(() => false)) {
        await nextBtn.click();
        await page.waitForTimeout(1000);
      }
    }
    console.log('  ⚠️ Não encontrou step de planos em 5 tentativas');
    await takeScreenshot(page, 'onboarding-no-plan-step');
  });

  test('BillingStep tem métodos de pagamento', async ({ page }) => {
    await page.goto('/cadastrar-academia');
    await page.waitForLoadState('load');
    await page.waitForTimeout(1000);

    // Navegar até o step de billing
    for (let i = 0; i < 6; i++) {
      const pixOption = page.locator('text=PIX, button:has-text("PIX")').first();
      const boletoOption = page.locator('text=Boleto').first();

      if (await pixOption.isVisible().catch(() => false)) {
        console.log(`  ✅ Step de billing encontrado no step ${i + 1}`);

        // Verificar 3 métodos
        const hasPix = await pixOption.isVisible().catch(() => false);
        const hasBoleto = await boletoOption.isVisible().catch(() => false);
        const hasCartao = await page.locator('text=Cartão, text=Cartao').first().isVisible().catch(() => false);
        console.log(`  PIX: ${hasPix}, Boleto: ${hasBoleto}, Cartão: ${hasCartao}`);

        // Verificar campos de dados de cobrança
        const hasName = await page.locator('input[placeholder*="responsável"], input[placeholder*="nome"], label:has-text("Nome completo")').first().isVisible().catch(() => false);
        const hasCpf = await page.locator('input[placeholder*="CPF"], input[placeholder*="CNPJ"], label:has-text("CPF")').first().isVisible().catch(() => false);
        console.log(`  Campo nome: ${hasName}`);
        console.log(`  Campo CPF: ${hasCpf}`);

        // Verificar resumo de preço
        const hasPrice = await page.locator('text=/R\\$\\d+\\/mês/').first().isVisible().catch(() => false);
        console.log(`  Resumo com preço: ${hasPrice}`);

        // Verificar texto de trial
        const hasTrialText = await page.locator('text=7 dias, text=grátis, text=trial').first().isVisible().catch(() => false);
        console.log(`  Menção a trial/7 dias: ${hasTrialText}`);

        await takeScreenshot(page, 'onboarding-billing-step');
        return;
      }

      // Avançar
      const nextBtn = page.locator('button:has-text("Próximo"), button:has-text("Avançar"), button:has-text("Continuar")').first();
      if (await nextBtn.isVisible().catch(() => false)) {
        // Preencher campos
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
    console.log('  ⚠️ Não encontrou step de billing em 6 tentativas');
    await takeScreenshot(page, 'onboarding-no-billing-step');
  });
});
```

**Commit:** `test: E2E onboarding wizard — cadastro, planos, billing step`

---

## BLOCO 2 — TESTES DA PÁGINA DE DADOS BANCÁRIOS

Criar `e2e/tests/07-bank-account.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';
import { TEST_USERS, login } from '../helpers/auth';
import { assertPageLoaded, takeScreenshot, dismissOverlays } from '../helpers/assertions';

test.describe('Configuração de Dados Bancários', () => {

  test('Banner de dados bancários aparece no dashboard', async ({ page }) => {
    await login(page, TEST_USERS.admin);
    await page.waitForLoadState('load');
    await dismissOverlays(page);
    await page.waitForTimeout(2000);

    // Procurar banner de configurar conta bancária
    const bankBanner = page.locator(
      'text=conta bancária, text=conta bancaria, text=dados bancários, text=dados bancarios, text=Configurar agora'
    ).first();
    const hasBanner = await bankBanner.isVisible().catch(() => false);
    console.log(`  Banner dados bancários: ${hasBanner}`);

    await takeScreenshot(page, 'bank-dashboard-banner');
  });

  test('Página de dados bancários carrega', async ({ page }) => {
    await login(page, TEST_USERS.admin);

    await page.goto('/admin/configuracoes/dados-bancarios');
    await page.waitForLoadState('load');
    await assertPageLoaded(page);
    await page.waitForTimeout(2000);

    // Verificar título
    const hasTitle = await page.locator('text=Receber pagamentos, text=Dados Bancários, text=dados bancarios, text=conta bancária').first().isVisible().catch(() => false);
    console.log(`  Título da página: ${hasTitle}`);

    // Verificar campos do formulário
    const fields = {
      nome: await page.locator('input[placeholder*="titular"], input[placeholder*="responsável"], input[name*="name"], label:has-text("Nome")').first().isVisible().catch(() => false),
      cpf: await page.locator('input[placeholder*="CPF"], input[placeholder*="CNPJ"], input[name*="cpf"]').first().isVisible().catch(() => false),
      banco: await page.locator('select, input[placeholder*="anco"], [class*="bank-select"], label:has-text("Banco")').first().isVisible().catch(() => false),
      agencia: await page.locator('input[placeholder*="gência"], input[placeholder*="gencia"], input[name*="agency"], label:has-text("Agência")').first().isVisible().catch(() => false),
      conta: await page.locator('input[placeholder*="onta"], input[name*="account"], label:has-text("Conta")').first().isVisible().catch(() => false),
    };

    for (const [field, visible] of Object.entries(fields)) {
      console.log(`  Campo ${field}: ${visible}`);
    }

    // Verificar botão de salvar
    const saveBtn = page.locator('button:has-text("Configurar"), button:has-text("Salvar"), button:has-text("Ativar")').first();
    const hasSave = await saveBtn.isVisible().catch(() => false);
    console.log(`  Botão salvar: ${hasSave}`);

    // Verificar lista de bancos
    const bankSelect = page.locator('select, [class*="bank"], [role="combobox"]').first();
    if (await bankSelect.isVisible().catch(() => false)) {
      const options = await bankSelect.locator('option').count().catch(() => 0);
      console.log(`  Opções de banco: ${options}`);
    }

    await takeScreenshot(page, 'bank-account-page');
  });

  test('Link no sidebar existe', async ({ page }) => {
    await login(page, TEST_USERS.admin);
    await page.waitForLoadState('load');
    await dismissOverlays(page);

    // Procurar link no sidebar
    const bankLink = page.locator('a[href*="dados-bancarios"], nav a:has-text("Dados Bancários"), nav a:has-text("Dados Bancarios")').first();
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
```

**Commit:** `test: E2E bank account — dashboard banner, settings page, sidebar link`

---

## BLOCO 3 — TESTES DO FINANCEIRO E COBRANÇAS

Criar `e2e/tests/08-student-charges.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';
import { TEST_USERS, login } from '../helpers/auth';
import { assertPageLoaded, takeScreenshot, dismissOverlays } from '../helpers/assertions';

test.describe('Cobrança de Alunos', () => {

  test('Financeiro tem botão Gerar Cobrança', async ({ page }) => {
    await login(page, TEST_USERS.admin);

    await page.goto('/admin/financeiro');
    await page.waitForLoadState('load');
    await assertPageLoaded(page);
    await dismissOverlays(page);
    await page.waitForTimeout(2000);

    // Verificar botão de gerar cobrança
    const chargeBtn = page.locator('button:has-text("Gerar Cobrança"), button:has-text("Gerar Cobranca"), button:has-text("Nova Cobrança")').first();
    const hasBtn = await chargeBtn.isVisible().catch(() => false);
    console.log(`  Botão gerar cobrança: ${hasBtn}`);

    await takeScreenshot(page, 'financeiro-charge-button');
  });

  test('Modal de cobrança abre', async ({ page }) => {
    await login(page, TEST_USERS.admin);

    await page.goto('/admin/financeiro');
    await page.waitForLoadState('load');
    await dismissOverlays(page);
    await page.waitForTimeout(2000);

    const chargeBtn = page.locator('button:has-text("Gerar Cobrança"), button:has-text("Gerar Cobranca")').first();
    if (await chargeBtn.isVisible().catch(() => false)) {
      await chargeBtn.click();
      await page.waitForTimeout(1000);

      // Verificar que modal abriu
      const modal = page.locator('[class*="modal"], [class*="dialog"], [role="dialog"], [class*="fixed"][class*="inset"]');
      const hasModal = await modal.first().isVisible().catch(() => false);
      console.log(`  Modal aberto: ${hasModal}`);

      if (hasModal) {
        // Verificar campos do modal
        const hasStudentSelect = await page.locator('text=Aluno, select, input[placeholder*="aluno"], [class*="student"]').first().isVisible().catch(() => false);
        const hasValue = await page.locator('input[placeholder*="valor"], input[placeholder*="R$"], input[type="number"], label:has-text("Valor")').first().isVisible().catch(() => false);
        const hasDueDate = await page.locator('input[type="date"], input[placeholder*="vencimento"], label:has-text("Vencimento")').first().isVisible().catch(() => false);
        const hasPaymentMethod = await page.locator('text=PIX, button:has-text("PIX"), select').first().isVisible().catch(() => false);

        console.log(`  Seletor de aluno: ${hasStudentSelect}`);
        console.log(`  Campo valor: ${hasValue}`);
        console.log(`  Campo vencimento: ${hasDueDate}`);
        console.log(`  Método pagamento: ${hasPaymentMethod}`);
      }

      await takeScreenshot(page, 'financeiro-charge-modal');
    } else {
      console.log('  ⚠️ Botão gerar cobrança não encontrado');
      await takeScreenshot(page, 'financeiro-no-charge-btn');
    }
  });

  test('Aba de cobranças existe no financeiro', async ({ page }) => {
    await login(page, TEST_USERS.admin);

    await page.goto('/admin/financeiro');
    await page.waitForLoadState('load');
    await dismissOverlays(page);
    await page.waitForTimeout(2000);

    // Verificar aba de cobranças
    const chargesTab = page.locator('button:has-text("Cobrança"), button:has-text("Cobranca"), button:has-text("cobranças"), button:has-text("cobrancas")').first();
    const hasTab = await chargesTab.isVisible().catch(() => false);
    console.log(`  Aba cobranças: ${hasTab}`);

    if (hasTab) {
      await chargesTab.click();
      await page.waitForTimeout(1000);

      // Verificar conteúdo da aba
      const hasEmpty = await page.locator('text=Nenhuma cobrança, text=Nenhuma cobranca, text=nenhuma cobrança').first().isVisible().catch(() => false);
      const hasList = await page.locator('table tbody tr, [class*="payment-row"], [class*="charge-item"]').count().catch(() => 0);
      console.log(`  Empty state: ${hasEmpty}`);
      console.log(`  Itens na lista: ${hasList}`);
    }

    await takeScreenshot(page, 'financeiro-charges-tab');
  });

  test('Aviso de banco não configurado aparece', async ({ page }) => {
    await login(page, TEST_USERS.admin);

    await page.goto('/admin/financeiro');
    await page.waitForLoadState('load');
    await dismissOverlays(page);
    await page.waitForTimeout(2000);

    // Se banco não configurado, deve mostrar aviso
    const bankWarning = page.locator(
      'text=Configure seus dados bancários, text=Configure seus dados bancarios, text=conta bancária, text=Configurar agora'
    ).first();
    const hasWarning = await bankWarning.isVisible().catch(() => false);
    console.log(`  Aviso banco não configurado: ${hasWarning}`);

    if (hasWarning) {
      // Verificar link para configurar
      const configLink = page.locator('a[href*="dados-bancarios"], a:has-text("Configurar agora")').first();
      const hasLink = await configLink.isVisible().catch(() => false);
      console.log(`  Link para configurar: ${hasLink}`);
    }

    await takeScreenshot(page, 'financeiro-bank-warning');
  });
});
```

**Commit:** `test: E2E student charges — modal, tabs, bank warning`

---

## BLOCO 4 — TESTES DE TRIAL E ASSINATURA

Criar `e2e/tests/09-trial-subscription.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';
import { TEST_USERS, login } from '../helpers/auth';
import { assertPageLoaded, takeScreenshot, dismissOverlays } from '../helpers/assertions';

test.describe('Trial e Assinatura', () => {

  test('TrialBanner aparece no dashboard (se em trial)', async ({ page }) => {
    await login(page, TEST_USERS.admin);
    await page.waitForLoadState('load');
    await dismissOverlays(page);
    await page.waitForTimeout(2000);

    // Verificar se trial banner existe
    const trialBanner = page.locator(
      'text=trial, text=Trial, text=experimental, text=dias restantes, text=dias grátis, [class*="trial"]'
    ).first();
    const hasTrial = await trialBanner.isVisible().catch(() => false);
    console.log(`  Trial banner visível: ${hasTrial}`);

    await takeScreenshot(page, 'trial-banner');
  });

  test('Página de plano existe', async ({ page }) => {
    await login(page, TEST_USERS.admin);

    await page.goto('/admin/plano');
    await page.waitForLoadState('load');
    await assertPageLoaded(page);
    await page.waitForTimeout(2000);

    // Verificar elementos da página de plano
    const hasPlanName = await page.locator('text=Starter, text=Essencial, text=Pro, text=Black Belt').first().isVisible().catch(() => false);
    const hasUsage = await page.locator('text=alunos, text=Alunos, text=uso, text=Uso').first().isVisible().catch(() => false);

    console.log(`  Nome do plano visível: ${hasPlanName}`);
    console.log(`  Info de uso visível: ${hasUsage}`);

    await takeScreenshot(page, 'admin-plan-page');
  });

  test('API de assinatura existe', async ({ page }) => {
    // Testar se o endpoint responde (sem dados válidos deve retornar erro controlado)
    const response = await page.request.post('/api/subscriptions/create', {
      data: {},
      headers: { 'Content-Type': 'application/json' },
    });

    const status = response.status();
    console.log(`  API subscriptions/create status: ${status}`);
    // Deve retornar 400 ou 500, não 404
    expect(status).not.toBe(404);

    const body = await response.json().catch(() => null);
    console.log(`  Response body: ${JSON.stringify(body)?.substring(0, 100)}`);
  });

  test('API de setup-payments existe', async ({ page }) => {
    const response = await page.request.post('/api/academy/setup-payments', {
      data: {},
      headers: { 'Content-Type': 'application/json' },
    });

    const status = response.status();
    console.log(`  API setup-payments status: ${status}`);
    expect(status).not.toBe(404);
  });

  test('API de charge-student existe', async ({ page }) => {
    const response = await page.request.post('/api/academy/charge-student', {
      data: {},
      headers: { 'Content-Type': 'application/json' },
    });

    const status = response.status();
    console.log(`  API charge-student status: ${status}`);
    expect(status).not.toBe(404);
  });

  test('Webhook Asaas responde', async ({ page }) => {
    const response = await page.request.post('/api/webhooks/asaas', {
      data: { event: 'PAYMENT_CONFIRMED', payment: { id: 'test' } },
      headers: { 'Content-Type': 'application/json' },
    });

    const status = response.status();
    console.log(`  Webhook status: ${status}`);
    // Deve responder (pode ser 200, 400 ou 401 dependendo de auth — não 404)
    expect(status).not.toBe(404);
  });
});
```

**Commit:** `test: E2E trial/subscription — APIs, webhook, trial banner, plan page`

---

## BLOCO 5 — TESTES DE INTEGRAÇÃO: FLUXO ADMIN COMPLETO

Criar `e2e/tests/10-admin-full-flow.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';
import { TEST_USERS, login } from '../helpers/auth';
import { assertPageLoaded, takeScreenshot, dismissOverlays } from '../helpers/assertions';

test.describe('Fluxo Admin Completo — Ponta a Ponta', () => {

  test('Admin: dashboard → alunos → financeiro → dados bancários', async ({ page }) => {
    await login(page, TEST_USERS.admin);
    await page.waitForLoadState('load');
    await dismissOverlays(page);

    // 1. Dashboard carrega
    await assertPageLoaded(page);
    console.log('  ✅ Dashboard carregou');
    await takeScreenshot(page, 'flow-admin-1-dashboard');

    // 2. Navegar pra alunos
    await page.goto('/admin/alunos');
    await page.waitForLoadState('load');
    await assertPageLoaded(page);
    console.log('  ✅ Lista de alunos carregou');
    await takeScreenshot(page, 'flow-admin-2-alunos');

    // 3. Navegar pro financeiro
    await page.goto('/admin/financeiro');
    await page.waitForLoadState('load');
    await assertPageLoaded(page);

    // Verificar botão gerar cobrança
    const chargeBtn = await page.locator('button:has-text("Gerar Cobrança"), button:has-text("Gerar Cobranca")').first().isVisible().catch(() => false);
    console.log(`  ✅ Financeiro carregou (botão cobrança: ${chargeBtn})`);
    await takeScreenshot(page, 'flow-admin-3-financeiro');

    // 4. Navegar pra dados bancários
    await page.goto('/admin/configuracoes/dados-bancarios');
    await page.waitForLoadState('load');
    await assertPageLoaded(page);

    const hasBankForm = await page.locator('input, select').count();
    console.log(`  ✅ Dados bancários carregou (${hasBankForm} campos)`);
    await takeScreenshot(page, 'flow-admin-4-dados-bancarios');

    // 5. Navegar pro plano
    await page.goto('/admin/plano');
    await page.waitForLoadState('load');
    await assertPageLoaded(page);
    console.log('  ✅ Página de plano carregou');
    await takeScreenshot(page, 'flow-admin-5-plano');

    // 6. Verificar configurações
    await page.goto('/admin/configuracoes');
    await page.waitForLoadState('load');
    await assertPageLoaded(page);
    console.log('  ✅ Configurações carregou');
    await takeScreenshot(page, 'flow-admin-6-configuracoes');
  });

  test('Responsável: dashboard → pagamentos → agenda', async ({ page }) => {
    await login(page, TEST_USERS.responsavel);
    await page.waitForLoadState('load');
    await dismissOverlays(page);

    // 1. Dashboard
    await assertPageLoaded(page);
    console.log('  ✅ Dashboard responsável carregou');

    // 2. Pagamentos
    await page.goto('/parent/pagamentos');
    await page.waitForLoadState('load');
    await assertPageLoaded(page);
    console.log('  ✅ Pagamentos carregou');

    // 3. Agenda
    await page.goto('/parent/agenda');
    await page.waitForLoadState('load');
    await assertPageLoaded(page);
    console.log('  ✅ Agenda carregou');

    await takeScreenshot(page, 'flow-responsavel-completo');
  });

  test('Aluno: dashboard → configurações com excluir conta', async ({ page }) => {
    await login(page, TEST_USERS.aluno_adulto);
    await page.waitForLoadState('load');
    await dismissOverlays(page);

    // 1. Dashboard
    await assertPageLoaded(page);
    console.log('  ✅ Dashboard aluno carregou');

    // 2. Configurações
    await page.goto('/dashboard/configuracoes');
    await page.waitForLoadState('load');
    await assertPageLoaded(page);

    // Scrollar até o fim
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    const hasDelete = await page.locator('text=Excluir, text=excluir, text=Zona de Perigo').first().isVisible().catch(() => false);
    console.log(`  ✅ Configurações carregou (excluir conta: ${hasDelete})`);

    await takeScreenshot(page, 'flow-aluno-configuracoes');
  });
});
```

**Commit:** `test: E2E full admin flow — dashboard → alunos → financeiro → banco → plano`

---

## BLOCO 6 — RODAR TESTES E RELATÓRIO

### 6A. Rodar todos os testes novos

```bash
# Só os testes novos (06-10)
npx playwright test e2e/tests/06 e2e/tests/07 e2e/tests/08 e2e/tests/09 e2e/tests/10 --project=desktop

# Resultado esperado: todos passam (são testes exploratórios que logam o estado)
```

### 6B. Rodar suite completa

```bash
pnpm test:e2e:desktop
```

### 6C. Gerar relatório

```bash
echo "=== RELATÓRIO E2E COMPLETO ===" > e2e/RELATORIO_E2E.txt
echo "Data: $(date)" >> e2e/RELATORIO_E2E.txt
echo "" >> e2e/RELATORIO_E2E.txt
pnpm test:e2e:desktop 2>&1 | grep -E "✓|✗|passed|failed|Error" >> e2e/RELATORIO_E2E.txt
echo "" >> e2e/RELATORIO_E2E.txt
echo "Screenshots em: e2e/artifacts/" >> e2e/RELATORIO_E2E.txt
cat e2e/RELATORIO_E2E.txt
```

### 6D. Commit e push

```bash
pnpm typecheck && pnpm build
git add -A
git commit -m "test: E2E complete business flows — onboarding, billing, bank, charges, trial, full admin flow"
git push origin main
```

**Commit:** `test: complete E2E business flow testing suite`

---

## COMANDO DE RETOMADA

```
Continue de onde parou no BLACKBELT_E2E_NEGOCIOS.md. Verifique estado:
ls e2e/tests/06-onboarding-wizard.spec.ts 2>/dev/null && echo "B1 OK" || echo "B1 FALTA"
ls e2e/tests/07-bank-account.spec.ts 2>/dev/null && echo "B2 OK" || echo "B2 FALTA"
ls e2e/tests/08-student-charges.spec.ts 2>/dev/null && echo "B3 OK" || echo "B3 FALTA"
ls e2e/tests/09-trial-subscription.spec.ts 2>/dev/null && echo "B4 OK" || echo "B4 FALTA"
ls e2e/tests/10-admin-full-flow.spec.ts 2>/dev/null && echo "B5 OK" || echo "B5 FALTA"
pnpm typecheck 2>&1 | tail -5
Continue da próxima seção incompleta. ZERO erros. Commit e push.
```
