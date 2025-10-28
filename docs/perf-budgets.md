# Performance Budgets

## Core Web Vitals Targets

### Largest Contentful Paint (LCP)

- **Target**: < 2.5s
- **Measure**: First large content element render
- **Priority**: Critical

### First Input Delay (FID)

- **Target**: < 100ms
- **Measure**: Time to interactive
- **Priority**: Critical

### Cumulative Layout Shift (CLS)

- **Target**: < 0.1
- **Measure**: Visual stability
- **Priority**: Critical
- **Test**: `tests/visual/cls.spec.ts`

## API Response Times

### Projections Endpoint

- **Target**: < 300ms (p95)
- **Cache**: 5min (300s)
- **Stale-if-error**: 24h (86400s)

### Health Endpoint

- **Target**: < 50ms
- **Cache**: no-store

## Bundle Sizes

### Initial Load

- **Target**: < 150KB (gzipped)
- **Measure**: Main bundle JS

### Total Page Weight

- **Target**: < 500KB (gzipped)
- **Includes**: JS, CSS, fonts

## Monitoring

Run performance tests locally:

```bash
npx playwright test tests/visual/cls.spec.ts
```

Check Lighthouse in browser DevTools for Core Web Vitals.
