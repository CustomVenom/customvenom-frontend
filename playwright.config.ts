import { defineConfig } from '@playwright/test';

// Local vs CI Environment Parity:
// - CI: FRONTEND_BASE=https://www.customvenom.com (set in workflow)
// - Local: baseURL=http://localhost:3000 (local dev server)
// - Both use same test logic, different base URLs

export default defineConfig({
  testIgnore: ['tests/**/*.test.ts'],
  timeout: 60000,
  use: { baseURL: 'http://localhost:3000', trace: 'on-first-retry' },
  webServer: {
    command: 'npm run build && npm run start',
    url: 'http://localhost:3000',
    timeout: 120000,
    reuseExistingServer: !process.env['CI'],
  },
  projects: [
    {
      name: 'yahoo-connect',
      testMatch: 'tests/yahoo-connect.spec.ts',
    },
  ],
});

