// src/lib/env-validator.ts
// Startup validator for environment variables and config (production-safe)

export function validateEnv(isDev: boolean) {
  if (!isDev) return; // No-op in prod

  const required = ['NEXT_PUBLIC_SITE_URL'];
  const missing = required.filter((k) => !process.env[k]);

  if (missing.length) {
    // Warn in dev, don't throw
    console.warn(`Missing env vars: ${missing.join(', ')}`);
  }
}
