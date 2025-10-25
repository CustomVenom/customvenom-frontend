# 🚀 Production Deployment Guide

## ✅ Automatic Deployment Options

### Option 1: GitHub Actions (Recommended)
The repository now includes a GitHub Actions workflow that will automatically deploy to Vercel when you push to the main branch.

**Prerequisites:**
1. Set up Vercel secrets in GitHub:
   - Go to: https://github.com/CustomVenom/customvenom-frontend/settings/secrets/actions
   - Add these secrets:
     - `VERCEL_TOKEN`: Your Vercel API token
     - `VERCEL_ORG_ID`: Your Vercel organization ID
     - `VERCEL_PROJECT_ID`: Your Vercel project ID

**How it works:**
- Push to `main` branch → GitHub Actions triggers
- Builds with production environment variables
- Deploys to Vercel production automatically

### Option 2: Vercel Dashboard Configuration
1. Go to: https://vercel.com/dashboard
2. Select your `customvenom-frontend` project
3. Go to Settings → Environment Variables
4. Add:
   - `NEXT_PUBLIC_API_BASE` = `https://customvenom-workers-api.jdewett81.workers.dev`
   - `NEXT_PUBLIC_ENABLE_YAHOO` = `true`
5. Redeploy from the dashboard

### Option 3: Local Deployment Scripts
Run one of these scripts locally:

**Bash (macOS/Linux):**
```bash
chmod +x scripts/deploy-production.sh
./scripts/deploy-production.sh
```

**PowerShell (Windows):**
```powershell
./scripts/deploy-production.ps1
```

## 🔧 Environment Variables

The following environment variables are configured for production:

```bash
NEXT_PUBLIC_API_BASE=https://customvenom-workers-api.jdewett81.workers.dev
NEXT_PUBLIC_ENABLE_YAHOO=true
```

## 📋 Deployment Checklist

- [ ] Workers API deployed to production ✅
- [ ] Yahoo OAuth credentials set in Cloudflare Workers ✅
- [ ] Frontend code synced to GitHub ✅
- [ ] Environment variables configured ✅
- [ ] Vercel deployment triggered ✅
- [ ] Yahoo Developer Console configured (manual)
- [ ] Complete OAuth flow tested (manual)

## 🎯 Next Steps

1. **Configure Yahoo Developer Console:**
   - Redirect URI: `https://customvenom-workers-api.jdewett81.workers.dev/api/yahoo/callback`
   - Scope: `fspt-r`

2. **Test Complete OAuth Flow:**
   - Open: `https://customvenom-workers-api.jdewett81.workers.dev/api/yahoo/connect?returnTo=/settings`
   - Complete Yahoo consent
   - Verify session works
   - Capture final receipts

## 🔗 Production URLs

- **Workers API**: `https://customvenom-workers-api.jdewett81.workers.dev`
- **Frontend**: `https://customvenom-frontend.vercel.app` (after Vercel deployment)

## 📝 Troubleshooting

### Vercel Deployment Issues
- Check Vercel dashboard for deployment status
- Verify environment variables are set correctly
- Check build logs for any errors

### OAuth Flow Issues
- Verify Yahoo Developer Console redirect URI matches exactly
- Check Workers API logs for OAuth errors
- Ensure all environment variables are set correctly

The deployment configuration is now complete and ready for production!
