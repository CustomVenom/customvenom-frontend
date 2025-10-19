import { test, expect } from '@playwright/test';

const BASE = process.env.FRONTEND_BASE ?? 'http://localhost:3000';

test('Projections renders and has no console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (msg) => {
    const type = msg.type();
    if (type === 'error') errors.push(`[${type}] ${msg.text()}`);
  });

  const res = await page.goto(`${BASE}/projections`, { waitUntil: 'networkidle' });
  expect(res?.ok()).toBeTruthy();

  // Basic UI checks
  await expect(page.getByText(/Projections/i)).toBeVisible();

  // TrustSnapshot shows last_refresh or badge container exists
  await expect(page.locator('[data-testid="trust-snapshot"]')).toBeVisible();

  // No console errors
  expect(errors, errors.join('\n')).toHaveLength(0);
});
