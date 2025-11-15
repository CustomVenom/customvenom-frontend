# Yahoo OAuth Live Test Checklist

## Pre-Test Setup

### 1. Verify Environment Variables in Vercel Production

```bash
# Go to Vercel Dashboard → Your Project → Settings → Environment Variables
# Confirm these are set for Production:
# - NEXT_PUBLIC_API_BASE=https://customvenom-workers-api.jdewett81.workers.dev
```

### 2. Quick API Health Check

```bash
# Test Workers API is up
curl -sSD - "https://customvenom-workers-api.jdewett81.workers.dev/health" -o /dev/null | head -20

# Expected: 200 OK with x-route=health, x-breaker=closed
```

## Live Test Steps

### Step 1: Open Settings Page

Open: https://www.customvenom.com/settings

**Expected States:**

- ✅ **Not Configured**: Yellow card saying "Yahoo: not configured. Set NEXT_PUBLIC_API_BASE"
  - Fix: Set env var in Vercel, redeploy
- ✅ **Not Connected**: Yellow card saying "Yahoo: not connected" with "Connect Yahoo" link
  - Proceed to Step 2
- ✅ **Connected**: Green card with league name, season, and roster table
  - Proceed to Step 3 (verify roster data)

### Step 2: Connect Yahoo OAuth

1. Click "Connect Yahoo" link in the yellow card
2. Expected: Redirect to Yahoo OAuth consent page
3. Complete OAuth consent
4. Expected: Redirect back to Settings page
5. Expected: Yellow card changes to green "Yahoo Connected" card

**If OAuth fails:**

- Check browser console for errors
- Verify `YAHOO_CLIENT_ID` and `YAHOO_CLIENT_SECRET` are set in Workers API
- Verify redirect URI matches in Yahoo Developer Console

### Step 3: Verify Roster Data

1. Settings should show green "Yahoo Connected" card
2. Expected: League name and season displayed (e.g., "Yahoo Connected — My League (2025)")
3. Expected: Roster table with columns: Player, Pos, Team
4. Expected: 10-16 players in table

### Step 4: Capture Receipts

Run these commands after completing OAuth:

```bash
# Set your Workers API base
API_BASE="https://customvenom-workers-api.jdewett81.workers.dev"

# 1. Session Check - should return 200 after OAuth
curl -sSD - "$API_BASE/yahoo/me" -o /dev/null | head -20

# 2. Leagues Check - should return array with length > 0
curl -s "$API_BASE/yahoo/leagues" | jq '.leagues | length'

# 3. Fetch full leagues for screenshot
curl -s "$API_BASE/yahoo/leagues" | jq '.'
```

## Troubleshooting

### If Settings page shows error instead of card:

1. Check browser console for error message
2. Check Vercel logs for server-side errors
3. Verify `NEXT_PUBLIC_API_BASE` is set correctly in Vercel
4. Try temporarily commenting out YahooPanel import to confirm page renders without it

### If OAuth redirect fails:

1. Check redirect URI in Workers API: `https://api.customvenom.com/api/yahoo/callback`
2. Verify redirect URI matches in Yahoo Developer Console
3. Check CORS headers on Workers API

### If roster table is empty:

1. Check if Yahoo account has active leagues
2. Verify Yahoo scopes include `fspt-r` for fantasy permissions
3. Check Workers API logs for errors fetching roster

## Acceptance Criteria

- [ ] Settings renders without crashing
- [ ] Shows "Connect Yahoo" when not authenticated
- [ ] OAuth flow completes successfully
- [ ] Shows "Yahoo Connected" after authentication
- [ ] Roster table displays with player data
- [ ] Session API returns 200 OK
- [ ] Leagues API returns non-zero count
- [ ] Screenshot captured showing green "Connected" card and roster table

## Notes

- Keep tokens redacted in receipts
- Screenshots should show full browser URL bar
- Note any console errors or warnings
