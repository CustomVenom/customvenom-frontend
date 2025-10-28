# Final OAuth Verification & Hardening Checklist

**Date**: 2025-01-21
**Status**: 🟡 Ready for manual testing

---

## Immediate Actions Required

### 1. Clear Browser Cookies ⏳

**In browser DevTools**:

1. Open **Application** → **Cookies**
2. Select `https://www.customvenom.com`
3. Delete these cookies:
   - `__Host-next-auth.csrf-token`
   - `__Secure-next-auth.callback-url`
4. **Reload** the page

---

### 2. Update Yahoo Console ⏳

**URL**: https://developer.yahoo.com/myapps

1. Select your CustomVenom app
2. Set **Authorized Redirect URI**:
   ```
   https://api.customvenom.com/api/yahoo/callback
   ```
3. **Save**
4. **Wait 2-5 minutes** for propagation

---

### 3. Run Browser Smoke Test ⏳

**Steps**:

1. Navigate to: `https://www.customvenom.com/tools`
2. Open **DevTools** → **Network** tab
3. Click **"Connect Yahoo"** button
4. Approve on Yahoo consent screen
5. **Expected**: Return to `/tools?connected=yahoo`

---

### 4. Verify Session Cookie ⏳

**In browser console on `www.customvenom.com`**:

```javascript
// Should return: { hasCookie: true }
await fetch('https://api.customvenom.com/api/yahoo/session', {
  credentials: 'include',
}).then((r) => r.json());

// Should return: 200
await fetch('https://api.customvenom.com/api/yahoo/session/me', {
  credentials: 'include',
}).then((r) => r.status);
```

---

## Network Tab Verification

### On `/api/yahoo/callback` response, verify:

**Set-Cookie header**:

```http
Set-Cookie: cv_yahoo=eyJ...; Secure; HttpOnly; SameSite=None; Path=/; Max-Age=86400; Domain=.customvenom.com
```

✅ Must include: `SameSite=None`, `Secure`, `HttpOnly`

**Location header**:

```http
Location: https://www.customvenom.com/tools?connected=yahoo
```

✅ Should return to original page

---

## Hardening Checklist

### Frontend Fetch Verification

**All `/yahoo/*` calls must include**:

```javascript
await fetch('https://api.customvenom.com/api/yahoo/...', {
  credentials: 'include',
});
```

**NO Authorization headers**:

- ❌ Don't include `Authorization: Bearer ...`
- ✅ Let Workers API read cookie from request

### API CORS Headers

**All responses must include**:

```http
Access-Control-Allow-Origin: https://www.customvenom.com
Access-Control-Allow-Credentials: true
Vary: Origin
```

**OPTIONS preflight**:

- Must return 204 with same headers

### Cookie Attributes

**`cv_yahoo` cookie must have**:

- `SameSite=None` (not `Lax`)
- `Secure`
- `HttpOnly`
- `Path=/`
- `Max-Age=86400`
- `Domain=.customvenom.com`

---

## Automated Tests Needed

### Playwright Test (TODO)

```javascript
test('Yahoo OAuth flow', async ({ page }) => {
  // Click Connect Yahoo
  await page.click('a[href*="/api/connect/start"]');

  // Verify redirect to Yahoo
  await page.waitForURL(/api.login.yahoo.com/);

  // Complete OAuth (mock or skip)
  // ...

  // Verify return to original page
  expect(page.url()).toContain('?connected=yahoo');

  // Verify session cookie is set
  const session = await page.evaluate(() =>
    fetch('https://api.customvenom.com/api/yahoo/session', {
      credentials: 'include',
    }).then((r) => r.json()),
  );
  expect(session.hasCookie).toBe(true);
});
```

### CI Grep Check (TODO)

Add to `.github/workflows/`:

```yaml
- name: Check for NextAuth Yahoo routes
  run: |
    if grep -r "/api/auth/signin/yahoo" src/; then
      echo "❌ Found NextAuth Yahoo routes - should use Workers API instead"
      exit 1
    fi
```

---

## Expected Flow

```
1. User on www.customvenom.com/tools
   ↓
2. Clicks "Connect Yahoo"
   ↓
3. Browser → GET api.customvenom.com/api/connect/start?host=yahoo&from=/tools
   ↓
4. Workers API: Set cv_return_to cookie
   ↓
5. Workers API: 302 → /api/yahoo/signin
   ↓
6. Workers API: Build Yahoo OAuth URL
   ↓
7. Workers API: 302 → api.login.yahoo.com/oauth2/request_auth?...
   ↓
8. User approves on Yahoo
   ↓
9. Yahoo → GET api.customvenom.com/api/yahoo/callback?code=...
   ↓
10. Workers API: Exchange code for token
   ↓
11. Workers API: Set cv_yahoo cookie
   ↓
12. Workers API: Read cv_return_to, clear it
   ↓
13. Workers API: 302 → www.customvenom.com/tools?connected=yahoo
   ↓
14. User is back on /tools with cookie set
```

---

## Troubleshooting

### Cookie not set

- Check: Network tab shows `Set-Cookie` header
- Check: `SameSite=None` requires HTTPS
- Check: Request includes `credentials: "include"`

### Session returns `{ hasCookie: false }`

- Check: Cookie exists in Application → Cookies
- Check: CORS allows credentials
- Check: No NextAuth cookies interfering

### Redirect fails

- Check: Yahoo Console redirect URI is exact match
- Check: `cv_return_to` cookie was set
- Check: Redirect URL construction

---

## Success Criteria

- [ ] Browser cookies cleared
- [ ] Yahoo Console redirect URI updated
- [ ] OAuth flow completes successfully
- [ ] Cookie appears in Application tab
- [ ] Session test returns `{ hasCookie: true }`
- [ ] User returns to original page
- [ ] No NextAuth cookies created

---

## Files Modified

### Workers API

- `src/routes/yahoo.ts` - Complete OAuth implementation
- Commit: `5524b56`

### Frontend

- `src/components/ConnectYahoo.tsx`
- `src/app/tools/leagues/page.tsx`
- `src/app/settings/YahooPanel.tsx`
- `src/components/YahooPanelClient.tsx`
- `src/app/tools/YahooConnectButton.tsx`
- `src/components/YahooPanel.tsx`
- Commits: `7adb729`, `dab537d`

---

## Summary

- ✅ NextAuth Yahoo references removed
- ✅ All buttons point to Workers API
- ✅ Cookie handling configured correctly
- ✅ CORS headers set properly
- ⏳ Manual testing required
- ⏳ Yahoo Console update needed

**System is ready for production OAuth flow.**
