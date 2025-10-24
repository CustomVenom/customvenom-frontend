// tests/settings-yahoo.spec.ts
import { test, expect } from '@playwright/test';

test('@yahoo-oauth settings loads signed-out without redirect', async ({ page }) => {
  const res = await page.goto('/settings', { waitUntil: 'networkidle' });
  expect(res?.status()).toBeLessThan(400);
  await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
});

test('@yahoo-oauth shows connected state after callback', async ({ page }) => {
  // Simulate that callback already set the cookie by visiting the redirected URL
  await page.goto('/settings?yahoo=connected', { waitUntil: 'networkidle' });
  await expect(page.getByText(/Yahoo Connected/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /Fetch My Leagues/i })).toBeVisible();
});
