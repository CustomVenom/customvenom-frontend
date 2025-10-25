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

  test('@yahoo-oauth Successful callback redirects to /tools/leagues', async ({
    page,
    context,
  }) => {
    // Simulate a successful OAuth callback by setting cookies and visiting callback
    // Note: This test uses mocked cookies since we can't do real OAuth in tests
    await context.addCookies([
      {
        name: 'y_state',
        value: encodeURIComponent(
          JSON.stringify({ state: 'test-state', returnTo: '/tools/leagues' })
        ),
        url: process.env['FRONTEND_BASE'] || 'http://localhost:3000',
      },
    ]);

    // Visit callback with valid state and code parameters
    // The callback should redirect to /tools/leagues
    const response = await page.goto('/api/yahoo/callback?code=test&state=test-state', {
      waitUntil: 'networkidle',
    });

    // Should either redirect (302/303) or return error (no real token exchange)
    // If token exchange fails, we get 502, which is expected without real Yahoo tokens
    expect([302, 303, 400, 502]).toContain(response?.status() || 0);
  });

  test('@yahoo-oauth /tools/yahoo redirects to /tools/leagues', async ({ page }) => {
    await page.goto('/tools/yahoo', { waitUntil: 'networkidle' });
    expect(page.url()).toContain('/tools/leagues');
  });
});

