// tests/integration/api-proxy.test.ts
// Integration tests for API proxy routes and trust headers

import { describe, it, expect } from 'vitest';
import { testApiEndpoint, testApiEndpoints } from '@/lib/test-utils/trust-headers';

const BASE_URL = process.env.TEST_BASE_URL || 'http://localhost:3000';

describe('API Proxy Trust Headers', () => {
  it('should return trust headers from /api/projections', async () => {
    const result = await testApiEndpoint(
      `${BASE_URL}/api/projections?week=2025-46&sport=nfl&scoring_format=half_ppr`,
    );

    expect(result.ok).toBe(true);
    expect(result.trustHeaders['x-schema-version']).toBeTruthy();
    expect(result.trustHeaders['x-last-refresh']).toBeTruthy();
    expect(result.trustHeaders['x-request-id']).toBeTruthy();
    expect(result.requestId).toBeTruthy();
  });

  it('should return trust headers from /api/lineup-optimizer', async () => {
    const result = await testApiEndpoint(
      `${BASE_URL}/api/lineup-optimizer?team_key=test&risk=neutral`,
    );

    expect(result.ok).toBe(true);
    expect(result.trustHeaders['x-schema-version']).toBeTruthy();
    expect(result.trustHeaders['x-last-refresh']).toBeTruthy();
    expect(result.trustHeaders['x-request-id']).toBeTruthy();
  });

  it('should return trust headers from /api/league/transactions', async () => {
    const result = await testApiEndpoint(`${BASE_URL}/api/league/transactions?league_key=test`);

    expect(result.ok).toBe(true);
    expect(result.trustHeaders['x-schema-version']).toBeTruthy();
    expect(result.trustHeaders['x-last-refresh']).toBeTruthy();
    expect(result.trustHeaders['x-request-id']).toBeTruthy();
  });

  it('should test all endpoints together', async () => {
    const results = await testApiEndpoints(BASE_URL);
    expect(results.length).toBeGreaterThan(0);
    results.forEach((result) => {
      if (result) {
        expect(result.ok).toBe(true);
        expect(result.requestId).toBeTruthy();
      }
    });
  });
});
