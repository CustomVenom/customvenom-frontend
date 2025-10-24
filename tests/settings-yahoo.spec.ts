// tests/settings-yahoo.spec.ts
import { test, expect } from '@playwright/test';

test('@yahoo-oauth settings loads signed-out without redirect', async ({ page }) => {
  const res = await page.goto('/settings', { waitUntil: 'networkidle' });
  expect(res?.status()).toBeLessThan(400);
  await expect(page.getByTestId('yahoo-status')).toBeVisible();
  await expect(page.getByTestId('yahoo-connect-btn')).toBeVisible();
});

test('@yahoo-oauth shows connected state after callback', async ({ page, context }) => {
  // Seed cookies to simulate callback having run
  await context.addCookies([
    { name: 'y_at', value: 'stub', url: process.env.FRONTEND_BASE || 'http://localhost:3000' },
    {
      name: 'y_guid',
      value: 'GUID-123',
      url: process.env.FRONTEND_BASE || 'http://localhost:3000',
    },
  ]);
  await page.goto('/settings?yahoo=connected', { waitUntil: 'networkidle' });
  await expect(page.getByTestId('yahoo-connected')).toContainText('GUID-123');
});
