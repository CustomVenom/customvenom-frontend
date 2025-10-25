import { test, expect } from '@playwright/test';

test.describe('Mobile Dock', () => {
  test('Mobile dock renders on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/tools');

    // Check mobile dock is visible
    const dock = page.locator('nav[aria-label="Mobile navigation"]');
    await expect(dock).toBeVisible();
  });

  test('Mobile dock marks active item', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/tools');

    // Find Tools link in dock
    const toolsLink = page.locator('nav[aria-label="Mobile navigation"] a[href="/tools"]');
    await expect(toolsLink).toHaveAttribute('aria-current', 'page');
  });

  test('Desktop viewport hides mobile dock', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/tools');

    // Mobile dock should be hidden
    const dock = page.locator('nav[aria-label="Mobile navigation"]');
    await expect(dock).not.toBeVisible();
  });
});
