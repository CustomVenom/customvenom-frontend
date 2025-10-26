# Yahoo OAuth Deployment Fix

## Vercel Environment Variable

**Required:** Set `NEXTAUTH_URL=https://www.customvenom.com` in Vercel production environment.

### Steps:
1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Set: `NEXTAUTH_URL=https://www.customvenom.com` (no trailing slash)
3. **Redeploy frontend** after saving

### Verification:
- Check that `NEXTAUTH_URL` is set correctly in Vercel
- Redeploy the frontend to apply the environment variable
- Test the OAuth flow after deployment

## Yahoo Developer Console

**Required:** Set Authorized Redirect URI to exactly:
`https://www.customvenom.com/api/auth/callback/yahoo`

### Steps:
1. Go to Yahoo Developer Console
2. Select your CustomVenom app
3. Set Authorized Redirect URI: `https://www.customvenom.com/api/auth/callback/yahoo`
4. Save and wait 2-3 minutes for propagation

## Quick Verification (60 seconds)

### 1. Check Providers
Visit: `https://www.customvenom.com/api/auth/providers`
- Must list "yahoo" only
- No Google provider should appear

### 2. Check Authorize Params
1. Go to `/tools`
2. Click "Connect Yahoo"
3. Open DevTools → Network
4. Look for `request_auth` request
5. Verify parameters:
   - `redirect_uri=https://www.customvenom.com/api/auth/callback/yahoo`
   - `scope=fspt-r`
   - `client_id` matches your Yahoo app

### Expected Result
Click Connect on `/tools` → Yahoo consent → back to `/tools` showing "Yahoo Connected"

## If Error Persists

If you still get `error=undefined` at `/api/auth/error` after the above fixes:

**Root Cause:** The authorize URL's `client_id` doesn't match the app where you set the redirect URI.

**Fix:** Move the matching `client_id`/`secret` into Vercel and redeploy.

### Steps:
1. Check which Yahoo app has the correct redirect URI set
2. Copy that app's `YAHOO_CLIENT_ID` and `YAHOO_CLIENT_SECRET`
3. Update Vercel environment variables with those exact values
4. Redeploy frontend
5. Test OAuth flow again
