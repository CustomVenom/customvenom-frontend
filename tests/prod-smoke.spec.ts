import { test, expect } from '@playwright/test';

test('Production API health contract validation', async ({ request }) => {
  // Only run against production API
  const prodApi = 'https://api.customvenom.com';
  const res = await request.get(`${prodApi}/health`);

  // Status must be 200
  expect(res.status()).toBe(200);

  // Cache control must contain no-store
  const cacheControl = res.headers()['cache-control'];
  expect(cacheControl).toContain('no-store');

  // Request ID must be present
  expect(res.headers()['x-request-id']).toBeDefined();

  // Body must have all required contract fields
  const body = await res.json();
  expect(body.ok).toBeDefined();
  expect(body.ready).toBeDefined();
  expect(body.schema_version).toBeDefined();
  expect(body.last_refresh).toBeDefined();
  expect(body.r2_key).toBeDefined();
});
