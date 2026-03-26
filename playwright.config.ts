import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'https://blackbeltv2.vercel.app';

export default defineConfig({
  testDir: './e2e',
  timeout: 600000,
  retries: 0,
  workers: 1,
  use: {
    baseURL,
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    viewport: { width: 1280, height: 720 },
  },
  reporter: [
    ['list'],
    ['json', { outputFile: 'e2e/results.json' }],
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
