import { expect, test } from '@playwright/test';
import { login, TEST_USERS } from '../helpers/auth';

test('superadmin platform central uses the active backend end-to-end', async ({ page }) => {
  await login(page, TEST_USERS.superadmin);

  const snapshotResponsePromise = page.waitForResponse((response) => {
    return response.url().includes('/api/superadmin/platform-central') && response.request().method() === 'GET';
  });

  await page.goto('/superadmin/suporte');
  await page.waitForLoadState('networkidle');

  const snapshotResponse = await snapshotResponsePromise;
  expect(snapshotResponse.ok()).toBeTruthy();

  const snapshot = await snapshotResponse.json();
  expect(snapshot.overview.totalAccesses).toBeGreaterThan(0);
  expect(snapshot.support.metrics.total).toBeGreaterThan(0);
  expect(snapshot.errorsPerformance.totals.errors).toBeGreaterThan(0);
  expect(snapshot.devicesLayout.distribution.length).toBeGreaterThan(0);
  expect(snapshot.healthSecurityAI.latest.length).toBeGreaterThan(0);
  expect(snapshot.healthSecurityAI.ai.status).toBe('not_configured');

  await expect(page.getByRole('heading', { name: 'Central da Plataforma' })).toBeVisible();
  await expect(page.getByText('Atenção imediata')).toBeVisible();
  await expect(page.getByText('Rotas mais afetadas')).toBeVisible();

  await page.getByRole('button', { name: 'Suporte & Feedback' }).click();
  await expect(page.getByText('Fila densa')).toBeVisible();

  await page.locator('select').nth(0).selectOption('bug');
  await expect(page.locator('tbody tr').first()).toBeVisible();

  const firstItemTitle = await page.locator('tbody tr').nth(0).locator('td').nth(0).locator('p').first().textContent();
  await page.locator('tbody tr').nth(0).click();
  await expect(page.getByRole('button', { name: 'Atribuir para mim' })).toBeVisible();

  const assignResponsePromise = page.waitForResponse((response) => {
    return response.url().includes('/api/superadmin/platform-central') && response.request().method() === 'PATCH';
  });
  await page.getByRole('button', { name: 'Atribuir para mim' }).click();
  const assignResponse = await assignResponsePromise;
  expect(assignResponse.ok()).toBeTruthy();

  const resolveResponsePromise = page.waitForResponse((response) => {
    return response.url().includes('/api/superadmin/platform-central') && response.request().method() === 'PATCH';
  });
  await page.getByRole('button', { name: 'Resolver' }).click();
  const resolveResponse = await resolveResponsePromise;
  expect(resolveResponse.ok()).toBeTruthy();

  const note = `Smoke note ${Date.now()}`;
  const noteResponsePromise = page.waitForResponse((response) => {
    return response.url().includes('/api/superadmin/platform-central') && response.request().method() === 'POST';
  });
  await page.getByPlaceholder('Registrar nota interna').fill(note);
  await page.getByRole('button', { name: 'Registrar nota' }).click();
  const noteResponse = await noteResponsePromise;
  expect(noteResponse.ok()).toBeTruthy();
  await expect(page.getByText(note)).toBeVisible();

  await page.keyboard.press('Escape');
  if (firstItemTitle) {
    await expect(page.getByText(firstItemTitle, { exact: false }).first()).toBeVisible();
  }

  await page.getByRole('button', { name: 'Erros & Performance' }).click();
  await expect(page.getByText('Top erros por rota/dispositivo')).toBeVisible();
  await expect(page.getByText('Regressão por release')).toBeVisible();

  await page.getByRole('button', { name: 'Dispositivos & Layout' }).click();
  await expect(page.getByText('Distribuição por dispositivo')).toBeVisible();
  await expect(page.getByText('Rotas problemáticas por viewport')).toBeVisible();

  await page.getByRole('button', { name: 'Saúde, Segurança & IA' }).click();
  await expect(page.getByText('Saúde, risco e segurança')).toBeVisible();
  await expect(page.getByText('Não configurado')).toBeVisible();
});
