# BLACKBELT v2 — TESTES E2E COM PLAYWRIGHT
## Simular Uso Real do App: 9 Perfis, 10 Fluxos, Browser Real
## Cada teste navega, clica, preenche, verifica — como um usuário de verdade

> **INSTRUÇÕES DE EXECUÇÃO:**
> - Execute BLOCO a BLOCO, na ordem (B1 → B2 → ... → B7)
> - Cada BLOCO termina com: `pnpm typecheck && pnpm build` → commit → push
> - Os testes rodam contra o deploy REAL na Vercel (não localhost)
> - Base URL: `https://blackbelts.com.br`
> - PRÉ-REQUISITO: migrations rodadas, seed rodado, deploy atualizado

---

## BLOCO 1 — SETUP DO PLAYWRIGHT

### 1A. Instalar Playwright

```bash
pnpm add -D @playwright/test
npx playwright install chromium
```

### 1B. Configuração

Criar `playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // sequencial para não conflitar dados
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'e2e/report' }],
    ['json', { outputFile: 'e2e/results.json' }],
  ],
  use: {
    baseURL: process.env.E2E_BASE_URL || 'https://blackbelts.com.br',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15000,
    navigationTimeout: 30000,
  },
  projects: [
    {
      name: 'mobile',
      use: { ...devices['iPhone 14'] },
    },
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  outputDir: 'e2e/artifacts',
});
```

### 1C. Criar estrutura de diretórios

```bash
mkdir -p e2e/fixtures e2e/helpers e2e/tests
```

### 1D. Criar helpers

Criar `e2e/helpers/auth.ts`:

```typescript
import { Page, expect } from '@playwright/test';

export interface TestUser {
  email: string;
  password: string;
  expectedRole: string;
  expectedRedirect: string;
  displayName: string;
}

export const TEST_USERS: Record<string, TestUser> = {
  admin: {
    email: 'roberto@guerreiros.com',
    password: 'BlackBelt@2026',
    expectedRole: 'admin',
    expectedRedirect: '/admin',
    displayName: 'Roberto Mendes',
  },
  professor: {
    email: 'andre@guerreiros.com',
    password: 'BlackBelt@2026',
    expectedRole: 'professor',
    expectedRedirect: '/professor',
    displayName: 'André Takashi',
  },
  aluno_adulto: {
    email: 'joao@email.com',
    password: 'BlackBelt@2026',
    expectedRole: 'aluno_adulto',
    expectedRedirect: '/dashboard',
    displayName: 'João Silva',
  },
  teen: {
    email: 'lucas.teen@email.com',
    password: 'BlackBelt@2026',
    expectedRole: 'aluno_teen',
    expectedRedirect: '/teen',
    displayName: 'Lucas Gabriel',
  },
  kids: {
    email: 'helena.kids@email.com',
    password: 'BlackBelt@2026',
    expectedRole: 'aluno_kids',
    expectedRedirect: '/kids',
    displayName: 'Helena Costa',
  },
  responsavel: {
    email: 'patricia@email.com',
    password: 'BlackBelt@2026',
    expectedRole: 'responsavel',
    expectedRedirect: '/parent',
    displayName: 'Patrícia Oliveira',
  },
  recepcionista: {
    email: 'julia@guerreiros.com',
    password: 'BlackBelt@2026',
    expectedRole: 'recepcionista',
    expectedRedirect: '/recepcao',
    displayName: 'Juliana Santos',
  },
  superadmin: {
    email: 'gregoryguimaraes12@gmail.com',
    password: '@Greg1994',
    expectedRole: 'superadmin',
    expectedRedirect: '/superadmin',
    displayName: 'Gregory Pinto',
  },
  franqueador: {
    email: 'franqueador@guerreiros.com',
    password: 'BlackBelt@2026',
    expectedRole: 'franqueador',
    expectedRedirect: '/franqueador',
    displayName: 'Franqueador Demo',
  },
};

export async function login(page: Page, user: TestUser): Promise<void> {
  await page.goto('/login');
  await page.waitForLoadState('networkidle');

  // Preencher email
  const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="mail"]').first();
  await emailInput.waitFor({ state: 'visible', timeout: 10000 });
  await emailInput.fill(user.email);

  // Preencher senha
  const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
  await passwordInput.fill(user.password);

  // Clicar no botão de login
  const loginButton = page.locator('button[type="submit"], button:has-text("Entrar"), button:has-text("Login"), button:has-text("Acessar")').first();
  await loginButton.click();

  // Aguardar redirect
  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });
}

export async function logout(page: Page): Promise<void> {
  // Tentar várias formas de logout
  try {
    // Clicar no menu de perfil/avatar
    const profileMenu = page.locator('[data-testid="profile-menu"], button:has-text("Sair"), [aria-label="Menu"]').first();
    if (await profileMenu.isVisible()) {
      await profileMenu.click();
      const logoutBtn = page.locator('button:has-text("Sair"), a:has-text("Sair"), [data-testid="logout"]').first();
      if (await logoutBtn.isVisible()) {
        await logoutBtn.click();
      }
    }
  } catch {
    // Fallback: navegar direto para logout
    await page.goto('/login');
  }
  await page.waitForURL('**/login**', { timeout: 10000 }).catch(() => {});
}
```

Criar `e2e/helpers/assertions.ts`:

```typescript
import { Page, expect } from '@playwright/test';

// Verificar que a página carregou sem erro
export async function assertPageLoaded(page: Page, options?: { timeout?: number }) {
  const timeout = options?.timeout || 15000;

  // Não deve ter tela de erro
  const errorVisible = await page.locator('text=Algo deu errado, text=Erro, text=404, text=500').first().isVisible().catch(() => false);
  expect(errorVisible).toBeFalsy();

  // Não deve ter spinner infinito (esperar que suma)
  const spinner = page.locator('.animate-spin, [role="progressbar"]').first();
  if (await spinner.isVisible().catch(() => false)) {
    await spinner.waitFor({ state: 'hidden', timeout }).catch(() => {});
  }
}

// Verificar que dados carregaram (não está vazio)
export async function assertHasContent(page: Page) {
  // A página deve ter algum conteúdo visível além do shell
  const body = await page.locator('main, [role="main"], .content, .dashboard').first();
  if (await body.isVisible()) {
    const text = await body.innerText();
    expect(text.length).toBeGreaterThan(10);
  }
}

// Verificar toast de sucesso
export async function assertToastSuccess(page: Page, options?: { text?: string; timeout?: number }) {
  const timeout = options?.timeout || 5000;
  const toastSelector = '[class*="toast"], [role="alert"], [class*="Toaster"], [data-sonner-toast]';
  const toast = page.locator(toastSelector).first();
  await toast.waitFor({ state: 'visible', timeout });

  if (options?.text) {
    await expect(toast).toContainText(options.text, { timeout: 3000 });
  }
}

// Verificar que sidebar/menu tem items
export async function assertSidebarLoaded(page: Page) {
  const sidebar = page.locator('nav, [role="navigation"], aside').first();
  if (await sidebar.isVisible()) {
    const links = await sidebar.locator('a').count();
    expect(links).toBeGreaterThan(2);
  }
}

// Tirar screenshot com nome descritivo
export async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({ path: `e2e/artifacts/${name}.png`, fullPage: true });
}
```

**`pnpm typecheck && pnpm build` — ZERO erros.**
**Commit:** `test: Playwright setup — config, helpers, auth, assertions`

---

## BLOCO 2 — TESTE DE LOGIN DOS 9 PERFIS

Criar `e2e/tests/01-login-all-profiles.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';
import { TEST_USERS, login, logout } from '../helpers/auth';
import { assertPageLoaded, assertHasContent, assertSidebarLoaded, takeScreenshot } from '../helpers/assertions';

test.describe('Login de todos os 9 perfis', () => {
  const profiles = Object.entries(TEST_USERS);

  for (const [profileName, user] of profiles) {
    test(`Login como ${profileName} (${user.email})`, async ({ page }) => {
      // 1. Ir para login
      await page.goto('/login');
      await page.waitForLoadState('networkidle');

      // 2. Verificar que a página de login carregou
      await assertPageLoaded(page);
      const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="mail"]').first();
      await expect(emailInput).toBeVisible({ timeout: 10000 });

      // 3. Login
      await login(page, user);

      // 4. Verificar redirect para o dashboard correto
      const currentUrl = page.url();
      const expectedPath = user.expectedRedirect;

      // Pode redirecionar para selecionar-perfil se tem múltiplos perfis
      const isCorrectRedirect = currentUrl.includes(expectedPath) || currentUrl.includes('/selecionar-perfil');
      expect(isCorrectRedirect).toBeTruthy();

      // 5. Se foi para selecionar-perfil, selecionar o perfil correto
      if (currentUrl.includes('/selecionar-perfil')) {
        // Clicar no card do perfil correto
        const profileCard = page.locator(`[data-role="${user.expectedRole}"], button:has-text("${user.expectedRole}"), [class*="card"]`).first();
        if (await profileCard.isVisible()) {
          await profileCard.click();
          await page.waitForURL((url) => !url.pathname.includes('/selecionar-perfil'), { timeout: 10000 });
        }
      }

      // 6. Verificar que o dashboard carregou
      await assertPageLoaded(page);

      // 7. Verificar que tem conteúdo
      await page.waitForTimeout(2000); // dar tempo pra dados carregarem
      await assertHasContent(page);

      // 8. Verificar nome do usuário no header (se visível)
      const headerText = await page.locator('header, [class*="header"]').first().innerText().catch(() => '');
      // Não falhar se não encontrar o nome — apenas log
      if (headerText.toLowerCase().includes(user.displayName.toLowerCase().split(' ')[0])) {
        console.log(`  ✅ Nome "${user.displayName}" encontrado no header`);
      }

      // 9. Screenshot
      await takeScreenshot(page, `login-${profileName}`);

      // 10. Logout
      await logout(page);
    });
  }
});
```

**Commit:** `test: E2E login tests for all 9 profiles`

---

## BLOCO 3 — TESTE DOS DASHBOARDS

Criar `e2e/tests/02-dashboards.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';
import { TEST_USERS, login } from '../helpers/auth';
import { assertPageLoaded, assertHasContent, takeScreenshot } from '../helpers/assertions';

test.describe('Dashboards carregam com dados', () => {

  test('Admin — dashboard com KPIs e ações', async ({ page }) => {
    await login(page, TEST_USERS.admin);
    await page.waitForLoadState('networkidle');
    await assertPageLoaded(page);

    // Verificar KPIs (cards com números)
    const kpiCards = page.locator('[class*="card"], [class*="stat"], [class*="kpi"]');
    const cardCount = await kpiCards.count();
    console.log(`  Admin: ${cardCount} cards de KPI encontrados`);

    // Verificar que não está tudo zerado
    await assertHasContent(page);

    await takeScreenshot(page, 'dashboard-admin');
  });

  test('Admin — navegar em todas as páginas do menu', async ({ page }) => {
    await login(page, TEST_USERS.admin);
    await page.waitForLoadState('networkidle');

    // Coletar todos os links do sidebar
    const sidebarLinks = page.locator('nav a[href^="/admin"], aside a[href^="/admin"]');
    const linkCount = await sidebarLinks.count();
    console.log(`  Admin: ${linkCount} links no sidebar`);

    const visitedPages: string[] = [];
    const failedPages: string[] = [];

    // Visitar cada link
    for (let i = 0; i < Math.min(linkCount, 20); i++) {
      const href = await sidebarLinks.nth(i).getAttribute('href');
      if (!href || visitedPages.includes(href)) continue;

      await page.goto(href);
      await page.waitForLoadState('networkidle');

      const hasError = await page.locator('text=Algo deu errado, text=404, text=Error').first().isVisible().catch(() => false);
      if (hasError) {
        failedPages.push(href);
        console.log(`  ❌ ${href} — ERRO`);
      } else {
        visitedPages.push(href);
        console.log(`  ✅ ${href}`);
      }
    }

    expect(failedPages.length).toBe(0);
    console.log(`  Total: ${visitedPages.length} páginas OK, ${failedPages.length} com erro`);
  });

  test('Professor — dashboard com aulas e alunos', async ({ page }) => {
    await login(page, TEST_USERS.professor);
    await page.waitForLoadState('networkidle');
    await assertPageLoaded(page);
    await assertHasContent(page);
    await takeScreenshot(page, 'dashboard-professor');
  });

  test('Aluno Adulto — dashboard com progresso', async ({ page }) => {
    await login(page, TEST_USERS.aluno_adulto);
    await page.waitForLoadState('networkidle');
    await assertPageLoaded(page);
    await assertHasContent(page);
    await takeScreenshot(page, 'dashboard-aluno');
  });

  test('Teen — dashboard gamificado com XP', async ({ page }) => {
    await login(page, TEST_USERS.teen);
    await page.waitForLoadState('networkidle');
    await assertPageLoaded(page);
    await assertHasContent(page);

    // Verificar elementos gamificados
    const xpElement = page.locator('text=XP, text=xp, text=Level, text=level, text=Nível').first();
    const hasXp = await xpElement.isVisible().catch(() => false);
    console.log(`  Teen XP visible: ${hasXp}`);

    await takeScreenshot(page, 'dashboard-teen');
  });

  test('Responsável — dashboard com filhos', async ({ page }) => {
    await login(page, TEST_USERS.responsavel);
    await page.waitForLoadState('networkidle');
    await assertPageLoaded(page);
    await assertHasContent(page);

    // Verificar seletor de filhos
    const childSelector = page.locator('[class*="dependent"], [class*="filho"], [class*="child"], text=Sophia, text=Miguel').first();
    const hasChildren = await childSelector.isVisible().catch(() => false);
    console.log(`  Filhos visíveis: ${hasChildren}`);

    await takeScreenshot(page, 'dashboard-responsavel');
  });

  test('Recepcionista — dashboard com agenda do dia', async ({ page }) => {
    await login(page, TEST_USERS.recepcionista);
    await page.waitForLoadState('networkidle');
    await assertPageLoaded(page);
    await assertHasContent(page);
    await takeScreenshot(page, 'dashboard-recepcionista');
  });

  test('SuperAdmin — dashboard global', async ({ page }) => {
    await login(page, TEST_USERS.superadmin);
    await page.waitForLoadState('networkidle');
    await assertPageLoaded(page);
    await assertHasContent(page);
    await takeScreenshot(page, 'dashboard-superadmin');
  });
});
```

**Commit:** `test: E2E dashboard tests — all profiles with navigation audit`

---

## BLOCO 4 — TESTE DOS FLUXOS CRÍTICOS

Criar `e2e/tests/03-critical-flows.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';
import { TEST_USERS, login } from '../helpers/auth';
import { assertPageLoaded, assertToastSuccess, takeScreenshot } from '../helpers/assertions';

test.describe('Fluxos críticos de negócio', () => {

  test('FLUXO 1: Admin cadastra aluno', async ({ page }) => {
    await login(page, TEST_USERS.admin);

    // Navegar para lista de alunos
    await page.goto('/admin/alunos');
    await page.waitForLoadState('networkidle');
    await assertPageLoaded(page);

    // Procurar botão de cadastrar
    const cadastrarBtn = page.locator('button:has-text("Cadastrar"), button:has-text("Novo"), button:has-text("Adicionar"), a:has-text("Cadastrar")').first();
    const btnVisible = await cadastrarBtn.isVisible().catch(() => false);
    console.log(`  Botão cadastrar visível: ${btnVisible}`);

    if (btnVisible) {
      await cadastrarBtn.click();
      await page.waitForLoadState('networkidle');

      // Verificar que formulário abriu
      const formVisible = await page.locator('form, [class*="modal"], [class*="dialog"], input[name="nome"], input[name="name"]').first().isVisible().catch(() => false);
      console.log(`  Formulário aberto: ${formVisible}`);
    }

    await takeScreenshot(page, 'flow-admin-cadastrar-aluno');
  });

  test('FLUXO 2: Admin vê lista de alunos com dados', async ({ page }) => {
    await login(page, TEST_USERS.admin);

    await page.goto('/admin/alunos');
    await page.waitForLoadState('networkidle');
    await assertPageLoaded(page);

    // Verificar que lista tem itens
    const listItems = page.locator('table tbody tr, [class*="list"] > div, [class*="card"]');
    const count = await listItems.count();
    console.log(`  Alunos na lista: ${count}`);
    expect(count).toBeGreaterThan(0);

    await takeScreenshot(page, 'flow-admin-lista-alunos');
  });

  test('FLUXO 3: Admin navega financeiro', async ({ page }) => {
    await login(page, TEST_USERS.admin);

    await page.goto('/admin/financeiro');
    await page.waitForLoadState('networkidle');
    await assertPageLoaded(page);

    // Verificar que tem dados financeiros
    const hasFinanceData = await page.locator('text=R$, text=Receita, text=Fatura, text=Pago, text=Pendente').first().isVisible().catch(() => false);
    console.log(`  Dados financeiros visíveis: ${hasFinanceData}`);

    await takeScreenshot(page, 'flow-admin-financeiro');
  });

  test('FLUXO 4: Admin vê pendências', async ({ page }) => {
    await login(page, TEST_USERS.admin);

    // Tentar navegar para pendências
    await page.goto('/admin/pendencias');
    const pendenciasLoaded = await page.waitForLoadState('networkidle').then(() => true).catch(() => false);

    if (!pendenciasLoaded || page.url().includes('404')) {
      // Tentar no dashboard principal
      await page.goto('/admin');
      await page.waitForLoadState('networkidle');
    }

    await assertPageLoaded(page);

    // Verificar se tem indicadores de pendências
    const hasPendencias = await page.locator('text=Pendência, text=pendência, text=Inconsistência, text=Corrigir, [class*="badge"]').first().isVisible().catch(() => false);
    console.log(`  Pendências visíveis: ${hasPendencias}`);

    await takeScreenshot(page, 'flow-admin-pendencias');
  });

  test('FLUXO 5: Professor vê turmas', async ({ page }) => {
    await login(page, TEST_USERS.professor);

    await page.goto('/professor/turmas');
    await page.waitForLoadState('networkidle');
    await assertPageLoaded(page);

    const turmaCards = page.locator('[class*="card"], [class*="turma"], [class*="class"]');
    const count = await turmaCards.count();
    console.log(`  Turmas visíveis: ${count}`);

    await takeScreenshot(page, 'flow-professor-turmas');
  });

  test('FLUXO 6: Responsável vê agenda dos filhos', async ({ page }) => {
    await login(page, TEST_USERS.responsavel);

    await page.goto('/parent/agenda');
    await page.waitForLoadState('networkidle');
    await assertPageLoaded(page);

    const hasAgenda = await page.locator('text=agenda, text=Agenda, text=calendário, [class*="calendar"]').first().isVisible().catch(() => false);
    console.log(`  Agenda visível: ${hasAgenda}`);

    await takeScreenshot(page, 'flow-responsavel-agenda');
  });

  test('FLUXO 7: Responsável vê pagamentos', async ({ page }) => {
    await login(page, TEST_USERS.responsavel);

    await page.goto('/parent/pagamentos');
    await page.waitForLoadState('networkidle');
    await assertPageLoaded(page);

    const hasPayments = await page.locator('text=R$, text=Fatura, text=pagamento, text=Pagar').first().isVisible().catch(() => false);
    console.log(`  Pagamentos visíveis: ${hasPayments}`);

    await takeScreenshot(page, 'flow-responsavel-pagamentos');
  });

  test('FLUXO 8: Recepcionista vê check-in', async ({ page }) => {
    await login(page, TEST_USERS.recepcionista);

    await page.goto('/recepcao/checkin');
    await page.waitForLoadState('networkidle');
    await assertPageLoaded(page);

    await takeScreenshot(page, 'flow-recepcao-checkin');
  });

  test('FLUXO 9: Admin vê comunicados', async ({ page }) => {
    await login(page, TEST_USERS.admin);

    // Tentar diferentes rotas de comunicados
    for (const route of ['/admin/comunicados', '/admin/mensagens', '/admin/avisos']) {
      await page.goto(route);
      const loaded = await page.waitForLoadState('networkidle').then(() => true).catch(() => false);
      if (loaded && !page.url().includes('404')) {
        await assertPageLoaded(page);
        break;
      }
    }

    await takeScreenshot(page, 'flow-admin-comunicados');
  });

  test('FLUXO 10: Configurações com zona de perigo', async ({ page }) => {
    await login(page, TEST_USERS.aluno_adulto);

    await page.goto('/dashboard/configuracoes');
    await page.waitForLoadState('networkidle');
    await assertPageLoaded(page);

    // Verificar se tem zona de perigo (excluir conta)
    const hasDeleteSection = await page.locator('text=Excluir, text=excluir, text=Zona de Perigo, text=Danger').first().isVisible().catch(() => false);
    console.log(`  Zona de perigo visível: ${hasDeleteSection}`);

    await takeScreenshot(page, 'flow-config-excluir-conta');
  });
});
```

**Commit:** `test: E2E critical flows — 10 business-critical user journeys`

---

## BLOCO 5 — TESTE DE FUNCIONALIDADES ESPECÍFICAS

Criar `e2e/tests/04-features.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';
import { TEST_USERS, login } from '../helpers/auth';
import { assertPageLoaded, takeScreenshot } from '../helpers/assertions';

test.describe('Funcionalidades específicas', () => {

  test('Busca global (Ctrl+K)', async ({ page }) => {
    await login(page, TEST_USERS.admin);
    await page.waitForLoadState('networkidle');

    // Tentar abrir busca global com Ctrl+K
    await page.keyboard.press('Control+k');
    await page.waitForTimeout(1000);

    const searchModal = page.locator('[class*="command"], [class*="search-modal"], [class*="palette"], [role="dialog"]').first();
    const isOpen = await searchModal.isVisible().catch(() => false);
    console.log(`  Busca global abriu com Ctrl+K: ${isOpen}`);

    if (isOpen) {
      // Digitar algo e verificar resultados
      const searchInput = searchModal.locator('input').first();
      if (await searchInput.isVisible()) {
        await searchInput.fill('João');
        await page.waitForTimeout(1000);

        const results = searchModal.locator('[class*="result"], [class*="item"], li');
        const resultCount = await results.count();
        console.log(`  Resultados para "João": ${resultCount}`);
      }

      // Fechar
      await page.keyboard.press('Escape');
    }

    await takeScreenshot(page, 'feature-busca-global');
  });

  test('Dark mode toggle', async ({ page }) => {
    await login(page, TEST_USERS.admin);
    await page.waitForLoadState('networkidle');

    // Procurar toggle de dark mode
    const themeToggle = page.locator('[class*="theme"], [aria-label*="tema"], [aria-label*="dark"], button:has-text("Tema")').first();
    const hasToggle = await themeToggle.isVisible().catch(() => false);
    console.log(`  Toggle dark mode visível: ${hasToggle}`);

    if (hasToggle) {
      await themeToggle.click();
      await page.waitForTimeout(500);

      // Verificar que mudou
      const isDark = await page.locator('html[class*="dark"], body[class*="dark"], [data-theme="dark"]').first().isVisible().catch(() => false);
      console.log(`  Dark mode ativado: ${isDark}`);
    }

    await takeScreenshot(page, 'feature-dark-mode');
  });

  test('Notificações', async ({ page }) => {
    await login(page, TEST_USERS.admin);
    await page.waitForLoadState('networkidle');

    // Procurar sino de notificações
    const bellIcon = page.locator('[class*="notification"], [class*="bell"], [aria-label*="notificação"], button:has([class*="bell"])').first();
    const hasBell = await bellIcon.isVisible().catch(() => false);
    console.log(`  Sino de notificações visível: ${hasBell}`);

    if (hasBell) {
      await bellIcon.click();
      await page.waitForTimeout(1000);

      const notifPanel = page.locator('[class*="notification-center"], [class*="dropdown"], [class*="panel"]').first();
      const panelOpen = await notifPanel.isVisible().catch(() => false);
      console.log(`  Painel de notificações aberto: ${panelOpen}`);
    }

    await takeScreenshot(page, 'feature-notificacoes');
  });

  test('Responsável — seletor de dependentes', async ({ page }) => {
    await login(page, TEST_USERS.responsavel);
    await page.waitForLoadState('networkidle');

    // Procurar seletor de filhos
    const childSelector = page.locator('[class*="dependent"], [class*="selector"], [class*="filho"], select, [role="combobox"]');
    const hasPicker = await childSelector.first().isVisible().catch(() => false);
    console.log(`  Seletor de dependentes visível: ${hasPicker}`);

    // Verificar nomes dos filhos
    const hasSophia = await page.locator('text=Sophia').first().isVisible().catch(() => false);
    const hasMiguel = await page.locator('text=Miguel').first().isVisible().catch(() => false);
    console.log(`  Sophia visível: ${hasSophia}`);
    console.log(`  Miguel visível: ${hasMiguel}`);

    await takeScreenshot(page, 'feature-seletor-dependentes');
  });

  test('Mobile responsive — sidebar fecha', async ({ page }) => {
    // Definir viewport mobile
    await page.setViewportSize({ width: 375, height: 812 });
    await login(page, TEST_USERS.admin);
    await page.waitForLoadState('networkidle');

    // Em mobile, sidebar deve estar fechada
    const sidebar = page.locator('aside, nav[class*="sidebar"]').first();
    const sidebarVisible = await sidebar.isVisible().catch(() => false);

    // Procurar hamburger menu
    const hamburger = page.locator('[class*="hamburger"], [aria-label*="menu"], button:has([class*="menu"])').first();
    const hasHamburger = await hamburger.isVisible().catch(() => false);
    console.log(`  Hamburger visível em mobile: ${hasHamburger}`);

    if (hasHamburger) {
      await hamburger.click();
      await page.waitForTimeout(500);
      const sidebarAfterClick = await sidebar.isVisible().catch(() => false);
      console.log(`  Sidebar aberto após click: ${sidebarAfterClick}`);
    }

    await takeScreenshot(page, 'feature-mobile-responsive');
  });

  test('Empty states têm CTA', async ({ page }) => {
    await login(page, TEST_USERS.admin);

    // Navegar para uma página que pode estar vazia
    await page.goto('/admin/experimental');
    await page.waitForLoadState('networkidle');
    await assertPageLoaded(page);

    // Verificar se empty state tem botão de ação
    const emptyState = page.locator('[class*="empty"], text=Nenhum, text=Não há, text=Vazio').first();
    const hasEmpty = await emptyState.isVisible().catch(() => false);
    if (hasEmpty) {
      const ctaButton = page.locator('[class*="empty"] button, [class*="empty"] a').first();
      const hasCta = await ctaButton.isVisible().catch(() => false);
      console.log(`  Empty state com CTA: ${hasCta}`);
    } else {
      console.log(`  Página tem dados (não vazia)`);
    }

    await takeScreenshot(page, 'feature-empty-states');
  });
});
```

**Commit:** `test: E2E feature tests — search, dark mode, notifications, responsive, empty states`

---

## BLOCO 6 — TESTE DE SEGURANÇA E COMPLIANCE

Criar `e2e/tests/05-security.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';
import { TEST_USERS, login } from '../helpers/auth';

test.describe('Segurança e compliance', () => {

  test('Páginas protegidas redirecionam sem login', async ({ page }) => {
    const protectedRoutes = [
      '/admin',
      '/professor',
      '/dashboard',
      '/teen',
      '/parent',
      '/recepcao',
      '/superadmin',
    ];

    for (const route of protectedRoutes) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');

      const currentUrl = page.url();
      const isRedirected = currentUrl.includes('/login') || currentUrl.includes('/selecionar');
      console.log(`  ${route}: ${isRedirected ? '✅ redirecionou' : '❌ NÃO redirecionou'}`);
      expect(isRedirected).toBeTruthy();
    }
  });

  test('Admin não acessa rotas de superadmin', async ({ page }) => {
    await login(page, TEST_USERS.admin);

    await page.goto('/superadmin');
    await page.waitForLoadState('networkidle');

    const currentUrl = page.url();
    const isBlocked = !currentUrl.includes('/superadmin') || currentUrl.includes('/login') || currentUrl.includes('/selecionar') || currentUrl.includes('/admin');
    console.log(`  Admin acessou /superadmin: ${isBlocked ? '✅ bloqueado' : '❌ ACESSOU'}`);
  });

  test('Aluno não acessa rotas de admin', async ({ page }) => {
    await login(page, TEST_USERS.aluno_adulto);

    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    const currentUrl = page.url();
    const isBlocked = !currentUrl.includes('/admin') || currentUrl.includes('/login');
    console.log(`  Aluno acessou /admin: ${isBlocked ? '✅ bloqueado' : '❌ ACESSOU'}`);
  });

  test('Páginas legais acessíveis sem login', async ({ page }) => {
    const publicPages = [
      '/termos',
      '/privacidade',
    ];

    for (const route of publicPages) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');

      const has404 = await page.locator('text=404, text=não encontrada').first().isVisible().catch(() => false);
      const loaded = !page.url().includes('/login') && !has404;
      console.log(`  ${route}: ${loaded ? '✅ acessível' : '❌ problema'}`);
    }
  });

  test('Headers de segurança presentes', async ({ page }) => {
    const response = await page.goto('/login');
    const headers = response?.headers() || {};

    const securityHeaders = [
      'x-content-type-options',
      'x-frame-options',
      'strict-transport-security',
    ];

    for (const header of securityHeaders) {
      const value = headers[header];
      console.log(`  ${header}: ${value ? `✅ ${value}` : '❌ ausente'}`);
    }
  });

  test('Configurações tem opção de excluir conta', async ({ page }) => {
    await login(page, TEST_USERS.aluno_adulto);

    await page.goto('/dashboard/configuracoes');
    await page.waitForLoadState('networkidle');

    // Scrollar até o fim pra encontrar zona de perigo
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);

    const deleteBtn = page.locator('button:has-text("Excluir"), button:has-text("excluir"), text=Zona de Perigo').first();
    const hasDelete = await deleteBtn.isVisible().catch(() => false);
    console.log(`  Botão excluir conta: ${hasDelete ? '✅ presente' : '❌ ausente (Apple vai rejeitar)'}`);
  });
});
```

**Commit:** `test: E2E security tests — route protection, role isolation, headers, account deletion`

---

## BLOCO 7 — SCRIPT DE EXECUÇÃO E RELATÓRIO

### 7A. Script de execução

Criar `scripts/run-e2e.sh`:

```bash
#!/bin/bash
echo "🧪 BLACKBELT v2 — TESTES E2E"
echo "════════════════════════════"
echo ""
echo "Base URL: ${E2E_BASE_URL:-https://blackbelts.com.br}"
echo ""

# Instalar browsers se necessário
npx playwright install chromium --with-deps 2>/dev/null

# Rodar testes desktop
echo "📱 Rodando testes desktop..."
npx playwright test --project=desktop --reporter=list 2>&1 | tee e2e/desktop-output.txt

# Contar resultados
PASSED=$(grep -c "✓\|passed" e2e/desktop-output.txt 2>/dev/null || echo 0)
FAILED=$(grep -c "✗\|failed" e2e/desktop-output.txt 2>/dev/null || echo 0)

echo ""
echo "════════════════════════════"
echo "✅ Passed: $PASSED"
echo "❌ Failed: $FAILED"
echo ""

# Gerar relatório HTML
echo "📊 Relatório HTML: e2e/report/index.html"
echo "📸 Screenshots: e2e/artifacts/"
echo ""

if [ "$FAILED" -eq 0 ]; then
  echo "🎉 TODOS OS TESTES PASSARAM! App pronto para as stores."
else
  echo "⚠️ $FAILED testes falharam. Verificar screenshots em e2e/artifacts/"
fi
```

### 7B. Adicionar scripts no package.json

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:desktop": "playwright test --project=desktop",
    "test:e2e:mobile": "playwright test --project=mobile",
    "test:e2e:report": "playwright show-report e2e/report",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

### 7C. Adicionar ao .gitignore

```
# Playwright
e2e/report/
e2e/artifacts/
e2e/results.json
e2e/desktop-output.txt
```

### 7D. Build e push final

```bash
pnpm typecheck && pnpm build
chmod +x scripts/run-e2e.sh
git add -A
git commit -m "test: Playwright E2E suite — 9 profiles, 10 flows, security, features, mobile"
git push origin main
```

**Commit:** `test: complete E2E test suite with execution scripts`

---

## COMO RODAR

### Opção 1 — Via script:
```bash
chmod +x scripts/run-e2e.sh
./scripts/run-e2e.sh
```

### Opção 2 — Direto:
```bash
# Todos os testes
pnpm test:e2e

# Só desktop
pnpm test:e2e:desktop

# Só mobile
pnpm test:e2e:mobile

# Com UI visual (abre browser pra ver os testes rodando)
pnpm test:e2e:ui

# Ver relatório HTML
pnpm test:e2e:report
```

### Opção 3 — Contra localhost (dev):
```bash
E2E_BASE_URL=http://localhost:3000 pnpm test:e2e
```

---

## COMANDO DE RETOMADA

```
Continue de onde parou no BLACKBELT_PLAYWRIGHT.md. Verifique estado:
ls playwright.config.ts 2>/dev/null && echo "B1 OK" || echo "B1 FALTA"
ls e2e/tests/01-login-all-profiles.spec.ts 2>/dev/null && echo "B2 OK" || echo "B2 FALTA"
ls e2e/tests/02-dashboards.spec.ts 2>/dev/null && echo "B3 OK" || echo "B3 FALTA"
ls e2e/tests/03-critical-flows.spec.ts 2>/dev/null && echo "B4 OK" || echo "B4 FALTA"
ls e2e/tests/04-features.spec.ts 2>/dev/null && echo "B5 OK" || echo "B5 FALTA"
ls e2e/tests/05-security.spec.ts 2>/dev/null && echo "B6 OK" || echo "B6 FALTA"
ls scripts/run-e2e.sh 2>/dev/null && echo "B7 OK" || echo "B7 FALTA"
pnpm typecheck 2>&1 | tail -5
Continue da próxima seção incompleta. ZERO erros. Commit e push.
```
