# Vercel Setup Guide for CustomVenom Frontend

## Quick Setup (Free/Hobby Plan)

### 1. Project Settings
- **Framework**: Next.js (auto-detected)
- **Node.js Version**: 20.x (matches package.json engines)
- **Install Command**: `npm ci`
- **Build Command**: `vercel build`
- **Output Directory**: `.vercel/output`

### 2. Environment Variables
Add these per environment:

**Production:**
```
NEXT_PUBLIC_API_BASE=https://api.customvenom.com
NEXT_PUBLIC_ENABLE_MULTI_SPORT=false
```

**Preview:**
```
NEXT_PUBLIC_API_BASE=https://customvenom-workers-api-staging.jdewett81.workers.dev
NEXT_PUBLIC_ENABLE_MULTI_SPORT=true
```

### 3. Build Optimization
The `vercel.json` file includes:
- **Ignored Build Step**: Skips builds for docs-only changes to save minutes
- **Git Ignore Command**: Only builds when source files change

### 4. CORS Configuration
Ensure your Workers API allows the Vercel preview origin:
- Add `https://customvenom-frontend-*.vercel.app` to CORS origins
- Keep `Access-Control-Allow-Credentials: true` for cookies

## Files Created

### `vercel.json`
```json
{
  "build": { "env": {} },
  "git": {
    "ignoreCommand": "git diff --name-only $VERCEL_GIT_COMMIT_SHA~1 | grep -Ev '^(src|app|pages|components|public|package\.json|next\.config\.js)' >/dev/null || exit 1"
  }
}
```

### `.vercel/project.json` (Template)
```json
{
  "orgId": "your-org-id",
  "projectId": "your-project-id",
  "settings": {
    "framework": "nextjs",
    "buildCommand": "vercel build",
    "outputDirectory": ".vercel/output",
    "installCommand": "npm ci",
    "nodeVersion": "20.x"
  }
}
```

## Verification Checklist

After deployment, verify:

- [ ] Home page loads without errors
- [ ] Tools page shows selection status
- [ ] `/api/session/selection` endpoints work
- [ ] `cv_sel` cookie hydrates selection on page load
- [ ] No provider labels shown after team selection
- [ ] CORS headers include preview origin
- [ ] Build minutes are conserved (only builds on source changes)

## Next Steps

1. **Deploy to Vercel**: Connect GitHub repo and deploy
2. **Update Workers CORS**: Add Vercel preview origin to allowed origins
3. **Test Selection System**: Verify sticky selection works across sessions
4. **Monitor Builds**: Check that ignored builds are working correctly

## Troubleshooting

- **Build Failures**: Check Node version matches 20.x
- **CORS Errors**: Verify Workers API allows Vercel origin
- **Selection Issues**: Check cookie domain and SameSite settings
- **Build Minutes**: Verify ignore command is working
