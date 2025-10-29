import { expect, test } from '@playwright/test';

const BASE = process.env.BASE_URL ?? 'https://www.customvenom.com';

test('tools: single connect button (signed-out)', async ({ page }) => {
  await page.goto(`${BASE}/tools`, { waitUntil: 'domcontentloaded' });

  const btns = page
    .getByRole('link', { name: 'Connect league' })
    .or(page.getByRole('button', { name: 'Connect league' }));
  await expect(btns).toHaveCount(1);

  await expect(page.getByText(/Yahoo/i)).toHaveCount(0);
});

test('settings: no provider UI (signed-out)', async ({ page }) => {
  await page.goto(`${BASE}/settings`, { waitUntil: 'domcontentloaded' });

  const forbidden = [
    /Connect league/i,
    /Connect Yahoo/i,
    /League Integration/i,
    /Choose Your Team/i,
    /Refresh league/i,
    /Yahoo Fantasy/i,
  ];

  for (const re of forbidden) {
    await expect(page.getByText(re)).toHaveCount(0);
  }
});
