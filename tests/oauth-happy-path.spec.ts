import { test, expect } from '@playwright/test';

test.describe('OAuth Happy Path Tests', () => {
  test('Launch → assert redirect Location matches Yahoo auth', async ({ page }) => {
    // Test the OAuth launch endpoint directly
    const response = await page.goto(
      'https://customvenom-workers-api-staging.jdewett81.workers.dev/oauth/yahoo/launch',
      {
        waitUntil: 'networkidle',
      },
    );

    // Should redirect to Yahoo OAuth
    expect(response?.status()).toBe(302);

    const location = response?.headers()['location'];
    expect(location).toContain('https://api.login.yahoo.com/oauth2/request_auth');
    expect(location).toContain('client_id=');
    expect(location).toContain('redirect_uri=');
    expect(location).toContain('response_type=code');
    expect(location).toContain('scope=fspt-r');
    expect(location).toContain('state=');
  });

  test('Callback error path → 400 with cache-control: no-store', async ({ page }) => {
    // Test callback with invalid parameters
    const response = await page.goto(
      'https://customvenom-workers-api-staging.jdewett81.workers.dev/oauth/yahoo/callback?code=invalid&state=invalid',
      {
        waitUntil: 'networkidle',
      },
    );

    // Should return 400 for invalid callback
    expect(response?.status()).toBe(400);

    const headers = response?.headers() ?? {};
    expect((headers['cache-control'] ?? '').toLowerCase()).toMatch(/no-store/);

    const body = await response?.json();
    expect(body).toHaveProperty('ok', false);
    expect(body).toHaveProperty('error');
    expect(body).toHaveProperty('request_id');
  });

  test('401 /yahoo/me → header and body request_id match', async ({ page }) => {
    // Test the /yahoo/me endpoint without authentication
    const response = await page.goto(
      'https://customvenom-workers-api-staging.jdewett81.workers.dev/yahoo/me',
      {
        waitUntil: 'networkidle',
      },
    );

    // Should return 401
    expect(response?.status()).toBe(401);

    const headers = response?.headers() ?? {};
    const body = await response?.json();

    // Verify request_id consistency
    const headerRequestId = headers['x-request-id'];
    const bodyRequestId = body.request_id;

    expect(headerRequestId).toBeDefined();
    expect(bodyRequestId).toBeDefined();
    expect(headerRequestId).toBe(bodyRequestId);

    // Verify error format
    expect(body).toHaveProperty('ok', false);
    expect(body).toHaveProperty('error', 'auth_required');
    expect(body).toHaveProperty('request_id');

    // Verify cache headers
    expect((headers['cache-control'] ?? '').toLowerCase()).toMatch(/no-store/);
  });

  test('Health endpoint returns 200 with proper contract', async ({ page }) => {
    // Test the health endpoint
    const response = await page.goto(
      'https://customvenom-workers-api-staging.jdewett81.workers.dev/health',
      {
        waitUntil: 'networkidle',
      },
    );

    // Should return 200
    expect(response?.status()).toBe(200);

    const headers = response?.headers();
    const body = await response?.json();

    // Verify contract fields
    expect(body).toHaveProperty('ok');
    expect(body).toHaveProperty('ready');
    expect(body).toHaveProperty('schema_version', 'v1');
    expect(body).toHaveProperty('last_refresh');
    expect(body).toHaveProperty('environment');

    // Verify trust headers
    expect((headers['x-schema-version'] ?? '')).toBe('v1');
    expect(headers['x-last-refresh']).toBeDefined();
    expect((headers['cache-control'] ?? '').toLowerCase()).toMatch(/no-store/);
  });
});
