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
};

async function dismissModals(page: Page): Promise<void> {
  const modalButtons = page.locator(
    'button:has-text("Vamos la"), button:has-text("Fechar"), button:has-text("Entendi"), [class*="modal"] button:has-text("OK"), button:has-text("Pular")'
  ).first();
  if (await modalButtons.isVisible({ timeout: 1000 }).catch(() => false)) {
    await modalButtons.click();
    await page.waitForTimeout(300);
  }
}

async function attemptLogin(page: Page, user: TestUser): Promise<boolean> {
  await page.goto('/login');
  await page.waitForLoadState('load');

  const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="mail"]').first();
  await emailInput.waitFor({ state: 'visible', timeout: 10000 });
  await emailInput.fill(user.email);

  const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
  await passwordInput.fill(user.password);

  // Wait for button to be enabled (React hydration + validation)
  const loginButton = page.locator('button[type="submit"]').first();
  try {
    await loginButton.waitFor({ state: 'visible', timeout: 5000 });
    await page.waitForFunction(
      () => !document.querySelector('button[type="submit"]')?.hasAttribute('disabled'),
      { timeout: 5000 }
    ).catch(() => {});
    await loginButton.click({ timeout: 5000 });
  } catch {
    // Force click if button is stuck disabled (rate limiting)
    await loginButton.click({ force: true });
  }

  try {
    await page.waitForURL((url) => !url.pathname.includes('/login'), { timeout: 30000 });
    await dismissModals(page);
    return true;
  } catch {
    return false;
  }
}

export async function login(page: Page, user: TestUser): Promise<void> {
  const success = await attemptLogin(page, user);
  if (success) return;

  // Retry after delay (handles Supabase rate limiting)
  console.log(`  Login retry for ${user.email} after delay...`);
  await page.waitForTimeout(10000);
  const retrySuccess = await attemptLogin(page, user);
  if (retrySuccess) return;

  throw new Error(`Login failed for ${user.email} after retry`);
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
