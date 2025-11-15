# Yahoo OAuth Smoke Test

**Date**: 2025-01-21
**Purpose**: Verify Workers-only OAuth flow with cross-site cookies

---

## Prerequisites

1. ✅ Workers API deployed (`https://api.customvenom.com`)
2. ✅ Frontend deployed (`https://www.customvenom.com`)
3. ✅ Vercel build complete

---

## Step 1: Yahoo Developer Console

1. Navigate to: https://developer.yahoo.com/myapps
2. Select your CustomVenom app
3. Set **Authorized Redirect URI** to:
   ```
   https://api.customvenom.com/api/yahoo/callback
   ```
4. **Save**
5. **Wait 2-5 minutes** for propagation

**Status**: [ ] Done (user must complete)

---

## Step 2: End-to-End OAuth Flow

### 2.1. Start OAuth Flow

1. Navigate to: `https://www.customvenom.com/tools`
2. Click **"Connect Yahoo"** button
3. **Expected**: Redirect to Yahoo consent screen

### 2.2. Check Browser Network Tab

Open DevTools → **Network** tab, filter by `callback`

**On `/api/yahoo/callback` 302 response, verify:**

```http
Set-Cookie: cv_yahoo=eyJhY2Nlc3NfdG9rZW4iOiI...;
            Secure;
            HttpOnly;
            SameSite=None;
            Path=/;
            Max-Age=86400

Location: https://www.customvenom.com/tools?connected=yahoo
```

✅ **Check**: `SameSite=None`, `Secure`, `HttpOnly` present
✅ **Check**: `Path=/`, `Max-Age=86400` present

---

## Step 3: Verify Session Cookie

### 3.1. Test Session Endpoint

In browser console on `www.customvenom.com`, run:

```javascript
// Should return { hasCookie: true }
await fetch('https://api.customvenom.com/api/yahoo/session', {
  credentials: 'include',
}).then((r) => r.json());
```

**Expected**: `{ hasCookie: true }`

### 3.2. Test User Profile Endpoint

```javascript
// Should return HTTP 200
await fetch('https://api.customvenom.com/api/yahoo/session/me', {
  credentials: 'include',
}).then((r) => r.status);
```

**Expected**: `200`

---

## Step 4: Full Acceptance Criteria

✅ **One flow only**: Workers API handles all OAuth
✅ **Redirect URI**: `https://api.customvenom.com/api/yahoo/callback`
✅ **Scope**: `fspt-r`
✅ **Cookies**: Present with `SameSite=None`, `Secure`
✅ **Endpoints**: `/api/yahoo/session` and `/api/yahoo/session/me` return 200

---

## Expected Request Flow

```
1. User clicks "Connect Yahoo" on www
   ↓
2. Browser → https://api.customvenom.com/api/yahoo/signin
   ↓
3. Workers API redirects to Yahoo with state
   ↓
4. User consents on Yahoo
   ↓
5. Yahoo → https://api.customvenom.com/api/yahoo/callback?code=...
   ↓
6. Workers API exchanges code for token
   ↓
7. Workers API sets cookie, redirects to www/tools?connected=yahoo
   ↓
8. www loads, calls API with credentials="include"
   ↓
9. API reads cookie, returns session data
```

---

## Troubleshooting

### Issue: Cookie not set

- **Check**: Network tab shows `Set-Cookie` header
- **Check**: `SameSite=None` requires HTTPS
- **Check**: Cross-site request includes `credentials: "include"`

### Issue: 401 on /session endpoints

- **Check**: Cookie present in Application → Cookies → `api.customvenom.com`
- **Check**: Cookie includes `cv_yahoo=` value
- **Check**: Request includes `credentials: "include"`

### Issue: Redirect URI mismatch

- **Check**: Yahoo Console has exact match (no trailing slash)
- **Check**: Wait 2-5 minutes after saving

---

## Results

- **Step 1 (Yahoo Console)**: [ ] Done
- **Step 2 (OAuth Flow)**: [ ] Pass / [ ] Fail
- **Step 3 (Session Verify)**: [ ] Pass / [ ] Fail
- **Overall**: [ ] Pass / [ ] Fail

**Notes**: _[Record any issues here]_
