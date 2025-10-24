# Performance Budgets

Automated performance monitoring with Lighthouse CI.

## Local Testing

```bash
# Build the app
npm run build

# Run Lighthouse CI locally
npx @lhci/cli autorun --config=./lighthouse/lighthouserc.json
```

## Budgets

### Metrics
- **FCP** (First Contentful Paint): < 1.8s
- **LCP** (Largest Contentful Paint): < 2.5s
- **CLS** (Cumulative Layout Shift): < 0.1

### Resources
- **Script**: < 150KB (gzipped)
- **Stylesheet**: < 50KB (gzipped)

## CI Integration

Lighthouse CI runs automatically on:
- Pull requests (PRs)
- Pushes to `main` branch

Configured via `.github/workflows/frontend-lighthouse.yml`

## Viewing Results

Results are uploaded to temporary public storage and linked in PR comments.

To use GitHub App integration:
1. Install Lighthouse CI GitHub App
2. Add `LHCI_GITHUB_APP_TOKEN` to repo secrets
3. PR comments will include performance comparison

## Debugging Failures

If Lighthouse CI fails:

1. Check the specific metric that failed
2. Run locally to reproduce: `npx @lhci/cli autorun`
3. Use Lighthouse DevTools to identify bottlenecks
4. Look for:
   - Large bundle sizes
   - Unused JavaScript
   - Blocking resources
   - Layout shifts

## Best Practices

- Keep bundle sizes small with code splitting
- Preload critical resources
- Minimize render-blocking resources
- Avoid layout shifts (CLS)
- Use Next.js Image optimization

