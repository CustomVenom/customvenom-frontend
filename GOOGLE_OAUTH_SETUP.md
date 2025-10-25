# 🔐 Google OAuth Configuration

**Your Google OAuth Client ID:** `294409641665-58nk9ngpglaq7e3v99bpckupr780lpsj.apps.googleusercontent.com`

---

## ✅ **What You Need to Do**

### Step 1: Add Redirect URIs in Google Console

**Go to:** https://console.cloud.google.com/apis/credentials

**Find your OAuth client** (Client ID: `294409641665-58nk9ngpglaq7e3v99bpckupr780lpsj`)

**Click on it to edit.**

---

### Step 2: Add Authorized Redirect URIs

In the "Authorized redirect URIs" section, click **"Add URI"** and add these **two** URIs:

#### Preview Redirect URI

```
https://customvenom-frontend-b3aoume16-incarcers-projects.vercel.app/api/auth/callback/google
```

#### Production Redirect URI

```
https://customvenom-frontend-incarcer-incarcers-projects.vercel.app/api/auth/callback/google
```

**Important:**

- Must end with `/api/auth/callback/google`
- No trailing slash at the end
- Both URIs should be added now (so you don't have to come back later)

---

### Step 3: Get Client Secret

While you're in the Google Console:

1. Look for **"Client secret"** field
2. Click the "Copy" icon
3. The secret looks like: `GOCSPX-abc123xyz789`
4. **Save this** - you'll need it for Vercel!

---

### Step 4: Save in Google Console

Click **"Save"** button at the bottom of the Google Console page.

---

## 📋 **Values for Vercel**

Now add these to Vercel environment variables:

### GOOGLE_CLIENT_ID

```
Name:        GOOGLE_CLIENT_ID
Value:       294409641665-58nk9ngpglaq7e3v99bpckupr780lpsj.apps.googleusercontent.com
Environment: ☑️ Preview ☑️ Production (check BOTH!)
```

### GOOGLE_CLIENT_SECRET

```
Name:        GOOGLE_CLIENT_SECRET
Value:       <paste-the-secret-you-copied-from-google>
Environment: ☑️ Preview ☑️ Production (check BOTH!)
```

**Example:** If your secret is `GOCSPX-ABC123XYZ789`, paste that in the Value field.

---

## ✅ **Verification**

After adding to Vercel and redeploying:

### 1. Check Providers Endpoint

```
https://customvenom-frontend-b3aoume16-incarcers-projects.vercel.app/api/auth/providers
```

Should show:

```json
{
  "google": {
    "id": "google",
    "name": "Google",
    "type": "oauth",
    ...
  },
  ...
}
```

### 2. Test Sign-In Flow

1. Go to: `https://customvenom-frontend-b3aoume16-incarcers-projects.vercel.app/api/auth/signin`
2. Click "Sign in with Google"
3. Should redirect to Google
4. Sign in with your Google account
5. Should redirect back to your app
6. Visit `/settings` to verify you're signed in

---

## 🎯 **Current OAuth Configuration**

| Setting                 | Value                                                                                           |
| ----------------------- | ----------------------------------------------------------------------------------------------- |
| **Client ID**           | `294409641665-58nk9ngpglaq7e3v99bpckupr780lpsj.apps.googleusercontent.com`                      |
| **Client Secret**       | Get from Google Console                                                                         |
| **Preview Redirect**    | `https://customvenom-frontend-b3aoume16-incarcers-projects.vercel.app/api/auth/callback/google` |
| **Production Redirect** | `https://customvenom-frontend-incarcer-incarcers-projects.vercel.app/api/auth/callback/google`  |

---

## 🔒 **Security Note**

**Client ID:** Safe to share publicly (it's in your frontend code)  
**Client Secret:** ⚠️ NEVER share publicly or commit to git!

The Client Secret should only be:

- In Vercel environment variables ✅
- In your password manager ✅
- In local `.env.local` for testing ✅

---

## 🆘 **Common Issues**

### "redirect_uri_mismatch" Error

**Cause:** Redirect URI in Google Console doesn't match exactly

**Fix:** Verify you added the EXACT URI with no typos:

```
https://customvenom-frontend-b3aoume16-incarcers-projects.vercel.app/api/auth/callback/google
```

### "Invalid client" Error

**Cause:** Client ID or Secret is wrong in Vercel

**Fix:**

1. Double-check you copied the full Client ID (294409641665-58nk9ngpglaq7e3v99bpckupr780lpsj.apps.googleusercontent.com)
2. Verify Client Secret is correct
3. Redeploy

### "Access blocked" Error

**Cause:** Google OAuth consent screen not configured

**Fix:**

1. Go to: https://console.cloud.google.com/apis/credentials/consent
2. Fill in required fields (app name, support email)
3. Add test users if needed
4. Save and try again

---

**Last Updated:** October 17, 2025  
**Your Client ID:** `294409641665-58nk9ngpglaq7e3v99bpckupr780lpsj.apps.googleusercontent.com`  
**Status:** Ready to add redirect URIs ✅
