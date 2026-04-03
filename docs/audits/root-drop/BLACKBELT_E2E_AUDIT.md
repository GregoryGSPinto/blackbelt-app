# BLACKBELT v2 — Teste E2E Automatizado com Playwright

## CONTEXTO

O BlackBelt v2 tem 9 perfis, 282 páginas, e dados seedados no Supabase.
Precisamos navegar em TODAS as páginas como CADA perfil relevante, verificar:
- Páginas que retornam erro (500, crash, tela branca)
- Páginas com dados vazios (nenhum dado aparece apesar do seed)
- Botões/links que não funcionam
- Console errors (JavaScript errors no browser)
- Elementos visuais quebrados (missing images, layout problems)

---

## EXECUÇÃO — 4 BLOCOS

### BLOCO 0 — Setup Playwright

```bash
# Instalar Playwright
pnpm add -D @playwright/test
npx playwright install chromium

# Criar playwright.config.ts
```

Crie `playwright.config.ts` na raiz:

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  retries: 0,
  use: {
    baseURL: 'https://blackbelts.com.br',
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    viewport: { width: 1280, height: 720 },
  },
  reporter: [
    ['list'],
    ['json', { outputFile: 'e2e/results.json' }],
  ],
});
```

---

### BLOCO 1 — Criar Helper de Login

Crie `e2e/helpers.ts`:

```typescript
import { Page, expect } from '@playwright/test';

export interface LoginCredentials {
  email: string;
  password: string;
  role: string;
  expectedPath: string; // onde deve redirecionar após login
}

export const USERS: LoginCredentials[] = [
  { email: 'gregoryguimaraes12@gmail.com', password: '@Greg1994', role: 'superadmin', expectedPath: '/superadmin' },
  { email: 'roberto@guerreiros.com', password: 'BlackBelt@2026', role: 'admin', expectedPath: '/admin' },
  { email: 'andre@guerreiros.com', password: 'BlackBelt@2026', role: 'professor', expectedPath: '/professor' },
  { email: 'julia@guerreiros.com', password: 'BlackBelt@2026', role: 'recepcionista', expectedPath: '/recepcao' },
  { email: 'joao@email.com', password: 'BlackBelt@2026', role: 'aluno_adulto', expectedPath: '/aluno' },
  { email: 'lucas.teen@email.com', password: 'BlackBelt@2026', role: 'aluno_teen', expectedPath: '/teen' },
  { email: 'miguel.kids@email.com', password: 'BlackBelt@2026', role: 'aluno_kids', expectedPath: '/kids' },
  { email: 'maria.resp@email.com', password: 'BlackBelt@2026', role: 'responsavel', expectedPath: '/responsavel' },
  { email: 'fernando@guerreiros.com', password: 'BlackBelt@2026', role: 'franqueador', expectedPath: '/franqueador' },
];

export async function login(page: Page, creds: LoginCredentials): Promise<boolean> {
  try {
    await page.goto('/login', { waitUntil: 'networkidle', timeout: 15000 });
    await page.fill('input[type="email"], input[name="email"]', creds.email);
    await page.fill('input[type="password"], input[name="password"]', creds.password);
    await page.click('button[type="submit"]');
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 10000 });
    return true;
  } catch (err) {
    return false;
  }
}

export interface PageResult {
  url: string;
  status: 'ok' | 'empty' | 'error' | 'crash' | 'redirect' | 'not_found';
  consoleErrors: string[];
  emptyIndicators: string[];
  loadTime: number;
  screenshot?: string;
  details: string;
}

export async function testPage(page: Page, path: string): Promise<PageResult> {
  const consoleErrors: string[] = [];
  const startTime = Date.now();

  // Capture console errors
  const errorHandler = (msg: any) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  };
  page.on('console', errorHandler);

  try {
    const response = await page.goto(path, { waitUntil: 'networkidle', timeout: 15000 });
    const loadTime = Date.now() - startTime;
    const status = response?.status() ?? 0;

    // Check for crash/error page
    const bodyText = await page.textContent('body').catch(() => '') ?? '';
    const title = await page.title().catch(() => '');

    if (status >= 500 || bodyText.includes('Application error') || bodyText.includes('Internal Server Error')) {
      return { url: path, status: 'crash', consoleErrors, emptyIndicators: [], loadTime, details: `HTTP ${status}` };
    }

    if (status === 404 || bodyText.includes('404') || bodyText.includes('not found') || title.includes('404')) {
      return { url: path, status: 'not_found', consoleErrors, emptyIndicators: [], loadTime, details: '404 Not Found' };
    }

    // Check if redirected (e.g. auth redirect)
    const currentUrl = new URL(page.url());
    if (currentUrl.pathname !== path && currentUrl.pathname.includes('/login')) {
      return { url: path, status: 'redirect', consoleErrors, emptyIndicators: [], loadTime, details: `Redirected to ${currentUrl.pathname}` };
    }

    // Check for empty state indicators
    const emptyIndicators: string[] = [];
    const emptyPatterns = [
      'Nenhum', 'nenhum', 'Não há', 'não há', 'Vazio', 'vazio',
      'Sem dados', 'sem dados', 'Sem registros', 'Sem resultados',
      'No data', 'No results', 'Empty', 'nothing to show',
      'Comece adicionando', 'Cadastre', 'Crie seu primeiro',
    ];

    for (const pattern of emptyPatterns) {
      const found = await page.locator(`text=${pattern}`).count().catch(() => 0);
      if (found > 0) {
        const text = await page.locator(`text=${pattern}`).first().textContent().catch(() => pattern);
        emptyIndicators.push(text ?? pattern);
      }
    }

    // Check if main content area has any meaningful content
    const mainContent = await page.locator('main, [role="main"], .content, .page-content').textContent().catch(() => '');
    const hasContent = (mainContent?.trim().length ?? 0) > 50;

    if (emptyIndicators.length > 0 || !hasContent) {
      return { url: path, status: 'empty', consoleErrors, emptyIndicators, loadTime, details: emptyIndicators.join('; ') || 'No meaningful content' };
    }

    return { url: path, status: 'ok', consoleErrors, emptyIndicators: [], loadTime, details: 'OK' };
  } catch (err: any) {
    const loadTime = Date.now() - startTime;
    return { url: path, status: 'error', consoleErrors, emptyIndicators: [], loadTime, details: err.message };
  } finally {
    page.removeListener('console', errorHandler);
  }
}
```

---

### BLOCO 2 — Criar Testes por Perfil

Extraia TODAS as páginas do projeto agrupadas por perfil:

```bash
# Listar todas as páginas por prefixo de rota
find app -name 'page.tsx' | sed 's|app||;s|/page.tsx||;s|/\(.*\)|\1|' | sort
```

Crie `e2e/full-audit.spec.ts`:

Para CADA perfil, faça login e navegue em TODAS as páginas daquele perfil.
Use a lista real de páginas do `find` acima.

**Estrutura do teste:**

```typescript
import { test } from '@playwright/test';
import { USERS, login, testPage, PageResult } from './helpers';
import * as fs from 'fs';

// ══════════════════════════════════════════════
// ROUTES PER PROFILE — extraído do find app
// ══════════════════════════════════════════════

const ROUTES: Record<string, string[]> = {
  superadmin: [
    '/superadmin',
    '/superadmin/academias',
    '/superadmin/campeonatos',
    '/superadmin/financeiro',
    '/superadmin/logs',
    '/superadmin/plataforma',
    '/superadmin/settings',
    '/superadmin/suporte',
    '/superadmin/usuarios',
    // ... TODAS as rotas /superadmin/*
  ],
  admin: [
    '/admin',
    '/admin/agenda',
    '/admin/alunos',
    '/admin/analytics',
    '/admin/attendance',
    '/admin/billing',
    '/admin/campeonatos',
    '/admin/certificates',
    '/admin/classes',
    '/admin/communication',
    '/admin/contracts',
    '/admin/events',
    '/admin/finances',
    '/admin/gamification',
    '/admin/inventory',
    '/admin/invites',
    '/admin/modalities',
    '/admin/notifications',
    '/admin/professors',
    '/admin/reports',
    '/admin/settings',
    '/admin/streaming',
    '/admin/units',
    // ... TODAS as rotas /admin/*
  ],
  professor: [
    '/professor',
    '/professor/agenda',
    '/professor/alunos',
    '/professor/attendance',
    '/professor/aulas',
    '/professor/curriculo',
    '/professor/diario',
    '/professor/match-analysis',
    '/professor/notifications',
    '/professor/profile',
    '/professor/reports',
    '/professor/turmas',
    // ... TODAS as rotas /professor/*
  ],
  recepcionista: [
    '/recepcao',
    '/recepcao/alunos',
    '/recepcao/attendance',
    '/recepcao/cadastro',
    '/recepcao/checkin',
    '/recepcao/contracts',
    '/recepcao/experimental',
    '/recepcao/finances',
    '/recepcao/notifications',
    '/recepcao/profile',
    // ... TODAS as rotas /recepcao/*
  ],
  aluno_adulto: [
    '/aluno',
    '/aluno/agenda',
    '/aluno/attendance',
    '/aluno/certificates',
    '/aluno/compete',
    '/aluno/curriculo',
    '/aluno/evolucao',
    '/aluno/finances',
    '/aluno/gamification',
    '/aluno/match-analysis',
    '/aluno/notifications',
    '/aluno/profile',
    '/aluno/streaming',
    '/aluno/turmas',
    // ... TODAS as rotas /aluno/*
  ],
  aluno_teen: [
    '/teen',
    '/teen/academia',
    '/teen/agenda',
    '/teen/attendance',
    '/teen/battle-pass',
    '/teen/compete',
    '/teen/desafios',
    '/teen/evolucao',
    '/teen/notifications',
    '/teen/profile',
    '/teen/ranking',
    '/teen/season',
    '/teen/streaming',
    '/teen/turmas',
    // ... TODAS as rotas /teen/*
  ],
  aluno_kids: [
    '/kids',
    '/kids/album',
    '/kids/attendance',
    '/kids/aventura',
    '/kids/conquistas',
    '/kids/estrelas',
    '/kids/faixa',
    '/kids/notifications',
    '/kids/profile',
    '/kids/streaming',
    '/kids/turmas',
    // ... TODAS as rotas /kids/*
  ],
  responsavel: [
    '/responsavel',
    '/responsavel/alunos',
    '/responsavel/attendance',
    '/responsavel/calendar',
    '/responsavel/finances',
    '/responsavel/notifications',
    '/responsavel/profile',
    '/responsavel/reports',
    // ... TODAS as rotas /responsavel/*
  ],
  franqueador: [
    '/franqueador',
    '/franqueador/academias',
    '/franqueador/analytics',
    '/franqueador/contracts',
    '/franqueador/finances',
    '/franqueador/notifications',
    '/franqueador/profile',
    '/franqueador/reports',
    '/franqueador/royalties',
    '/franqueador/settings',
    // ... TODAS as rotas /franqueador/*
  ],
};

// ══════════════════════════════════════════════
// IMPORTANTE: Substitua os arrays acima pela lista REAL
// extraída com: find app -name 'page.tsx'
// Converta cada path app/(profile)/xxx/page.tsx → /profile/xxx
// ══════════════════════════════════════════════

test.describe.serial('Full BlackBelt Audit', () => {
  const allResults: Record<string, PageResult[]> = {};

  for (const user of USERS) {
    const routes = ROUTES[user.role] ?? [];

    test(`[${user.role}] login + ${routes.length} pages`, async ({ page }) => {
      const results: PageResult[] = [];

      // Login
      const loggedIn = await login(page, user);
      if (!loggedIn) {
        results.push({
          url: '/login',
          status: 'error',
          consoleErrors: [],
          emptyIndicators: [],
          loadTime: 0,
          details: `LOGIN FAILED for ${user.email}`,
        });
        allResults[user.role] = results;
        return;
      }

      results.push({
        url: '/login',
        status: 'ok',
        consoleErrors: [],
        emptyIndicators: [],
        loadTime: 0,
        details: `Login OK → ${page.url()}`,
      });

      // Navigate each route
      for (const route of routes) {
        const result = await testPage(page, route);
        results.push(result);

        // Log inline for real-time visibility
        const icon = result.status === 'ok' ? '✅' :
                     result.status === 'empty' ? '⚠️ ' :
                     result.status === 'redirect' ? '↩️ ' : '❌';
        console.log(`  ${icon} [${user.role}] ${route} → ${result.status} (${result.loadTime}ms) ${result.details.substring(0, 80)}`);
      }

      allResults[user.role] = results;
    });
  }

  test.afterAll(async () => {
    // Generate summary report
    const report: string[] = [];
    report.push('═══════════════════════════════════════════════');
    report.push('  BLACKBELT v2 — FULL AUDIT REPORT');
    report.push('  ' + new Date().toISOString());
    report.push('═══════════════════════════════════════════════\n');

    let totalOk = 0, totalEmpty = 0, totalError = 0, totalCrash = 0, totalRedirect = 0, totalNotFound = 0;

    for (const [role, results] of Object.entries(allResults)) {
      const ok = results.filter(r => r.status === 'ok').length;
      const empty = results.filter(r => r.status === 'empty').length;
      const error = results.filter(r => r.status === 'error').length;
      const crash = results.filter(r => r.status === 'crash').length;
      const redirect = results.filter(r => r.status === 'redirect').length;
      const notFound = results.filter(r => r.status === 'not_found').length;

      totalOk += ok; totalEmpty += empty; totalError += error;
      totalCrash += crash; totalRedirect += redirect; totalNotFound += notFound;

      report.push(`\n── ${role.toUpperCase()} (${results.length} pages) ──`);
      report.push(`   ✅ OK: ${ok}  ⚠️  Empty: ${empty}  ❌ Error: ${error}  💥 Crash: ${crash}  ↩️  Redirect: ${redirect}  🔍 404: ${notFound}`);

      // Detail non-OK pages
      for (const r of results) {
        if (r.status !== 'ok') {
          report.push(`   ${r.status === 'empty' ? '⚠️ ' : '❌'} ${r.url}`);
          if (r.details) report.push(`      → ${r.details.substring(0, 120)}`);
          if (r.consoleErrors.length > 0) {
            report.push(`      Console errors: ${r.consoleErrors.slice(0, 3).join('; ').substring(0, 150)}`);
          }
        }
      }
    }

    const total = totalOk + totalEmpty + totalError + totalCrash + totalRedirect + totalNotFound;
    report.push('\n═══════════════════════════════════════════════');
    report.push('  SUMMARY');
    report.push('═══════════════════════════════════════════════');
    report.push(`  Total pages tested: ${total}`);
    report.push(`  ✅ OK:       ${totalOk}`);
    report.push(`  ⚠️  Empty:    ${totalEmpty}`);
    report.push(`  ❌ Error:    ${totalError}`);
    report.push(`  💥 Crash:    ${totalCrash}`);
    report.push(`  ↩️  Redirect: ${totalRedirect}`);
    report.push(`  🔍 404:      ${totalNotFound}`);
    report.push('═══════════════════════════════════════════════\n');

    // Pages that need attention (grouped)
    const needsAttention = Object.entries(allResults)
      .flatMap(([role, results]) => results.filter(r => r.status !== 'ok' && r.status !== 'redirect').map(r => ({ role, ...r })));

    if (needsAttention.length > 0) {
      report.push('\n── PAGES NEEDING ATTENTION ──');
      for (const r of needsAttention) {
        report.push(`[${r.role}] ${r.url} → ${r.status}: ${r.details.substring(0, 100)}`);
      }
    }

    const reportText = report.join('\n');
    console.log('\n' + reportText);

    // Save to file
    fs.writeFileSync('e2e/AUDIT_REPORT.txt', reportText);
    fs.writeFileSync('e2e/audit-results.json', JSON.stringify(allResults, null, 2));
    console.log('\nReport saved to: e2e/AUDIT_REPORT.txt');
    console.log('Raw data saved to: e2e/audit-results.json');
  });
});
```

**IMPORTANTE:** Antes de escrever o arquivo final, rode:

```bash
find app -name 'page.tsx' | sort
```

E use o resultado REAL para preencher o objeto `ROUTES` acima.
Converta cada path seguindo estas regras:
- `app/(admin)/admin/agenda/page.tsx` → `/admin/agenda`
- `app/(aluno)/aluno/streaming/page.tsx` → `/aluno/streaming`
- `app/(auth)/login/page.tsx` → SKIP (não é rota de perfil)
- `app/(public)/landing/page.tsx` → SKIP
- Ignore route groups `(parentheses)` — eles não aparecem na URL

Páginas públicas (landing, compete, privacy, terms) devem ter seu próprio array:

```typescript
const PUBLIC_ROUTES = [
  '/',
  '/landing',
  '/compete',
  '/compete/campeonatos',
  '/privacy',
  '/terms',
  // ... todas as rotas públicas
];
```

Teste as públicas SEM login.

---

### BLOCO 3 — Rodar os Testes

```bash
# Rodar todos os testes
npx playwright test e2e/full-audit.spec.ts --reporter=list 2>&1

# Se o teste for muito longo, rode por perfil:
# npx playwright test e2e/full-audit.spec.ts -g "superadmin" 2>&1
# npx playwright test e2e/full-audit.spec.ts -g "admin" 2>&1
# etc.
```

O output vai mostrar em tempo real cada página testada.
No final, o relatório completo estará em `e2e/AUDIT_REPORT.txt`.

---

### BLOCO 4 — Commit + Report

```bash
git add playwright.config.ts e2e/ -f
git commit -m "test: Playwright full audit — 9 profiles, all pages

- Login + navigation for all 9 roles
- Checks: crash, empty, error, redirect, 404, console errors
- Report: e2e/AUDIT_REPORT.txt
- Raw data: e2e/audit-results.json"

git push origin main
```

Depois cole o conteúdo completo de `e2e/AUDIT_REPORT.txt` no final da sua resposta.

---

## REGRAS

1. **Use a lista REAL de páginas** do `find app -name 'page.tsx'`. NÃO use a lista exemplo acima — ela é incompleta.

2. **NÃO modifique nenhum código do app.** Este prompt é SOMENTE para testes.

3. **Se o login falhar para algum perfil**, registre no relatório mas continue com os outros perfis.

4. **Se uma página demorar mais de 15s**, marque como `error` com timeout e continue.

5. **Capture console errors** de TODAS as páginas — isso revela erros JS que não aparecem visualmente.

6. **O relatório final é o deliverable principal.** Cole ele completo na resposta.
