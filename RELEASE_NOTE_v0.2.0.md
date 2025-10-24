# What Changed - v0.2.0

## Trust Layer
Introduced a consistent trust ribbon across all pages showing data schema version and last refresh time. The ribbon displays a `[stale]` badge only when `x-stale=true` header is present, helping users understand data freshness at a glance.

## Unified Visual Design
Implemented "Venom Field Map" backgrounds with gradient themes per section:
- **Projections**: Purple → Pink → Orange
- **Tools**: Blue → Cyan → Teal
- **League**: Green → Emerald → Lime
- **Settings**: Gray → Slate → Zinc

## Boundary Discipline
Enhanced reason chips to enforce strict display rules:
- Maximum 2 chips per projection
- Confidence threshold ≥ 0.65
- Total effect delta ≤ 4%

This ensures explanations are focused and trustworthy without overwhelming users.

## Navigation Improvements
Added comprehensive navigation enhancements:
- **Side Navigation**: Desktop sidebar with active state indicators
- **Mobile Dock**: Bottom navigation for mobile devices
- **Skip Link**: Keyboard shortcut to jump directly to main content
- **Quick Navigation**: Press `G` then `P`/`T`/`L`/`S` to navigate instantly

All navigation includes proper `aria-current` attributes for screen readers.

## Developer Experience
- **DevOverlay**: Diagnostic panel (dev-only, toggle with backtick) showing request metadata
- **Trust Libraries**: Utilities for extracting and validating trust headers
- **i18n Scaffold**: Translation infrastructure ready for future localization

## Performance
Added CLS (Cumulative Layout Shift) monitoring with tests enforcing < 0.1 threshold on key pages.

## Testing
New Playwright tests covering:
- Trust snapshot visibility
- CLS performance
- Chip boundary enforcement
- Navigation accessibility
- Mobile dock responsiveness

