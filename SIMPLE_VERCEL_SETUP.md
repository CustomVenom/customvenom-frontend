# 🎯 Simple Vercel Setup (Beginner-Friendly)

**Don't worry! I'll walk you through this step by step.**

---

## 📍 Where to Go

**Open this page:**  
https://vercel.com/incarcers-projects/customvenom-frontend/settings/environment-variables

---

## ✅ **What Values Are READY to Use (Copy Exactly)**

These are **real values** you can copy-paste as-is:

### 1. AUTH_SECRET (Copy this exactly)
```
mrCsQrchjWR2ZbJodgFQO9OTH1ksOnw/W+STFu5wj3U=
```

### 2. NEXTAUTH_SECRET (Same as above)
```
mrCsQrchjWR2ZbJodgFQO9OTH1ksOnw/W+STFu5wj3U=
```

### 3. NEXTAUTH_URL for Preview
```
https://customvenom-frontend-b3aoume16-incarcers-projects.vercel.app
```

### 4. NEXTAUTH_URL for Production  
```
https://customvenom-frontend-incarcer-incarcers-projects.vercel.app
```

### 5. API URLs (Same for both environments)
```
https://api.customvenom.com
```

---

## ❌ **What Values Need to Be REPLACED**

These are **placeholders** - you need to get the real values:

### 1. Google OAuth (You need to get these)
- `<from-google-console>` ← **NOT a real value!**
- `<your-google-client-id>` ← **NOT a real value!**

**How to get them:**
- Go to: https://console.cloud.google.com/apis/credentials
- Create OAuth 2.0 Client ID
- Copy the Client ID and Client Secret
- Use those instead

### 2. Database URL (You need to create this)
- `<from-neon-or-vercel>` ← **NOT a real value!**

**How to get it:**
- Go to: https://neon.tech
- Sign up (free)
- Create a database
- Copy the connection string
- Use that instead

### 3. Stripe Keys (Optional for now)
- `<from-stripe>` ← **NOT a real value!**

**You can skip Stripe for now if you're just testing.**

---

## 🎯 **EXACT Steps for Vercel (Do This First)**

### Start with Preview Environment ONLY

Go to: https://vercel.com/incarcers-projects/customvenom-frontend/settings/environment-variables

---

### Step 1: Add NEXTAUTH_URL

1. Click **"Add New"**
2. Fill in:
   - **Name:** `NEXTAUTH_URL`
   - **Value:** `https://customvenom-frontend-b3aoume16-incarcers-projects.vercel.app`
   - **Environment:** Check ☑️ **Preview** only
3. Click **"Save"**

---

### Step 2: Add AUTH_SECRET

1. Click **"Add New"**
2. Fill in:
   - **Name:** `AUTH_SECRET`
   - **Value:** `mrCsQrchjWR2ZbJodgFQO9OTH1ksOnw/W+STFu5wj3U=`
   - **Environment:** Check ☑️ **Preview** only
3. Click **"Save"**

---

### Step 3: Add NEXTAUTH_SECRET

1. Click **"Add New"**
2. Fill in:
   - **Name:** `NEXTAUTH_SECRET`
   - **Value:** `mrCsQrchjWR2ZbJodgFQO9OTH1ksOnw/W+STFu5wj3U=`
   - **Environment:** Check ☑️ **Preview** only
3. Click **"Save"**

---

### Step 4: Add API URLs

**First one:**
1. Click **"Add New"**
2. Fill in:
   - **Name:** `NEXT_PUBLIC_API_BASE`
   - **Value:** `https://api.customvenom.com`
   - **Environment:** Check ☑️ **Preview** AND ☑️ **Production** (both!)
3. Click **"Save"**

**Second one:**
1. Click **"Add New"**
2. Fill in:
   - **Name:** `API_BASE`
   - **Value:** `https://api.customvenom.com`
   - **Environment:** Check ☑️ **Preview** AND ☑️ **Production** (both!)
3. Click **"Save"**

---

### Step 5: Add DATABASE_URL (REQUIRED!)

**First, create a free database:**

1. Go to: https://neon.tech
2. Click "Sign Up" (use your GitHub account)
3. Create new project:
   - Name: `customvenom-preview`
   - Region: Pick closest to you
4. After creation, click "Dashboard"
5. Look for "Connection String"
6. **Copy it** (looks like: `postgresql://username:password@host/database`)

**Now add to Vercel:**

1. Click **"Add New"**
2. Fill in:
   - **Name:** `DATABASE_URL`
   - **Value:** (paste the connection string you copied from Neon)
   - **Environment:** Check ☑️ **Preview** only (for now)
3. Click **"Save"**

---

### Step 6: STOP HERE for Now

**Don't add Google or Stripe yet!** Let's test if the build works first.

---

## 🔄 **Redeploy to Apply Changes**

After adding those 6 environment variables:

1. Go to: https://vercel.com/incarcers-projects/customvenom-frontend/deployments
2. Find the latest Preview deployment (should say "Preview" badge)
3. Click on it
4. Click **"Redeploy"** button (top right)
5. Wait 2-3 minutes for build to complete

---

## 🧪 **Test If It Works**

After redeploy finishes:

**Open this URL in your browser:**
```
https://customvenom-frontend-b3aoume16-incarcers-projects.vercel.app/api/auth/providers
```

**What you should see:**

✅ **Success:** JSON with `{"google": {...}}` or similar  
❌ **Still broken:** 404 error

---

## 💡 **If You See 404 Still**

**Check Vercel Build Logs:**

1. Go to the deployment
2. Click "Build Logs" tab
3. Look for RED errors
4. Take a screenshot or copy the error
5. Send me the error message

---

## 📋 **What You've Added So Far**

After Step 6, you should have these in Vercel Preview:

- ✅ `NEXTAUTH_URL` = Your Preview URL
- ✅ `AUTH_SECRET` = Generated secret
- ✅ `NEXTAUTH_SECRET` = Same secret
- ✅ `NEXT_PUBLIC_API_BASE` = API URL
- ✅ `API_BASE` = API URL
- ✅ `DATABASE_URL` = Your Neon database

**Total:** 6 environment variables

---

## 🎯 **What Comes Next (Later)**

Once the above works, we'll add:

1. **Google OAuth** (for sign-in)
2. **Stripe** (for payments - optional)
3. **Production environment** (copy Preview values)

**But first**, let's make sure the basic setup works!

---

## 🆘 **Common Questions**

### Q: Do I delete values already there?

**A:** Only if they're wrong or placeholders like `<from-google-console>`. 

If you see:
- A real URL or value → Keep it
- A placeholder with `<` and `>` → Replace it

### Q: What is `<same-as-vercel>`?

**A:** It's a placeholder meaning "use the same value you already set in Vercel."

Example:
- If you already set `GOOGLE_CLIENT_ID` in Preview
- When adding Production, use the same value

### Q: Can I skip some variables?

**A:** These are **REQUIRED** (app won't work without them):
- `DATABASE_URL` ← Most important!
- `AUTH_SECRET`
- `NEXTAUTH_URL`
- `API_BASE`

You can skip:
- Google OAuth (for now)
- Stripe (for now)
- Sentry (optional)

### Q: How do I know if it worked?

**A:** Visit this URL:
```
https://customvenom-frontend-b3aoume16-incarcers-projects.vercel.app/api/auth/providers
```

If you see JSON (not 404), it worked! 🎉

---

## 📞 **Need Help?**

If you get stuck:

1. **Check Vercel Build Logs** for errors
2. **Screenshot the error** 
3. **Tell me:**
   - What you see when you visit `/api/auth/providers`
   - Any errors in the build logs
   - Which environment variables you've added

I'll help you fix it! 😊

---

**Last Updated:** October 17, 2025  
**Status:** Ready for you to add 6 environment variables  
**Difficulty:** 🟢 Beginner-friendly

