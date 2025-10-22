import { defineConfig } from '@playwright/test';

export default defineConfig({
  timeout: 60000,
  use: { baseURL: 'http://localhost:3000', trace: 'on-first-retry' },
  webServer: {
    command: 'npm run build && PORT=3000 npm run start',
    url: 'http://localhost:3000',
    timeout: 120000,
    reuseExistingServer: !process.env.CI,
  },
});
