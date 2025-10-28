# Cross-Computer Development Setup

## Quick Setup for Any Computer

### 1. Prerequisites

- Node.js 20.x (use `.nvmrc` file)
- Git configured with your credentials
- Access to the CustomVenom GitHub repository

### 2. Initial Setup

```bash
# Clone the repository
git clone https://github.com/CustomVenom/customvenom-frontend.git
cd customvenom-frontend

# Use the correct Node version (if using nvm)
nvm use

# Install dependencies
npm ci

# Verify setup
npm run type-check
npm run build
```

### 3. Development Workflow

```bash
# Start development server
npm run dev

# Run tests
npm test

# Type check
npm run type-check

# Build for production
npm run build
```

## Vercel Configuration

### Dashboard Settings (Recommended)

Go to Project → Settings → Build & Development Settings:

- **Node.js Version**: `20.x`
- **Install Command**: `npm ci`
- **Build Command**: `vercel build`
- **Output Directory**: `.vercel/output`

### Environment Variables

Set these in Vercel Dashboard → Settings → Environment Variables:

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

## Files for Cross-Computer Compatibility

### `.nvmrc`

```
20
```

Use with `nvm use` to ensure consistent Node version.

### `package.json` engines

```json
{
  "engines": {
    "node": "20"
  }
}
```

### `vercel.json`

```json
{
  "build": { "env": {} },
  "git": {
    "ignoreCommand": "git diff --name-only $VERCEL_GIT_COMMIT_SHA~1 | grep -Ev '^(src|app|pages|components|public|package\\.json|next\\.config\\.js)' >/dev/null || exit 1"
  }
}
```

## Troubleshooting

### Node Version Issues

```bash
# Check current version
node --version

# Use correct version (if nvm installed)
nvm use

# Or install Node 20 manually
# Download from https://nodejs.org/
```

### Build Issues

```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Clear Next.js cache
rm -rf .next
npm run build
```

### Git Issues

```bash
# Check git config
git config --list

# Set user info if needed
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

## Verification Checklist

After setup on any computer:

- [ ] `node --version` shows 20.x
- [ ] `npm ci` completes without errors
- [ ] `npm run type-check` passes
- [ ] `npm run build` succeeds
- [ ] `npm run dev` starts the development server
- [ ] No absolute paths in source code
- [ ] Git operations work correctly

## Notes

- **Absolute Paths**: Avoid hardcoded paths like `C:\Users\...` or `/home/...`
- **Environment Variables**: Use `process.env` for configuration
- **Dependencies**: Always use `npm ci` for consistent installs
- **Node Version**: Stick to Node 20.x for consistency
- **Git**: Repository is the source of truth, not local files
