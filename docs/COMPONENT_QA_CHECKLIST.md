# Component QA Checklist

Quick verification checklist for UI components. Use Storybook to test isolated component states.

## TrustRibbon

### States to Verify
- [ ] **Fresh**: Shows v{schema_version} • last_refresh (no stale badge)
- [ ] **Stale**: Shows v{schema_version} • last_refresh • [stale] badge
- [ ] **Missing Data**: Shows v{schema_version} • — (dash for missing time)
- [ ] **Responsive**: Text wraps properly on mobile viewports
- [ ] **Dark Mode**: Colors invert correctly

### Quick Assert
```typescript
// TrustRibbon should always reserve height (h-6) to prevent CLS
// Fixed ribbon overlays the spacer
```

---

## PageFrame

### States to Verify
- [ ] **Projections**: Purple → Pink → Orange gradient
- [ ] **Tools**: Blue → Cyan → Teal gradient
- [ ] **League**: Green → Emerald → Lime gradient
- [ ] **Settings**: Gray → Slate → Zinc gradient
- [ ] **Dark Mode**: Gradients have proper dark variants

### Quick Assert
```typescript
// PageFrame should not cause CLS
// Background should be present on initial render
```

---

## ReasonChips

### States to Verify
- [ ] **High Confidence (2 chips)**: Shows top 2 reasons with conf ≥ 0.65
- [ ] **Mixed Positive/Negative**: Correctly displays +X% and -X% badges
- [ ] **Low Confidence Filtered**: Chips with conf < 0.65 don't appear
- [ ] **Boundary Enforcement**: Total |Δ| clamped to ≤ 4%
- [ ] **Empty State**: Gracefully handles empty reasons array

### Quick Assert
```typescript
// Maximum 2 chips per projection
// Confidence threshold: ≥ 0.65
// Total effect delta: ≤ 4%
```

---

## SideNav

### States to Verify
- [ ] **Active State**: Current page marked with aria-current="page"
- [ ] **Visual Highlight**: Active item has bg-[rgb(var(--cv-primary))] and white text
- [ ] **Hover**: Non-active items show hover state
- [ ] **Navigation**: Clicking items navigates correctly
- [ ] **Desktop Only**: Hidden on mobile (< lg breakpoint)

### Quick Assert
```typescript
// SideNav should only render on lg+ viewports
// Active item must have aria-current="page"
```

---

## MobileDock

### States to Verify
- [ ] **Active State**: Current page marked with aria-current="page"
- [ ] **Visual Highlight**: Active item uses primary color
- [ ] **Icon + Label**: Both icon and text label visible
- [ ] **Bottom Fixed**: Stays at bottom of viewport (z-50)
- [ ] **Mobile Only**: Hidden on desktop (≥ lg breakpoint)

### Quick Assert
```typescript
// MobileDock should only render on < lg viewports
// Fixed positioning at bottom
// Active item must have aria-current="page"
```

---

## ProLock

### States to Verify
- [ ] **Unlocked (isPro=true)**: Content fully visible, no overlay
- [ ] **Locked (isPro=false)**: Content blurred with lock overlay
- [ ] **Custom Message**: Locked state shows upgrade CTA
- [ ] **Keyboard Accessible**: Tab navigates to CTA button
- [ ] **Navigation**: CTA navigates to /go-pro

### Quick Assert
```typescript
// When locked, content has blur-sm opacity-60
// Overlay contains single CTA button
// Button navigates to upgrade page
```

---

## General Checks

### Accessibility
- [ ] All interactive elements keyboard accessible
- [ ] Proper ARIA labels on all components
- [ ] aria-current used on active navigation items
- [ ] Color contrast meets WCAG AA standards

### Performance
- [ ] No layout shifts (CLS < 0.1)
- [ ] No console errors or warnings
- [ ] Components render without flicker
- [ ] Responsive behavior smooth on resize

### Visual Consistency
- [ ] Consistent spacing and typography
- [ ] Colors match design system
- [ ] Dark mode variants work correctly
- [ ] Border radius and shadows consistent

---

## Testing Commands

```bash
# View all stories
npm run storybook

# Run visual regression
npx playwright test tests/visual/tools-header.vrt.spec.ts

# Run Lighthouse
npm run lhci
```

