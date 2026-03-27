import { test, expect } from '@playwright/test';
import { TEST_USERS, login, logout } from '../helpers/auth';
import { assertPageLoaded, assertHasContent, takeScreenshot } from '../helpers/assertions';

test.describe('Login de todos os 9 perfis', () => {
  const profiles = Object.entries(TEST_USERS);

  for (const [profileName, user] of profiles) {
    test(`Login como ${profileName} (${user.email})`, async ({ page }) => {
      // 1. Ir para login
      await page.goto('/login');
      await page.waitForLoadState('load');

      // 2. Verificar que a pagina de login carregou
      await assertPageLoaded(page);
      const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="mail"]').first();
      await expect(emailInput).toBeVisible({ timeout: 10000 });

      // 3. Login
      await login(page, user);

      // 4. Verificar redirect para o dashboard correto
      const currentUrl = page.url();
      const expectedPath = user.expectedRedirect;

      const isCorrectRedirect = currentUrl.includes(expectedPath) || currentUrl.includes('/selecionar-perfil');
      expect(isCorrectRedirect).toBeTruthy();

      // 5. Se foi para selecionar-perfil, selecionar o perfil correto
      if (currentUrl.includes('/selecionar-perfil')) {
        const profileCard = page.locator(`[data-role="${user.expectedRole}"], button:has-text("${user.expectedRole}"), [class*="card"]`).first();
        if (await profileCard.isVisible()) {
          await profileCard.click();
          await page.waitForURL((url) => !url.pathname.includes('/selecionar-perfil'), { timeout: 10000 });
        }
      }

      // 6. Verificar que o dashboard carregou
      await assertPageLoaded(page);

      // 7. Verificar que tem conteudo
      await page.waitForTimeout(2000);
      await assertHasContent(page);

      // 8. Verificar nome do usuario no header
      const headerText = await page.locator('header, [class*="header"]').first().innerText().catch(() => '');
      if (headerText.toLowerCase().includes(user.displayName.toLowerCase().split(' ')[0])) {
        console.log(`  ✅ Nome "${user.displayName}" encontrado no header`);
      }

      // 9. Screenshot
      await takeScreenshot(page, `login-${profileName}`);

      // 10. Logout
      await logout(page);
    });
  }
});
