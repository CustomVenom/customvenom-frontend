import { test, expect } from '@playwright/test';

test('Connect League button 302s to /api/yahoo/signin', async ({ page, context }) => {
  await page.goto('https://www.customvenom.com/dashboard', { waitUntil: 'networkidle' });

  const [req] = await Promise.all([
    context.waitForEvent('request', (r) => r.url().includes('/api/connect/start?host=yahoo')),
    page.getByRole('button', { name: /connect league/i }).click(),
  ]);

  const res = await req.response();
  expect(res).not.toBeNull();
  expect(res!.status()).toBeGreaterThanOrEqual(300);
  expect(res!.status()).toBeLessThan(400);

  // Follow redirect chain (best-effort)
  const loc = res!.headers()['location'] || '';
  expect(loc).toMatch(/\/api\/yahoo\/signin$/);
});
