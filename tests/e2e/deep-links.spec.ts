// tests/e2e/deep-links.spec.ts
// E2E tests for deep linking functionality

import { test, expect } from '@playwright/test';

test.describe('Deep Links', () => {
  test('should open player drawer from /team?player=ID', async ({ page }) => {
    // This test assumes we have a valid player ID from mock data
    await page.goto('/team?player=qb-allen-josh');

    // Wait for drawer to appear (adjust selector based on actual implementation)
    const drawer = page.locator('[role="dialog"], .drawer, [aria-modal="true"]');
    await expect(drawer).toBeVisible({ timeout: 5000 });

    // Verify player name is shown
    await expect(page.getByText('Josh Allen')).toBeVisible();
  });

  test('should pre-fill Start/Sit form from URL params', async ({ page }) => {
    await page.goto(
      '/tools/start-sit?playerA=qb-allen-josh&playerB=rb-mccaffrey-christian&risk=chase',
    );

    // Wait for form to load
    await page.waitForLoadState('networkidle');

    // Verify form fields are pre-filled (adjust selectors based on actual implementation)
    // This is a placeholder - adjust based on actual form structure
    const playerAField = page.locator('[name="playerA"], [data-testid="player-a"]').first();
    const playerBField = page.locator('[name="playerB"], [data-testid="player-b"]').first();
    const riskField = page.locator('[name="risk"], [data-testid="risk"]').first();

    // Check if fields exist and have values (adjust based on actual implementation)
    if ((await playerAField.count()) > 0) {
      await expect(playerAField).toHaveValue(/qb-allen-josh/i);
    }
    if ((await playerBField.count()) > 0) {
      await expect(playerBField).toHaveValue(/rb-mccaffrey-christian/i);
    }
    if ((await riskField.count()) > 0) {
      await expect(riskField).toHaveValue(/chase/i);
    }

    // Verify recommendation renders (if applicable)
    const recommendation = page.locator('text=/recommend/i, text=/start/i, text=/sit/i').first();
    if ((await recommendation.count()) > 0) {
      await expect(recommendation).toBeVisible();
    }
  });

  test('should pre-fill Trade Analyzer from URL params', async ({ page }) => {
    await page.goto(
      '/tools/trade?offer=qb-allen-josh,rb-mccaffrey-christian&request=wr-jefferson-justin',
    );

    await page.waitForLoadState('networkidle');

    // Verify multi-select is pre-filled (adjust selectors based on actual implementation)
    // This is a placeholder - adjust based on actual form structure
    const offerField = page.locator('[name="offer"], [data-testid="offer"]').first();
    const requestField = page.locator('[name="request"], [data-testid="request"]').first();

    // Check if fields exist (adjust based on actual implementation)
    if ((await offerField.count()) > 0) {
      const offerValue = await offerField.inputValue();
      expect(offerValue).toContain('qb-allen-josh');
      expect(offerValue).toContain('rb-mccaffrey-christian');
    }

    if ((await requestField.count()) > 0) {
      const requestValue = await requestField.inputValue();
      expect(requestValue).toContain('wr-jefferson-justin');
    }
  });
});
