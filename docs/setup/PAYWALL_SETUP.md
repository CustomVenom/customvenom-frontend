# Paywall & Auth Bypass Setup

**Status:** ✅ Configured and ready

---

## 🎯 What Was Done

### 1. Middleware Updated

**File:** `src/middleware.ts`

**Features:**

- Demo mode support (`NEXT_PUBLIC_DEMO_MODE=1`)
- Paywall bypass flag (`PAYWALL_DISABLED=1`)
- Public routes allowlist

**Behavior:**

- When `PAYWALL_DISABLED=1`: All guards disabled
- When `NEXT_PUBLIC_DEMO_MODE=1`: Anonymous access to `/projections`
- Public routes: `/`, `/projections`, `/status`, `/privacy`, `/terms`, `/api/auth`

---

### 2. Auth Guards Updated

**File:** `src/lib/auth-guards.ts`

**Functions Modified:**

- `requireAuth()` - Bypasses if `PAYWALL_DISABLED=1`
- `requireAdmin()` - Bypasses if `PAYWALL_DISABLED=1`
- `requirePro()` - Bypasses if `PAYWALL_DISABLED=1` OR admin email

**Admin Auto-Bypass:**

- Admin emails (from `src/lib/rbac.ts`) automatically bypass pro requirements
- Admin email: `jdewett81@gmail.com`

---

### 3. Environment Configuration

#### Local Development (.env.local.template)

```env
NEXT_PUBLIC_DEMO_MODE=1
PAYWALL_DISABLED=1
```

#### Vercel Preview

```env
NEXT_PUBLIC_DEMO_MODE=1
PAYWALL_DISABLED=0  # Can enable during testing
```

#### Vercel Production

```env
NEXT_PUBLIC_DEMO_MODE=0
PAYWALL_DISABLED=0  # Never enable in production
```

---

## 🚀 How to Use

### Local Development (No Auth Setup Yet)

1. **Copy environment template:**

   ```bash
   cd customvenom-frontend
   cp .env.local.template .env.local
   ```

2. **Edit `.env.local`:**

   ```env
   PAYWALL_DISABLED=1
   NEXT_PUBLIC_DEMO_MODE=1
   ```

3. **Start dev server:**

   ```bash
   npm run dev
   ```

4. **Access without auth:**
   - ✅ `/projections` - Works without login
   - ✅ `/ops/metrics` - Accessible (with warning)
   - ✅ All pages load

---

### With Auth Setup (Google OAuth)

1. **Get Google OAuth credentials:**
   - Go to: https://console.cloud.google.com/apis/credentials
   - Create OAuth 2.0 Client ID
   - Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

2. **Get Neon database:**
   - Go to: https://neon.tech
   - Create free database
   - Copy connection string

3. **Update `.env.local`:**

   ```env
   DATABASE_URL=postgresql://user:pass@...
   GOOGLE_CLIENT_ID=YOUR_CLIENT_ID
   GOOGLE_CLIENT_SECRET=YOUR_CLIENT_SECRET

   # Can disable bypass once auth works
   PAYWALL_DISABLED=0
   NEXT_PUBLIC_DEMO_MODE=1
   ```

4. **Sign in with admin email:**
   - Use: `jdewett81@gmail.com`
   - Auto-assigned admin role
   - Bypasses all paywalls

---

## 🔒 Admin Email Bypass

**Admin email:** `jdewett81@gmail.com` (configured in `src/lib/rbac.ts`)

**What it bypasses:**

- ✅ Pro subscription requirement (`requirePro()`)
- ✅ Admin access checks (auto-passes `requireAdmin()`)
- ✅ All permission checks
- ✅ Access to `/ops/metrics` and admin routes

**How it works:**

1. Admin email hardcoded in `ADMIN_EMAILS` array
2. `getEffectiveRole()` checks email and returns `admin` role
3. `requirePro()` checks `entitlements.isAdmin` and bypasses
4. Entitlements show `isAdmin: true`, `isPro: true`, all features enabled

---

## 🎭 Demo Mode

**When enabled:** `NEXT_PUBLIC_DEMO_MODE=1`

**Behavior:**

- Anonymous users can access `/projections`
- API serves golden week data (`x-demo-mode: true`)
- No signup/paywall redirects
- "Demo Mode" badge shown in UI

**Use cases:**

- Public demo/preview
- Testing without auth
- Marketing/landing page

---

## 🚫 Paywall Disabled Flag

**When enabled:** `PAYWALL_DISABLED=1`

**Behavior:**

- ALL auth guards return without redirecting
- Can access any page without login
- Used for development only

**⚠️ NEVER enable in production**

---

## 📋 Quick Checks

### Test Admin Bypass (With Auth Configured)

1. Sign in with `jdewett81@gmail.com`
2. Check for "Admin" badge in UI
3. Visit `/ops/metrics` - should load
4. Visit `/settings` - should show admin role
5. No "upgrade to pro" prompts

### Test Demo Mode (Anonymous)

1. Don't sign in
2. Visit `/projections`
3. Should load with data
4. Look for "Demo Mode" or demo badge
5. No login prompt

### Test Paywall Bypass (Dev)

1. Set `PAYWALL_DISABLED=1` in `.env.local`
2. Restart dev server
3. Visit any page without signing in
4. All pages load without redirects

---

## 🔧 Troubleshooting

### "Redirected to auth_required"

- Check `PAYWALL_DISABLED=1` is set
- Restart dev server after env changes
- Verify `.env.local` exists and is loaded

### "Admin badge not showing"

- Confirm you're signed in with `jdewett81@gmail.com`
- Check `src/lib/rbac.ts` - email should be in `ADMIN_EMAILS`
- Verify session includes user email

### "Can't access /ops/metrics"

- If signed in as admin: Check entitlements API
- If `PAYWALL_DISABLED=1`: Should work without auth
- Check browser console for errors

### "Demo mode not working"

- Verify `NEXT_PUBLIC_DEMO_MODE=1` (must have `NEXT_PUBLIC_` prefix)
- Restart dev server (client env vars need restart)
- Check API response for `x-demo-mode: true` header

---

## 📝 Environment Setup Checklist

### For Local Dev (No Auth)

- [ ] Copy `.env.local.template` to `.env.local`
- [ ] Set `PAYWALL_DISABLED=1`
- [ ] Set `NEXT_PUBLIC_DEMO_MODE=1`
- [ ] Set API base URLs
- [ ] Run `npm run dev`
- [ ] Test `/projections` loads

### For Local Dev (With Auth)

- [ ] Create Google OAuth app
- [ ] Create Neon database
- [ ] Add credentials to `.env.local`
- [ ] Run `npx prisma generate`
- [ ] Run `npx prisma db push`
- [ ] Sign in with admin email
- [ ] Verify admin badge shows

### For Vercel Preview

- [ ] Import `VERCEL_ENV_PREVIEW.env`
- [ ] Set up Neon database
- [ ] Configure Google OAuth redirect URI
- [ ] Set `NEXT_PUBLIC_DEMO_MODE=1`
- [ ] Deploy and test

### For Vercel Production

- [ ] Import `VERCEL_ENV_PRODUCTION.env`
- [ ] Use separate production database
- [ ] Use production Google OAuth
- [ ] Set `NEXT_PUBLIC_DEMO_MODE=0`
- [ ] Set `PAYWALL_DISABLED=0`
- [ ] Deploy carefully

---

## ✅ Current State

| Feature           | Status        | Notes                      |
| ----------------- | ------------- | -------------------------- |
| Admin Bypass      | ✅ Configured | Email: jdewett81@gmail.com |
| Demo Mode         | ✅ Configured | Toggle with env var        |
| Paywall Disabled  | ✅ Configured | Dev/testing only           |
| Middleware        | ✅ Updated    | Respects flags             |
| Auth Guards       | ✅ Updated    | All bypass admin           |
| Environment Files | ✅ Ready      | Templates created          |

**Ready to use:** Copy `.env.local.template` → `.env.local` and run `npm run dev`
