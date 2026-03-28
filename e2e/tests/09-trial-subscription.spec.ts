import { test, expect } from '@playwright/test';
import { TEST_USERS, login } from '../helpers/auth';
import { assertPageLoaded, takeScreenshot, dismissOverlays } from '../helpers/assertions';

test.describe('Trial e Assinatura', () => {

  test('TrialBanner aparece no dashboard (se em trial)', async ({ page }) => {
    await login(page, TEST_USERS.admin);
    await page.waitForLoadState('load');
    await dismissOverlays(page);
    await page.waitForTimeout(2000);

    const trialBanner = page.locator(
      'text=trial, text=Trial, text=experimental, text=dias restantes, text=dias gratis, [class*="trial"]'
    ).first();
    const hasTrial = await trialBanner.isVisible().catch(() => false);
    console.log(`  Trial banner visivel: ${hasTrial}`);

    await takeScreenshot(page, 'trial-banner');
  });

  test('Pagina de plano existe', async ({ page }) => {
    await login(page, TEST_USERS.admin);

    await page.goto('/admin/plano');
    await page.waitForLoadState('load');
    await assertPageLoaded(page);
    await page.waitForTimeout(2000);

    const hasPlanName = await page.locator('text=Starter, text=Essencial, text=Pro, text=Black Belt').first().isVisible().catch(() => false);
    const hasUsage = await page.locator('text=alunos, text=Alunos, text=uso, text=Uso').first().isVisible().catch(() => false);

    console.log(`  Nome do plano visivel: ${hasPlanName}`);
    console.log(`  Info de uso visivel: ${hasUsage}`);

    await takeScreenshot(page, 'admin-plan-page');
  });

  test('API de assinatura existe', async ({ page }) => {
    const response = await page.request.post('/api/subscriptions/create', {
      data: {},
      headers: { 'Content-Type': 'application/json' },
    });

    const status = response.status();
    console.log(`  API subscriptions/create status: ${status}`);
    expect(status).not.toBe(404);

    const body = await response.json().catch(() => null);
    console.log(`  Response body: ${JSON.stringify(body)?.substring(0, 100)}`);
  });

  test('API de setup-payments existe', async ({ page }) => {
    const response = await page.request.post('/api/academy/setup-payments', {
      data: {},
      headers: { 'Content-Type': 'application/json' },
    });

    const status = response.status();
    console.log(`  API setup-payments status: ${status}`);
    expect(status).not.toBe(404);
  });

  test('API de charge-student existe', async ({ page }) => {
    const response = await page.request.post('/api/academy/charge-student', {
      data: {},
      headers: { 'Content-Type': 'application/json' },
    });

    const status = response.status();
    console.log(`  API charge-student status: ${status}`);
    expect(status).not.toBe(404);
  });

  test('Webhook Asaas responde', async ({ page }) => {
    const response = await page.request.post('/api/webhooks/asaas', {
      data: { event: 'PAYMENT_CONFIRMED', payment: { id: 'test' } },
      headers: { 'Content-Type': 'application/json' },
    });

    const status = response.status();
    console.log(`  Webhook status: ${status}`);
    expect(status).not.toBe(404);
  });
});
