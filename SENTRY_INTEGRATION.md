# Sentry Integration - Frontend

## Overview
Minimal, off-by-default Sentry stub implementation for Next.js frontend. No events will be sent until DSNs are configured and sampling rates are increased.

## What Was Added

### 1. Package Dependencies
- Added `@sentry/nextjs` (v8.0.0) to `package.json`

### 2. Configuration Files
- **`sentry.client.config.ts`** - Client-side Sentry configuration
  - Uses `NEXT_PUBLIC_SENTRY_DSN` environment variable
  - `tracesSampleRate: 0.0` (off by default)
  - `replaysSessionSampleRate: 0.0` (off by default)
  - Only enabled when DSN is present

- **`sentry.server.config.ts`** - Server-side Sentry configuration
  - Uses `SENTRY_DSN` environment variable
  - `tracesSampleRate: 0.0` (off by default)
  - Only enabled when DSN is present

### 3. Integration
- Updated `src/app/layout.tsx` to import both Sentry configs at the top

### 4. Environment Variables (to be added to .env)
```
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=
```

## Acceptance Criteria

- [ ] **No Events Sent by Default**
  - Run `npm run dev` without DSN configured
  - Verify no Sentry events are sent (check network tab)
  - Trigger an error and confirm no Sentry traffic

- [ ] **Build Succeeds**
  - Run `npm install` to install new dependencies
  - Run `npm run build` successfully
  - Verify no build errors related to Sentry

- [ ] **Type Safety**
  - No TypeScript errors in Sentry config files
  - No TypeScript errors in layout.tsx

- [ ] **Environment Variables Ready**
  - Environment variables documented
  - Empty by default (safe to merge)

## How to Enable (Future)

1. **Add DSNs to environment:**
   ```
   SENTRY_DSN=https://[YOUR_DSN]@sentry.io/[PROJECT]
   NEXT_PUBLIC_SENTRY_DSN=https://[YOUR_DSN]@sentry.io/[PROJECT]
   ```

2. **Increase sampling rates** in config files:
   ```typescript
   tracesSampleRate: 0.05,  // Start with 5% on staging
   replaysSessionSampleRate: 0.05,
   ```

3. **Test on staging first** before production

4. **Monitor event volume** and adjust sampling rates accordingly

## Deployment Notes

- Safe to deploy to production immediately (no events sent)
- DSNs can be added later via Vercel environment variables
- Consider injecting `COMMIT_SHA` in CI/CD for release tracking

## PR Body Suggestion

```
Add Sentry stubs (frontend) - off by default

- ✅ No events emitted without DSNs
- ✅ Sampling set to 0.0
- ✅ Safe to merge
- ✅ Ready for future enablement when needed
```

