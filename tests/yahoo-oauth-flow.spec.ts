import { test, expect } from '@playwright/test';

test.describe('Yahoo OAuth Flow', () => {
  test('@yahoo-oauth Tools/Yahoo shows Connect when not connected', async ({ page }) => {
    await page.goto('/tools/yahoo', { waitUntil: 'networkidle' });
    await expect(page.getByRole('link', { name: /Connect Yahoo/i })).toBeVisible();
  });

  test('@yahoo-oauth Connect navigates to Yahoo auth', async ({ page }) => {
    await page.goto('/tools/yahoo', { waitUntil: 'networkidle' });
    const connectLink = page.getByRole('link', { name: /Connect Yahoo/i });
    await connectLink.click();

    // Should redirect to Yahoo auth
    await page.waitForURL(/api\.login\.yahoo\.com/, { timeout: 5000 });
    expect(page.url()).toContain('api.login.yahoo.com');
  });

  test('@yahoo-oauth Invalid state returns 400', async ({ page }) => {
    const response = await page.goto('/api/yahoo/callback?code=bad&state=bad', {
      waitUntil: 'networkidle',
    });
    expect(response?.status()).toBe(400);
    await expect(page.getByText(/Invalid OAuth state/i)).toBeVisible();
  });

  test('@yahoo-oauth Tools/Yahoo returns 200', async ({ page }) => {
    const response = await page.goto('/tools/yahoo', { waitUntil: 'networkidle' });
    expect(response?.status()).toBe(200);

    // Should contain either Connect button or leagues list
    const hasConnect = await page
      .getByRole('link', { name: /Connect Yahoo/i })
      .isVisible()
      .catch(() => false);
    const hasLeagues = await page
      .getByText(/Your Yahoo leagues/i)
      .isVisible()
      .catch(() => false);

    expect(hasConnect || hasLeagues).toBe(true);
  });

  test('@yahoo-oauth Connect redirect includes returnTo parameter', async ({ page }) => {
    await page.goto('/tools/yahoo', { waitUntil: 'networkidle' });
    const connectLink = page.getByRole('link', { name: /Connect Yahoo/i });
    const href = await connectLink.getAttribute('href');

    expect(href).toContain('/api/yahoo/connect');
    expect(href).toContain('returnTo=');
  });
});
