# BLACKBELT v2 — MEGA SIMULAÇÃO: CADA USUÁRIO, CADA BOTÃO, CADA TELA

## O QUE ESTE PROMPT FAZ

Loga como CADA um dos 9 usuários reais do sistema.
Em CADA perfil, navega em TODAS as páginas (282+).
Em CADA página, clica em CADA botão, preenche CADA formulário, testa CADA interação.
CADA coisa que quebrar é corrigida NA HORA.
No final, o app funciona de verdade para todos os perfis.

---

## USUÁRIOS REAIS DO SISTEMA

```
┌──────────────────────────────────┬────────────────┬───────────────┬────────────────┐
│             Email                │     Senha      │    Perfil     │  Redireciona   │
├──────────────────────────────────┼────────────────┼───────────────┼────────────────┤
│ gregoryguimaraes12@gmail.com              │ @Greg1994      │ superadmin    │ /superadmin    │
│ roberto@guerreiros.com           │ BlackBelt@2026 │ admin         │ /admin         │
│ andre@guerreiros.com             │ BlackBelt@2026 │ professor     │ /professor     │
│ julia@guerreiros.com             │ BlackBelt@2026 │ recepcionista │ /recepcao      │
│ joao@email.com                   │ BlackBelt@2026 │ aluno_adulto  │ /aluno         │
│ lucas.teen@email.com             │ BlackBelt@2026 │ aluno_teen    │ /teen          │
│ miguel.kids@email.com            │ BlackBelt@2026 │ aluno_kids    │ /kids          │
│ maria.resp@email.com             │ BlackBelt@2026 │ responsavel   │ /responsavel   │
│ fernando@guerreiros.com          │ BlackBelt@2026 │ franqueador   │ /franqueador   │
└──────────────────────────────────┴────────────────┴───────────────┴────────────────┘
```

---

## REGRAS ABSOLUTAS

1. **USAR PLAYWRIGHT com browser real** — não scripts Node.js, não curl.
2. **CADA página deve CARREGAR sem erro** — sem tela branca, sem error boundary, sem console error.
3. **CADA botão deve ser CLICÁVEL** — se tem botão na tela, clicar. Se abre modal, interagir. Se submete form, verificar resposta.
4. **CADA formulário deve ser PREENCHÍVEL** — preencher, submeter, verificar sucesso.
5. **Se algo quebrar → CORRIGIR o código do app** (service, componente, API route, migration), não o teste.
6. **typecheck + build a cada correção.** Sem exceção.
7. **Commit a cada perfil concluído.** Um commit por perfil = 9 commits no mínimo.
8. **Dados devem sobreviver reload.**

---

## FASE 0 — SETUP

### 0.1 — Instalar Playwright

```bash
pnpm add -D @playwright/test
npx playwright install chromium
```

### 0.2 — Criar playwright.config.ts

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 60000,
  retries: 0,
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    viewport: { width: 1280, height: 800 },
  },
  reporter: [['list'], ['json', { outputFile: 'e2e/results.json' }]],
  webServer: {
    command: 'pnpm dev',
    port: 3000,
    timeout: 120000,
    reuseExistingServer: true,
  },
});
```

### 0.3 — Mapear TODAS as páginas REAIS

```bash
# EXECUTAR E USAR O RESULTADO REAL — NÃO INVENTAR ROTAS
find app -name 'page.tsx' | sort

# Por perfil
find app/\(admin\) -name 'page.tsx' 2>/dev/null | sort
find app/\(professor\) -name 'page.tsx' 2>/dev/null | sort
find app/\(recepcao\) -name 'page.tsx' 2>/dev/null | sort
find app/\(aluno\) -name 'page.tsx' 2>/dev/null | sort
find app/\(teen\) -name 'page.tsx' 2>/dev/null | sort
find app/\(kids\) -name 'page.tsx' 2>/dev/null | sort
find app/\(responsavel\) -name 'page.tsx' 2>/dev/null | sort
find app/\(franqueador\) -name 'page.tsx' 2>/dev/null | sort
find app/\(superadmin\) -name 'page.tsx' 2>/dev/null | sort
```

Converter cada path:
- `app/(admin)/admin/alunos/page.tsx` → `/admin/alunos`
- `app/(professor)/professor/turmas/page.tsx` → `/professor/turmas`
- Ignorar parênteses do route group

---

## FASE 1 — CRIAR HELPERS + TESTE

### 1.1 — Criar `e2e/mega-helpers.ts`

```typescript
import { Page } from '@playwright/test';

export interface UserCreds {
  email: string;
  password: string;
  role: string;
  baseRoute: string;
}

export const ALL_USERS: UserCreds[] = [
  { email: 'roberto@guerreiros.com', password: 'BlackBelt@2026', role: 'admin', baseRoute: '/admin' },
  { email: 'andre@guerreiros.com', password: 'BlackBelt@2026', role: 'professor', baseRoute: '/professor' },
  { email: 'julia@guerreiros.com', password: 'BlackBelt@2026', role: 'recepcionista', baseRoute: '/recepcao' },
  { email: 'joao@email.com', password: 'BlackBelt@2026', role: 'aluno_adulto', baseRoute: '/aluno' },
  { email: 'lucas.teen@email.com', password: 'BlackBelt@2026', role: 'aluno_teen', baseRoute: '/teen' },
  { email: 'miguel.kids@email.com', password: 'BlackBelt@2026', role: 'aluno_kids', baseRoute: '/kids' },
  { email: 'maria.resp@email.com', password: 'BlackBelt@2026', role: 'responsavel', baseRoute: '/responsavel' },
  { email: 'fernando@guerreiros.com', password: 'BlackBelt@2026', role: 'franqueador', baseRoute: '/franqueador' },
  { email: 'gregoryguimaraes12@gmail.com', password: '@Greg1994', role: 'superadmin', baseRoute: '/superadmin' },
];

export async function login(page: Page, user: UserCreds): Promise<boolean> {
  try {
    await page.goto('/login', { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 10000 });
    await page.fill('input[type="email"], input[name="email"]', user.email);
    await page.fill('input[type="password"], input[name="password"]', user.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 15000 });
    console.log(`  ✅ Login OK: ${user.email} → ${page.url()}`);
    return true;
  } catch (err) {
    console.log(`  ❌ Login FALHOU: ${user.email} — ${(err as Error).message}`);
    return false;
  }
}

export async function logout(page: Page): Promise<void> {
  await page.context().clearCookies();
  await page.evaluate(() => { try { localStorage.clear(); sessionStorage.clear(); } catch {} });
}

export interface InteractionResult {
  page: string;
  element: string;
  action: string;
  result: 'ok' | 'error' | 'not_found' | 'crash' | 'empty';
  details: string;
}

export async function interactWithPage(page: Page, path: string): Promise<InteractionResult[]> {
  const results: InteractionResult[] = [];
  const consoleErrors: string[] = [];

  page.on('console', msg => {
    if (msg.type() === 'error' && !msg.text().includes('favicon') && !msg.text().includes('sw.js') && !msg.text().includes('manifest')) {
      consoleErrors.push(msg.text());
    }
  });

  try {
    const response = await page.goto(path, { waitUntil: 'networkidle', timeout: 25000 });
    const status = response?.status() ?? 0;
    const body = await page.textContent('body') ?? '';

    // CRASH
    if (status >= 500 || body.includes('Application error') || body.includes('Algo deu errado') || body.includes('Internal Server Error')) {
      results.push({ page: path, element: 'page', action: 'load', result: 'crash', details: `HTTP ${status} — crash/error boundary` });
      return results;
    }

    // REDIRECT para login
    if (page.url().includes('/login') && !path.includes('/login')) {
      results.push({ page: path, element: 'page', action: 'load', result: 'error', details: 'Redirect to login (auth issue)' });
      return results;
    }

    // 404
    if (status === 404 || (body.includes('404') && body.length < 500)) {
      results.push({ page: path, element: 'page', action: 'load', result: 'not_found', details: '404' });
      return results;
    }

    results.push({ page: path, element: 'page', action: 'load', result: 'ok', details: `HTTP ${status}` });

    // === INTERAÇÕES ===

    // 1. BOTÕES — encontrar e clicar todos os visíveis
    const buttons = await page.locator('button:visible, a[role="button"]:visible').all();
    for (let i = 0; i < Math.min(buttons.length, 20); i++) {
      try {
        const btn = buttons[i];
        const text = (await btn.textContent() ?? '').trim().substring(0, 50);
        const isDisabled = await btn.isDisabled().catch(() => false);
        const type = await btn.getAttribute('type') ?? '';

        // Pular submit, logout, deletar
        if (type === 'submit') continue;
        if (text.toLowerCase().match(/sair|logout|excluir|deletar|remover|apagar/)) continue;

        if (!isDisabled && text.length > 0) {
          await btn.click({ timeout: 3000 }).catch(() => {});
          await page.waitForTimeout(500);

          // Se abriu modal, fechar
          const modal = page.locator('[role="dialog"], [class*="modal"], [class*="Modal"]').first();
          if (await modal.isVisible().catch(() => false)) {
            const closeBtn = modal.locator('button:has-text("Fechar"), button:has-text("Cancelar"), button:has-text("X"), button:has-text("×"), [aria-label="close"], [aria-label="Close"]').first();
            if (await closeBtn.isVisible().catch(() => false)) {
              await closeBtn.click().catch(() => {});
            } else {
              await page.keyboard.press('Escape');
            }
            await page.waitForTimeout(300);
            results.push({ page: path, element: `btn: "${text}"`, action: 'click→modal', result: 'ok', details: 'Modal opened/closed' });
          } else {
            results.push({ page: path, element: `btn: "${text}"`, action: 'click', result: 'ok', details: 'Clicked' });
          }

          // Verificar crash pós-click
          const postBody = await page.textContent('body') ?? '';
          if (postBody.includes('Algo deu errado') || postBody.includes('Application error')) {
            results.push({ page: path, element: `btn: "${text}"`, action: 'click', result: 'crash', details: 'CRASH after click' });
            await page.goto(path, { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
          }

          // Se navegou para outra página, voltar
          if (!page.url().includes(path.split('?')[0]) && !page.url().includes('/login')) {
            await page.goto(path, { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
          }
        }
      } catch {}
    }

    // 2. LINKS INTERNOS — seguir e verificar
    const links = await page.locator('a[href]:visible').all();
    const internalLinks: string[] = [];
    for (const link of links.slice(0, 15)) {
      try {
        const href = await link.getAttribute('href') ?? '';
        if (href.startsWith('/') && !href.includes('/login') && !href.includes('/logout') && !href.includes('#') && href.length > 1) {
          internalLinks.push(href);
        }
      } catch {}
    }
    for (const href of [...new Set(internalLinks)].slice(0, 8)) {
      try {
        const resp = await page.goto(href, { waitUntil: 'networkidle', timeout: 15000 });
        const s = resp?.status() ?? 0;
        const b = await page.textContent('body') ?? '';
        if (s >= 500 || b.includes('Algo deu errado') || b.includes('Application error')) {
          results.push({ page: path, element: `link→${href}`, action: 'navigate', result: 'crash', details: `HTTP ${s}` });
        } else if (page.url().includes('/login')) {
          results.push({ page: path, element: `link→${href}`, action: 'navigate', result: 'error', details: 'Auth redirect' });
        } else {
          results.push({ page: path, element: `link→${href}`, action: 'navigate', result: 'ok', details: `HTTP ${s}` });
        }
      } catch (err) {
        results.push({ page: path, element: `link→${href}`, action: 'navigate', result: 'error', details: (err as Error).message.substring(0, 80) });
      }
    }
    await page.goto(path, { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});

    // 3. INPUTS — verificar que existem e são editáveis
    const inputs = await page.locator('input:visible:not([type="hidden"]):not([type="submit"]), textarea:visible, select:visible').all();
    for (let i = 0; i < Math.min(inputs.length, 15); i++) {
      try {
        const input = inputs[i];
        const type = await input.getAttribute('type') ?? 'text';
        const name = await input.getAttribute('name') ?? await input.getAttribute('placeholder') ?? `input-${i}`;
        const tagName = await input.evaluate(el => el.tagName.toLowerCase());

        if (type === 'checkbox' || type === 'radio') {
          results.push({ page: path, element: `${type}: ${name}`, action: 'found', result: 'ok', details: 'Skipped' });
        } else if (tagName === 'select') {
          const options = await input.locator('option').count();
          results.push({ page: path, element: `select: ${name}`, action: 'found', result: 'ok', details: `${options} options` });
        } else {
          const isReadonly = await input.getAttribute('readonly') !== null;
          const isDisabled = await input.isDisabled().catch(() => false);
          results.push({ page: path, element: `input[${type}]: ${name}`, action: 'found', result: 'ok', details: isReadonly || isDisabled ? 'Readonly' : 'Editable' });
        }
      } catch {}
    }

    // 4. TABELAS — verificar dados
    const tables = await page.locator('table:visible').all();
    for (let i = 0; i < tables.length; i++) {
      try {
        const rows = await tables[i].locator('tbody tr').count();
        results.push({ page: path, element: `table-${i}`, action: 'check-data', result: rows > 0 ? 'ok' : 'empty', details: `${rows} rows` });
      } catch {}
    }

    // 5. CARDS/LISTAS — contar conteúdo
    const cards = await page.locator('[class*="card"]:visible, [class*="Card"]:visible').count();
    if (cards > 0) {
      results.push({ page: path, element: 'cards', action: 'count', result: 'ok', details: `${cards} cards` });
    }

    // 6. EMPTY STATES
    const emptyPatterns = ['Nenhum', 'nenhum', 'Não há', 'Sem dados', 'Sem registros', 'Vazio', 'Comece adicionando', 'Crie seu primeiro', 'Nada encontrado'];
    for (const pattern of emptyPatterns) {
      const count = await page.locator(`text=${pattern}`).count().catch(() => 0);
      if (count > 0) {
        const text = await page.locator(`text=${pattern}`).first().textContent().catch(() => pattern);
        results.push({ page: path, element: 'empty-state', action: 'detected', result: 'empty', details: (text ?? pattern).substring(0, 60) });
        break;
      }
    }

    // 7. SPINNERS STUCK
    const spinners = await page.locator('.animate-spin:visible, [class*="spinner"]:visible, [class*="Spinner"]:visible').count();
    if (spinners > 0) {
      await page.waitForTimeout(3000);
      const still = await page.locator('.animate-spin:visible').count();
      if (still > 0) {
        results.push({ page: path, element: 'spinner', action: 'stuck', result: 'error', details: 'Loading spinner still visible after 3s' });
      }
    }

    // 8. CONSOLE ERRORS
    if (consoleErrors.length > 0) {
      for (const err of consoleErrors.slice(0, 3)) {
        results.push({ page: path, element: 'console', action: 'error', result: 'error', details: err.substring(0, 120) });
      }
    }

  } catch (err) {
    results.push({ page: path, element: 'page', action: 'load', result: 'error', details: (err as Error).message.substring(0, 100) });
  }

  return results;
}
```

---

### 1.2 — Criar `e2e/mega-simulation.spec.ts`

**ANTES DE ESCREVER: rodar `find app -name 'page.tsx' | sort` e preencher ROUTES com resultado REAL.**

```typescript
import { test } from '@playwright/test';
import { ALL_USERS, login, logout, interactWithPage, InteractionResult } from './mega-helpers';
import * as fs from 'fs';

// ═══════════════════════════════════════════════════
// ROTAS POR PERFIL — PREENCHER COM find app REAL
// Converter: app/(admin)/admin/alunos/page.tsx → /admin/alunos
// ═══════════════════════════════════════════════════

const ROUTES: Record<string, string[]> = {
  admin: [
    '/admin',
    // TODAS as rotas /admin/* do find app
    // Ex: '/admin/agenda', '/admin/alunos', '/admin/analytics', '/admin/attendance',
    // '/admin/billing', '/admin/campeonatos', '/admin/certificates', '/admin/classes',
    // '/admin/communication', '/admin/contracts', '/admin/events', '/admin/finances',
    // '/admin/gamification', '/admin/inventory', '/admin/invites', '/admin/modalities',
    // '/admin/notifications', '/admin/professors', '/admin/reports', '/admin/settings',
    // '/admin/streaming', '/admin/units', etc.
  ],
  professor: [
    '/professor',
    // TODAS as rotas /professor/*
  ],
  recepcionista: [
    '/recepcao',
    // TODAS as rotas /recepcao/*
  ],
  aluno_adulto: [
    '/aluno',
    // TODAS as rotas /aluno/*
  ],
  aluno_teen: [
    '/teen',
    // TODAS as rotas /teen/*
  ],
  aluno_kids: [
    '/kids',
    // TODAS as rotas /kids/*
  ],
  responsavel: [
    '/responsavel',
    // TODAS as rotas /responsavel/*
  ],
  franqueador: [
    '/franqueador',
    // TODAS as rotas /franqueador/*
  ],
  superadmin: [
    '/superadmin',
    // TODAS as rotas /superadmin/*
  ],
};

const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/cadastrar-academia',
  '/compete',
  '/compete/campeonatos',
  '/privacy',
  '/terms',
  // LISTAR TODAS as páginas públicas do find app
];

// ═══════════════════════════════════════════════════
// TESTES
// ═══════════════════════════════════════════════════

const allResults: Record<string, InteractionResult[]> = {};

test.describe.serial('PUBLIC pages', () => {
  test('Public pages load and interact', async ({ page }) => {
    const results: InteractionResult[] = [];
    for (const route of PUBLIC_ROUTES) {
      console.log(`\n── PUBLIC: ${route} ──`);
      const pageResults = await interactWithPage(page, route);
      results.push(...pageResults);
      for (const r of pageResults) {
        if (r.result !== 'ok') {
          const icon = r.result === 'crash' ? '💥' : r.result === 'empty' ? '⚠️ ' : '❌';
          console.log(`  ${icon} ${r.element} → ${r.action}: ${r.details}`);
        }
      }
    }
    allResults['public'] = results;
  });
});

for (const user of ALL_USERS) {
  const routes = ROUTES[user.role] ?? [];

  test.describe.serial(`${user.role.toUpperCase()} (${user.email})`, () => {
    test(`Login + interact all ${routes.length} pages`, async ({ page }) => {
      const results: InteractionResult[] = [];

      const loggedIn = await login(page, user);
      if (!loggedIn) {
        results.push({ page: '/login', element: 'auth', action: 'login', result: 'error', details: `Login failed for ${user.email}` });
        allResults[user.role] = results;
        return;
      }
      results.push({ page: '/login', element: 'auth', action: 'login', result: 'ok', details: `Logged in as ${user.role}` });

      for (const route of routes) {
        console.log(`\n── ${user.role.toUpperCase()}: ${route} ──`);
        const pageResults = await interactWithPage(page, route);
        results.push(...pageResults);

        for (const r of pageResults) {
          if (r.result !== 'ok') {
            const icon = r.result === 'crash' ? '💥' : r.result === 'empty' ? '⚠️ ' : '❌';
            console.log(`  ${icon} ${r.element} → ${r.action}: ${r.details}`);
          }
        }
      }

      allResults[user.role] = results;
      await logout(page);
    });
  });
}

test.afterAll(() => {
  const report: string[] = [];
  report.push('\n╔═══════════════════════════════════════════════════════════════════╗');
  report.push('║           BLACKBELT v2 — MEGA SIMULAÇÃO COMPLETA                ║');
  report.push('║           ' + new Date().toISOString().substring(0, 19) + '                                ║');
  report.push('╠═══════════════════════════════════════════════════════════════════╣');

  let grandTotal = 0, grandOk = 0, grandError = 0, grandCrash = 0, grandEmpty = 0;

  for (const [role, results] of Object.entries(allResults)) {
    const ok = results.filter(r => r.result === 'ok').length;
    const errors = results.filter(r => r.result === 'error').length;
    const crashes = results.filter(r => r.result === 'crash').length;
    const empty = results.filter(r => r.result === 'empty').length;
    const total = results.length;
    grandTotal += total; grandOk += ok; grandError += errors; grandCrash += crashes; grandEmpty += empty;

    const score = total > 0 ? Math.round(ok / total * 100) : 0;
    const icon = crashes > 0 ? '💥' : errors > 0 ? '⚠️ ' : '✅';

    report.push(`║                                                                   ║`);
    report.push(`║  ${icon} ${role.toUpperCase().padEnd(18)} ${String(ok).padStart(3)}/${String(total).padStart(3)} OK (${String(score).padStart(3)}%)  💥${String(crashes).padStart(2)} ❌${String(errors).padStart(2)} ⚠️ ${String(empty).padStart(2)}    ║`);

    const problems = results.filter(r => r.result !== 'ok');
    for (const p of problems.slice(0, 5)) {
      const line = `  ${p.page} → ${p.element}: ${p.details}`.substring(0, 63);
      report.push(`║  ${line}${' '.repeat(Math.max(0, 65 - line.length))}║`);
    }
    if (problems.length > 5) {
      report.push(`║     ... +${problems.length - 5} more issues${' '.repeat(49)}║`);
    }
  }

  const grandScore = grandTotal > 0 ? Math.round(grandOk / grandTotal * 100) : 0;
  report.push('║                                                                   ║');
  report.push('╠═══════════════════════════════════════════════════════════════════╣');
  report.push(`║  TOTAL: ${grandOk}/${grandTotal} interactions (${grandScore}%)${' '.repeat(Math.max(0, 38 - String(grandOk).length - String(grandTotal).length - String(grandScore).length))}║`);
  report.push(`║  ✅ OK: ${grandOk}  ❌ Errors: ${grandError}  💥 Crashes: ${grandCrash}  ⚠️  Empty: ${grandEmpty}${' '.repeat(Math.max(0, 20 - String(grandOk).length - String(grandError).length - String(grandCrash).length - String(grandEmpty).length))}║`);
  report.push(`║  Status: ${grandScore >= 90 ? 'PRODUCTION-READY ✅' : grandScore >= 70 ? 'NEEDS FIXES ⚠️' : 'NOT READY ❌'}${' '.repeat(grandScore >= 90 ? 42 : grandScore >= 70 ? 45 : 48)}║`);
  report.push('╚═══════════════════════════════════════════════════════════════════╝');

  const reportText = report.join('\n');
  console.log(reportText);
  fs.writeFileSync('e2e/MEGA_SIMULATION_REPORT.txt', reportText);
  fs.writeFileSync('e2e/mega-results.json', JSON.stringify(allResults, null, 2));
  console.log('\nReport: e2e/MEGA_SIMULATION_REPORT.txt');
});
```

---

## FASE 2 — RODAR

```bash
npx playwright test e2e/mega-simulation.spec.ts --reporter=list --timeout=120000 2>&1
cat e2e/MEGA_SIMULATION_REPORT.txt
```

Commit do setup:
```bash
git add playwright.config.ts e2e/ -f
git commit -m "test: mega simulation setup — 9 profiles, 282+ pages, all interactions"
git push
```

---

## FASE 3 — CORRIGIR TUDO

### Para CADA item com resultado ≠ ok:

1. **Ler o relatório:**
```bash
cat e2e/MEGA_SIMULATION_REPORT.txt
cat e2e/mega-results.json | python3 -c "import json,sys; data=json.load(sys.stdin); [print(f'{role}: {r[\"page\"]} → {r[\"element\"]}: {r[\"details\"]}') for role,results in data.items() for r in results if r['result']!='ok']" 2>/dev/null || cat e2e/mega-results.json | grep -A3 '"result": "error"\|"result": "crash"' | head -60
```

2. **Priorizar:**
   - 💥 CRASHES → app quebra, corrigir PRIMEIRO
   - ❌ Login failures → usuário não entra
   - ❌ Page errors → página não funciona
   - ❌ Button crashes → interação quebra o app
   - ❌ Console errors → bugs silenciosos
   - ⚠️ Empty tables/states → dados não aparecem (seed pode estar incompleto)
   - ⚠️ Stuck spinners → loading infinito

3. **Para cada bug:**
   - Abrir o arquivo (componente, service, API route)
   - Identificar causa (null check? RLS? coluna faltando? service mock? tipo errado?)
   - CORRIGIR
   - Se precisar de migration: `npx supabase db push`

4. **Após cada lote de correções:**
   ```bash
   pnpm typecheck && pnpm build
   ```

5. **Rodar o perfil específico:**
   ```bash
   npx playwright test e2e/mega-simulation.spec.ts -g "ADMIN" --reporter=list 2>&1
   ```

6. **Commit:**
   ```bash
   git add -A && git commit -m "fix(role): descrição das correções" && git push
   ```

### REPETIR ATÉ SCORE ≥ 90%

---

## FASE 4 — TESTES DE FORMULÁRIOS ESPECÍFICOS

Após crashes e erros de carregamento resolvidos, testar formulários que CRIAM dados:

### Admin — Cadastrar aluno
- Navegar para /admin/alunos
- Botão "Novo Aluno" ou equivalente
- Preencher nome, email, telefone, data nascimento
- Submeter → verificar que aparece na lista

### Admin — Criar turma
- Navegar para /admin/classes
- Preencher nome, modalidade, horários, professor
- Submeter → verificar na lista

### Professor — Registrar presença
- Navegar para /professor/attendance
- Selecionar turma e data
- Marcar alunos presentes
- Verificar que persiste

### Professor — Criar treino
- Navegar para /professor/streaming ou treinos
- Criar treino com exercícios
- Publicar → verificar que aluno vê

### Recepcionista — Check-in
- Navegar para /recepcao/checkin ou attendance
- Registrar entrada de aluno
- Verificar que persiste

### Admin — Gerar cobrança
- Navegar para /admin/billing ou finances
- Gerar cobrança para aluno
- Verificar que fatura aparece

### Aluno — Ver treino e registrar resultado
- Navegar para /aluno/streaming ou treinos
- Ver treino do dia
- Se tem campo de resultado, preencher

### Responsável — Ver dependentes
- Navegar para /responsavel
- Verificar que mostra os dependentes vinculados
- Verificar frequência e pagamentos

### Franqueador — Ver unidades
- Navegar para /franqueador/academias
- Verificar que mostra unidades e métricas

Para CADA formulário que falhar → corrigir → commit.

---

## FASE 5 — SEGURANÇA CROSS-ROLE

Testar que um perfil NÃO acessa rotas de outro:

```typescript
// Aluno NÃO pode acessar /admin
// Professor NÃO pode acessar /admin/finances
// Recepcionista NÃO pode deletar alunos
// Franqueador NÃO pode editar dados de academia que não é dele
```

Para cada violação encontrada → corrigir middleware/AuthGuard → commit.

---

## FASE 6 — RELATÓRIO FINAL

Rodar simulação completa uma última vez:
```bash
npx playwright test e2e/mega-simulation.spec.ts --reporter=list --timeout=120000 2>&1
cat e2e/MEGA_SIMULATION_REPORT.txt
```

Imprimir relatório expandido:
```
╔═══════════════════════════════════════════════════════════════════╗
║           BLACKBELT v2 — MEGA SIMULAÇÃO FINAL                    ║
╠═══════════════════════════════════════════════════════════════════╣
║                                                                   ║
║  PERFIL            PÁGINAS   BOTÕES   LINKS   FORMS   SCORE      ║
║  ────────────────  ───────   ──────   ─────   ─────   ─────      ║
║  Admin             XX/XX     XX/XX    XX/XX   XX/XX   XX%        ║
║  Professor         XX/XX     XX/XX    XX/XX   XX/XX   XX%        ║
║  Recepcionista     XX/XX     XX/XX    XX/XX   XX/XX   XX%        ║
║  Aluno Adulto      XX/XX     XX/XX    XX/XX   XX/XX   XX%        ║
║  Aluno Teen        XX/XX     XX/XX    XX/XX   XX/XX   XX%        ║
║  Aluno Kids        XX/XX     XX/XX    XX/XX   XX/XX   XX%        ║
║  Responsável       XX/XX     XX/XX    XX/XX   XX/XX   XX%        ║
║  Franqueador       XX/XX     XX/XX    XX/XX   XX/XX   XX%        ║
║  SuperAdmin        XX/XX     XX/XX    XX/XX   XX/XX   XX%        ║
║  Público           XX/XX     XX/XX    XX/XX   XX/XX   XX%        ║
║                                                                   ║
║  TOTAL INTERACTIONS: XXXX                                         ║
║  SCORE: XX%                                                       ║
║  CORREÇÕES APLICADAS: XX                                          ║
║  MIGRATIONS CRIADAS: XX                                           ║
║                                                                   ║
║  STATUS: PRODUCTION-READY / NEEDS WORK                            ║
╚═══════════════════════════════════════════════════════════════════╝
```

Commit final:
```bash
pnpm typecheck && pnpm build
git add -A
git commit -m "test: mega simulation complete — 9 profiles, 282+ pages, all buttons, score XX%"
git push
```

---

## REGRAS FINAIS

1. **find app REAL** para rotas. NÃO inventar. O BlackBelt tem 282+ páginas — pegar TODAS.
2. **LOGIN REAL** com credenciais da tabela. Se falhar, verificar se o user_id está sincronizado no banco.
3. **CADA botão visível = clicar** (exceto logout, deletar, submit de form).
4. **CADA link interno = seguir** e página destino deve carregar.
5. **CADA tabela deve ter dados** — se vazia, verificar seed.
6. **CADA spinner > 3s = BUG** — loading infinito.
7. **NÃO pular perfis.** TODOS os 9 + público = 10 blocos.
8. **Se contexto encher:** `⚠️ CONTEXTO CHEIO — ÚLTIMO PERFIL: [role]`
9. **Objetivo: score ≥ 90%.**
10. **Deliverable: MEGA_SIMULATION_REPORT.txt** — colar completo na resposta.
