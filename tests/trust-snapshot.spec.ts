import { test, expect } from '@playwright/test';

test('Trust Snapshot renders with version and timestamp', async ({ page }) => {
  // Assumes NEXT_PUBLIC_API_BASE points to staging; page fetches /projections in layout
  await page.goto('/dashboard');
  const snapshot = page
    .locator('[aria-label="Trust Snapshot"], [data-testid="trust-snapshot"]')
    .first();
  await expect(snapshot).toBeVisible();

  // shows schema version
  await expect(snapshot).toContainText(/Schema:v\d+/);
});
