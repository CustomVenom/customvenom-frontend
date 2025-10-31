import { test, expect } from '@playwright/test';

test.describe('UI Contract Tests', () => {
  test('trust snapshot renders with schema_version and last_refresh', async ({ page }) => {
    await page.goto('/dashboard');

    // Wait for trust snapshot to load
    await expect(page.locator('[data-testid="trust-snapshot"]')).toBeVisible();

    // Check schema version is visible
    await expect(page.locator('[data-testid="schema-version"]')).toBeVisible();

    // Check last refresh is visible
    await expect(page.locator('[data-testid="last-refresh"]')).toBeVisible();

    // Check version element exists
    await expect(page.locator('[data-testid="version"]')).toBeVisible();
  });

  test('leagues flow does not spin forever on error', async ({ page }) => {
    await page.goto('/dashboard/leagues');

    // Wait for leagues table to load
    await expect(page.locator('[data-testid="leagues-table"]')).toBeVisible();

    // Check that loading spinner disappears
    await expect(page.locator('[data-testid="loading-spinner"]')).not.toBeVisible({
      timeout: 10000,
    });

    // If there's an error, check that details with requestId are shown
    const errorDetails = page.locator('[data-testid="error-details"]');
    if (await errorDetails.isVisible()) {
      await expect(errorDetails).toContainText('requestId');
    }
  });

  test('protection mode badge shows when x-stale=true', async ({ page }) => {
    // Mock API response with x-stale header
    await page.route('**/api/leagues', async (route) => {
      await route.fulfill({
        status: 200,
        headers: {
          'x-stale': 'true',
          'x-request-id': 'test-request-id',
        },
        body: JSON.stringify({
          leagues: [],
          stale: true,
        }),
      });
    });

    await page.goto('/dashboard/leagues');

    // Check that protection mode badge is visible
    await expect(page.locator('[data-testid="protection-mode-badge"]')).toBeVisible();

    // Check badge text
    await expect(page.locator('[data-testid="protection-mode-badge"]')).toContainText(
      'Protection Mode',
    );
  });

  test('health endpoint returns correct contract', async ({ page }) => {
    const response = await page.request.get('/api/health');

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty('ok');
    expect(body).toHaveProperty('ready');
    expect(body).toHaveProperty('schema_version');
    expect(body).toHaveProperty('last_refresh');

    const headers = response.headers();
    expect(headers['cache-control']).toBe('no-store');
    expect(headers['x-request-id']).toBeDefined();
  });
});
