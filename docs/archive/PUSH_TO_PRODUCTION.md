# 🚀 Push to Production - Quick Guide

## Current Status

✅ **All changes committed** on branch `redesign/ui-v2`

## Next Steps to Deploy

### Option 1: Merge to Main (Recommended for Production)

```bash
# Switch to main branch
git checkout main

# Merge the redesign
git merge redesign/ui-v2

# Push to trigger Vercel deployment
git push origin main
```

**Vercel will automatically deploy** when you push to main.

---

### Option 2: Push Branch and Deploy via Vercel Dashboard

```bash
# Push the branch
git push origin redesign/ui-v2

# Then in Vercel Dashboard:
# 1. Go to your project
# 2. Settings → Git → Production Branch
# 3. Deploy from redesign/ui-v2 branch
```

---

## ⚠️ CRITICAL: Run Prisma Migration

**Before the app works in production, you MUST run the database migration:**

```bash
# Set your production DATABASE_URL
export DATABASE_URL="postgresql://..."

# Run migration
npx prisma migrate deploy
```

**Or via Neon Dashboard:**

1. Go to Neon console
2. Open SQL editor
3. Copy contents of: `prisma/migrations/20251102211353_add_auth_tier_role_enums/migration.sql`
4. Run the SQL

**Migration is NON-BREAKING** - existing users default to FREE tier.

---

## Post-Deployment Checklist

After deployment completes:

- [ ] Homepage loads (light mode)
- [ ] Login page works (`/login`)
- [ ] Signup page works (`/signup`)
- [ ] Dashboard loads (dark mode, `/dashboard`)
- [ ] Yahoo OAuth still works
- [ ] Team data displays correctly
- [ ] Team selector switches teams
- [ ] Check Vercel logs for errors
- [ ] Verify database migration ran successfully

---

## Environment Variables (Verify in Vercel)

Make sure these are set in Vercel production:

- ✅ `DATABASE_URL`
- ✅ `NEXTAUTH_SECRET`
- ✅ `NEXTAUTH_URL`
- ✅ `NEXT_PUBLIC_API_BASE`
- ✅ `YAHOO_CLIENT_ID`
- ✅ `YAHOO_CLIENT_SECRET`

---

## Rollback

If something goes wrong:

1. **Vercel Dashboard**: Revert to previous deployment
2. **Git**: `git revert HEAD && git push origin main`

---

**Ready to push?** Run the commands above!
