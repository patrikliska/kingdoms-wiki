import { expect, test } from '@playwright/test';

test('find a quest via global search and open its detail', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('banner').getByRole('button', { name: 'Hledat' }).click();
  await page.getByRole('combobox').fill('postav pekárnu');
  await page.getByRole('option').first().click();
  await expect(page).toHaveURL(/\/quests\/[a-z0-9]+/);
  await expect(page.getByRole('heading', { level: 2, name: 'Postav pekárnu' }).first()).toBeVisible();
});

test('quest detail is shareable by URL and shows the chain', async ({ page }) => {
  await page.goto('/quests/wh1');
  await expect(page.getByRole('heading', { level: 2, name: 'Sklad' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Řetěz questů' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Odemkne: Sklad surovin 3/ })).toBeVisible();
});

test('closing the quest detail returns to the list', async ({ page }) => {
  await page.goto('/quests/wh1');
  await page.getByRole('button', { name: 'Zavřít' }).last().click();
  await expect(page).toHaveURL(/\/quests$/);
});

test('tribe choice persists across reloads', async ({ page }) => {
  await page.goto('/');
  const picker = page.getByRole('group', { name: 'Národ' });
  await picker.getByRole('button', { name: 'Galové' }).click();
  await page.reload();
  await expect(
    page.getByRole('group', { name: 'Národ' }).getByRole('button', { name: 'Galové' }),
  ).toHaveAttribute('aria-pressed', 'true');
});

test('filters live in the URL', async ({ page }) => {
  await page.goto('/quests?giver=markus&q=units');
  await expect(page.getByRole('heading', { level: 2, name: /Marcus/ })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: /Wren/ })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Marcus/ })).toHaveAttribute('aria-pressed', 'true');
});

test('daily quests tab', async ({ page }) => {
  await page.goto('/quests/daily');
  await expect(page.getByRole('heading', { name: 'Jak fungují daily questy' })).toBeVisible();
});

test('quest titles follow the language and English search still works in Czech', async ({ page }) => {
  await page.goto('/quests?q=construct+a+warehouse');
  await expect(page.getByRole('link', { name: /^Sklad / }).first()).toBeVisible();
  await page.getByRole('banner').getByRole('button', { name: 'EN', exact: true }).click();
  await expect(page.getByRole('link', { name: /Construct a Warehouse/ }).first()).toBeVisible();
});
