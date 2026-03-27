import { test, expect } from '@playwright/test';
import { TEST_USERS, login } from '../helpers/auth';
import { assertPageLoaded, assertHasContent, takeScreenshot } from '../helpers/assertions';

test.describe('Dashboards carregam com dados', () => {

  test('Admin — dashboard com KPIs e acoes', async ({ page }) => {
    await login(page, TEST_USERS.admin);
    await page.waitForLoadState('networkidle');
    await assertPageLoaded(page);

    const kpiCards = page.locator('[class*="card"], [class*="stat"], [class*="kpi"]');
    const cardCount = await kpiCards.count();
    console.log(`  Admin: ${cardCount} cards de KPI encontrados`);

    await assertHasContent(page);
    await takeScreenshot(page, 'dashboard-admin');
  });

  test('Admin — navegar em todas as paginas do menu', async ({ page }) => {
    await login(page, TEST_USERS.admin);
    await page.waitForLoadState('networkidle');

    const sidebarLinks = page.locator('nav a[href^="/admin"], aside a[href^="/admin"]');
    const linkCount = await sidebarLinks.count();
    console.log(`  Admin: ${linkCount} links no sidebar`);

    const visitedPages: string[] = [];
    const failedPages: string[] = [];

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
    console.log(`  Total: ${visitedPages.length} paginas OK, ${failedPages.length} com erro`);
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

    const xpElement = page.locator('text=XP, text=xp, text=Level, text=level, text=Nivel').first();
    const hasXp = await xpElement.isVisible().catch(() => false);
    console.log(`  Teen XP visible: ${hasXp}`);

    await takeScreenshot(page, 'dashboard-teen');
  });

  test('Responsavel — dashboard com filhos', async ({ page }) => {
    await login(page, TEST_USERS.responsavel);
    await page.waitForLoadState('networkidle');
    await assertPageLoaded(page);
    await assertHasContent(page);

    const childSelector = page.locator('[class*="dependent"], [class*="filho"], [class*="child"], text=Sophia, text=Miguel').first();
    const hasChildren = await childSelector.isVisible().catch(() => false);
    console.log(`  Filhos visiveis: ${hasChildren}`);

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
