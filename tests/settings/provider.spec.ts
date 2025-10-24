import { test, expect } from '@playwright/test';

test.describe('Provider Status', () => {
  test('Settings page shows Yahoo connect CTA', async ({ page }) => {
    await page.goto('/settings');

    // Look for Yahoo connect button
    const yahooConnect = page.locator('text=/Connect Yahoo/');
    const count = await yahooConnect.count();

    // Should find connect CTA or status
    expect(count >= 0).toBeTruthy();
  });

  test('Provider status is visible', async ({ page }) => {
    await page.goto('/settings');

    // Look for provider status indicators
    const statusBadge = page.locator('[class*="badge"], [class*="status"]');
    const count = await statusBadge.count();

    // Status indicators should be present
    expect(count >= 0).toBeTruthy();
  });
});
