import { expect, test } from '@playwright/test';

const BASE = process.env.BASE_URL ?? 'https://www.customvenom.com';

test('tools: single connect button (signed-out)', async ({ page, context }) => {
  // Clear cookies to ensure signed-out state
  await context.clearCookies();

  await page.goto(`${BASE}/tools`, { waitUntil: 'domcontentloaded' });

  // Look for either the connect button or the loading/error state
  const connectBtn = page
    .getByRole('link', { name: /connect league/i })
    .or(page.getByRole('button', { name: /connect league/i }));

  const loadingState = page.getByText(/checking league connection|api base not configured/i);

  // Should have either the connect button OR a loading/error state (not both)
  const hasConnectBtn = (await connectBtn.count()) > 0;
  const hasLoadingState = (await loadingState.count()) > 0;

  expect(hasConnectBtn || hasLoadingState).toBe(true);
  expect(hasConnectBtn && hasLoadingState).toBe(false);

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
