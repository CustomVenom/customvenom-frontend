# UI Redesign Testing Checklist

## ✅ Build & Type Safety
- [ ] `npm run type-check` passes (all TypeScript errors resolved)
- [ ] `npm run build` completes successfully
- [ ] No console warnings in dev mode

## 🌐 Public Hub (Light Mode)
- [ ] Landing page (`/`) loads with light background
- [ ] Yard-line pattern visible on background
- [ ] VenomLogo displays correctly
- [ ] Hero section shows "Pick Your Poison"
- [ ] Projections showcase table renders
- [ ] Trust Snapshot widget visible
- [ ] Features grid displays correctly
- [ ] CTA section with gradient background
- [ ] Footer renders with links
- [ ] Mobile responsive (test on mobile viewport)

## 🔐 Auth Flow
- [ ] `/login` page renders (dark theme, scale pattern)
- [ ] `/signup` page renders (dark theme)
- [ ] Email/password login works
- [ ] Signup flow creates user with FREE tier
- [ ] Redirect to dashboard after login works
- [ ] `/account` page requires authentication (redirects if not logged in)
- [ ] Account tabs (Profile, Billing, Leagues, Preferences) render

## 🐍 Dashboard Hub (Dark Mode)
- [ ] Dashboard (`/dashboard`) loads with dark background
- [ ] Scale pattern visible on background
- [ ] "War Room" heading displays
- [ ] Team selector dropdown works
- [ ] Yahoo OAuth connection flow intact
- [ ] Player data loads correctly
- [ ] Navigation cards render
- [ ] Dark theme applied consistently
- [ ] Mobile responsive

## 💎 StrikeForce Paywall
- [ ] StrikeForce component renders for FREE users
- [ ] Tier badges display correctly (Viper/Mamba)
- [ ] Upgrade CTA links to `/account?upgrade=`
- [ ] Inline variant shows upgrade card
- [ ] Blur variant overlays content (if used)
- [ ] Loading state shows spinner
- [ ] Unauthenticated state shows "Connect League"

## 🛡️ Middleware Protection
- [ ] `/dashboard` redirects to `/login` when not authenticated
- [ ] `/account` redirects to `/login` when not authenticated
- [ ] MAMBA routes (`/dashboard/killshots`, etc.) check tier
- [ ] Development mode: FREE users can access dashboard
- [ ] Yahoo OAuth routes (`/api/yahoo/*`) are whitelisted
- [ ] Static files load correctly

## 🎨 Design System
- [ ] Venom colors applied (venom-500, venom-600, etc.)
- [ ] Strike gold accents visible
- [ ] Field dark backgrounds applied
- [ ] Animations work (venom-glow, strike-pulse)
- [ ] Button variants render correctly
- [ ] Card variants (public/dashboard) display correctly
- [ ] Badge variants (trust/venom/strike) render

## 🔗 Integration Points
- [ ] Yahoo OAuth flow unchanged
- [ ] Player data API (`/api/projections`) works
- [ ] Trust Snapshot shows schema_version and last_refresh
- [ ] No breaking changes to existing functionality

## 📱 Performance
- [ ] LCP < 2.5s on landing page
- [ ] No layout shift on navigation
- [ ] Images optimize correctly
- [ ] Fonts load properly

## 🐛 Known Issues
- NextAuth build warning: `Module not found: Can't resolve './lib/oauth2'` (dependency issue, may need `npm install` or dependency update)

---

## Quick Test Commands

```bash
# Health check
curl http://localhost:3000/api/health

# Type check
npm run type-check

# Build
npm run build

# Dev server
npm run dev
```

## Manual Testing URLs

1. **Public Hub**: http://localhost:3000/
2. **Login**: http://localhost:3000/login
3. **Signup**: http://localhost:3000/signup
4. **Dashboard**: http://localhost:3000/dashboard (requires auth)
5. **Account**: http://localhost:3000/account (requires auth)

---

**Test Date**: _[Fill in after testing]_
**Tester**: _[Fill in]_
**Environment**: Development / Staging / Production
**Notes**: _[Any issues or observations]_

