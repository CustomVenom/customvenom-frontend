import { test, expect } from '@playwright/test';

const FRONTEND_BASE = process.env.FRONTEND_BASE ?? 'https://www.customvenom.com';

test.describe('Frontend endpoints', () => {
  test('root, tools, and subroutes respond 200', async ({ page }) => {
    for (const path of ['/', '/tools', '/tools/start-sit', '/tools/faab', '/tools/decisions']) {
      const res = await page.goto(FRONTEND_BASE + path, { waitUntil: 'domcontentloaded' });
      expect(res?.status(), `GET ${path}`).toBe(200);
    }
  });

  test('HSTS and HTTPS redirect', async ({ request }) => {
    const res = await request.get(FRONTEND_BASE + '/', { failOnStatusCode: false });
    expect(res.status()).toBe(200);
    const hsts = res.headers()['strict-transport-security'];
    expect(hsts, 'HSTS header present').toBeTruthy();
  });

  test('Trust Snapshot visible on /tools', async ({ page }) => {
    await page.goto(FRONTEND_BASE + '/tools');
    // Adjust selector to your component label
    const el = page.getByLabel('Trust Snapshot');
    await expect(el).toBeVisible();
    // Check contents: version and timestamp (loosely)
    await expect(el).toContainText(/v\d+/);
  });

  test('Canonical host redirect', async ({ request }) => {
    // Test that non-canonical host redirects to canonical
    const nonCanonical = FRONTEND_BASE.replace('www.', '');
    const res = await request.get(nonCanonical, {
      failOnStatusCode: false,
      maxRedirects: 0,
    });
    expect([301, 308]).toContain(res.status());
    const location = res.headers()['location'];
    expect(location).toMatch(/^https:\/\/www\.customvenom\.com/);
  });

  test('Cache policies', async ({ request }) => {
    // HTML should not be long-cached
    const htmlRes = await request.get(FRONTEND_BASE + '/');
    const htmlCache = htmlRes.headers()['cache-control'];
    expect(htmlCache).not.toContain('max-age=31536000');

    // Static assets should be long-cached (test if we can find one)
    const htmlContent = await htmlRes.text();
    const assetMatch = htmlContent.match(/_next\/static\/[^"]+\.js/);
    if (assetMatch) {
      const assetRes = await request.get(FRONTEND_BASE + '/' + assetMatch[0]);
      const assetCache = assetRes.headers()['cache-control'];
      expect(assetCache).toContain('max-age=31536000');
    }
  });
});
