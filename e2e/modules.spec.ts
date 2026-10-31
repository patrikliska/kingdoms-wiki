import { expect, test } from '@playwright/test';

test('building calculator: range in URL drives the result, stepper changes it', async ({ page }) => {
  await page.goto('/buildings/warehouse?from=0&lvl=2');
  await expect(page.getByRole('heading', { level: 1, name: 'Sklad surovin' })).toBeVisible();
  await expect(page.getByText('Cena (2 lvl)')).toBeVisible();
  await page.getByRole('button', { name: 'Na level: zvýšit' }).click();
  await expect(page).toHaveURL(/lvl=3/);
  await expect(page.getByText('Cena (3 lvl)')).toBeVisible();
  await page.getByLabel('Na level', { exact: true }).fill('10');
  await expect(page).toHaveURL(/lvl=10/);
});

test('buildings catalog hides other tribes’ special buildings', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('group', { name: 'Národ' }).getByRole('button', { name: 'Germáni' }).click();
  await page.goto('/buildings');
  await expect(page.getByRole('link', { name: /Zemní hráz/ })).toBeVisible();
  await expect(page.getByRole('link', { name: /Městská zeď/ })).toHaveCount(0);
});

test('buildings catalog filters by category', async ({ page }) => {
  await page.goto('/buildings');
  await page.getByRole('button', { name: /Armáda/ }).click();
  await expect(page).toHaveURL(/cat=military/);
  await expect(page.getByRole('link', { name: /Kasárny/ }).first()).toBeVisible();
  await expect(page.getByRole('link', { name: /Dřevorubec/ })).toHaveCount(0);
});

test('walls: own wall by default, other walls and levels via URL', async ({ page }) => {
  await page.goto('/walls');
  await expect(page.getByRole('heading', { level: 2, name: /Městská zeď/ })).toBeVisible();
  await page.getByRole('button', { name: /Zemní hráz/ }).click();
  await expect(page).toHaveURL(/wall=teuton/);
  await expect(page.getByRole('heading', { level: 2, name: /Zemní hráz/ })).toBeVisible();
  await page.getByRole('slider').fill('15');
  await expect(page).toHaveURL(/lvl=15/);
  await expect(page.getByRole('heading', { name: /na levelu 15/ })).toBeVisible();
});

test('unit URL opens its detail', async ({ page }) => {
  await page.goto('/units/legionnaire');
  await expect(page.getByRole('heading', { level: 2, name: 'Legionnaire' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Praetorian/ }).first()).toBeAttached();
});

test('tribes page compares tribes', async ({ page }) => {
  await page.goto('/tribes?compare=1');
  await expect(page.getByRole('region', { name: 'Srovnání obchodníků' })).toBeVisible();
});

test('global search finds units with the keyboard', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.keyboard.press('Control+k');
  await page.getByRole('combobox').fill('druidrider');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/units\/druidrider/);
});

test('settings sheet changes the tribe everywhere', async ({ page }) => {
  await page.goto('/units');
  await page.getByRole('button', { name: /Nastavení/ }).click();
  const sheet = page.getByRole('dialog', { name: 'Nastavení' });
  await expect(sheet).toBeVisible();
  await sheet.getByRole('button', { name: /Galové/ }).click();
  await page.keyboard.press('Escape');
  await expect(sheet).toBeHidden();
  await expect(page.getByRole('link', { name: /Phalanx/ }).first()).toBeVisible();
});
