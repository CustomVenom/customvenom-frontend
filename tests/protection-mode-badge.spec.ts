import { test, expect } from '@playwright/test';

test.describe('Protection Mode Badge', () => {
  test('shows protection mode badge when x-stale=true', async ({ page }) => {
    // Mock API response with x-stale header
    await page.route('**/api/leagues', async (route) => {
      await route.fulfill({
        status: 200,
        headers: {
          'x-stale': 'true',
          'x-request-id': 'test-request-id',
        },
        body: JSON.stringify({
          leagues: [],
          stale: true,
        }),
      });
    });

    await page.goto('/dashboard/leagues');

    // Check that protection mode badge is visible
    const badge = page.locator('[data-testid="protection-mode-badge"]');
    await expect(badge).toBeVisible();

    // Check badge text content
    await expect(badge).toContainText('Protection mode');

    // Check badge styling (amber colors)
    await expect(badge).toHaveClass(/bg-amber-100/);
    await expect(badge).toHaveClass(/text-amber-800/);

    // Check for pulsing indicator
    const indicator = badge.locator('.animate-pulse');
    await expect(indicator).toBeVisible();
  });

  test('does not show protection mode badge when x-stale=false', async ({ page }) => {
    // Mock API response without x-stale header
    await page.route('**/api/leagues', async (route) => {
      await route.fulfill({
        status: 200,
        headers: {
          'x-request-id': 'test-request-id',
        },
        body: JSON.stringify({
          leagues: [],
          stale: false,
        }),
      });
    });

    await page.goto('/dashboard/leagues');

    // Check that protection mode badge is not visible
    const badge = page.locator('[data-testid="protection-mode-badge"]');
    await expect(badge).not.toBeVisible();
  });

  test('protection mode badge has correct accessibility attributes', async ({ page }) => {
    // Mock API response with x-stale header
    await page.route('**/api/leagues', async (route) => {
      await route.fulfill({
        status: 200,
        headers: {
          'x-stale': 'true',
          'x-request-id': 'test-request-id',
        },
        body: JSON.stringify({
          leagues: [],
          stale: true,
        }),
      });
    });

    await page.goto('/dashboard/leagues');

    const badge = page.locator('[data-testid="protection-mode-badge"]');
    await expect(badge).toBeVisible();

    // Check for proper ARIA attributes
    await expect(badge).toHaveAttribute('role', 'status');
    await expect(badge).toHaveAttribute('aria-label', 'Protection mode active');
  });

  test('protection mode badge appears in correct location', async ({ page }) => {
    // Mock API response with x-stale header
    await page.route('**/api/leagues', async (route) => {
      await route.fulfill({
        status: 200,
        headers: {
          'x-stale': 'true',
          'x-request-id': 'test-request-id',
        },
        body: JSON.stringify({
          leagues: [],
          stale: true,
        }),
      });
    });

    await page.goto('/dashboard/leagues');

    // Check that badge appears in the leagues table header area
    const tableHeader = page.locator('[data-testid="leagues-table-header"]');
    const badge = tableHeader.locator('[data-testid="protection-mode-badge"]');
    await expect(badge).toBeVisible();

    // Verify badge is positioned correctly relative to other elements
    const syncSlots = tableHeader.locator('[data-testid="sync-slots"]');
    await expect(syncSlots).toBeVisible();
    await expect(badge).toBeVisible();
  });
});
