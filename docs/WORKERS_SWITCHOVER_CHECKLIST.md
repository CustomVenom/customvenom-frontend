# Workers API Switchover Checklist

## Pre-Switchover Status ✅

- ✅ TrustSnapshot schema formatting fixed (`v2.1` display)
- ✅ Explanation chips show confidence when no delta
- ✅ CORS headers added to `/api/session/selection`
- ✅ Mock fallback functioning with proper trust headers
- ✅ API proxy routes hardened with graceful fallback

## When Workers API is Available

### Frontend Setup

1. **Environment Configuration**
   - Ensure `.env.local` has: `NEXT_PUBLIC_API_BASE=https://api.customvenom.com`
   - Restart dev server: `npm run dev`

2. **Verification on `/players`**
   - Open DevTools → Network tab
   - Verify requests go to `https://api.customvenom.com/api/projections`
   - Check response headers:
     - `x-schema-version`: Should be `v2.1` (or current version)
     - `x-last-refresh`: Should be recent ISO timestamp
     - `x-request-id`: Should be present
     - `x-stale`: Should be `false` (only `true` during fallback)

3. **UI Verification**
   - TrustSnapshot displays:
     - Schema version: `v2.1` (not `vv1.0.0`)
     - Last refresh: Recent time (e.g., "Updated 2m ago")
     - No "stale" badge (unless upstream is actually stale)
   - Table renders with live player data
   - Chips display correctly (delta or confidence)

### Workers API Health Check

1. **Health Endpoint**
   - `GET /health` → Should return `200 OK`
   - Trust headers present (bypass KV confirmed)
   - Response: `{ ok: true, ready: true }`

2. **Error Handling**
   - If any endpoint returns `500`:
     - Proxy should return stale mock + `x-stale=true`
     - Log `requestId` for debugging
     - Never return `500` to frontend

## If Issues Occur

### Capture These Details

1. **Route URL**: The failing endpoint (e.g., `/api/projections?week=2025-11&sport=nfl`)
2. **Console/Network Error**: Full error message from browser console or network tab
3. **Request ID**: From response headers (`x-request-id`) or TrustSnapshot

### Common Issues & Quick Fixes

**Issue**: `x-stale=true` but Workers is up

- **Check**: Week parameter matches live artifact week
- **Fix**: Adjust `selectedWeek` in store or query params

**Issue**: CORS errors

- **Check**: `NEXT_PUBLIC_SITE_URL` matches origin
- **Fix**: Update CORS headers in proxy route

**Issue**: TrustSnapshot shows wrong schema version

- **Check**: Response header `x-schema-version`
- **Fix**: Verify `formatSchema()` is being called

**Issue**: Chips show `0.0%` instead of confidence

- **Check**: Explanation text contains numeric delta
- **Fix**: Verify `hasDelta` flag is set correctly

## Quick Test Commands

```bash
# Test API endpoint directly
curl -v "http://localhost:3000/api/projections?week=2025-11&sport=nfl"

# Check trust headers
curl -I "http://localhost:3000/api/projections?week=2025-11&sport=nfl" | grep -i "x-"

# Test Workers health (when available)
curl "https://api.customvenom.com/health"
```

## Success Criteria

- ✅ Network requests hit Workers API
- ✅ TrustSnapshot shows real schema version and refresh time
- ✅ `x-stale=false` on successful responses
- ✅ No CORS errors
- ✅ Data renders correctly in UI
- ✅ Chips display delta or confidence appropriately
