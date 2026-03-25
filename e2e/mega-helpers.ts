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
  { email: 'joao@email.com', password: 'BlackBelt@2026', role: 'aluno_adulto', baseRoute: '/dashboard' },
  { email: 'lucas.teen@email.com', password: 'BlackBelt@2026', role: 'aluno_teen', baseRoute: '/teen' },
  { email: 'miguel.kids@email.com', password: 'BlackBelt@2026', role: 'aluno_kids', baseRoute: '/kids' },
  { email: 'maria.resp@email.com', password: 'BlackBelt@2026', role: 'responsavel', baseRoute: '/parent' },
  { email: 'fernando@guerreiros.com', password: 'BlackBelt@2026', role: 'franqueador', baseRoute: '/franqueador' },
  { email: 'super@blackbelt.app', password: '@Greg1994', role: 'superadmin', baseRoute: '/superadmin' },
];

export async function login(page: Page, user: UserCreds): Promise<boolean> {
  try {
    await page.goto('/login', { waitUntil: 'networkidle', timeout: 20000 });
    await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 10000 });
    await page.fill('input[type="email"], input[name="email"]', user.email);
    await page.fill('input[type="password"], input[name="password"]', user.password);
    await page.click('button[type="submit"]');

    // Wait for redirect away from login — might go to profile picker or dashboard
    await page.waitForURL(url => !url.pathname.includes('/login'), { timeout: 15000 });

    // Handle profile picker if shown
    if (page.url().includes('/selecionar-perfil')) {
      // Click the first profile card/button
      const profileBtn = page.locator('button, [role="button"], a').filter({ hasText: new RegExp(user.role.replace('_', '|'), 'i') }).first();
      if (await profileBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await profileBtn.click();
      } else {
        // Click first available profile
        const firstProfile = page.locator('[data-testid="profile-card"], .cursor-pointer, button').first();
        await firstProfile.click({ timeout: 5000 });
      }
      await page.waitForURL(url => !url.pathname.includes('/selecionar-perfil'), { timeout: 10000 });
    }

    console.log(`  ✅ Login OK: ${user.email} → ${page.url()}`);
    return true;
  } catch (err) {
    console.log(`  ❌ Login FALHOU: ${user.email} — ${(err as Error).message.substring(0, 100)}`);
    return false;
  }
}

export async function logout(page: Page): Promise<void> {
  await page.context().clearCookies();
  await page.evaluate(() => {
    try { localStorage.clear(); sessionStorage.clear(); } catch {}
  });
}

export interface InteractionResult {
  page: string;
  element: string;
  action: string;
  result: 'ok' | 'error' | 'not_found' | 'crash' | 'empty';
  details: string;
}

export async function visitPage(page: Page, path: string): Promise<InteractionResult[]> {
  const results: InteractionResult[] = [];
  const consoleErrors: string[] = [];

  const consoleHandler = (msg: { type: () => string; text: () => string }) => {
    if (msg.type() === 'error') {
      const t = msg.text();
      if (!t.includes('favicon') && !t.includes('sw.js') && !t.includes('manifest') && !t.includes('hydrat')) {
        consoleErrors.push(t);
      }
    }
  };
  page.on('console', consoleHandler);

  try {
    const response = await page.goto(path, { waitUntil: 'networkidle', timeout: 25000 });
    const status = response?.status() ?? 0;
    const bodyText = await page.textContent('body').catch(() => '') ?? '';

    // CRASH / error boundary
    if (status >= 500 || bodyText.includes('Application error') || bodyText.includes('Internal Server Error')) {
      results.push({ page: path, element: 'page', action: 'load', result: 'crash', details: `HTTP ${status}` });
      return results;
    }

    // Error boundary component
    if (bodyText.includes('Algo deu errado') || bodyText.includes('Erro Crítico')) {
      results.push({ page: path, element: 'page', action: 'load', result: 'crash', details: 'Error boundary' });
      return results;
    }

    // Redirect to login
    if (page.url().includes('/login') && !path.includes('/login')) {
      results.push({ page: path, element: 'page', action: 'load', result: 'error', details: 'Auth redirect to /login' });
      return results;
    }

    // 404
    if (status === 404 || (bodyText.includes('404') && bodyText.length < 1000)) {
      results.push({ page: path, element: 'page', action: 'load', result: 'not_found', details: '404' });
      return results;
    }

    results.push({ page: path, element: 'page', action: 'load', result: 'ok', details: `HTTP ${status}` });

    // Check for stuck spinners (wait 2s)
    const spinners = await page.locator('.animate-spin:visible').count().catch(() => 0);
    if (spinners > 0) {
      await page.waitForTimeout(2000);
      const still = await page.locator('.animate-spin:visible').count().catch(() => 0);
      if (still > 0) {
        results.push({ page: path, element: 'spinner', action: 'stuck', result: 'error', details: 'Loading spinner stuck >2s' });
      }
    }

    // Check for empty states
    const emptyPatterns = ['Nenhum', 'Não há', 'Sem dados', 'Sem registros', 'Vazio'];
    for (const pattern of emptyPatterns) {
      const count = await page.locator(`text=${pattern}`).count().catch(() => 0);
      if (count > 0) {
        const text = await page.locator(`text=${pattern}`).first().textContent().catch(() => pattern) ?? pattern;
        results.push({ page: path, element: 'empty-state', action: 'detected', result: 'empty', details: text.substring(0, 60) });
        break;
      }
    }

    // Count interactive elements
    const btnCount = await page.locator('button:visible').count().catch(() => 0);
    const linkCount = await page.locator('a[href]:visible').count().catch(() => 0);
    const inputCount = await page.locator('input:visible, textarea:visible, select:visible').count().catch(() => 0);
    results.push({ page: path, element: 'ui-elements', action: 'count', result: 'ok', details: `${btnCount} btns, ${linkCount} links, ${inputCount} inputs` });

    // Click up to 10 non-destructive buttons
    const buttons = await page.locator('button:visible').all();
    for (let i = 0; i < Math.min(buttons.length, 10); i++) {
      try {
        const btn = buttons[i];
        const text = ((await btn.textContent()) ?? '').trim().substring(0, 40);
        if (!text) continue;
        const lower = text.toLowerCase();
        if (lower.match(/sair|logout|excluir|deletar|remover|apagar|cancelar assinatura/)) continue;
        const type = await btn.getAttribute('type') ?? '';
        if (type === 'submit') continue;
        const disabled = await btn.isDisabled().catch(() => true);
        if (disabled) continue;

        await btn.click({ timeout: 2000 }).catch(() => {});
        await page.waitForTimeout(400);

        // Check for crash after click
        const postBody = await page.textContent('body').catch(() => '') ?? '';
        if (postBody.includes('Algo deu errado') || postBody.includes('Application error')) {
          results.push({ page: path, element: `btn:"${text}"`, action: 'click', result: 'crash', details: 'Crash after click' });
          await page.goto(path, { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
          continue;
        }

        // Close modal if opened
        const modal = page.locator('[role="dialog"]:visible, [data-state="open"]:visible').first();
        if (await modal.isVisible({ timeout: 500 }).catch(() => false)) {
          await page.keyboard.press('Escape');
          await page.waitForTimeout(300);
          results.push({ page: path, element: `btn:"${text}"`, action: 'click→modal', result: 'ok', details: 'Modal opened' });
        } else {
          results.push({ page: path, element: `btn:"${text}"`, action: 'click', result: 'ok', details: 'OK' });
        }

        // If navigated away, go back
        if (!page.url().includes(path.split('?')[0]) && !page.url().includes('/login')) {
          await page.goto(path, { waitUntil: 'networkidle', timeout: 15000 }).catch(() => {});
        }
      } catch {}
    }

    // Console errors
    if (consoleErrors.length > 0) {
      for (const err of consoleErrors.slice(0, 3)) {
        results.push({ page: path, element: 'console', action: 'error', result: 'error', details: err.substring(0, 100) });
      }
    }

  } catch (err) {
    results.push({ page: path, element: 'page', action: 'load', result: 'error', details: (err as Error).message.substring(0, 100) });
  }

  page.removeListener('console', consoleHandler);
  return results;
}
