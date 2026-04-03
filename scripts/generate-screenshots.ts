import { chromium } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://blackbelts.com.br';
const LOGIN_EMAIL = 'roberto@guerreiros.com';
const LOGIN_PASS = 'BlackBelt@2026';

const SCREENS = [
  { name: '01-landing', path: '/', needsAuth: false },
  { name: '02-login', path: '/login', needsAuth: false },
  { name: '03-dashboard', path: '/admin', needsAuth: true },
  { name: '04-alunos', path: '/admin/alunos', needsAuth: true },
  { name: '05-turmas', path: '/admin/turmas', needsAuth: true },
  { name: '06-financeiro', path: '/admin/financeiro', needsAuth: true },
  { name: '07-graduacoes', path: '/admin/graduacoes', needsAuth: true },
  { name: '08-calendario', path: '/admin/calendario', needsAuth: true },
];

const VIEWPORTS = [
  { name: 'iphone', width: 430, height: 932 },
  { name: 'android', width: 412, height: 915 },
];

async function run() {
  const browser = await chromium.launch({ headless: true });

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 3,
    });
    const page = await context.newPage();

    // Login once
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passInput = page.locator('input[type="password"]').first();
    if (await emailInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await emailInput.fill(LOGIN_EMAIL);
      await passInput.fill(LOGIN_PASS);
      const submitBtn = page.locator('button[type="submit"], button:has-text("Entrar")').first();
      await submitBtn.click();
      await page.waitForTimeout(3000);
    }

    for (const screen of SCREENS) {
      try {
        await page.goto(`${BASE_URL}${screen.path}`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(2000);

        // Dismiss banners/overlays
        const closeButtons = page.locator('button:has-text("×"), button:has-text("Fechar"), [aria-label="close"], [aria-label="Close"]');
        for (let i = 0; i < await closeButtons.count(); i++) {
          try { await closeButtons.nth(i).click({ timeout: 500 }); } catch {}
        }
        await page.waitForTimeout(500);

        await page.screenshot({
          path: `docs/store-screenshots/${screen.name}-${vp.name}.png`,
          fullPage: false,
        });
        console.log(`✅ ${screen.name}-${vp.name}.png`);
      } catch (e) {
        console.log(`❌ ${screen.name}-${vp.name}: ${e}`);
      }
    }

    await context.close();
  }

  await browser.close();
  console.log('\nScreenshots saved in docs/store-screenshots/');
}

run().catch(console.error);
