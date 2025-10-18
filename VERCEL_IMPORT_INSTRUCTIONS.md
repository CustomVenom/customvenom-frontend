# 📦 How to Import Environment Variables to Vercel

## ⏰ IMPORTANT: Deployment Limit Status

**You've hit Vercel's 100 deployments/day limit**  
**Limit resets**: Midnight UTC (~7-8 PM your local time today)

**DO THIS NOW** (before limit resets):
1. Set up environment variables ✅
2. Create database ✅
3. Configure OAuth ✅

**THEN** when limit resets: Deploy once successfully ✅

---

## 🎯 Step-by-Step Import Process

### Step 1: Prepare Your Database (2 minutes)

**Create FREE PostgreSQL database at Neon:**

1. Go to: https://neon.tech
2. Click "Sign up" (use GitHub to sign in)
3. Click "Create a project"
   - Name: `customvenom-preview`
   - Region: Choose closest to you
   - Click "Create"
4. **COPY the connection string** - it looks like:
   ```
   postgresql://username:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
5. **Save this** - you'll paste it into the .env files below

---

### Step 2: Edit the ENV Files

**Open each file and replace placeholders:**

#### File 1: `VERCEL_ENV_PREVIEW.env`

Find and replace these 3 lines:
```env
DATABASE_URL=REPLACE_WITH_YOUR_NEON_CONNECTION_STRING
GOOGLE_CLIENT_ID=REPLACE_WITH_YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=REPLACE_WITH_YOUR_GOOGLE_CLIENT_SECRET
```

With your actual values:
```env
DATABASE_URL=postgresql://username:password@ep-xxx.neon.tech/neondb?sslmode=require
GOOGLE_CLIENT_ID=123456789.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxxxxxxxxxxxxx
```

#### File 2: `VERCEL_ENV_PRODUCTION.env`

Same replacements as Preview (can use same database or create separate one)

---

### Step 3: Import to Vercel (Use Vercel CLI - Easiest)

**Option A: Vercel CLI (Recommended)**

```powershell
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Navigate to frontend directory
cd customvenom-frontend

# Link to your Vercel project
vercel link

# Import Preview environment variables
vercel env add --environment preview < VERCEL_ENV_PREVIEW.env

# Import Production environment variables
vercel env add --environment production < VERCEL_ENV_PRODUCTION.env
```

**Option B: Manual Copy-Paste in Vercel Dashboard**

1. Go to: https://vercel.com/incarcers-projects/customvenom-frontend/settings/environment-variables

2. Click "Add New"

3. **For EACH variable** in the files below:
   - Copy the NAME (before =)
   - Copy the VALUE (after =)
   - Select environment: **Preview** or **Production**
   - Click "Save"

---

## 📋 PREVIEW Environment Variables

**Import these for: Preview environment ONLY**

```env
NEXTAUTH_URL=https://customvenom-frontend-git-main-incarcers-projects.vercel.app
AUTH_SECRET=mrCsQrchjWR2ZbJodgFQO9OTH1ksOnw/W+STFu5wj3U=
NEXTAUTH_SECRET=mrCsQrchjWR2ZbJodgFQO9OTH1ksOnw/W+STFu5wj3U=
DATABASE_URL=YOUR_NEON_CONNECTION_STRING_HERE
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_SECRET_HERE
NEXT_PUBLIC_API_BASE=https://customvenom-workers-api.jdewett81.workers.dev
API_BASE=https://customvenom-workers-api.jdewett81.workers.dev
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=
NEXT_PUBLIC_LOGS_ENABLED=false
```

**Environment Selection in Vercel:** ☑️ Preview

---

## 📋 PRODUCTION Environment Variables

**Import these for: Production environment ONLY**

```env
NEXTAUTH_URL=https://customvenom-frontend.vercel.app
AUTH_SECRET=mrCsQrchjWR2ZbJodgFQO9OTH1ksOnw/W+STFu5wj3U=
NEXTAUTH_SECRET=mrCsQrchjWR2ZbJodgFQO9OTH1ksOnw/W+STFu5wj3U=
DATABASE_URL=YOUR_NEON_CONNECTION_STRING_HERE
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_SECRET_HERE
NEXT_PUBLIC_API_BASE=https://customvenom-workers-api.jdewett81.workers.dev
API_BASE=https://customvenom-workers-api.jdewett81.workers.dev
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=
NEXT_PUBLIC_LOGS_ENABLED=false
```

**Environment Selection in Vercel:** ☑️ Production

---

## 📋 BOTH Environments (Alternative - Same Values)

**If you want to use the SAME values for Preview AND Production:**

```env
AUTH_SECRET=mrCsQrchjWR2ZbJodgFQO9OTH1ksOnw/W+STFu5wj3U=
NEXTAUTH_SECRET=mrCsQrchjWR2ZbJodgFQO9OTH1ksOnw/W+STFu5wj3U=
DATABASE_URL=YOUR_NEON_CONNECTION_STRING_HERE
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_SECRET_HERE
NEXT_PUBLIC_API_BASE=https://customvenom-workers-api.jdewett81.workers.dev
API_BASE=https://customvenom-workers-api.jdewett81.workers.dev
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=
NEXT_PUBLIC_LOGS_ENABLED=false
```

**Environment Selection in Vercel:** ☑️ Preview, ☑️ Production

**Then add these SEPARATELY (different per environment):**

**NEXTAUTH_URL for Preview:**
```
Value: https://customvenom-frontend-git-main-incarcers-projects.vercel.app
Environment: ☑️ Preview only
```

**NEXTAUTH_URL for Production:**
```
Value: https://customvenom-frontend.vercel.app
Environment: ☑️ Production only
```

---

## ⚠️ BEFORE YOU IMPORT

### 1. Get Your Database URL (2 minutes)

**Quick Neon Setup:**
```
1. Visit: https://neon.tech
2. Sign up with GitHub
3. Create project: "customvenom"
4. COPY the connection string shown
5. Replace "YOUR_NEON_CONNECTION_STRING_HERE" in files above
```

### 2. Get Google OAuth Credentials (5 minutes)

**If you DON'T have these yet:**

1. Go to: https://console.cloud.google.com/apis/credentials
2. Create new project or select existing
3. Click "Create Credentials" → "OAuth 2.0 Client ID"
4. Application type: "Web application"
5. Add Authorized redirect URIs:
   ```
   https://customvenom-frontend-git-main-incarcers-projects.vercel.app/api/auth/callback/google
   https://customvenom-frontend.vercel.app/api/auth/callback/google
   ```
6. Click "Create"
7. **COPY Client ID and Client Secret**
8. Replace "YOUR_GOOGLE_CLIENT_ID_HERE" and "YOUR_GOOGLE_SECRET_HERE"

---

## 🚀 After Importing Variables

### Step 1: Run Database Migration

```powershell
# Pull environment variables from Vercel
cd customvenom-frontend
npx vercel env pull .env.production.local

# Push Prisma schema to database
npx prisma db push

# Verify
npx prisma studio
```

### Step 2: Wait for Deployment Limit Reset

**Current time**: ~9 AM October 18, 2025  
**Limit resets**: Midnight UTC (7-8 PM your time today)

### Step 3: Deploy (After Limit Resets)

Either:
- **Push a new commit** (triggers auto-deploy)
- **OR manually redeploy** in Vercel dashboard

---

## 📝 Quick Reference

| Variable | Preview Value | Production Value | Both? |
|----------|--------------|------------------|-------|
| NEXTAUTH_URL | git-main URL | .vercel.app URL | ❌ Different |
| AUTH_SECRET | Same secret | Same secret | ✅ Same |
| DATABASE_URL | Your DB | Your DB | ✅ Same (or separate) |
| GOOGLE_CLIENT_ID | Your ID | Same ID | ✅ Same |
| GOOGLE_CLIENT_SECRET | Your Secret | Same Secret | ✅ Same |
| API_BASE | Workers URL | Workers URL | ✅ Same |

---

## ✅ Import Checklist

- [ ] Created Neon database
- [ ] Got database connection string
- [ ] Created Google OAuth credentials
- [ ] Added both redirect URIs to Google Console
- [ ] Replaced placeholders in .env files
- [ ] Imported Preview variables to Vercel
- [ ] Imported Production variables to Vercel
- [ ] Ran `npx prisma db push`
- [ ] Waiting for deployment limit reset
- [ ] Ready to deploy when limit resets

---

**Files Created:**
- `VERCEL_ENV_PREVIEW.env` - Copy/paste for Preview
- `VERCEL_ENV_PRODUCTION.env` - Copy/paste for Production
- `ENV_LOCAL_REFERENCE.txt` - For local development

**Status**: Ready to import when you have DATABASE_URL and Google OAuth credentials

