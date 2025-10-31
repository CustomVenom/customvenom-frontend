import { test, expect } from '@playwright/test';

test('League nav resolves to /league/roster', async ({ page }) => {
  await page.goto('https://www.customvenom.com/dashboard', { waitUntil: 'networkidle' });

  // Click the League nav item
  await page
    .getByRole('link', { name: /league/i })
    .first()
    .click();

  // Assert redirect target and heading render
  await expect(page).toHaveURL(/\/league(\/roster)?$/);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});
