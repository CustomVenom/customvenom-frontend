import { test, expect } from '@playwright/test';

test.describe('Navigation Components', () => {
  test('SideNav shows aria-current on active item', async ({ page }) => {
    await page.goto('/tools');

    // Find the Tools link with aria-current
    const toolsLink = page.locator('nav[aria-label="Side navigation"] a[href="/tools"]');
    await expect(toolsLink).toHaveAttribute('aria-current', 'page');
  });

  test('Skip link is focusable', async ({ page }) => {
    await page.goto('/tools');

    // Check skip link exists
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeVisible({ state: 'hidden' }); // sr-only initially

    // Check it becomes visible on focus
    await skipLink.focus();
    await expect(skipLink).toBeVisible();
  });

  test('QuickNav shortcuts work', async ({ page }) => {
    await page.goto('/tools');

    // Press 'g' then 'p' to navigate to projections
    await page.keyboard.press('g');
    await page.keyboard.press('p');

    // Should navigate to projections
    await expect(page).toHaveURL(/\/projections/);
  });
});
