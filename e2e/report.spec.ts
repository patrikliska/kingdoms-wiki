import { expect, test, type Page } from '@playwright/test';

/** The e2e build posts reports to /api/report (playwright.config.ts); we answer it here. */
async function fakeEndpoint(page: Page, response: { status: number; body: unknown }) {
  const sent: unknown[] = [];
  await page.route('**/api/report', async (route) => {
    sent.push(route.request().postDataJSON());
    await route.fulfill({
      status: response.status,
      contentType: 'application/json',
      body: JSON.stringify(response.body),
    });
  });
  return sent;
}

test('report form sends a correction with the page context', async ({ page }) => {
  const sent = await fakeEndpoint(page, {
    status: 201,
    body: { ok: true, number: 42, url: 'https://github.com/patrikliska/kingdoms-wiki/issues/42' },
  });
  await page.goto('/buildings/city-wall?lvl=20');
  await page.getByRole('button', { name: 'Navrhnout opravu' }).click();

  const dialog = page.getByRole('dialog', { name: 'Navrhnout opravu' });
  await dialog.getByLabel('Popis').fill('Krátce');
  await dialog.getByRole('button', { name: 'Odeslat' }).click();
  await expect(dialog.getByText('Popis je moc krátký (aspoň 10 znaků).')).toBeVisible();
  expect(sent).toHaveLength(0);

  await dialog.getByRole('button', { name: 'Překlad' }).click();
  await dialog.getByLabel('Popis').fill('Ve hře se budova jmenuje jinak.');
  await expect(dialog.getByText(/moc krátký/)).toBeHidden();
  await expect(
    dialog.getByText('Přiložíme: stránka /buildings/city-wall?lvl=20 · Římané · Guvernér'),
  ).toBeVisible();
  await dialog.getByRole('button', { name: 'Odeslat' }).click();

  await expect(dialog.getByText('Díky! Hlášení #42 je založené.')).toBeVisible();
  await expect(dialog.getByRole('link', { name: 'Zobrazit na GitHubu' })).toHaveAttribute(
    'href',
    'https://github.com/patrikliska/kingdoms-wiki/issues/42',
  );
  expect(sent).toEqual([
    expect.objectContaining({
      kind: 'translation',
      message: 'Ve hře se budova jmenuje jinak.',
      website: '',
      context: expect.objectContaining({ path: '/buildings/city-wall?lvl=20', tribe: 'roman', lang: 'cs' }),
    }),
  ]);
});

test('report form keeps the text when sending fails', async ({ page }) => {
  await fakeEndpoint(page, { status: 429, body: { ok: false, error: 'rate' } });
  await page.goto('/more');
  await page.getByRole('button', { name: /Nahlásit chybu nebo navrhnout úpravu/ }).click();

  const dialog = page.getByRole('dialog', { name: 'Navrhnout opravu' });
  await dialog.getByLabel('Popis').fill('Na stránce Více chybí odkaz na zdroj.');
  await dialog.getByRole('button', { name: 'Odeslat' }).click();

  await expect(dialog.getByText('Moc hlášení za krátkou dobu. Zkus to za minutu.')).toBeVisible();
  await expect(dialog.getByLabel('Popis')).toHaveValue('Na stránce Více chybí odkaz na zdroj.');
});
