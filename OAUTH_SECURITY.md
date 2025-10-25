# OAuth Security - Known Requirements

## Same-Host Only for OAuth Callbacks

OAuth callbacks must be on the same host as the requesting page to ensure proper cookie handling and security.

### Implementation

```typescript
// app/api/yahoo/callback/route.ts
if (parsedReturnTo.startsWith('https://')) {
  console.error('Rejected absolute URL in returnTo:', parsedReturnTo);
  returnTo = '/tools/leagues'; // Safe fallback
}
```

### Security Requirements

- **Same-host only**: OAuth callbacks must be on the same domain
- **HTTPS only**: All OAuth URLs must use HTTPS
- **Secure cookies**: HttpOnly, Secure, SameSite=Lax
- **No open redirects**: Reject absolute URLs in returnTo parameter

## Cookie Security

All OAuth-related cookies must be secure:

```typescript
// Cookie attributes
{
  httpOnly: true,     // Prevent XSS access
  secure: true,       // HTTPS only
  sameSite: 'lax',    // CSRF protection
  maxAge: 86400       // 24 hours
}
```

## Verification

After OAuth connect flow:

```bash
# Should return 200 for same host session
curl -s "https://www.customvenom.com/api/yahoo/me" \
  -H "Cookie: cv_yahoo=session_token" \
  -o /dev/null -w "%{http_code}"
# Expected: 200

# Should return 401 for different host
curl -s "https://other-domain.com/api/yahoo/me" \
  -H "Cookie: cv_yahoo=session_token" \
  -o /dev/null -w "%{http_code}"
# Expected: 401
```

## Environment Variables

Required for OAuth to work:

- `NEXT_PUBLIC_API_BASE` - HTTPS Workers API origin
- `NEXT_PUBLIC_ENABLE_YAHOO` - Enable Yahoo OAuth panel
- `NEXTAUTH_URL` - Frontend URL for OAuth callbacks
- `NEXTAUTH_SECRET` - Secret for NextAuth.js

## OAuth Flow

1. User clicks "Connect Yahoo" on `/settings`
2. Redirects to `/api/yahoo/connect?returnTo=/settings`
3. OAuth consent on Yahoo
4. Callback to `/api/yahoo/callback`
5. Redirect back to `/settings` with session
6. Panel shows "Yahoo Connected" with roster data

## Security Checklist

- ✅ HTTPS-only OAuth URLs
- ✅ Same-host callback validation
- ✅ Secure cookie attributes
- ✅ No open redirect vulnerabilities
- ✅ Proper CORS configuration
- ✅ Session validation on API calls
