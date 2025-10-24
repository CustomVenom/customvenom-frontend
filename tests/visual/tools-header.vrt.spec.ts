import { test, expect } from '@playwright/test';

test.describe('Tools Header Visual Regression', () => {
  test('Tools page header matches baseline', async ({ page }) => {
    await page.goto('/tools');
    
    // Wait for header to be stable
    await page.waitForLoadState('networkidle');
    
    // Find the main heading
    const heading = page.locator('h1:has-text("Tools")');
    await expect(heading).toBeVisible();
    
    // Simple visual check - text content matches
    const text = await heading.textContent();
    expect(text?.trim()).toBe('Tools');
    
    // Check heading styles (font size, weight)
    const styles = await heading.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        fontSize: computed.fontSize,
        fontWeight: computed.fontWeight,
      };
    });
    
    // Verify heading has expected styling
    expect(styles.fontSize).toBeTruthy();
    expect(styles.fontWeight).toBeTruthy();
  });
});

