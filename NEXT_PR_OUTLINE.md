# Next PR: Storybook Seeds + Lighthouse Budget Enforcement

## Purpose
Add visual regression testing and automated performance budget enforcement.

## Scope

### Storybook Seeds
Create component stories for:
- `TrustRibbon` - with various states (fresh, stale, missing data)
- `PageFrame` - all section variants (projections, tools, league, settings)
- `ReasonChips` - boundary enforcement examples
- `SideNav` - active state variations
- `MobileDock` - mobile viewport rendering
- `ProLock` - locked and unlocked states

**Files:**
- `.storybook/main.ts`
- `.storybook/preview.ts`
- `src/components/TrustRibbon.stories.tsx`
- `src/components/PageFrame.stories.tsx`
- `src/components/ReasonChips.stories.tsx`
- `src/components/SideNav.stories.tsx`
- `src/components/MobileDock.stories.tsx`
- `src/components/ProLock.stories.tsx`

### Lighthouse Budget Check
Add automated performance budgets to CI:

**Files:**
- `.github/workflows/lighthouse.yml` (new)
- `lighthouserc.json` (config)

**Budgets:**
```json
{
  "budgets": [
    {
      "path": "/tools",
      "timings": [
        { "metric": "largest-contentful-paint", "budget": 2500 },
        { "metric": "first-contentful-paint", "budget": 1800 },
        { "metric": "cumulative-layout-shift", "budget": 0.1 }
      ],
      "resourceSizes": [
        { "resourceType": "script", "budget": 150 }
      ]
    }
  ]
}
```

### Test Updates
- Add Storybook visual regression tests
- Integrate Lighthouse CI with GitHub Actions
- Add budget failure reporting

## Acceptance Criteria
- [ ] All new components have Storybook stories
- [ ] Stories render correctly in Storybook
- [ ] Lighthouse CI runs on PRs
- [ ] Budget violations fail CI
- [ ] Performance metrics visible in PR comments

## Estimated Effort
- Storybook setup: 2-3 hours
- Component stories: 1-2 hours
- Lighthouse CI: 1 hour
- Total: ~4-6 hours

