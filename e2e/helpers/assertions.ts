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

export async function takeScreenshot(page: Page, name: string) {
  await page.screenshot({ path: `e2e/artifacts/${name}.png`, fullPage: true });
}
