# Contributing

## Development Setup

1. **Install dependencies**: `npm install`
2. **Generate Prisma client**: `npx prisma generate`
3. **Run preflight checks**: `npm run preflight`

## Code Quality Standards

### Pre-commit Requirements

All code must pass these checks before committing:

- **ESLint**: `npm run lint` (zero warnings allowed)
- **TypeScript**: `npm run type-check` (no type errors)
- **Build**: `npm run build` (successful compilation)

### Environment Variable Access

**Always use bracket notation for `process.env` access:**

```typescript
// ✅ CORRECT
const apiBase = process.env['NEXT_PUBLIC_API_BASE'];
const stripeKey = process.env['STRIPE_SECRET_KEY'];

// ❌ WRONG - Will trigger ESLint error
const apiBase = process.env.NEXT_PUBLIC_API_BASE;
const stripeKey = process.env.STRIPE_SECRET_KEY;
```

### Yahoo HTTPS Security

**All Yahoo API calls must use HTTPS for security compliance:**

```typescript
// ✅ CORRECT - Use safeFetch for Yahoo endpoints
import { safeFetch } from '@/lib/http-guard';

const response = await safeFetch('http://fantasysports.yahoo.com/api/leagues', options);
// Automatically upgrades to: https://fantasysports.yahoo.com/api/leagues

// ❌ WRONG - Direct fetch can bypass HTTPS enforcement
const response = await fetch('http://fantasysports.yahoo.com/api/leagues', options);
```

**Preflight checks will block any `http://*.yahoo.com` references in source code.**

### safeFetch Checklist

**Before making any Yahoo API calls, verify:**

- [ ] Import `safeFetch` from `@/lib/http-guard`
- [ ] Use `safeFetch()` instead of direct `fetch()` for Yahoo endpoints
- [ ] Test that HTTP URLs are automatically upgraded to HTTPS
- [ ] Verify non-Yahoo URLs remain unchanged
- [ ] Check that relative paths work correctly

**Example implementation:**
```typescript
import { safeFetch } from '@/lib/http-guard';

// ✅ CORRECT - Auto-upgrades to HTTPS
const response = await safeFetch('http://fantasysports.yahoo.com/api/leagues', {
  headers: { 'Authorization': `Bearer ${token}` }
});

// ❌ WRONG - Bypasses HTTPS enforcement
const response = await fetch('http://fantasysports.yahoo.com/api/leagues', options);
```

### Quick Quality Check

**Always run `npm run preflight` before pushing.**

```bash
npm run preflight
```

This runs both ESLint and TypeScript checks with zero tolerance for warnings or errors.

## Git Hooks

Pre-commit and pre-push hooks are configured to enforce these standards automatically. If you need to bypass them (not recommended), use:

```bash
git commit --no-verify
git push --no-verify
```

## Build Configuration

- **Next.js builds**: ESLint is ignored during builds (`eslint.ignoreDuringBuilds: true`)
- **Local development**: ESLint is enforced via pre-commit hooks
- **CI/CD**: All quality checks must pass before deployment

## Troubleshooting

If you encounter import resolution warnings, ensure:
1. All dependencies are installed: `npm install`
2. TypeScript paths are configured correctly in `tsconfig.json`
3. Components exist in the expected locations

The restricted syntax rule prevents `process.env.FOO` dot-access to maintain TypeScript compliance with `exactOptionalPropertyTypes: true`.
