# 🏈 Yahoo OAuth + League Import Setup

**Priority:** #1 for business (your personal Yahoo league integration)
**Environment:** Preview only (safe testing)
**Time:** 15 minutes
**Risk:** Zero (no production, no DB writes)

---

## 🎯 **What This Enables:**

- ✅ Sign in with Yahoo account
- ✅ Import Yahoo Fantasy league data
- ✅ Get personalized recommendations based on YOUR roster
- ✅ Test league import flow before building full integration

---

## 📋 **Step 1: Create Yahoo App (5 minutes)**

### **1.1 Go to Yahoo Developer Console:**
https://developer.yahoo.com/apps/

### **1.2 Create New App:**
- Click **"Create an App"**
- **Application Name:** "CustomVenom Fantasy"
- **Application Type:** "Web Application"
- **Callback Domain:** Your Preview URL domain
- **API Permissions:**
  - ✅ Fantasy Sports (Read)
  - ✅ OpenID Connect Permissions

### **1.3 Get Credentials:**
After creating, you'll see:
- **App ID:** (e.g., `DwjgwnmJ`)
- **Client ID:** (longer string starting with `dj0...`)
- **Client Secret:** (longer string)

**Save these!** You'll need them in Step 2.

---

## 📋 **Step 2: Add Redirect URI (2 minutes)**

### **2.1 In Yahoo App Settings:**

Add this **Redirect URI:**
```
https://customvenom-frontend-git-main-customvenom.vercel.app/auth/callback/yahoo
```

**Important:** Must match your Preview URL exactly!

### **2.2 Verify:**
- OAuth2 Authorization: Enabled
- Permissions include: `fspt-r` (Fantasy Sports Read)
- Redirect URI saved

---

## 📋 **Step 3: Add Environment Variables to Vercel (3 minutes)**

Go to: https://vercel.com/incarcers-projects/customvenom-frontend/settings/environment-variables

**Add these 2 variables for PREVIEW ONLY:**

| Key | Value | Environment |
|-----|-------|-------------|
| `YAHOO_CLIENT_ID` | (your Client ID from Step 1) | ✅ Preview |
| `YAHOO_CLIENT_SECRET` | (your Client Secret from Step 1) | ✅ Preview |

**Don't add to Production yet** - test in Preview first!

---

## 📋 **Step 4: Redeploy Preview (2 minutes)**

1. Go to: https://vercel.com/incarcers-projects/customvenom-frontend/deployments
2. Find latest Preview deployment
3. Click "..." → **"Redeploy"**
4. Wait for build to complete

---

## 🧪 **Step 5: Test Yahoo OAuth (3 minutes)**

### **5.1 Visit Preview Site:**
```
https://customvenom-frontend-git-main-customvenom.vercel.app
```

### **5.2 Click "Sign In"**
- Should see both Google and Yahoo options
- Click **"Sign in with Yahoo"**

### **5.3 Authorize:**
- Log in with your Yahoo account
- Grant permissions to CustomVenom
- Should redirect back to your site

### **5.4 Verify:**
- You're signed in ✅
- Name/email showing in header ✅
- Can access `/settings` page ✅

---

## 🧪 **Step 6: Test League Import (2 minutes)**

### **6.1 Go to Settings:**
```
https://customvenom-frontend-git-main-customvenom.vercel.app/settings
```

### **6.2 Find "League Integration" Section:**
- Should see "Import Yahoo League" form
- Enter any league ID (e.g., `12345`)
- Click **"Test Import"**

### **6.3 Expected Response:**
```json
{
  "ok": true,
  "schema_version": "v1",
  "last_refresh": "2025-10-17T...",
  "received": {
    "provider": "yahoo",
    "league_id": "12345"
  },
  "message": "Preview mode - import stub successful"
}
```

---

## ✅ **Success Criteria:**

**You're done when:**
- ✅ Yahoo appears as sign-in option
- ✅ Yahoo OAuth completes successfully
- ✅ Session created (signed in)
- ✅ League import returns 200 with schema_version
- ✅ No database errors (Preview mode = no DB writes)

---

## 🔧 **Troubleshooting:**

### **"Yahoo provider not found" error:**
- Yahoo provider is already in code (src/lib/integrations/yahoo/provider.ts)
- Check env vars are set for Preview
- Redeploy after adding env vars

### **OAuth redirect mismatch:**
- Verify redirect URI in Yahoo console matches Preview URL exactly
- Must include `/auth/callback/yahoo` path
- Check for https:// vs http://

### **"Invalid client" error:**
- Double-check YAHOO_CLIENT_ID and YAHOO_CLIENT_SECRET
- Make sure you're using values from YOUR app, not the example
- Verify env vars are set for Preview environment

### **League import returns 400:**
- Check request body has both `provider` and `league_id`
- Provider must be exactly `"yahoo"` (lowercase)
- League ID can be any string for testing

---

## 📊 **What's Already Built:**

**✅ In Code Now:**
- Yahoo OAuth provider (src/lib/integrations/yahoo/provider.ts)
- League import stub endpoint (src/app/api/league/import/route.ts)
- Import UI component (src/components/LeagueImport.tsx)
- Settings page integration

**⏳ Not Built Yet (Future):**
- Actual Yahoo Fantasy API calls
- League data storage in database
- Personalized recommendations from roster
- Team sync/refresh logic

---

## 🎯 **After Preview Works:**

**Next steps to make it production-ready:**

1. **Build real Yahoo Fantasy API client:**
   - Fetch league details
   - Get user's team roster
   - Pull standings, matchups, transactions

2. **Store league data in database:**
   - League table (Prisma schema already has it!)
   - User's team players
   - Refresh weekly

3. **Generate personalized recommendations:**
   - Filter projections by roster needs
   - Highlight pickup targets
   - Show trade suggestions

4. **Enable for Production:**
   - Add Yahoo env vars to Production
   - Switch from stub to real import
   - Test with your actual Yahoo league

---

## 📞 **Quick Reference:**

**Yahoo Developer Console:**
https://developer.yahoo.com/apps/

**Your App ID:** `DwjgwnmJ` (from provider.ts)

**Test Endpoint:**
```bash
curl -X POST https://customvenom-frontend-git-main-customvenom.vercel.app/api/league/import \
  -H "Content-Type: application/json" \
  -d '{"provider":"yahoo","league_id":"123"}' | jq
```

**Expected:**
```json
{
  "ok": true,
  "schema_version": "v1",
  "received": { "provider": "yahoo", "league_id": "123" }
}
```

---

## ✅ **Current Implementation:**

**What Works (Preview):**
- ✅ Yahoo OAuth provider configured
- ✅ Sign in with Yahoo (when env vars added)
- ✅ League import stub endpoint (validates input)
- ✅ Simple UI for testing

**What's Stubbed:**
- ⚠️ League import returns success but doesn't fetch real data
- ⚠️ No database storage
- ⚠️ No actual Yahoo API calls

**When to Build Real Version:**
- After OAuth is tested and working in Preview
- After you've verified sign-in flow works
- When you're ready to connect your actual Yahoo league

---

**Status:** ✅ Code deployed, ready for Yahoo credentials
**Next:** Add YAHOO_CLIENT_ID + YAHOO_CLIENT_SECRET to Vercel Preview
**Test:** Sign in with Yahoo, then test league import stub

