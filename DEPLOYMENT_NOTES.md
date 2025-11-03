# 🚀 Production Deployment - UI Redesign v2.0

## Pre-Deployment Checklist

### ✅ Code Changes
- [x] All UI redesign phases complete (8 phases)
- [x] New design system implemented
- [x] Auth framework with tier system
- [x] StrikeForce paywall component
- [x] Middleware protection
- [x] Public Hub (light) and Dashboard Hub (dark)

### ⚠️ Critical: Prisma Migration Required

**Before deploying to production, you MUST run the Prisma migration:**

```bash
# In production database (Neon/Postgres)
npx prisma migrate deploy
```

**Or via Prisma Studio/Neon dashboard:**
- Run the SQL from: `prisma/migrations/20251102211353_add_auth_tier_role_enums/migration.sql`

**Migration adds:**
- `UserTier` enum (FREE, VIPER, MAMBA)
- `UserRole` enum (USER, ADMIN, DEVELOPER)
- New `tier` and `role` columns on User table
- `Subscription` model
- Backward compatibility fields (`legacyRole`, `legacyTier`)

**⚠️ This migration is NON-BREAKING** - existing users will default to `FREE` tier and `USER` role.

---

## Environment Variables Required

**Vercel Production Environment:**
- `DATABASE_URL` - Neon Postgres connection string
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `NEXTAUTH_URL` - `https://www.customvenom.com` (or your domain)
- `NEXT_PUBLIC_API_BASE` - Workers API URL
- `YAHOO_CLIENT_ID` - Yahoo OAuth credentials
- `YAHOO_CLIENT_SECRET` - Yahoo OAuth credentials

**Optional (for OAuth providers):**
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `TWITTER_CLIENT_ID`
- `TWITTER_CLIENT_SECRET`
- `FACEBOOK_CLIENT_ID`
- `FACEBOOK_CLIENT_SECRET`

---

## Deployment Steps

### Option 1: Merge to Main (Recommended)

```bash
# On redesign/ui-v2 branch
git checkout main
git merge redesign/ui-v2
git push origin main
```

Vercel will automatically deploy on push to main.

### Option 2: Push Branch Directly

```bash
# Push branch for review
git push origin redesign/ui-v2
```

Then merge via GitHub PR or Vercel dashboard.

---

## Post-Deployment

### 1. Run Prisma Migration

```bash
# Set DATABASE_URL in your environment
export DATABASE_URL="postgresql://..."
npx prisma migrate deploy
```

### 2. Verify Deployment

- [ ] Homepage loads (light mode)
- [ ] Login page works
- [ ] Signup flow works
- [ ] Dashboard loads (dark mode)
- [ ] Yahoo OAuth still works
- [ ] Team data displays correctly
- [ ] Team selector switches teams

### 3. Monitor

- Check Vercel logs for errors
- Check database for new user registrations
- Verify auth flow end-to-end

---

## Rollback Plan

If issues occur:

1. **Revert via Vercel**: Previous deployment is available in Vercel dashboard
2. **Revert via Git**:
   ```bash
   git revert <commit-hash>
   git push origin main
   ```
3. **Database rollback**: Migration can be rolled back if needed (non-breaking, so low priority)

---

## Known Issues

- NextAuth build warning (doesn't affect runtime)
- Prisma client generation needed on build (handled by Vercel)

---

**Deployment Date**: ___________
**Deployed By**: ___________
**Migration Status**: Pending / Complete
**Post-Deployment Status**: ___________

