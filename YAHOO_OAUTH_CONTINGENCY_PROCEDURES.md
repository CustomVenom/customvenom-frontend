# Yahoo OAuth Contingency Procedures

## Recovery Drill (Quarterly)

### Purpose

Verify that Yahoo OAuth state reset behaves correctly after app access revocation.

### Procedure

1. **Revoke App Access**
   - Go to Yahoo Account Settings → Connected Apps
   - Find "Custom Venom" and click "Revoke Access"
   - Confirm access is revoked

2. **Test End-to-End Reconnection**
   - Visit `https://www.customvenom.com/settings`
   - Click "Connect Yahoo"
   - Complete full OAuth consent flow
   - Verify "Yahoo Connected" state with leagues list
   - Check that roster data loads correctly

3. **Verification Checklist**
   - [ ] Yahoo consent screen appears (not cached)
   - [ ] Consent grants `fspt-r` scope
   - [ ] Callback redirects to `https://www.customvenom.com/api/auth/callback/yahoo`
   - [ ] Settings page shows "Yahoo Connected" with league name
   - [ ] Leagues API returns data with `schema_version` and `last_refresh`
   - [ ] Roster table displays player data

### Expected Behavior

- Clean OAuth flow without cached tokens
- Full consent screen (not "already connected")
- Successful callback processing
- Connected state with data display

---

## Secret Hygiene (Quarterly)

### Purpose

Rotate `YAHOO_CLIENT_SECRET` to maintain security without breaking the OAuth flow.

### Pre-Rotation Checklist

- [ ] Document current secret (for rollback if needed)
- [ ] Ensure all environments have same `YAHOO_CLIENT_ID`
- [ ] Verify current flow passes smoke tests

### Rotation Procedure

#### 1. Update Yahoo Developer Console

- Go to Yahoo Developer Console → App Settings
- Generate new `YAHOO_CLIENT_SECRET`
- **DO NOT** change `YAHOO_CLIENT_ID`
- Update redirect URI if needed: `https://www.customvenom.com/api/auth/callback/yahoo`
- Save changes and wait 2-3 minutes for propagation

#### 2. Update Environment Variables

**Vercel Production:**

```bash
# Update in Vercel dashboard
YAHOO_CLIENT_SECRET=<new-secret>
```

**Workers API (Cloudflare):**

```bash
# Update via Wrangler
npx wrangler secret put YAHOO_CLIENT_SECRET --env production
# Enter new secret when prompted
```

#### 3. Immediate Verification

**Smoke Tests (run within 5 minutes of rotation):**

```bash
# API health check
curl -sSD - "https://api.customvenom.com/health" | grep -Ei '^(cache-control:|x-request-id:)'

# Connect endpoint check
curl -i "https://api.customvenom.com/api/yahoo/connect" | grep -i ^Location

# Full OAuth flow test
# 1. Visit https://www.customvenom.com/settings
# 2. Click "Connect Yahoo"
# 3. Complete consent
# 4. Verify callback success
# 5. Check connected state
```

#### 4. Post-Rotation Verification

- [ ] Workers API `/api/yahoo/connect` returns 302 redirect
- [ ] Yahoo authorize URL contains correct `client_id` and `redirect_uri`
- [ ] OAuth consent screen appears (not error)
- [ ] Consent grants `fspt-r` scope
- [ ] Callback processes successfully
- [ ] Settings shows "Yahoo Connected" with data

### Rollback Procedure (if needed)

```bash
# Revert to previous secret in both:
# 1. Yahoo Developer Console
# 2. Vercel environment variables
# 3. Cloudflare Workers secrets
```

---

## Troubleshooting Guide

### If Weekly Drift Watch Fails

#### 1. Check `/api/auth/error` Code

Visit `https://www.customvenom.com/api/auth/error` and note the error code:

- `OAuthSignin` - Provider configuration issue
- `OAuthCallback` - Callback URL mismatch
- `CSRF` - State parameter issue
- `Configuration` - Environment variable problem

#### 2. Capture Yahoo Authorize URL

Open DevTools → Network → Click "Connect Yahoo" → Copy the full authorize URL

#### 3. Common Issues & Fixes

**Issue: `OAuthCallback` error**

- **Cause**: Redirect URI mismatch
- **Fix**: Ensure Yahoo Console has exactly `https://www.customvenom.com/api/auth/callback/yahoo`
- **Verify**: Workers API redirect_uri matches exactly

**Issue: `OAuthSignin` error**

- **Cause**: Client ID/Secret mismatch
- **Fix**: Verify `YAHOO_CLIENT_ID` and `YAHOO_CLIENT_SECRET` match Yahoo Console
- **Check**: Both Vercel and Workers API have same credentials

**Issue: `CSRF` error**

- **Cause**: State parameter corruption
- **Fix**: Clear browser cookies and retry
- **Check**: Workers API state generation is working

**Issue: `Configuration` error**

- **Cause**: Missing environment variables
- **Fix**: Verify `NEXTAUTH_URL=https://www.customvenom.com` (no trailing slash)
- **Check**: All required env vars are set in both Vercel and Workers API

#### 4. Emergency Contacts

- **Yahoo OAuth Issues**: Check Yahoo Developer Console status
- **Vercel Issues**: Check Vercel deployment logs
- **Workers API Issues**: Check Cloudflare Workers logs

### Debug Commands

```bash
# Check environment variables
echo $NEXTAUTH_URL
echo $YAHOO_CLIENT_ID

# Test Workers API
curl -v "https://api.customvenom.com/api/yahoo/connect"

# Test frontend callback
curl -v "https://www.customvenom.com/api/auth/callback/yahoo?code=test"
```

---

## Success Criteria

### Recovery Drill Success

- [ ] Clean OAuth flow from start to finish
- [ ] No cached tokens or "already connected" states
- [ ] Full consent screen with correct scope
- [ ] Successful callback and connected state
- [ ] Data display (leagues, roster) working

### Secret Rotation Success

- [ ] New secret works within 5 minutes
- [ ] All smoke tests pass
- [ ] OAuth flow completes end-to-end
- [ ] No user-facing errors
- [ ] Connected state displays correctly

### Weekly Drift Watch Success

- [ ] All URLs aligned to `https://www.customvenom.com`
- [ ] No `customvenom.com` (without www) references
- [ ] Workers API redirect URI and scope correct
- [ ] Frontend Connect buttons point to correct endpoints
- [ ] NextAuth callback route accessible

---

## Emergency Response

### If OAuth Completely Broken

1. **Immediate**: Check Yahoo Developer Console for app status
2. **Verify**: All environment variables are set correctly
3. **Test**: Manual OAuth flow from start to finish
4. **Rollback**: If needed, revert to previous working configuration
5. **Document**: Record exact error messages and steps to reproduce

### If Users Can't Connect

1. **Check**: Yahoo Developer Console app status
2. **Verify**: Redirect URI matches exactly
3. **Test**: OAuth flow with fresh browser session
4. **Monitor**: Error rates in application logs
5. **Communicate**: Update users if extended downtime expected
