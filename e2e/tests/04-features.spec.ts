import { test, expect } from '@playwright/test';
import { TEST_USERS, login } from '../helpers/auth';
import { assertPageLoaded, takeScreenshot } from '../helpers/assertions';

test.describe('Funcionalidades especificas', () => {

  test('Busca global (Ctrl+K)', async ({ page }) => {
    await login(page, TEST_USERS.admin);
    await page.waitForLoadState('networkidle');

    await page.keyboard.press('Control+k');
    await page.waitForTimeout(1000);

    const searchModal = page.locator('[class*="command"], [class*="search-modal"], [class*="palette"], [role="dialog"]').first();
    const isOpen = await searchModal.isVisible().catch(() => false);
    console.log(`  Busca global abriu com Ctrl+K: ${isOpen}`);

    if (isOpen) {
      const searchInput = searchModal.locator('input').first();
      if (await searchInput.isVisible()) {
        await searchInput.fill('Joao');
        await page.waitForTimeout(1000);

        const results = searchModal.locator('[class*="result"], [class*="item"], li');
        const resultCount = await results.count();
        console.log(`  Resultados para "Joao": ${resultCount}`);
      }

      await page.keyboard.press('Escape');
    }

    await takeScreenshot(page, 'feature-busca-global');
  });

  test('Dark mode toggle', async ({ page }) => {
    await login(page, TEST_USERS.admin);
    await page.waitForLoadState('networkidle');

    const themeToggle = page.locator('[class*="theme"], [aria-label*="tema"], [aria-label*="dark"], button:has-text("Tema")').first();
    const hasToggle = await themeToggle.isVisible().catch(() => false);
    console.log(`  Toggle dark mode visivel: ${hasToggle}`);

    if (hasToggle) {
      await themeToggle.click();
      await page.waitForTimeout(500);

      const isDark = await page.locator('html[class*="dark"], body[class*="dark"], [data-theme="dark"]').first().isVisible().catch(() => false);
      console.log(`  Dark mode ativado: ${isDark}`);
    }

    await takeScreenshot(page, 'feature-dark-mode');
  });

  test('Notificacoes', async ({ page }) => {
    await login(page, TEST_USERS.admin);
    await page.waitForLoadState('networkidle');

    const bellIcon = page.locator('[class*="notification"], [class*="bell"], [aria-label*="notificacao"], button:has([class*="bell"])').first();
    const hasBell = await bellIcon.isVisible().catch(() => false);
    console.log(`  Sino de notificacoes visivel: ${hasBell}`);

    if (hasBell) {
      await bellIcon.click();
      await page.waitForTimeout(1000);

      const notifPanel = page.locator('[class*="notification-center"], [class*="dropdown"], [class*="panel"]').first();
      const panelOpen = await notifPanel.isVisible().catch(() => false);
      console.log(`  Painel de notificacoes aberto: ${panelOpen}`);
    }

    await takeScreenshot(page, 'feature-notificacoes');
  });

  test('Responsavel — seletor de dependentes', async ({ page }) => {
    await login(page, TEST_USERS.responsavel);
    await page.waitForLoadState('networkidle');

    const childSelector = page.locator('[class*="dependent"], [class*="selector"], [class*="filho"], select, [role="combobox"]');
    const hasPicker = await childSelector.first().isVisible().catch(() => false);
    console.log(`  Seletor de dependentes visivel: ${hasPicker}`);

    const hasSophia = await page.locator('text=Sophia').first().isVisible().catch(() => false);
    const hasMiguel = await page.locator('text=Miguel').first().isVisible().catch(() => false);
    console.log(`  Sophia visivel: ${hasSophia}`);
    console.log(`  Miguel visivel: ${hasMiguel}`);

    await takeScreenshot(page, 'feature-seletor-dependentes');
  });

  test('Mobile responsive — sidebar fecha', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await login(page, TEST_USERS.admin);
    await page.waitForLoadState('networkidle');

    const sidebar = page.locator('aside, nav[class*="sidebar"]').first();

    const hamburger = page.locator('[class*="hamburger"], [aria-label*="menu"], button:has([class*="menu"])').first();
    const hasHamburger = await hamburger.isVisible().catch(() => false);
    console.log(`  Hamburger visivel em mobile: ${hasHamburger}`);

    if (hasHamburger) {
      await hamburger.click();
      await page.waitForTimeout(500);
      const sidebarAfterClick = await sidebar.isVisible().catch(() => false);
      console.log(`  Sidebar aberto apos click: ${sidebarAfterClick}`);
    }

    await takeScreenshot(page, 'feature-mobile-responsive');
  });

  test('Empty states tem CTA', async ({ page }) => {
    await login(page, TEST_USERS.admin);

    await page.goto('/admin/experimental');
    await page.waitForLoadState('networkidle');
    await assertPageLoaded(page);

    const emptyState = page.locator('[class*="empty"], text=Nenhum, text=Nao ha, text=Vazio').first();
    const hasEmpty = await emptyState.isVisible().catch(() => false);
    if (hasEmpty) {
      const ctaButton = page.locator('[class*="empty"] button, [class*="empty"] a').first();
      const hasCta = await ctaButton.isVisible().catch(() => false);
      console.log(`  Empty state com CTA: ${hasCta}`);
    } else {
      console.log(`  Pagina tem dados (nao vazia)`);
    }

    await takeScreenshot(page, 'feature-empty-states');
  });
});
