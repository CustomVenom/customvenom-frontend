import { test, expect } from '@playwright/test';

test('Trust Snapshot renders with version and timestamp', async ({ page }) => {
  // Assumes NEXT_PUBLIC_API_BASE points to staging; page fetches /projections in layout
  await page.goto('/tools');
  const snapshot = page.locator('[aria-label="Trust Snapshot"], [data-testid="trust-snapshot"]');
  await expect(snapshot).toBeVisible();

  // shows v<schema_version>
  await expect(snapshot).toContainText(/v\d+\.\d+\.\d+/);

  // shows a time element
  const timeEl = snapshot.locator('time');
  await expect(timeEl).toBeVisible();
  const dt = await timeEl.getAttribute('datetime');
  expect(dt && dt.length > 0).toBeTruthy();
});
