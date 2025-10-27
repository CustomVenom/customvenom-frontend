# ESLint Cleanup Task

**Priority**: Low  
**Estimated Time**: 15 minutes  
**Status**: Pending  

## 🎯 **Objective**

Clean up remaining ESLint warnings to ensure pre-push hook stays green.

## 📋 **Current ESLint Warnings**

Based on last run, the following warnings need to be addressed:

### **Unused Variables (5 warnings)**
- `src/app/api/yahoo/refresh/route.ts:3:7` - `TOKEN_URL` is assigned but never used
- `src/app/settings/ConnectYahoo.tsx:71:16` - `_err` is defined but never used  
- `src/app/settings/ConnectYahoo.tsx:105:14` - `_err` is defined but never used
- `src/app/tools/yahoo/[leagueId]/page.tsx:1:10` - `cookies` is defined but never used
- `src/lib/auth.ts:8:8` - `GoogleProvider` is defined but never used

### **Import Resolution (2 warnings)**
- `src/server/yahoo.ts:1:8` - Unable to resolve path to module 'server-only'
- `src/utils/safeFetchJson.ts:1:8` - Unable to resolve path to module 'server-only'

## 🔧 **Fix Strategy**

### **Unused Variables**
1. **Prefix with underscore**: Change `TOKEN_URL` to `_TOKEN_URL`
2. **Remove unused imports**: Remove `cookies` import if not needed
3. **Remove unused providers**: Remove `GoogleProvider` if not used

### **Import Resolution**
1. **Install missing package**: `npm install server-only`
2. **Or remove imports**: If `server-only` not needed, remove the imports

## ✅ **Acceptance Criteria**

- [ ] All ESLint warnings resolved
- [ ] Pre-push hook runs successfully without `--no-verify`
- [ ] No functionality broken
- [ ] Code still compiles and type-checks

## 🚀 **Commands to Run**

```bash
# Fix unused variables
# Edit files to prefix unused vars with underscore or remove them

# Install missing dependency (if needed)
npm install server-only

# Run ESLint to verify
npx eslint . --max-warnings=2

# Test pre-push hook
git add . && git commit -m "test: verify pre-push hook" && git push origin main
```

## 📝 **Notes**

- This is a low-priority cleanup task
- Can be done incrementally
- Focus on keeping pre-push hook green
- No breaking changes to functionality
