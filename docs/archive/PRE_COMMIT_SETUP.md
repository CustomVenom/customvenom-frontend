# Pre-Commit Setup - Catch Errors Before Vercel

## 🎯 Problem Solved

**Before:** TypeScript errors reach Vercel → build fails → frustration  
**After:** Errors caught locally → fix before commit → smooth deployments ✅

---

## 🚀 What's Been Set Up

### 1. **GitHub Actions Workflow** ✅

**File:** `.github/workflows/lint-and-type-check.yml`

**Runs on every push and PR:**

- ✅ ESLint check
- ✅ TypeScript type check
- ✅ Scans for `any` types
- ✅ Prisma schema validation

**Result:** Vercel won't even try to build if CI fails

### 2. **Pre-Commit Hook** ✅

**File:** `.husky/pre-commit`

**Runs before every commit:**

- ✅ Lints only changed files (fast!)
- ✅ Auto-fixes what it can
- ✅ Type checks entire project
- ✅ Blocks commit if errors found

### 3. **Pre-Push Hook** ✅

**File:** `.husky/pre-push`

**Runs before every git push:**

- ✅ Full lint check
- ✅ Full type check
- ✅ Blocks push if errors found

### 4. **VSCode Auto-Fix** ✅

**File:** `.vscode/settings.json`

**Auto-fixes on save:**

- ✅ ESLint auto-fix
- ✅ Prettier formatting
- ✅ Trailing whitespace removal
- ✅ Final newline insertion
- ✅ Consistent line endings (LF)

### 5. **NPM Scripts** ✅

**File:** `package.json`

**New commands:**

```bash
npm run lint          # Check for errors
npm run lint:fix      # Auto-fix what's possible
npm run type-check    # TypeScript validation
npm run pre-commit    # Run both checks manually
```

---

## ⚡ Quick Start (One-Time Setup)

### Step 1: Initialize Husky (30 seconds)

```bash
cd customvenom-frontend
npm run prepare
chmod +x .husky/pre-commit
chmod +x .husky/pre-push
```

**Windows (PowerShell):**

```powershell
cd customvenom-frontend
npm run prepare
# Hooks work on Windows via Git Bash
```

### Step 2: Test It Works (1 minute)

```bash
# Make a small change
echo "// test" >> src/lib/test.ts

# Try to commit
git add .
git commit -m "test"

# Should run lint and type-check automatically
# If errors exist, commit will be blocked ✅
```

### Step 3: Install VSCode Extension (optional)

1. Install "ESLint" extension
2. Install "Prettier" extension
3. Reload VSCode
4. ✅ Auto-fix on save enabled

---

## 🛡️ What Gets Checked

### Before Commit (Fast - Only Changed Files)

- ✅ ESLint on staged files
- ✅ Prettier formatting
- ✅ TypeScript compilation
- ⏱️ Takes 5-10 seconds typically

### Before Push (Comprehensive - All Files)

- ✅ Full ESLint check
- ✅ Full TypeScript check
- ⏱️ Takes 20-30 seconds typically

### In GitHub Actions (On Push/PR)

- ✅ ESLint
- ✅ TypeScript
- ✅ Scan for `any` types
- ✅ Prisma validation
- ⏱️ Takes 1-2 minutes

---

## 🎯 Common Scenarios

### Scenario 1: Quick Fix Commit

```bash
# Make changes
vim src/lib/cache.ts

# Commit (auto-lints and type-checks)
git add .
git commit -m "fix: update cache logic"

# If errors found:
# ❌ Commit blocked
# 📝 Fix errors shown in terminal
# ✅ Try commit again
```

### Scenario 2: Skip Hooks (Emergency Only)

```bash
# Skip pre-commit (NOT RECOMMENDED)
git commit --no-verify -m "emergency fix"

# Better: Fix the errors!
npm run lint:fix  # Auto-fix what's possible
npm run type-check  # See remaining errors
```

### Scenario 3: Fix Before Pushing

```bash
# Check locally before push
npm run pre-commit

# See all errors at once
npm run lint
npm run type-check

# Auto-fix what's possible
npm run lint:fix
```

---

## 🔍 What Each Tool Does

### ESLint

**Catches:**

- ❌ `any` types
- ❌ Unused variables
- ❌ Missing dependencies in useEffect
- ❌ Wrong HTML elements (<a> instead of <Link>)
- ❌ Code style violations

**Auto-fixes:**

- ✅ Import sorting
- ✅ Spacing and indentation
- ✅ Quote style consistency
- ✅ Some unused variable removals

### TypeScript

**Catches:**

- ❌ Type errors
- ❌ Missing properties
- ❌ Invalid type assignments
- ❌ Compilation errors

**Cannot auto-fix** - requires manual fixes

### Prettier

**Fixes:**

- ✅ Code formatting
- ✅ Line length
- ✅ Spacing
- ✅ Quote style
- ✅ Trailing commas

---

## 📋 Checklist for Clean Commits

### Every Time (Automated)

- [x] ESLint runs on changed files
- [x] TypeScript checks entire project
- [x] Prettier formats code
- [x] Blocks commit if errors found

### Manually (When Needed)

```bash
# Before starting work
git pull origin main

# While working
npm run dev  # Watch for console errors

# Before committing
npm run lint:fix  # Auto-fix style issues
npm run type-check  # Verify types

# Commit (hooks run automatically)
git add .
git commit -m "your message"

# Before pushing (hook runs automatically)
git push origin main
```

---

## 🆘 Troubleshooting

### "Hooks not running"

```bash
# Reinitialize husky
npm run prepare

# Make hooks executable (Mac/Linux)
chmod +x .husky/pre-commit
chmod +x .husky/pre-push

# On Windows, hooks run via Git Bash automatically
```

### "ESLint taking too long"

```bash
# Lint only changed files
npx lint-staged

# Or disable pre-commit temporarily
git commit --no-verify -m "message"
```

### "Type check fails but I need to commit"

```bash
# See errors
npm run type-check

# Fix errors, then commit
# DON'T use --no-verify unless emergency
```

### "Prettier conflicts with ESLint"

```bash
# Install prettier if needed
npm install --save-dev prettier

# Format all files
npx prettier --write "src/**/*.{ts,tsx}"
```

---

## 🎓 Best Practices

### 1. **Run Checks Before Starting Work**

```bash
npm run lint
npm run type-check
```

Start with a clean slate ✅

### 2. **Fix Errors Immediately**

Don't let errors pile up. Fix as you go.

### 3. **Use Auto-Fix Liberally**

```bash
npm run lint:fix
```

Let tools fix formatting for you.

### 4. **Test Locally First**

```bash
npm run build
```

Catch build errors before pushing.

### 5. **Read Error Messages**

TypeScript and ESLint errors are usually helpful!

---

## 📊 Benefits

### Time Saved

- **Before:** 10+ minutes waiting for Vercel build to fail
- **After:** 5-10 seconds to catch errors locally

### Reduced Frustration

- **Before:** Commit → Push → Vercel fails → Fix → Push again
- **After:** Fix before commit → Push once → Success ✅

### Cleaner History

- No "fix lint errors" commits
- No "fix types" commits
- Professional commit history

---

## 🔧 Optional: Install Prettier Globally

```bash
npm install -g prettier

# Format any file
prettier --write src/lib/cache.ts

# Check formatting
prettier --check "src/**/*.{ts,tsx}"
```

---

## 📝 Quick Reference Card

```bash
# Check errors
npm run lint          # ESLint
npm run type-check    # TypeScript
npm run pre-commit    # Both

# Auto-fix
npm run lint:fix      # Fix ESLint issues

# Test build
npm run build         # Full production build

# Skip hooks (emergency)
git commit --no-verify
git push --no-verify

# Manual staging
npx lint-staged       # Lint only staged files
```

---

## ✅ Setup Complete

You now have **3 layers of protection**:

1. **VSCode** → Auto-fix on save
2. **Pre-commit hook** → Catch errors before commit
3. **GitHub Actions** → Final safety net before Vercel

**Result:** TypeScript and ESLint errors caught in < 10 seconds, not 10 minutes! 🎉

---

**Next:** Just commit normally. Hooks will run automatically and catch errors before they reach Vercel.
