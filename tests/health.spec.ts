import { test, expect } from '@playwright/test';

test('API /health exposes contract fields and no-store cache', async ({ request }) => {
  const api = process.env.NEXT_PUBLIC_API_BASE!;
  const res = await request.get(`${api}/health`, { failOnStatusCode: false });
  expect(res.status()).toBe(200);

  const body = await res.json();
  expect(body).toMatchObject({
    ok: expect.any(Boolean),
    ready: expect.any(Boolean),
    schema_version: expect.any(String),
    last_refresh: expect.any(String),
    r2_key: expect.any(String),
  });

  const cache = res.headers()['cache-control'] || '';
  expect(cache.toLowerCase()).toContain('no-store');
  // Best-effort: request id present
  expect(res.headers()).toHaveProperty('x-request-id');
});

test('API /health contract validation', async ({ request }) => {
  const api = process.env.NEXT_PUBLIC_API_BASE!;
  const res = await request.get(`${api}/health`);

  // Status must be 200
  expect(res.status()).toBe(200);

  // Cache control must contain no-store
  const cacheControl = res.headers()['cache-control'];
  expect(cacheControl).toContain('no-store');

  // Body must have all required contract fields
  const body = await res.json();
  expect(body.ok).toBeDefined();
  expect(body.ready).toBeDefined();
  expect(body.schema_version).toBeDefined();
  expect(body.last_refresh).toBeDefined();
  expect(body.r2_key).toBeDefined();

  // Request ID must be present
  expect(res.headers()['x-request-id']).toBeDefined();
});
