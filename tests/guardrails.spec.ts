import { expect, test } from '@playwright/test';

const BASE = process.env.BASE_URL ?? 'https://www.customvenom.com';

test('tools: single connect button (signed-out)', async ({ page, context }) => {
  // Clear cookies to ensure signed-out state
  await context.clearCookies();
  
  await page.goto(`${BASE}/tools`, { waitUntil: 'domcontentloaded' });

  const btns = page
    .getByRole('link', { name: /connect league/i })
    .or(page.getByRole('button', { name: /connect league/i }));
  await expect(btns).toHaveCount(1, { timeout: 10000 });

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
