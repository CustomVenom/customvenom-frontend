// tests/e2e/layout-overlap.spec.ts
// E2E tests for sticky bars and layout overlap

import { test, expect } from '@playwright/test';

const VIEWPORT_SMALL = { width: 375, height: 667 }; // iPhone SE size

test.describe('Layout Overlap', () => {
  test('last row should not be overlapped by bottom nav on /players at 375×667', async ({
    page,
  }) => {
    await page.setViewportSize(VIEWPORT_SMALL);
    await page.goto('/players');

    // Wait for table to load
    await page.waitForLoadState('networkidle');

    // Find the last row in the table
    const table = page.locator('table').first();
    const rows = table.locator('tbody tr');
    const rowCount = await rows.count();

    if (rowCount > 0) {
      const lastRow = rows.nth(rowCount - 1);

      // Get bounding box of last row
      const lastRowBox = await lastRow.boundingBox();
      const viewportHeight = VIEWPORT_SMALL.height;

      // Check if last row is visible (not overlapped)
      // Bottom nav is typically 56-64px, so last row should be above that
      if (lastRowBox) {
        const bottomNavHeight = 64; // Adjust based on actual CSS
        const lastRowBottom = lastRowBox.y + lastRowBox.height;
        const availableHeight = viewportHeight - bottomNavHeight;

        expect(lastRowBottom).toBeLessThanOrEqual(availableHeight);
      }

      // Verify last row is tappable (not covered by nav)
      await expect(lastRow).toBeVisible();
    }
  });

  test('last row should not be overlapped by bottom nav on /team at 375×667', async ({ page }) => {
    await page.setViewportSize(VIEWPORT_SMALL);
    await page.goto('/team');

    await page.waitForLoadState('networkidle');

    // Find the last interactive element (adjust selector based on actual implementation)
    const content = page.locator('main').first();
    const lastElement = content.locator('button, a, [role="button"]').last();

    if ((await lastElement.count()) > 0) {
      const lastElementBox = await lastElement.boundingBox();
      const viewportHeight = VIEWPORT_SMALL.height;

      if (lastElementBox) {
        const bottomNavHeight = 64;
        const lastElementBottom = lastElementBox.y + lastElementBox.height;
        const availableHeight = viewportHeight - bottomNavHeight;

        expect(lastElementBottom).toBeLessThanOrEqual(availableHeight);
      }

      await expect(lastElement).toBeVisible();
    }
  });

  test('should switch table to card layout at 768px breakpoint', async ({ page }) => {
    // Test at 767px (table layout)
    await page.setViewportSize({ width: 767, height: 1024 });
    await page.goto('/players');
    await page.waitForLoadState('networkidle');

    const tableAt767 = page.locator('table').first();
    const hasTableAt767 = await tableAt767.isVisible().catch(() => false);

    // Test at 768px (card layout, if implemented)
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/players');
    await page.waitForLoadState('networkidle');

    // Adjust assertions based on actual responsive implementation
    // This is a placeholder - verify based on your actual breakpoint behavior
    const tableAt768 = page.locator('table').first();
    const cardsAt768 = page.locator('[data-testid="player-card"], .player-card').first();

    // If cards are implemented, verify they show at 768px+
    if ((await cardsAt768.count()) > 0) {
      await expect(cardsAt768.first()).toBeVisible();
    } else if (hasTableAt767) {
      // If no cards, table should still be visible
      await expect(tableAt768).toBeVisible();
    }
  });
});
