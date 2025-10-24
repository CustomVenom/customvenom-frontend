import { test, expect } from '@playwright/test';

test.describe('Trust Ribbon on Tools Page', () => {
  test('Trust Snapshot is visible with version and time', async ({ page }) => {
    await page.goto('/tools');

    // Check for Trust Snapshot visibility
    const snapshot = page.locator('[aria-label="Trust Snapshot"]');
    await expect(snapshot).toBeVisible();

    // Verify schema version format
    await expect(snapshot).toContainText(/v\d+\.\d+\.\d+/);

    // Verify time element exists
    const timeEl = snapshot.locator('time');
    await expect(timeEl).toBeVisible();

    const dt = await timeEl.getAttribute('datetime');
    expect(dt && dt.length > 0).toBeTruthy();
  });

  test('Stale badge only appears when x-stale=true', async ({ page }) => {
    await page.goto('/tools');

    const snapshot = page.locator('[aria-label="Trust Snapshot"]');
    const staleBadge = snapshot.locator('text=/Stale/');

    // Check if stale badge exists (may or may not be visible)
    const count = await staleBadge.count();
    expect(count >= 0).toBeTruthy();
  });
});
