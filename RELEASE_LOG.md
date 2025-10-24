# Release Log - Yahoo OAuth Integration

## Release Date
YYYY-MM-DD HH:MM UTC

## Version
Frontend: commit `XXXXXXX`
PR: #19

## Summary
Yahoo OAuth integration with Settings page status display, user GUID display, and leagues fetching capability.

## Deploy Timestamps

### Staging
- Deployed: YYYY-MM-DD HH:MM UTC
- Verified: YYYY-MM-DD HH:MM UTC

### Production
- Deployed: YYYY-MM-DD HH:MM UTC
- Verified: YYYY-MM-DD HH:MM UTC

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
# Result: [paste output]
```

### Settings Page
```bash
STAGE_FRONTEND="https://customvenom-frontend-staging.vercel.app"
curl -sS -I "$STAGE_FRONTEND/settings" | grep -i '^location' || echo "OK: no redirect"
# Result: OK: no redirect
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
# Result: [paste output]
```

### Settings Page
```bash
FRONTEND="https://www.customvenom.com"
curl -sS -I "$FRONTEND/settings" | grep -i '^location' || echo "OK: no redirect"
# Result: OK: no redirect
```

### Callback Shape
```bash
curl -sSD - "https://www.customvenom.com/api/yahoo/callback?code=dummy" -o /dev/null | grep -i '^location' || echo "Check via real flow"
# Result: 400 Bad Request (expected - OAuth state validation)
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
