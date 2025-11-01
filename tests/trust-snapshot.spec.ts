import { test, expect } from '@playwright/test';

const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:3000';

test('Trust Snapshot renders version and timestamp', async ({ page }) => {
  await page.goto(`${FRONTEND}/projections`);

  const snapshot = page.getByLabel('Trust Snapshot');
  await expect(snapshot).toBeVisible();

  // Assert version is present
  await expect(snapshot).toContainText('v');

  // Assert timestamp is present (contains colon for time)
  await expect(snapshot).toContainText(':');

  // Take screenshot for artifact
  await page.screenshot({
    path: 'artifacts/projections-trust-snapshot.png',
    fullPage: false,
  });
});

test('Trust Snapshot shows stale badge when x-stale=true', async ({ page }) => {
  // Intercept /api/projections and add x-stale: true header
  await page.route('**/api/projections*', async (route) => {
    const response = await route.fetch();
    const body = await response.json();

    // Clone response and add x-stale header
    const newHeaders = { ...response.headers(), 'x-stale': 'true' };
    await route.fulfill({
      response,
      headers: newHeaders,
      json: body,
    });
  });

  await page.goto(`${FRONTEND}/projections`);

  const snapshot = page.getByLabel('Trust Snapshot');
  await expect(snapshot).toBeVisible();

  // Assert stale badge is present
  await expect(snapshot.getByText('stale')).toBeVisible();
});
