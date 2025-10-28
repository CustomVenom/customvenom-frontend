# Yahoo OAuth Smoke Test - Ready

**Date**: 2025-01-21
**Status**: ✅ Workers API live | ⏳ Frontend deploying | ⏳ Manual test pending

---

## Pre-Deployment Checks ✅

### Workers API (`api.customvenom.com`)

- ✅ `/api/yahoo/session` returns `{ hasCookie: false }` (expected without cookie)
- ✅ `/api/yahoo/session/me` returns `404` (expected without auth)
- ✅ `/api/yahoo/signin` endpoint deployed
- ✅ `/api/yahoo/callback` endpoint deployed
- ✅ Cookie handling configured (`SameSite=None`, `Secure`, `HttpOnly`)

### Frontend (`www.customvenom.com`)

- ✅ Route handler type fixed (Next.js 15 compatible)
- ✅ Connect buttons point to Workers API
- ✅ Code pushed to GitHub (commit: `63d5426`)
- ⏳ **Awaiting Vercel build completion**

---

## Manual Testing Steps

### Step 1: Yahoo Developer Console (Required)

1. **Navigate to**: https://developer.yahoo.com/myapps
2. **Select**: CustomVenom app
3. **Set Authorized Redirect URI** to:
   ```
   https://api.customvenom.com/api/yahoo/callback
   ```
4. **Save**
5. **Wait 2-5 minutes** for propagation

---

### Step 2: End-to-End OAuth Flow (Browser)

#### 2.1. Start Flow

1. Open: `https://www.customvenom.com/tools`
2. Click: **"Connect Yahoo"** button
3. **Expected**: Redirect to Yahoo consent screen

#### 2.2. Verify Network Headers

Open **DevTools → Network** tab, filter by `callback`

**On `/api/yahoo/callback` 302 response:**

```http
Set-Cookie: cv_yahoo=eyJ...; Secure; HttpOnly; SameSite=None; Path=/; Max-Age=86400
Location: https://www.customvenom.com/tools?connected=yahoo
```

✅ **Checklist:**

- [ ] `SameSite=None` present
- [ ] `Secure` present
- [ ] `HttpOnly` present
- [ ] `Path=/` present
- [ ] `Max-Age=86400` present

---

### Step 3: Verify Session Cookie (Browser Console)

On `www.customvenom.com`, run:

```javascript
// Test 1: Session cookie check
await fetch('https://api.customvenom.com/api/yahoo/session', {
  credentials: 'include',
}).then((r) => r.json());
// Expected: { hasCookie: true }

// Test 2: User profile
await fetch('https://api.customvenom.com/api/yahoo/session/me', {
  credentials: 'include',
}).then((r) => r.status);
// Expected: 200
```

---

## Acceptance Criteria

- [ ] **One flow only**: Workers API handles all OAuth (no NextAuth)
- [ ] **Redirect URI**: `https://api.customvenom.com/api/yahoo/callback` in Yahoo Console
- [ ] **Scope**: `fspt-r` in request
- [ ] **Cookies**: Set with `SameSite=None`, `Secure`, `HttpOnly`
- [ ] **Endpoints**: `/api/yahoo/session` and `/api/yahoo/session/me` return 200

---

## Expected Flow

```
www → /tools → Click "Connect Yahoo"
    ↓
api.customvenom.com/api/yahoo/signin
    ↓
Yahoo consent (scope: fspt-r)
    ↓
Yahoo → api.customvenom.com/api/yahoo/callback?code=...
    ↓
Workers API: exchange code, set cookie
    ↓
302 → www.customvenom.com/tools?connected=yahoo
    ↓
www loads, calls API with credentials="include"
    ↓
API returns session data
```

---

## Troubleshooting

### Cookie not set

- ✅ Network tab shows `Set-Cookie` header
- ✅ `SameSite=None` requires HTTPS (both domains)
- ✅ Request includes `credentials: "include"`

### 401 on /session endpoints

- Check: Cookie in DevTools → Application → Cookies → `api.customvenom.com`
- Check: Request includes `credentials: "include"`
- Check: Cookie name is `cv_yahoo`

### Redirect URI mismatch

- ✅ Yahoo Console: `https://api.customvenom.com/api/yahoo/callback` (no trailing slash)
- ✅ Wait 2-5 minutes after saving

---

## Commands

### Quick Test (PowerShell)

```powershell
# Check session endpoint
Invoke-RestMethod -Uri "https://api.customvenom.com/api/yahoo/session" | ConvertTo-Json

# Check auth endpoint (should 404 without cookie)
try {
  Invoke-WebRequest -Uri "https://api.customvenom.com/api/yahoo/session/me"
} catch {
  Write-Host "Status: $($_.Exception.Response.StatusCode.value__)"
}
```

### Browser Console Test

```javascript
// After completing OAuth flow
await fetch('https://api.customvenom.com/api/yahoo/session', {
  credentials: 'include',
}).then((r) => r.json());
// Should return: { hasCookie: true, ... }
```

---

## Next Steps

1. **Wait for Vercel** to finish frontend build
2. **Update Yahoo Console** redirect URI
3. **Run manual smoke test** (Steps 2-3 above)
4. **Report results**: Any failing step number

---

## Status Log

- **2025-01-21**: Workers API deployed ✅
- **2025-01-21**: Frontend fix pushed ✅
- **2025-01-21**: Frontend build in progress ⏳
- **2025-01-21**: Yahoo Console pending ⏳
- **2025-01-21**: Manual test pending ⏳
