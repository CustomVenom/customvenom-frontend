# Verification Checklist - PRs 1-3

## Local and Preview Sanity

### Dev Server

```bash
npm run dev
```

- [ ] Browse `/players` - verify projections load
- [ ] Browse `/team` - verify roster loads (if session available)
- [ ] Browse `/tools/start-sit` - verify tool renders

### E2E Tests

```bash
npx playwright test tests/e2e/trust-snapshot.spec.ts tests/e2e/health.spec.ts
```

- [ ] All tests pass

### Preview Deployment

```bash
vercel build && vercel deploy --prebuilt
```

- [ ] Preview URL loads correctly
- [ ] All routes accessible

## API Client Behavior

### Request Deduplication

- [ ] Trigger two identical requests (same URL/options) simultaneously
- [ ] Confirm only one network call appears in DevTools Network tab
- [ ] Both promises resolve with same response

### Abort Cleanup

- [ ] Navigate away mid-request (e.g., start loading `/players`, navigate to `/team`)
- [ ] Check console - no abort errors
- [ ] Check memory - no leaks (use Chrome DevTools Memory profiler)
- [ ] Verify request is cancelled (Network tab shows cancelled status)

## ErrorBoundary

### Error Rendering

- [ ] Temporarily add `throw new Error('Test error')` in a leaf component (e.g., `PlayerRow.tsx`)
- [ ] Verify ErrorBoundary renders error UI
- [ ] Verify error details are in collapsible `<details>` element
- [ ] Remove test error

### Reload Functionality

- [ ] Click "Reload" button in ErrorBoundary
- [ ] Verify page reloads
- [ ] Verify normal UI restored after reload

## React Query Cache Tuning

### Projections Cache (`/players`)

- [ ] Load `/players` page
- [ ] Switch to another tab, wait 5 minutes
- [ ] Switch back - data should be instant (no loading spinner)
- [ ] Verify fewer background refetches (check Network tab)
- [ ] After 5 minutes, data should refetch on focus

### Roster Cache (`/team`)

- [ ] Load `/team` page with roster
- [ ] Switch tabs, wait 2 minutes
- [ ] Switch back - roster should be instant
- [ ] Verify refetch only on explicit action (not on window focus)
- [ ] After 2 minutes, roster should refetch

### Cache Configuration

- [ ] Verify `CACHE.projections.staleTime = 5 * 60 * 1000` (5 minutes)
- [ ] Verify `CACHE.projections.gcTime = 30 * 60 * 1000` (30 minutes)
- [ ] Verify `CACHE.roster.staleTime = 2 * 60 * 1000` (2 minutes)
- [ ] Verify `CACHE.roster.gcTime = 15 * 60 * 1000` (15 minutes)
- [ ] Verify `refetchOnWindowFocus: false` in both hooks
- [ ] Verify `retry: 1` in both hooks

## Deploy Readiness

### Frontend Environment Variables (Vercel)

- [ ] `NEXT_PUBLIC_SITE_URL` - Production domain
- [ ] `NEXTAUTH_URL` - Must match NEXT_PUBLIC_SITE_URL
- [ ] `AUTH_SECRET` or `NEXTAUTH_SECRET` - 32+ character random string
- [ ] `DATABASE_URL` - PostgreSQL connection string (valid format)
- [ ] `NEXT_PUBLIC_API_BASE` - Workers API URL

### Workers Flags (Cloudflare)

- [ ] `FEATURE_TRUST_ENGINE=false` - Keep trust-core disabled
- [ ] `RATE_LIMIT_PERSIST=off` - Disable KV writes for rate limiting
- [ ] `VIOLATION_WRITES=off` - Disable KV writes for violations
- [ ] `METRIC_PUTS=off` - Disable KV writes for metrics
- [ ] `WRITE_SAMPLE=0.01` - Sample writes at 1% if enabled

## Post-Deploy Monitoring

### Cost Metrics

- [ ] Check `/api/admin/usage → cost_metrics` (first hour post-deploy)
- [ ] Verify KV usage stays within budget
- [ ] Verify CPU usage is reasonable

### Health Checks

- [ ] `/api/health` returns 200 with trust headers
- [ ] `/players` shows `x-stale=false` when Workers is healthy
- [ ] TrustSnapshot displays correct schema version and refresh time

### Error Handling

- [ ] No 500 errors in production
- [ ] Fallback only occurs with `x-stale=true` header
- [ ] ErrorBoundary catches any unexpected errors gracefully

## Troubleshooting

If any verification fails:

1. Capture the route URL
2. Capture the request ID (from TrustSnapshot or response headers)
3. Check console/network errors
4. Report with minimal repro steps
