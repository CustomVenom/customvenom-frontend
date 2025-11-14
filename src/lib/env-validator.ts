// src/lib/env-validator.ts
// Startup validator for environment variables and config

const REQUIRED_ENV_VARS = {
  // Public vars that should be set in production
  NEXT_PUBLIC_SITE_URL: process.env['NEXT_PUBLIC_SITE_URL'],
} as const;

const OPTIONAL_ENV_VARS = {
  NEXT_PUBLIC_API_BASE: process.env['NEXT_PUBLIC_API_BASE'],
  NEXT_PUBLIC_FEATURE_NBA: process.env['NEXT_PUBLIC_FEATURE_NBA'],
  NEXT_PUBLIC_PAYWALL: process.env['NEXT_PUBLIC_PAYWALL'],
} as const;

export function validateEnv() {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Check required vars
  for (const [key, value] of Object.entries(REQUIRED_ENV_VARS)) {
    if (!value) {
      errors.push(`Missing required env var: ${key}`);
    }
  }

  // Check optional vars and warn if missing in production
  const isProduction = process.env['NODE_ENV'] === 'production';
  if (isProduction && !OPTIONAL_ENV_VARS.NEXT_PUBLIC_API_BASE) {
    warnings.push('NEXT_PUBLIC_API_BASE not set - API calls will fail');
  }

  // Validate feature flags
  const featureNba = OPTIONAL_ENV_VARS.NEXT_PUBLIC_FEATURE_NBA;
  if (featureNba !== undefined && featureNba !== 'true' && featureNba !== 'false') {
    warnings.push(`NEXT_PUBLIC_FEATURE_NBA should be 'true' or 'false', got: ${featureNba}`);
  }

  const paywall = OPTIONAL_ENV_VARS.NEXT_PUBLIC_PAYWALL;
  if (paywall !== undefined && paywall !== 'true' && paywall !== 'false') {
    warnings.push(`NEXT_PUBLIC_PAYWALL should be 'true' or 'false', got: ${paywall}`);
  }

  // Log warnings
  if (warnings.length > 0) {
    console.warn('[Env Validator] Warnings:', warnings);
  }

  // Log errors
  if (errors.length > 0) {
    console.error('[Env Validator] Errors:', errors);
  }

  return {
    valid: errors.length === 0,
    warnings,
    errors,
  };
}

// Run validation on module load (dev only)
if (typeof window === 'undefined' && process.env['NODE_ENV'] !== 'production') {
  validateEnv();
}
