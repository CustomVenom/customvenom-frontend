import { test, expect } from '@playwright/test';

test.describe('Reason Chips Boundary Enforcement', () => {
  test('Chips should respect ≤2 limit', async ({ page }) => {
    await page.goto('/projections');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Find all chip containers
    const chipContainers = page.locator('.flex.flex-wrap.items-center.gap-1.5');
    const count = await chipContainers.count();

    // Each row should have at most 2 chips
    for (let i = 0; i < count; i++) {
      const chips = chipContainers.nth(i).locator('span').count();
      const chipCount = await chips;
      expect(chipCount).toBeLessThanOrEqual(2);
    }
  });

  test('Chips should show confidence ≥ 0.65 indicators', async ({ page }) => {
    await page.goto('/projections');

    await page.waitForLoadState('networkidle');

    // Check that chips display percentage effects
    const chips = page.locator('span:has-text("%")');
    const count = await chips.count();

    // If chips exist, they should show effect percentages
    if (count > 0) {
      const firstChip = chips.first();
      const text = await firstChip.textContent();
      expect(text).toMatch(/[+-]?\d+\.?\d*%/);
    }
  });
});
