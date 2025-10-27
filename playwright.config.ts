import { defineConfig } from '@playwright/test';

// Local vs CI Environment Parity:
// - CI: FRONTEND_BASE=https://www.customvenom.com (set in workflow)
// - Local: baseURL=http://localhost:3000 (local dev server)
// - Both use same test logic, different base URLs

export default defineConfig({
  testIgnore: ['tests/**/*.test.ts'],
  timeout: 60000,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },
  webServer: {
    command: 'npm run build && npm run start:test',
    url: 'http://localhost:3000',
    timeout: 120000,
    reuseExistingServer: true,
    env: {
      NEXT_PUBLIC_API_BASE: 'https://customvenom-workers-api-staging.jdewett81.workers.dev',
    },
  },
  projects: [
    {
      name: 'trust-snapshot',
      testMatch: 'tests/trust-snapshot.spec.ts',
      use: {
        actionTimeout: 5000,
        navigationTimeout: 15000,
      },
    },
    {
      name: 'health',
      testMatch: 'tests/health.spec.ts',
      use: {
        actionTimeout: 10000,
        navigationTimeout: 15000,
      },
    },
    {
      name: 'yahoo-connect',
      testMatch: 'tests/yahoo-connect.spec.ts',
      use: {
        actionTimeout: 10000,
        navigationTimeout: 30000,
      },
    },
  ],
});
