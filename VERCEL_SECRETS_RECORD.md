# Vercel Secrets Configuration Record

## GitHub Repository Secrets Added

**Repository**: CustomVenom/customvenom-frontend
**Location**: Settings → Secrets and variables → Actions
**Date**: January 2025

### Required Secrets for deploy-production.yml

1. **VERCEL_TOKEN**
   - Value: `w5cnTdVNZVi37czZxxebdR70`
   - Purpose: API token for Vercel authentication

2. **VERCEL_ORG_ID**
   - Value: `team_QxeR05C2BZAoPRXDJRLkhR5g`
   - Purpose: Vercel organization identifier

3. **VERCEL_PROJECT_ID**
   - Value: `prj_b7paDV51FswJXiJeUBtwf5XY3k55`
   - Purpose: Vercel project identifier

## Impact

These secrets enable the GitHub Actions workflow to:
- Successfully deploy to Vercel production
- Make the Workers-only Yahoo OAuth flow live
- Update production with the OAuth fixes

## Workflow File

The deploy-production.yml workflow references these secrets:
```yaml
vercel-token: ${{ secrets.VERCEL_TOKEN }}
vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

## Status

✅ **CONFIGURED** - All required Vercel secrets are now set in GitHub repository settings.
