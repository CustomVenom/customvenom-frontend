import { expect, request, test } from '@playwright/test';

const API = process.env.API_BASE_URL ?? 'https://api.customvenom.com';
const FRONTEND = process.env.BASE_URL ?? 'https://www.customvenom.com';

test('callback responds 302 with Location → /dashboard', async ({ playwright }) => {
  const ctx = await request.newContext({ baseURL: API });

  // Use a dummy code; we only validate the redirect Location header.
  const res = await ctx.get('/api/yahoo/callback?code=dummy', { maxRedirects: 0 });

  // Many servers use 302/303; accept both
  expect([302, 303]).toContain(res.status());

  const loc = res.headers()['location'] || res.headers()['Location'];
  expect(loc).toBeTruthy();

  // Allow absolute or relative Location; both should end at /dashboard
  // Examples: https://www.customvenom.com/dashboard or /dashboard
  const final = new URL(loc, FRONTEND).toString();
  expect(final).toBe(`${FRONTEND}/dashboard`);
});
