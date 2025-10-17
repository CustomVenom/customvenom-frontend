# 📋 Vercel Copy-Paste Guide

**Super simple: Just copy and paste exactly what's shown**

---

## 🚦 Color Key

- 🟢 **GREEN** = Ready to paste (real value)
- 🔴 **RED** = You need to get this value first
- 🟡 **YELLOW** = Optional (skip for now)

---

## 📝 **For Preview Environment**

Go to: https://vercel.com/incarcers-projects/customvenom-frontend/settings/environment-variables

Click "Add New" for each one below.  
Select "Preview" environment.

---

### 🟢 Variable 1: NEXTAUTH_URL (READY - Copy this!)

```
Name:        NEXTAUTH_URL
Value:       https://customvenom-frontend-b3aoume16-incarcers-projects.vercel.app
Environment: ☑️ Preview
```

**Action:** Copy the value above and paste it exactly as-is.

---

### 🟢 Variable 2: AUTH_SECRET (READY - Copy this!)

```
Name:        AUTH_SECRET
Value:       mrCsQrchjWR2ZbJodgFQO9OTH1ksOnw/W+STFu5wj3U=
Environment: ☑️ Preview
```

**Action:** Copy the value above and paste it exactly as-is.

---

### 🟢 Variable 3: NEXTAUTH_SECRET (READY - Copy this!)

```
Name:        NEXTAUTH_SECRET
Value:       mrCsQrchjWR2ZbJodgFQO9OTH1ksOnw/W+STFu5wj3U=
Environment: ☑️ Preview
```

**Action:** Copy the value above and paste it exactly as-is. (Yes, same as AUTH_SECRET)

---

### 🟢 Variable 4: NEXT_PUBLIC_API_BASE (READY - Copy this!)

```
Name:        NEXT_PUBLIC_API_BASE
Value:       https://api.customvenom.com
Environment: ☑️ Preview ☑️ Production (check BOTH!)
```

**Action:** Copy the value above and paste it exactly as-is.

---

### 🟢 Variable 5: API_BASE (READY - Copy this!)

```
Name:        API_BASE
Value:       https://api.customvenom.com
Environment: ☑️ Preview ☑️ Production (check BOTH!)
```

**Action:** Copy the value above and paste it exactly as-is.

---

### 🔴 Variable 6: DATABASE_URL (YOU NEED TO GET THIS!)

```
Name:        DATABASE_URL
Value:       ⚠️ GET FROM NEON.TECH (see below)
Environment: ☑️ Preview
```

**How to get it:**

1. **Go to:** https://neon.tech
2. **Click:** "Sign Up" (use your GitHub account)
3. **Create project:** 
   - Name: `customvenom-preview`
   - Click "Create Project"
4. **Copy connection string:**
   - Look for "Connection String" or "Database URL"
   - Click "Copy" 
   - Should look like: `postgresql://username:password@ep-something.region.aws.neon.tech/dbname`
5. **Paste in Vercel:** Use this as the value for `DATABASE_URL`

---

### 🔴 Variable 7: GOOGLE_CLIENT_ID (YOU NEED TO GET THIS!)

```
Name:        GOOGLE_CLIENT_ID
Value:       ⚠️ GET FROM GOOGLE CONSOLE (see below)
Environment: ☑️ Preview ☑️ Production (check BOTH!)
```

**How to get it:**

1. **Go to:** https://console.cloud.google.com/apis/credentials
2. **Sign in** with your Google account
3. **Create project** (if you don't have one):
   - Click "Select a project" → "New Project"
   - Name: "CustomVenom"
   - Click "Create"
4. **Click:** "Create Credentials" → "OAuth client ID"
5. **Configure consent screen** (if prompted):
   - User Type: External
   - App name: CustomVenom
   - Fill in required fields
   - Save
6. **Create OAuth Client:**
   - Application type: Web application
   - Name: CustomVenom Frontend
   - **Authorized redirect URIs:** Click "Add URI" and add:
     ```
     https://customvenom-frontend-b3aoume16-incarcers-projects.vercel.app/api/auth/callback/google
     ```
   - Click "Create"
7. **Copy Client ID:** Shows in popup (looks like: `123456789-abc123.apps.googleusercontent.com`)
8. **Paste in Vercel:** Use this as the value for `GOOGLE_CLIENT_ID`

---

### 🔴 Variable 8: GOOGLE_CLIENT_SECRET (YOU NEED TO GET THIS!)

```
Name:        GOOGLE_CLIENT_SECRET
Value:       ⚠️ GET FROM GOOGLE CONSOLE (same place as above)
Environment: ☑️ Preview ☑️ Production (check BOTH!)
```

**How to get it:**

1. In the same Google Console popup from above
2. **Copy Client Secret:** (looks like: `GOCSPX-abc123xyz789`)
3. **Paste in Vercel:** Use this as the value for `GOOGLE_CLIENT_SECRET`

---

### 🟡 Variable 9-11: STRIPE (SKIP FOR NOW)

**You can add these later when you're ready for payments.**

For now, you can test the app without Stripe.

---

## 📊 **Summary: What to Add**

| # | Variable Name | Where to Get Value | Environment |
|---|---------------|-------------------|-------------|
| 1 | NEXTAUTH_URL | 🟢 Copy from above | Preview |
| 2 | AUTH_SECRET | 🟢 Copy from above | Preview |
| 3 | NEXTAUTH_SECRET | 🟢 Copy from above | Preview |
| 4 | NEXT_PUBLIC_API_BASE | 🟢 Copy from above | Preview + Production |
| 5 | API_BASE | 🟢 Copy from above | Preview + Production |
| 6 | DATABASE_URL | 🔴 Create at neon.tech | Preview |
| 7 | GOOGLE_CLIENT_ID | 🔴 Get from Google Console | Preview + Production |
| 8 | GOOGLE_CLIENT_SECRET | 🔴 Get from Google Console | Preview + Production |

**Total to add:** 8 variables

---

## ⚠️ **About Placeholders**

If you see these in the docs, they are **NOT real values**:

```
<from-google-console>     ← Replace with actual Google Client ID
<same-as-preview>         ← Use the same value from Preview
<your-connection-string>  ← Replace with actual database URL
<get-from-stripe>         ← Replace with actual Stripe key
```

**These ARE real values (copy exactly):**

```
mrCsQrchjWR2ZbJodgFQO9OTH1ksOnw/W+STFu5wj3U=  ← Real AUTH_SECRET
https://api.customvenom.com                   ← Real API URL
https://customvenom-frontend-b3aoume16...     ← Real Preview URL
```

**Rule of thumb:** If it has `<` and `>` brackets, it's a placeholder!

---

## 🎯 **After Adding All Variables**

### Step 1: Redeploy

1. Go to: https://vercel.com/incarcers-projects/customvenom-frontend/deployments
2. Click on latest Preview deployment
3. Click **"Redeploy"** button
4. Wait 2-3 minutes

### Step 2: Test

Open this URL:
```
https://customvenom-frontend-b3aoume16-incarcers-projects.vercel.app/api/auth/providers
```

**What you should see:**
```json
{
  "google": {
    "id": "google",
    "name": "Google",
    "type": "oauth",
    ...
  }
}
```

**If you see this = SUCCESS!** ✅

---

## 🆘 **If Something Goes Wrong**

### "I accidentally pasted a placeholder like `<from-google-console>`"

**Fix:**
1. Go back to Vercel environment variables
2. Find that variable
3. Click the "..." menu on the right
4. Click "Edit"
5. Replace with the real value
6. Save
7. Redeploy

### "I don't know which environment to select"

**For now:**
- Select **"Preview"** for testing
- We'll add Production later

### "Build is failing"

**Most common cause:** DATABASE_URL is missing or wrong

**Check:**
1. Did you create a database on Neon.tech?
2. Did you copy the FULL connection string (including `postgresql://`)?
3. Did you paste it in Vercel as `DATABASE_URL`?

---

## ✅ **Quick Checklist**

Before redeploying:

- [ ] Added NEXTAUTH_URL with Preview URL (no `<>` brackets)
- [ ] Added AUTH_SECRET with the long random string
- [ ] Added NEXTAUTH_SECRET with the same long random string
- [ ] Added NEXT_PUBLIC_API_BASE with API URL
- [ ] Added API_BASE with API URL
- [ ] Created Neon database and got connection string
- [ ] Added DATABASE_URL with real connection string (no `<>` brackets)
- [ ] Created Google OAuth client
- [ ] Added GOOGLE_CLIENT_ID (looks like: `123-abc.apps.googleusercontent.com`)
- [ ] Added GOOGLE_CLIENT_SECRET (looks like: `GOCSPX-abc123`)

---

## 📞 **You've Got This!**

It seems complicated, but you're just:
1. Creating a database (free, 2 minutes)
2. Creating Google OAuth (free, 3 minutes)  
3. Copy-pasting values into Vercel (5 minutes)
4. Redeploying (3 minutes waiting)

**Total time: ~15 minutes**

---

**Last Updated:** October 17, 2025  
**Difficulty:** 🟢 Beginner-friendly  
**Help:** If stuck, tell me where you got stuck and I'll help!

