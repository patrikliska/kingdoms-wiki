import { expect, test } from '@playwright/test';

test.describe('phone layout', () => {
  test.skip(({ isMobile }) => !isMobile, 'phone-only behaviour');

  test('tab bar has 5 items and "More" leads to the other modules', async ({ page }) => {
    await page.goto('/');
    const tabs = page.getByRole('navigation', { name: 'Hlavní navigace' }).last();
    await expect(tabs.getByRole('link')).toHaveCount(5);
    await tabs.getByRole('link', { name: 'Více' }).click();
    await expect(page).toHaveURL(/\/more$/);
    await page.getByRole('link', { name: /Zdi/ }).click();
    await expect(page).toHaveURL(/\/walls$/);
  });

  test('units are cards, not a wide table', async ({ page }) => {
    await page.goto('/units');
    await expect(page.getByRole('table')).toHaveCount(0);
    await expect(page.getByRole('link', { name: /Legionnaire/ })).toBeVisible();
  });

  test('quest detail opens as a modal sheet and Esc closes it', async ({ page }) => {
    await page.goto('/quests/wh1');
    const sheet = page.getByRole('dialog', { name: 'Sklad' });
    await expect(sheet).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page).toHaveURL(/\/quests$/);
  });
});
