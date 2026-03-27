import { Page } from '@playwright/test';

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
    displayName: 'Andre Takashi',
  },
  aluno_adulto: {
    email: 'joao@email.com',
    password: 'BlackBelt@2026',
    expectedRole: 'aluno_adulto',
    expectedRedirect: '/dashboard',
    displayName: 'Joao Silva',
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
    displayName: 'Patricia Oliveira',
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

  const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="mail"]').first();
  await emailInput.waitFor({ state: 'visible', timeout: 10000 });
  await emailInput.fill(user.email);

  const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
  await passwordInput.fill(user.password);

  const loginButton = page.locator('button[type="submit"], button:has-text("Entrar"), button:has-text("Login"), button:has-text("Acessar")').first();
  await loginButton.click();

  await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 15000 });
}

export async function logout(page: Page): Promise<void> {
  try {
    const profileMenu = page.locator('[data-testid="profile-menu"], button:has-text("Sair"), [aria-label="Menu"]').first();
    if (await profileMenu.isVisible()) {
      await profileMenu.click();
      const logoutBtn = page.locator('button:has-text("Sair"), a:has-text("Sair"), [data-testid="logout"]').first();
      if (await logoutBtn.isVisible()) {
        await logoutBtn.click();
      }
    }
  } catch {
    await page.goto('/login');
  }
  await page.waitForURL('**/login**', { timeout: 10000 }).catch(() => {});
}
