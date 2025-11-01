import { test, expect } from '@playwright/test';

const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:3000';

test('Trust Snapshot renders version and timestamp on /tools page', async ({ page }) => {
  await page.goto(`${FRONTEND}/tools`);

  const snapshot = page.getByLabel('Trust Snapshot');
  await expect(snapshot).toBeVisible();

  // Assert version is present (should match pattern like "v1" or "v1.0.0")
  await expect(snapshot).toContainText(/v\d+/);

  // Assert timestamp is present - should have a <time> element with datetime attribute
  const timeElement = snapshot.locator('time');
  await expect(timeElement).toBeVisible();

  const datetime = await timeElement.getAttribute('datetime');
  expect(datetime).toBeTruthy();
  expect(datetime!.length).toBeGreaterThan(0);

  // Assert timestamp text is visible (contains colon for time)
  await expect(snapshot).toContainText(':');
});

test('Trust Snapshot renders version and timestamp on /projections page', async ({ page }) => {
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
