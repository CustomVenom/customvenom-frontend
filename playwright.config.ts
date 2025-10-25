import { defineConfig } from '@playwright/test';

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
});

