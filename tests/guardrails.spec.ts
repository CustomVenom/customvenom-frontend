import { expect, test } from '@playwright/test';

test.describe('League Connection Guardrails', () => {
  test('only one connect button and no provider words', async ({ page }) => {
    await page.goto('/tools');

    // Should have exactly one "Connect league" button
    const connectButtons = page.locator('text=Connect league');
    await expect(connectButtons).toHaveCount(1);

    // Should not have any "Yahoo" text
    const yahooText = page.locator('text=Yahoo');
    await expect(yahooText).toHaveCount(0);

    // Should not have any "Connect Yahoo" text
    const connectYahooText = page.locator('text=Connect Yahoo');
    await expect(connectYahooText).toHaveCount(0);
  });

  test('no other connect buttons on other pages', async ({ page }) => {
    // Check settings page
    await page.goto('/settings');

    // Should not have any connect buttons when guard is enabled
    const connectButtons = page.locator('text=Connect');
    await expect(connectButtons).toHaveCount(0);

    // Should not have any "Yahoo" text
    const yahooText = page.locator('text=Yahoo');
    await expect(yahooText).toHaveCount(0);
  });

  test('leagues page redirects to tools for connection', async ({ page }) => {
    await page.goto('/tools/leagues');

    // Should have link to tools for connection
    const toolsLink = page.locator('text=Go to Tools to Connect');
    await expect(toolsLink).toHaveCount(1);

    // Should not have "Connect Yahoo" text
    const connectYahooText = page.locator('text=Connect Yahoo');
    await expect(connectYahooText).toHaveCount(0);
  });
});
