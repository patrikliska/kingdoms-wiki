import { expect, test } from '@playwright/test';

test.describe('English browser outside Czechia', () => {
  test.use({ locale: 'en-US', timezoneId: 'America/New_York' });

  test('defaults to English', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Quick reference for Travian Kingdoms' }),
    ).toBeVisible();
  });

  test('formats numbers the English way', async ({ page }) => {
    await page.goto('/walls');
    await expect(page.getByRole('definition').filter({ hasText: '+80.6%' })).toBeVisible();
  });

  test('can switch to Czech and the choice is remembered', async ({ page }) => {
    await page.goto('/quests');
    await page.getByRole('banner').getByRole('button', { name: 'CZ', exact: true }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Questy' })).toBeVisible();
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('lang', 'cs');
    await expect(page.getByRole('heading', { level: 1, name: 'Questy' })).toBeVisible();
  });
});

test.describe('English browser in Czechia', () => {
  test.use({ locale: 'en-US', timezoneId: 'Europe/Prague' });

  test('defaults to Czech based on the time zone', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'cs');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Rychlá příručka pro Travian Kingdoms' }),
    ).toBeVisible();
  });
});

test.describe('Czech browser abroad', () => {
  test.use({ locale: 'cs-CZ', timezoneId: 'America/New_York' });

  test('defaults to Czech based on the browser language', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'cs');
  });

  test('can switch to English', async ({ page }) => {
    await page.goto('/units');
    await page.getByRole('banner').getByRole('button', { name: 'EN', exact: true }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Units' })).toBeVisible();
    await expect(page.getByText('Attack').first()).toBeVisible();
  });

  test('building names follow the language', async ({ page }) => {
    await page.goto('/buildings/main-building');
    await expect(page.getByRole('heading', { level: 1, name: 'Hlavní budova' })).toBeVisible();
    await page.getByRole('banner').getByRole('button', { name: 'EN', exact: true }).click();
    await expect(page.getByRole('heading', { level: 1, name: 'Main Building' })).toBeVisible();
  });
});
