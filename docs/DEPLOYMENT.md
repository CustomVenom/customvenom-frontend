# Frontend Deployment Guide

**Architecture Law #5: CI/CD Quality Gates**

This guide ensures all architectural laws pass before deployment.

## Quick Start

```bash
# Run smoke tests (validates all architectural laws)
npm run smoke:laws

# Deploy with full test suite
npm run deploy:safe
```

## Smoke Tests

The smoke test suite (`scripts/smoke-tests.ts`) validates:

1. **TypeScript Compilation** - Code compiles without errors
2. **ESLint Check** - Code follows style guidelines (including architectural law rules)
3. **Frontend Structured JSON Logging** - Logger outputs proper JSON with request IDs
4. **Request ID Middleware** - Request IDs generated at edge
5. **API Contract Guards** - Guards prevent frontend heuristics
6. **ESLint Rules for Heuristics** - Rules prevent fantasy point calculations
7. **No Frontend Fantasy Calculations** - No business logic in frontend
8. **CI Workflow Quality Gates** - CI enforces all checks
9. **Configuration as Code** - All config in vercel.json
10. **Next.js Build** - Application builds successfully

## Deployment Pipeline

The deployment script (`scripts/deploy-with-tests.sh`) runs:

1. ✅ Check for uncommitted changes
2. ✅ Pull latest from remote
3. ✅ Install dependencies (`npm ci`)
4. ✅ Run smoke tests (architecture laws)
5. ✅ Run unit tests
6. ✅ Build application
7. ✅ Push to remote
8. ✅ Deploy to Vercel preview
9. ✅ Test preview deployment
10. ✅ Prompt for production deployment

## Manual Deployment Steps

If you need to deploy manually:

```bash
# 1. Ensure all tests pass
npm run smoke:laws
npm test
npm run build

# 2. Push to remote
git push origin main

# 3. Deploy to Vercel
vercel --prod
```

## Pre-Deployment Checklist

- [ ] All smoke tests pass (`npm run smoke:laws`)
- [ ] All unit tests pass (`npm test`)
- [ ] TypeScript compiles (`npm run typecheck`)
- [ ] No linting errors (`npm run lint`)
- [ ] Build succeeds (`npm run build`)
- [ ] Git repository is clean (`git status`)
- [ ] Preview deployment verified
- [ ] Request IDs present in logs

## Architecture Law Validation

The smoke tests specifically validate:

- **Law #1:** Types align with contracts (via shared-types package)
- **Law #2:** No fantasy calculations in frontend
- **Law #3:** API contract guards prevent heuristics
- **Law #4:** Structured JSON logging with request IDs
- **Law #5:** CI workflow enforces quality gates

See `customvenom-workers-api/docs/ARCHITECTURE.md` for complete architectural laws documentation.

## Troubleshooting

### Smoke Tests Fail

1. Check which test failed (see output)
2. Fix the issue in the corresponding file
3. Re-run: `npm run smoke:laws`

### ESLint Errors

The ESLint config includes architectural law rules that prevent:

- Fantasy point calculations
- Heuristic fallbacks (`projection * 0.7`)

Fix violations or add appropriate comments.

### Build Fails

1. Check TypeScript errors: `npm run typecheck`
2. Check linting errors: `npm run lint`
3. Fix issues and retry

### Vercel Deployment Fails

1. Check Vercel dashboard for build logs
2. Verify environment variables are set
3. Check for build errors in logs
4. Ensure `vercel.json` is properly configured
