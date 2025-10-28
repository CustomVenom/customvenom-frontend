# Safe Upgrade Process Template

This document provides a repeatable process for safely upgrading dependencies one family at a time.

---

## 🎯 Upgrade Philosophy

**ONE DEPENDENCY FAMILY AT A TIME**

- Upgrade related packages together (e.g., Next.js + React together)
- Test thoroughly before moving to next family
- Each upgrade gets its own branch and PR
- Merge only when ALL checks pass

---

## 📋 Upgrade Checklist Template

Copy this checklist for each upgrade PR:

```markdown
## Upgrade: [Dependency Name] to [Version]

### Pre-Upgrade

- [ ] Current version: \_\_\_
- [ ] Target version: \_\_\_
- [ ] Reviewed CHANGELOG for breaking changes
- [ ] Checked compatibility with other dependencies

### Upgrade Steps

- [ ] Created feature branch: `upgrade/[name]-[version]`
- [ ] Updated `package.json` with exact version
- [ ] Ran `npm ci` to clean install
- [ ] Ran `npm run lint` (0 warnings)
- [ ] Ran `npm run type-check` (0 errors)
- [ ] Ran `npm run build` (success)
- [ ] Local dev test: `npm run dev` works
- [ ] Tested key pages: /projections, /ops/metrics, auth flow

### Verification

- [ ] Committed changes
- [ ] Pushed to GitHub
- [ ] CI workflow passed
- [ ] Preview deployment successful
- [ ] Smoke tested preview URL
- [ ] No console errors or warnings
- [ ] Performance unchanged

### Merge

- [ ] PR approved
- [ ] Merged to main
- [ ] Production deployment successful
- [ ] Post-deploy smoke test passed
```

---

## 🔄 Upgrade Order (Recommended)

Upgrade in this order to minimize conflicts:

### 1. Next.js + React (Together)

**Why together:** Tightly coupled, version compatibility required

```bash
git checkout -b upgrade/next-15.6.x
cd customvenom-frontend

# Check latest versions
npm view next versions --json | tail -5
npm view react versions --json | tail -5

# Upgrade
npm install next@15.6.0 react@19.1.1 react-dom@19.1.1 --save-exact

# Verify
npm ci
npm run type-check
npm run build
npm run dev

# Test in browser: http://localhost:3000/projections
```

**Critical Tests:**

- [ ] `/projections` renders
- [ ] Server components work
- [ ] Client components work
- [ ] API routes respond
- [ ] Auth flow works

---

### 2. Tailwind CSS + PostCSS

**Why together:** Tailwind v4+ requires specific PostCSS setup

```bash
git checkout -b upgrade/tailwind-4.x
cd customvenom-frontend

# Check current config
cat tailwind.config.js
cat postcss.config.js

# Upgrade
npm install tailwindcss@^4.1.20 @tailwindcss/postcss@^4.1.20 --save-exact

# Verify config compatibility
npm run build

# Check UI
npm run dev
```

**Critical Tests:**

- [ ] All pages render with styles
- [ ] Dark mode toggle works
- [ ] Responsive breakpoints work
- [ ] Custom colors render correctly
- [ ] No missing/broken styles

---

### 3. Stripe SDK

**Why separate:** Financial integration, needs careful testing

```bash
git checkout -b upgrade/stripe-17.x
cd customvenom-frontend

# Check breaking changes
npm view stripe versions --json | tail -5
# Visit: https://github.com/stripe/stripe-node/releases

# Upgrade
npm install stripe@^17.0.0 @stripe/stripe-js@^4.1.0 --save-exact

# Verify
npm ci
npm run type-check
npm run build
```

**Critical Tests:**

- [ ] Checkout page loads
- [ ] Can create checkout session
- [ ] Webhook signature verification works
- [ ] Subscription status updates
- [ ] Test mode works correctly

---

### 4. Auth Libraries (NextAuth + Prisma)

**Why together:** Database adapter compatibility

```bash
git checkout -b upgrade/auth-libs
cd customvenom-frontend

# Check versions
npm view next-auth versions --json | tail -5
npm view @auth/prisma-adapter versions --json | tail -5
npm view @prisma/client versions --json | tail -5

# Upgrade
npm install next-auth@latest @auth/prisma-adapter@latest --save-exact
npm install @prisma/client@latest prisma@latest --save-exact

# Regenerate Prisma client
npx prisma generate

# Verify
npm run type-check
npm run build
```

**Critical Tests:**

- [ ] Sign in with Google works
- [ ] Session persists
- [ ] User data saved to database
- [ ] Admin role assigned correctly
- [ ] Protected routes work
- [ ] Sign out works

---

### 5. Dev Dependencies (ESLint, TypeScript, etc.)

**Why last:** Least likely to break runtime, but may need config updates

```bash
git checkout -b upgrade/dev-deps
cd customvenom-frontend

# Upgrade TypeScript
npm install typescript@latest --save-dev --save-exact

# Upgrade ESLint
npm install eslint@latest eslint-config-next@latest --save-dev --save-exact

# Upgrade other dev deps
npm install prettier@latest --save-dev --save-exact
npm install @types/node@latest @types/react@latest @types/react-dom@latest --save-dev --save-exact

# Verify
npm ci
npm run lint
npm run type-check
npm run build
```

**Critical Tests:**

- [ ] Lint rules still apply
- [ ] Type checking passes
- [ ] Build succeeds
- [ ] No new warnings

---

## 🚨 Breaking Change Detection

### Before Upgrading

Always check for breaking changes:

```bash
# For npm packages
npm view [package-name] versions --json
# Visit GitHub releases: https://github.com/[org]/[repo]/releases

# Read CHANGELOG
npm view [package-name] homepage
```

### Common Breaking Changes to Watch For

**Next.js:**

- App Router changes
- Config file format changes
- Middleware changes
- Image optimization changes
- Environment variable handling

**React:**

- Hook behavior changes
- Server component rules
- Hydration changes

**Tailwind:**

- Config format changes (v3 → v4)
- Class name changes
- Plugin API changes

**Stripe:**

- API version updates
- Webhook event structure changes
- SDK method signature changes

---

## 🔄 Rollback Procedure

If issues are found after merge:

### Option 1: Revert PR (Fast)

```bash
# Find the merge commit
git log --oneline -10

# Revert it
git revert [merge-commit-sha] -m 1

# Push
git push origin main
```

### Option 2: Revert to Specific Commit

```bash
# Find last known good commit
git log --oneline -20

# Create revert branch
git checkout -b revert/[issue-name]

# Revert to good commit
git revert --no-commit [bad-commit-sha]..HEAD
git commit -m "Revert: [reason]"

# Push and create PR
git push origin revert/[issue-name]
```

### Emergency Rollback in Vercel

1. Go to Vercel Dashboard
2. Select deployment before the upgrade
3. Click "Promote to Production"
4. Instant rollback (no git changes needed)

---

## 📊 Post-Upgrade Monitoring

After each upgrade is merged to production:

### Immediate (First Hour)

- [ ] Check Vercel deployment logs (no errors)
- [ ] Visit production site (loads correctly)
- [ ] Test critical flows (auth, projections, ops)
- [ ] Check browser console (no new errors)
- [ ] Verify no performance regression

### First Day

- [ ] Monitor uptime alerts (no new failures)
- [ ] Check Sentry for new errors (if enabled)
- [ ] Review Vercel analytics (no traffic drop)
- [ ] Test on multiple devices/browsers

### First Week

- [ ] No user-reported issues
- [ ] Performance metrics stable
- [ ] Error rate unchanged
- [ ] Ready for next upgrade

---

## 🎯 Example: Complete Upgrade Flow

### Upgrading Next.js 15.5.4 → 15.6.0

```bash
# 1. Create branch
git checkout main
git pull
git checkout -b upgrade/next-15.6.0

# 2. Upgrade
cd customvenom-frontend
npm install next@15.6.0 --save-exact

# 3. Clean install
npm ci

# 4. Run checks
npm run lint
# Expected: 0 warnings

npm run type-check
# Expected: 0 errors

npm run build
# Expected: Build succeeded

# 5. Local test
npm run dev
# Visit: http://localhost:3000/projections
# Check: No console errors, page renders

# 6. Commit
git add package.json package-lock.json
git commit -m "chore: upgrade Next.js to 15.6.0

- Reviewed CHANGELOG: no breaking changes
- Ran full test suite: all pass
- Local smoke test: ✅"

# 7. Push
git push origin upgrade/next-15.6.0

# 8. Create PR on GitHub
# Title: "Upgrade: Next.js 15.5.4 → 15.6.0"
# Use PR template checklist

# 9. Wait for CI to pass

# 10. Deploy preview and test
# Visit preview URL
# Run smoke tests

# 11. Merge when green

# 12. Monitor production for 24 hours

# 13. Move to next upgrade
```

---

## 🔒 Lockfile Management

**ALWAYS commit `package-lock.json`:**

- Ensures reproducible builds
- Locks transitive dependencies
- Critical for CI/CD stability

**NEVER commit `node_modules`:**

- Use `.gitignore` to exclude
- Let `npm ci` rebuild on deployment

---

## 📝 Upgrade Log Template

Keep a log of all upgrades:

```markdown
# Upgrade Log

## 2025-10-18: Next.js 15.5.4 → 15.6.0

- **PR:** #123
- **Deployed:** 2025-10-18 14:30 UTC
- **Status:** ✅ Success
- **Issues:** None
- **Rollback:** Not needed

## 2025-10-20: Tailwind 4.1.14 → 4.1.20

- **PR:** #124
- **Deployed:** 2025-10-20 10:15 UTC
- **Status:** ✅ Success
- **Issues:** None
- **Rollback:** Not needed
```

---

## ✅ Success Criteria

An upgrade is successful when:

- [ ] All CI checks pass
- [ ] Preview deployment works
- [ ] Manual smoke tests pass
- [ ] No new console errors
- [ ] No performance regression
- [ ] Production deployment successful
- [ ] 24-hour monitoring shows no issues

---

**Remember:**

- One upgrade at a time
- Test thoroughly
- Monitor after deployment
- Don't rush - stability over speed
