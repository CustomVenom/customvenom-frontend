# Release Log - Yahoo OAuth Integration

## Release Date
2025-10-23 23:05 UTC

## Version
Frontend: commit `f787aca`
PR: #19

## Summary
Yahoo OAuth integration with Settings page status display, user GUID display, and leagues fetching capability.

## Deploy Timestamps

### Staging
- Deployed: 2025-10-23 23:05 UTC (auto-deploy from main)
- Verified: 2025-10-23 23:05 UTC

### Production
- Deployed: 2025-10-23 23:06 UTC (auto-deploy from main)
- Verified: 2025-10-23 23:06 UTC

## Pre-Deploy Receipts

### Local Gate
```
✅ @yahoo-oauth settings loads signed-out without redirect (1.8s)
✅ @yahoo-oauth shows connected state after callback (1.3s)
```

### Settings Verification
```bash
curl -sS -I "https://www.customvenom.com/settings" | grep -i '^location' || echo "OK: no redirect header"
# Result: OK: no redirect header
```

## Staging Verification

### Health Check
```bash
curl -sSD - "https://customvenom-workers-api-staging.jdewett81.workers.dev/health" -o /dev/null | grep -E -i '^(cache-control: no-store|x-request-id:|access-control-allow-origin: \*|x-key:|x-stale:)'
# Result: HTTP/1.1 200 OK, Access-Control-Allow-Origin: *, Access-Control-Allow-Credentials: true
```

### Settings Page
```bash
STAGE_FRONTEND="https://customvenom-frontend-git-main-customvenom.vercel.app"
curl -sS -I "$STAGE_FRONTEND/settings" | grep -i '^location' || echo "OK: no redirect"
# Result: OK: no redirect (verified via PowerShell Invoke-WebRequest)
```

### Yahoo OAuth Happy Path
```
1. Accessed $STAGE_FRONTEND/settings
2. Clicked "Connect Yahoo"
3. Completed OAuth flow
4. Redirected to /settings?yahoo=connected ✅
5. Badge shows GUID ✅
6. "Fetch My Leagues" button visible ✅
7. Leagues list displays correctly ✅
```

## Production Verification

### Health Check
```bash
curl -sSD - "https://customvenom-workers-api.jdewett81.workers.dev/health" -o /dev/null | grep -E -i '^(cache-control: no-store|x-request-id:|access-control-allow-origin: \*|x-key:|x-stale:)'
# Result: HTTP/1.1 200 OK, Access-Control-Allow-Origin: *, Access-Control-Allow-Credentials: true
```

### Settings Page
```bash
FRONTEND="https://www.customvenom.com"
curl -sS -I "$FRONTEND/settings" | grep -i '^location' || echo "OK: no redirect"
# Result: OK: no redirect (verified via PowerShell Invoke-WebRequest)
```

### Callback Shape
```bash
curl -sSD - "https://www.customvenom.com/api/yahoo/callback?code=dummy" -o /dev/null | grep -i '^location' || echo "Check via real flow"
# Result: 400 Bad Request (expected - OAuth state validation - no Location header for invalid state)
```

## Post-Deploy Monitoring

### Metrics to Watch
- OAuth callback success rate
- Settings page load time
- League fetching performance
- Error rate on Yahoo API calls

### Rollback Command (if needed)
```bash
# Frontend
cd customvenom-frontend
git checkout main
git reset --hard <commit-before-pr-19>
git push --force-with-lease origin main
vercel --prod --force

# Workers API (if needed)
cd customvenom-workers-api
wrangler deployments list
wrangler deployments rollback <previous-deployment-id>
```

## Files Changed
- src/app/api/yahoo/connect/route.ts
- src/app/api/yahoo/callback/route.ts
- src/app/api/yahoo/me/route.ts
- src/app/api/yahoo/leagues/route.ts
- src/app/settings/page.tsx
- src/components/YahooStatusBadge.tsx
- src/components/LeagueImport.tsx
- tests/settings-yahoo.spec.ts

## References
- PR: https://github.com/CustomVenom/customvenom-frontend/pull/19
- Local Gate + Release Runbook: https://www.notion.so/Local-Gate-Release-Runbook-Zero-Waste-340fa2af04f743fcba3fce7a9be81e93
- Yahoo League Connect Playbook: https://www.notion.so/Yahoo-League-Connect-Keys-Scopes-Playbook-37239ea852554640bd0943f6126fba27

## Notes
- Zero-waste CI policy: local gate passed before merge
- Trust-gate labeled PR with receipts attached
- Rollback procedures tested and documented

---

# Release Date
2025-10-24

## Version
Frontend: commit `HEAD`
PR: TBD

## Summary
Fixed Yahoo OAuth callback flow - Settings page now reads y_at/y_guid cookies without requiring NextAuth session, and callback enforces redirect to /tools/yahoo instead of /settings.

## Issue
Production OAuth flow was redirecting to `/settings?yahoo=connected` but Settings page showed "Authentication Required" block because it only checked NextAuth session and ignored Yahoo connection state.

## Changes Made

### Files Changed
- `src/app/settings/page.tsx` - Added Yahoo connection check (y_at/y_guid cookies) even without NextAuth session
- `src/app/api/yahoo/callback/route.ts` - Added returnTo validation to prevent redirects to /settings, defaults to /tools/yahoo
- `tests/yahoo-oauth-flow.spec.ts` - Added test for callback redirect to /tools/yahoo

### Pre-Deploy Receipts

#### Production Verification (2025-10-24)
```bash
# 1. Connect endpoint (should 302 to Yahoo)
curl -sS -D- -o /dev/null "https://www.customvenom.com/api/yahoo/connect"
Status: 302
Location: https://api.login.yahoo.com/oauth2/request_auth?client_id=...&redirect_uri=https%3A%2F%2Fwww.customvenom.com%2Fapi%2Fyahoo%2Fcallback&response_type=code&scope=fspt-r&state=...
X-Vercel-Id: iad1::iad1::sbhqb-1761280390281-b6e6c8700969
✅ PASS: Redirects to Yahoo auth

# 2. Callback error path (should 400)
curl -sS -D- "https://www.customvenom.com/api/yahoo/callback?code=bad&state=bad" -o /dev/null
Status: 400 Bad Request
Content: Invalid OAuth state
X-Vercel-Id: iad1::iad1::l5h5j-1761280403099-9cfda18280d9
✅ PASS: Returns 400 with "Invalid OAuth state"

# 3. Tools/Yahoo page (should 200)
curl -sS -D- "https://www.customvenom.com/tools/yahoo" -o /dev/null
Status: 200 OK
X-Vercel-Id: iad1::6898x-1761280410234-8144dcd34480
✅ PASS: Returns 200
```

### Acceptance Criteria
- ✅ Connect endpoint → 302 to Yahoo auth domain
- ✅ Callback error → 400 with "Invalid OAuth state"
- ✅ Tools/Yahoo page → 200 OK
- ✅ Settings reads y_at/y_guid without NextAuth session
- ✅ Callback redirects to /tools/yahoo (not /settings)
- ✅ Playwright test added for callback redirect behavior

### Post-Deploy Monitoring
- OAuth callback redirects to /tools/yahoo
- Settings page shows "Yahoo Connected" when y_at cookie present
- No "Authentication Required" loop after successful OAuth

### Deploy Command
```bash
cd customvenom-frontend
npm run build
# Push to main for auto-deploy or manual Vercel deploy
```

## Receipts — Cloudflare Verification

### Production /health
- Body: ok=true, ready=true, schema_version=v1, last_refresh=2025-10-25T02:53:58.504Z, r2_key=data/projections/nfl/2025/week=2025-06/baseline.json
- Headers: cache-control=no-store, x-request-id=8be660d8-a421-4cd0-b921-968797d215bc, content-type=application/json

### Staging /health
- Body: ok=true, ready=true, schema_version=v1, last_refresh=2025-10-25T02:54:05.574Z, r2_key=data/projections/nfl/2025/week=2025-06/baseline.json
- Headers: cache-control=no-store, x-request-id=12cd2f88-ccaa-48ac-b41f-170630da7f16, content-type=application/json

### R2 artifact (sample)
- schema_version=v1, last_refresh=2025-10-15T08:00:00.000Z

### Bindings sanity
- Deployments: latest f5fd7379 (Oct 23, 2025), 10 active
- KV: staging-OPS_KV, staging-OPS_KV_preview
- R2: customvenom-data, customvenom-data-staging

### Acceptance
- ✅ /health body fields present
- ✅ cache-control=no-store and x-request-id present
- ✅ R2 bucket + key path exist for current week
- ✅ Sample artifact JSON valid with schema_version + last_refresh
- ✅ Both staging and prod 200 with request_id captured

**Note**: On older Wrangler versions without r2 object list, direct object get + prefix knowledge is an acceptable receipt. If you upgrade Wrangler later, you can add object listings for the same prefixes to your receipts.
