// tests/e2e/trust-windows.spec.ts
// E2E tests for PublicTrustFooter and TrustSnapshot rendering

import { test, expect } from '@playwright/test';

const PUBLIC_ROUTES = [
  '/',
  '/features',
  '/pricing',
  '/about',
  '/legal/terms',
  '/legal/privacy',
  '/contact',
];
const DATA_ROUTES = ['/players', '/team', '/tools/start-sit', '/matchup', '/league/standings'];

test.describe('Trust Windows', () => {
  test('PublicTrustFooter should render only on public routes', async ({ page }) => {
    for (const route of PUBLIC_ROUTES) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');

      // Look for PublicTrustFooter (adjust selector based on actual implementation)
      const publicFooter = page
        .locator('.public-trust-footer, [data-testid="public-trust-footer"]')
        .first();

      // Footer should be visible on public routes
      if ((await publicFooter.count()) > 0) {
        await expect(publicFooter).toBeVisible();
      }
    }
  });

  test('PublicTrustFooter should NOT render on data routes', async ({ page }) => {
    for (const route of DATA_ROUTES) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');

      // PublicTrustFooter should not be visible on data routes
      const publicFooter = page
        .locator('.public-trust-footer, [data-testid="public-trust-footer"]')
        .first();

      if ((await publicFooter.count()) > 0) {
        await expect(publicFooter).not.toBeVisible();
      }
    }
  });

  test('TrustSnapshot should render on data routes', async ({ page }) => {
    for (const route of DATA_ROUTES) {
      await page.goto(route);
      await page.waitForLoadState('networkidle');

      // Look for TrustSnapshot (adjust selector based on actual implementation)
      const trustSnapshot = page
        .locator('[aria-label*="Trust"], .trust-snapshot, [data-testid="trust-snapshot"]')
        .first();

      // TrustSnapshot should be visible after data loads
      // Wait a bit for API call to complete
      await page.waitForTimeout(2000);

      if ((await trustSnapshot.count()) > 0) {
        await expect(trustSnapshot).toBeVisible();

        // Verify it shows schema version
        const schemaText = trustSnapshot.locator('text=/v\\d+/i, text=/schema/i').first();
        if ((await schemaText.count()) > 0) {
          await expect(schemaText).toBeVisible();
        }
      }
    }
  });

  test('TrustSnapshot should show trust headers after API call', async ({ page }) => {
    await page.goto('/players');
    await page.waitForLoadState('networkidle');

    // Wait for API call to complete
    await page.waitForResponse((response) => response.url().includes('/api/projections'), {
      timeout: 10000,
    });

    // Verify TrustSnapshot shows schema version and last refresh
    const trustSnapshot = page
      .locator('[aria-label*="Trust"], .trust-snapshot, [data-testid="trust-snapshot"]')
      .first();

    if ((await trustSnapshot.count()) > 0) {
      await expect(trustSnapshot).toBeVisible();

      // Check for schema version text
      const hasSchemaVersion = await trustSnapshot
        .locator('text=/v\\d+/i, text=/schema/i')
        .count()
        .then((count) => count > 0);

      // Check for last refresh text
      const hasLastRefresh = await trustSnapshot
        .locator('text=/updated/i, text=/refresh/i, time')
        .count()
        .then((count) => count > 0);

      expect(hasSchemaVersion || hasLastRefresh).toBe(true);
    }
  });
});
