import { defineConfig, devices } from '@playwright/test';

const czechPlayer = { locale: 'cs-CZ', timezoneId: 'Europe/Prague' };

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  reporter: 'list',
  use: { baseURL: 'http://localhost:4173', trace: 'on-first-retry' },
  webServer: {
    command: 'pnpm build && pnpm preview --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  // Default to a Czech player; i18n.spec.ts overrides locale/time zone per test group.
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], ...czechPlayer } },
    { name: 'mobile', use: { ...devices['Pixel 7'], ...czechPlayer } },
  ],
});
