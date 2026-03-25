import { Page } from '@playwright/test';

export interface LoginCredentials {
  email: string;
  password: string;
  role: string;
  expectedPath: string;
}

export const USERS: LoginCredentials[] = [
  { email: 'super@blackbelt.app', password: '@Greg1994', role: 'superadmin', expectedPath: '/superadmin' },
  { email: 'roberto@guerreiros.com', password: 'BlackBelt@2026', role: 'admin', expectedPath: '/admin' },
  { email: 'andre@guerreiros.com', password: 'BlackBelt@2026', role: 'professor', expectedPath: '/professor' },
  { email: 'julia@guerreiros.com', password: 'BlackBelt@2026', role: 'recepcionista', expectedPath: '/recepcao' },
  { email: 'joao@email.com', password: 'BlackBelt@2026', role: 'aluno_adulto', expectedPath: '/dashboard' },
  { email: 'lucas.teen@email.com', password: 'BlackBelt@2026', role: 'aluno_teen', expectedPath: '/teen' },
  { email: 'miguel.kids@email.com', password: 'BlackBelt@2026', role: 'aluno_kids', expectedPath: '/kids' },
  { email: 'maria.resp@email.com', password: 'BlackBelt@2026', role: 'responsavel', expectedPath: '/parent' },
  { email: 'fernando@guerreiros.com', password: 'BlackBelt@2026', role: 'franqueador', expectedPath: '/franqueador' },
];

export async function login(page: Page, creds: LoginCredentials): Promise<boolean> {
  try {
    await page.goto('/login', { waitUntil: 'networkidle', timeout: 15000 });
    await page.fill('input[type="email"], input[name="email"]', creds.email);
    await page.fill('input[type="password"], input[name="password"]', creds.password);
    await page.click('button[type="submit"]');
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });
    return true;
  } catch {
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

  const errorHandler = (msg: { type: () => string; text: () => string }) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  };
  page.on('console', errorHandler);

  try {
    const response = await page.goto(path, { waitUntil: 'networkidle', timeout: 20000 });
    const loadTime = Date.now() - startTime;
    const status = response?.status() ?? 0;

    const bodyText = await page.textContent('body').catch(() => '') ?? '';
    const title = await page.title().catch(() => '');

    if (status >= 500 || bodyText.includes('Application error') || bodyText.includes('Internal Server Error')) {
      return { url: path, status: 'crash', consoleErrors, emptyIndicators: [], loadTime, details: `HTTP ${status}` };
    }

    if (status === 404 || (bodyText.includes('404') && bodyText.includes('not found')) || title.includes('404')) {
      return { url: path, status: 'not_found', consoleErrors, emptyIndicators: [], loadTime, details: '404 Not Found' };
    }

    const currentUrl = new URL(page.url());
    if (currentUrl.pathname !== path && currentUrl.pathname.includes('/login')) {
      return { url: path, status: 'redirect', consoleErrors, emptyIndicators: [], loadTime, details: `Redirected to ${currentUrl.pathname}` };
    }

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

    const mainContent = await page.locator('main, [role="main"], .content, .page-content').textContent().catch(() => '');
    const hasContent = (mainContent?.trim().length ?? 0) > 50;

    if (emptyIndicators.length > 0 || !hasContent) {
      return { url: path, status: 'empty', consoleErrors, emptyIndicators, loadTime, details: emptyIndicators.join('; ') || 'No meaningful content' };
    }

    return { url: path, status: 'ok', consoleErrors, emptyIndicators: [], loadTime, details: 'OK' };
  } catch (err: unknown) {
    const loadTime = Date.now() - startTime;
    const message = err instanceof Error ? err.message : String(err);
    return { url: path, status: 'error', consoleErrors, emptyIndicators: [], loadTime, details: message };
  } finally {
    page.removeListener('console', errorHandler);
  }
}
