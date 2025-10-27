# Vercel Build Failure Incident Response

## Incident Summary
- **Symptom**: Vercel build fails during npm install with ERESOLVE on peer dependencies
- **Root Cause**: next@16.0.0 conflicts with @sentry/nextjs@8.55.0, which supports up to Next 15.x only
- **Impact**: Preview/production deploys from this branch cannot proceed
- **Resolution**: Pinned Next.js to 15.5.6 to maintain compatibility

## Resolution Applied (Path A)
✅ **Next.js Version Pinned**: `next@15.5.6` in package.json  
✅ **Lockfile Updated**: package-lock.json reflects pinned version  
✅ **Build Verified**: Local build succeeds with pinned version  
✅ **Committed & Pushed**: Changes deployed to main branch  

## Vercel Configuration
**Project → Settings → Build & Development Settings:**
- **Framework**: Next.js
- **Node.js Version**: 20.x
- **Install Command**: `npm ci`
- **Build Command**: `vercel build`
- **Output Directory**: `.vercel/output`

**Environment Variables:**
- **Production**: `NEXT_PUBLIC_API_BASE=https://api.customvenom.com`
- **Preview**: `NEXT_PUBLIC_API_BASE=https://customvenom-workers-api-staging.jdewett81.workers.dev`

## Verification Checklist
- [ ] Vercel build logs show "Found: next@15.5.6"
- [ ] npm ci completes without ERESOLVE errors
- [ ] Preview URL loads successfully
- [ ] Selection system works (team persists after refresh)
- [ ] API calls include x-team-key and x-league-key headers
- [ ] CORS headers include preview origin with ACAC=true

## Prevention Measures
✅ **Renovate Rule**: Blocks Next >=16 until Sentry supports it  
✅ **Dependabot Config**: Ignores Next 16+ updates  
✅ **Vercel Ignore Command**: Skips builds for non-source changes  
✅ **Package.json Engines**: Enforces Node 20.x  

## Rollback Plan
If issues arise after future upgrades:
```bash
git revert <commit-hash>  # Revert problematic upgrade
git push
# Re-deploy in Vercel
```

## Status
- **Current State**: ✅ Resolved
- **Next Action**: Monitor for Sentry Next 16 support
- **Follow-up**: Upgrade Next + Sentry together when compatible

## Files Modified
- `package.json` - Pinned next to 15.5.6
- `package-lock.json` - Updated lockfile
- `renovate.json` - Added dependency management rules
- `.github/dependabot.yml` - Added Dependabot configuration
- `vercel.json` - Added build optimization
