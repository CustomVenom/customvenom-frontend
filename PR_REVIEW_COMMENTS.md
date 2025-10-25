# PR Review Comments

## Overall

Looks solid! Trust layer is properly implemented with boundary enforcement. Nav a11y improvements are thoughtful.

## Trust Snapshot Visibility

**Comment:** Verify Trust Snapshot renders on /tools page with schema version and timestamp. Should see something like "Schema: v1 • Calibrated: Oct 22, 1:06 PM" in the Trust Snapshot component.

## CLS Performance

**Comment:** Can you confirm CLS < 0.1 on both /tools and /projections? I've added tests for this but would be good to manually verify in Lighthouse/DevTools.

## Quick Nav (G+P/T/L/S)

**Comment:** Test keyboard shortcuts: press `G` then `P` to navigate to projections, `G` then `T` for tools, etc. Should work without visible UI feedback (silent navigation).

## Skip Link

**Comment:** Tab from the address bar and verify skip link appears with yellow highlight. Press Enter should jump to #main-content.

## DevOverlay

**Comment:** Confirm DevOverlay is dev-only: run `npm run build` and verify overlay doesn't appear in production build. In dev, press backtick to toggle.

## Chips Boundary Enforcement

**Comment:** Verify ReasonChips component respects ≤2 chips, conf≥0.65, |Δ|≤4%. Check projections page where chips are displayed.

## aria-current

**Comment:** Check SideNav and MobileDock mark the active page with aria-current="page". Verify this is on the correct nav item when on each page.
