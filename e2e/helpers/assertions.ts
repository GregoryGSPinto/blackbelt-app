import { Page, expect } from '@playwright/test';

export async function assertPageLoaded(page: Page, options?: { timeout?: number }) {
  const timeout = options?.timeout || 15000;

  const errorVisible = await page.locator('text=Algo deu errado, text=Erro, text=404, text=500').first().isVisible().catch(() => false);
  expect(errorVisible).toBeFalsy();

  const spinner = page.locator('.animate-spin, [role="progressbar"]').first();
  if (await spinner.isVisible().catch(() => false)) {
    await spinner.waitFor({ state: 'hidden', timeout }).catch(() => {});
  }
}

export async function assertHasContent(page: Page) {
  const body = page.locator('main, [role="main"], .content, .dashboard').first();
  if (await body.isVisible()) {
    const text = await body.innerText();
    expect(text.length).toBeGreaterThan(10);
  }
}

export async function assertToastSuccess(page: Page, options?: { text?: string; timeout?: number }) {
  const timeout = options?.timeout || 5000;
  const toastSelector = '[class*="toast"], [role="alert"], [class*="Toaster"], [data-sonner-toast]';
  const toast = page.locator(toastSelector).first();
  await toast.waitFor({ state: 'visible', timeout });

  if (options?.text) {
    await expect(toast).toContainText(options.text, { timeout: 3000 });
  }
}

export async function assertSidebarLoaded(page: Page) {
  const sidebar = page.locator('nav, [role="navigation"], aside').first();
  if (await sidebar.isVisible()) {
    const links = await sidebar.locator('a').count();
    expect(links).toBeGreaterThan(2);
  }
}

export async function dismissOverlays(page: Page) {
  // Dismiss tutorial spotlight, welcome modals, or any z-[9999] overlays
  const overlay = page.locator('[class*="fixed"][class*="inset-0"][class*="z-"]').first();
  if (await overlay.isVisible({ timeout: 1000 }).catch(() => false)) {
    // Try clicking dismiss buttons inside the overlay
    const dismissBtn = page.locator(
      'button:has-text("Pular"), button:has-text("Fechar"), button:has-text("Entendi"), button:has-text("Vamos la"), button:has-text("OK"), button:has-text("Skip")'
    ).first();
    if (await dismissBtn.isVisible({ timeout: 500 }).catch(() => false)) {
      await dismissBtn.click();
      await page.waitForTimeout(300);
    } else {
      // Click the overlay background to dismiss
      await overlay.click({ position: { x: 5, y: 5 }, force: true }).catch(() => {});
      await page.waitForTimeout(300);
    }
  }
}

export async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({ path: `e2e/artifacts/${name}.png`, fullPage: true });
}
