# Outside-In Diagnostic Section

## Quick Issue Resolution Checklist

When debugging issues, follow this outside-in approach to isolate problems quickly:

### 1. Top-Level (What the User Sees)

- **Yahoo OAuth Flow**: Click "Connect Yahoo" → 302 to Yahoo OAuth → Consent → Callback → Set-Cookie
- **API Endpoints**: `/api/health`, `/api/projections` return 200 with proper headers
- **UI Components**: DebugRequestId chip shows request IDs

### 2. Network Layer

- **Request Type**: Should be `document` (navigation), not `fetch` or `xhr`
- **CORS Errors**: None for Yahoo authorize flow (any CORS messages should be expected Yahoo beacons)
- **Headers**: `x-request-id`, `cache-control`, `access-control-allow-origin` present

### 3. Routing and Domains

- **API Routes**: `/api/yahoo/connect`, `/api/yahoo/callback` exist and respond correctly
- **Middleware**: `/api/yahoo/*` excluded from matcher
- **Navigation**: Use plain `<a>` tags, not `Link` components for OAuth flows

### 4. Environment and Config

- **Environment Variables**: `YAHOO_CLIENT_ID`, `YAHOO_CLIENT_SECRET` set correctly
- **Vercel Config**: `API_BASE`, `NEXT_PUBLIC_API_BASE` point to Workers API
- **Feature Flags**: `NEXT_PUBLIC_YAHOO_CONNECT_ENABLED` controls access

### 5. Edge/Proxy and Cookie Behavior

- **Cookies**: `y_state` (SameSite=lax), `y_at` (HttpOnly, Secure, SameSite=Lax)
- **Proxy Headers**: Forward `x-request-id`, `cache-control`, `Access-Control-Allow-Origin`
- **Access-Control-Expose-Headers**: Include `x-request-id` for client JS access

### 6. Workers API (Backend Health)

- **Health Check**: `/health` returns 200 with `ok`, `ready`, `schema_version`, `last_refresh`
- **Headers**: `cache-control: no-store`, `x-request-id`, `access-control-allow-origin`
- **Projections**: `/projections` returns 200 with proper schema and headers

### 7. Framework and Middleware

- **Next.js Routes**: `app/api/yahoo/(connect|callback|refresh)/route.ts` with `export const dynamic = 'force-dynamic'`
- **Middleware**: Exclude `/api/yahoo/*` from middleware matcher
- **Navigation**: Use browser navigation, not fetch/XHR for OAuth flows

### 8. Security and CSP

- **Yahoo Consent**: Not blocked by extensions or CSP
- **Cookie Security**: All cookies have proper HttpOnly, Secure, SameSite attributes
- **CORS**: Properly configured for cross-origin requests

## Quick Fixes for Common Issues

### CORS Errors with Yahoo OAuth

- **Problem**: "Failed to fetch RSC payload" or CORS errors
- **Fix**: Replace `Link` components with plain `<a>` tags for `/api/yahoo/connect`
- **Check**: Ensure no `fetch('/api/yahoo/connect')` calls in client code

### Missing Headers in Proxy

- **Problem**: `x-request-id` or CORS headers not forwarded
- **Fix**: Update proxy routes to explicitly forward headers from Workers API
- **Check**: Verify `Access-Control-Expose-Headers` includes `x-request-id`

### Middleware Interference

- **Problem**: OAuth flow blocked or redirected
- **Fix**: Ensure `/api/yahoo/*` excluded from middleware matcher
- **Check**: Verify no page components at `/api/yahoo/connect/page.tsx`

### Environment Misconfiguration

- **Problem**: API calls failing or wrong endpoints
- **Fix**: Check `API_BASE` and `NEXT_PUBLIC_API_BASE` in Vercel
- **Check**: Verify Workers API deployment and environment variables

## Acceptance Criteria

### Yahoo OAuth Flow

- ✅ Connect → 302 to Yahoo with correct params
- ✅ Callback → Set-Cookie `y_at` + 302 to `/settings?yahoo=connected`
- ✅ `/api/yahoo/me` → 200 with `y_at` cookie

### Proxy Headers

- ✅ `/api/health` and `/api/projections` → 200 with proper headers
- ✅ Headers include `cache-control`, `x-request-id`, `Access-Control-Allow-Origin`
- ✅ `Access-Control-Expose-Headers` includes `x-request-id`

### System Health

- ✅ No CORS console errors for Yahoo authorize flow
- ✅ Navigation requests show Type = `document` in DevTools
- ✅ All endpoints return expected status codes and headers

## One-Line Fixes

If any check fails, paste the first failing line and you'll get a targeted one-line fix.

**Remember**: Always start with the user-facing symptom and work inward to isolate the root cause.
