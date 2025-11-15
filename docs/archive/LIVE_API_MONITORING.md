# Live API Monitoring Checklist

## Current Status

### ✅ System Health

- **Workers /health**: ✅ 200 OK, KV bypassed (0/1000 usage)
- **Frontend proxy**: ✅ Working, graceful fallback active
- **KV guardrails**: ✅ Enforced (no 500s, proper stale handling)
- **UI polish**: ✅ Schema formatting, chip confidence display working

### ⏳ Pending Live Data

- **Workers /api/projections**: Currently unavailable (fallback active)
- **x-stale**: `true` (expected during fallback)
- **Schema version**: `v2.1` (from mock fallback)

## Monitoring Checklist

### When Workers API Becomes Available

1. **Check Network Tab** (`/players` page)
   - Look for requests to `https://api.customvenom.com/api/projections`
   - Verify response headers:
     - `x-stale: false` (not `true`)
     - `x-schema-version: v2.x` (real schema, not mock)
     - `x-last-refresh: <recent ISO timestamp>`
     - `x-request-id: <Workers request ID>`

2. **Verify TrustSnapshot**
   - Should show live schema version (e.g., "v2.1")
   - Should show recent refresh time (e.g., "Updated 2m ago")
   - Should NOT show "stale" badge

3. **Verify Data**
   - Table should populate with live player data
   - Chips should display correctly (delta or confidence)
   - No console errors

### If Issues Occur

**If x-stale=true from Workers (not mock):**

- Capture `x-request-id` from response headers
- Check Workers logs for that request ID
- Report: Route URL + Request ID + Error snippet

**If CORS errors persist:**

- Verify dev server restarted after CORS changes
- Check `/api/session/selection` OPTIONS handler
- Verify headers include `Access-Control-Allow-Origin: http://localhost:3000`

**If proxy returns 500:**

- This should NEVER happen (guardrails enforce fallback)
- Capture full error + request ID
- Check proxy route error handling

## Quick Test Commands

```bash
# Test Workers health
curl https://api.customvenom.com/health

# Test frontend proxy
curl "http://localhost:3000/api/projections?week=2025-11&sport=nfl" -v

# Test CORS (OPTIONS)
curl -X OPTIONS "http://localhost:3000/api/session/selection" -v
```

## Success Criteria

✅ **Live data confirmed when:**

- `x-stale=false` in response headers
- Schema version matches Workers (v2.x)
- TrustSnapshot shows real refresh time
- No "stale" badge visible
- Data renders correctly in UI

## Current Configuration

- **NEXT_PUBLIC_API_BASE**: `https://api.customvenom.com`
- **Fallback behavior**: Mock data with `x-stale=true`
- **KV guardrails**: Active (no 500s, proper fallback)
