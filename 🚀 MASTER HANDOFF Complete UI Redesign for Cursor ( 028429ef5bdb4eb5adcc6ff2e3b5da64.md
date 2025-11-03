# 🚀 MASTER HANDOFF: Complete UI Redesign for Cursor (Nov 2025)

# CustomVenom Complete UI Redesign - Cursor Implementation

**Created**: November 3, 2025

**Status**: Ready for implementation

**Priority**: Critical path to live player data

---

## 🎯 Mission Statement

Redesign CustomVenom frontend with **"Two Worlds" architecture** while **maintaining 100% Yahoo OAuth and player data functionality**. Zero disruption to existing integrations.

### Non-Negotiables

- ✅ Yahoo OAuth flow stays intact (login, callback, session)
- ✅ Player data API continues working (`/api/projections`, `/api/players`)
- ✅ Roster integration unaffected
- ✅ Existing `/dashboard/page.tsx` preserved until migration complete

---

## 📦 What You're Getting

### **7 Complete Implementation Pages**

1. **🎨 Design System v2.0** - Colors, typography, component patterns
2. **🏠 Public Hub Implementation** - Landing page (light mode)
3. **⚔️ Dashboard Hub Implementation** - War Room (dark mode)
4. **🎨 Component Library** - 10+ reusable components
5. **🔐 Auth & Authorization Framework** - Tiers, permissions, paywalls
6. **⚡ StrikeForce Paywall Component** - Venom-themed upgrades
7. **🔑 Login/Signup/Account Pages** - Complete auth flow

### **Key Design Concepts**

- **Public Hub**: Light, inviting, yard-line pattern, "Pick Your Poison"
- **Dashboard Hub**: Dark "war room", scale pattern, Strike Gold accents
- **Three Tiers**: Hatchling (free), Viper ($9.99), Mamba ($19.99)
- **No Generic "Pro"**: All venom-themed ("Unleash Full Venom", "Strike Force")

---

## 🗂️ Page Links (View in Notion)

[🎨 CustomVenom Design System v2.0 — Complete Redesign](https://www.notion.so/CustomVenom-Design-System-v2-0-Complete-Redesign-4dcae243dccf42c89c7ec616b51b71a1?pvs=21)

[🏠 Public Hub - Complete Implementation (Landing + Projections)](https://www.notion.so/Public-Hub-Complete-Implementation-Landing-Projections-022e050528c7455899f6dc455a2c42cc?pvs=21)

[⚔️ Dashboard Hub - Complete Implementation (War Room)](https://www.notion.so/Dashboard-Hub-Complete-Implementation-War-Room-e26e023cb62c4905b516bd7e3c3c54d6?pvs=21)

[🎨 Complete Component Library](https://www.notion.so/Complete-Component-Library-9c9a1e2522284e26b52bf44ee0ba31bf?pvs=21)

[🔐 Authentication & Authorization Framework](https://www.notion.so/Authentication-Authorization-Framework-f71d74ff0e98419d87993fb4502f98bf?pvs=21)

[⚡ StrikeForce Paywall Component](https://www.notion.so/StrikeForce-Paywall-Component-48941aa4a0ed424fbf52590c7f2046e1?pvs=21)

[🔑 Login & Signup Pages](https://www.notion.so/Login-Signup-Pages-e9c2d8f77bb54ef6a3981e459fd3d8ee?pvs=21)

[⚙️ Account Management Page](https://www.notion.so/Account-Management-Page-bd370ef42eca4b02b3372e498cc11605?pvs=21)

[🗄️ User Database Schema & Permissions](https://www.notion.so/User-Database-Schema-Permissions-aac64215c21540ad867bdd5cc98cb9dd?pvs=21)

---

## ⚠️ CRITICAL: Implementation Order

### **Phase 0: Backup & Safety (30 min)**

```bash
cd customvenom-frontend
git checkout -b redesign/ui-v2
git push -u origin redesign/ui-v2

# Snapshot current working state
cp -r src src.backup
cp -r public public.backup
```

### **Phase 1: Foundation (2 hours) - NO BREAKING CHANGES**

**Goal**: Add new design system alongside existing code

### Step 1.1: Install Dependencies

```bash
npm install class-variance-authority clsx tailwind-merge
npm install lucide-react  # Icon library
npm install @auth/prisma-adapter next-auth@beta  # For auth later
```

### Step 1.2: Update Tailwind Config

```jsx
// tailwind.config.js
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        venom: {
          50: '#ecfdf5',
          100: '#d1fae5',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          900: '#064e3b',
        },
        strike: {
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        field: {
          600: '#374151',
          700: '#1f2937',
          800: '#111827',
          900: '#0a0f0b',
        },
        trust: {
          500: '#3b82f6',
          600: '#2563eb',
        },
        alert: {
          500: '#ef4444',
          600: '#dc2626',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
```

### Step 1.3: Add Design Tokens to globals.css

```css
/* src/app/globals.css - APPEND to existing file */

/* Venom Glow Animation */
@keyframes venom-glow {
  0%, 100% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.3); }
  50% { box-shadow: 0 0 40px rgba(16, 185, 129, 0.6); }
}

.venom-glow {
  animation: venom-glow 2s ease-in-out infinite;
}

@keyframes strike-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.strike-pulse {
  animation: strike-pulse 2s ease-in-out infinite;
}

/* Scale Pattern (Dashboard texture) */
.scale-pattern {
  background-image: 
    radial-gradient(circle at 20px 20px, rgba(16, 185, 129, 0.03) 1px, transparent 1px),
    radial-gradient(circle at 60px 60px, rgba(16, 185, 129, 0.03) 1px, transparent 1px);
  background-size: 80px 80px;
  background-position: 0 0, 40px 40px;
}

/* Yard Line Pattern (Public sections) */
.yard-lines {
  background-image: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 49px,
    rgba(16, 185, 129, 0.08) 49px,
    rgba(16, 185, 129, 0.08) 51px
  );
}
```

### Step 1.4: Create Utility Functions

```tsx
// src/lib/utils.ts - NEW FILE
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: number, decimals = 1): string {
  return num.toFixed(decimals)
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
```

**Checkpoint 1.1**: Run `npm run dev` - existing site should work identically

---

### **Phase 2: Component Library (3 hours) - ISOLATED**

**Goal**: Build reusable components in isolation without touching existing pages

### Step 2.1: Core UI Components

```bash
# Create component structure
mkdir -p src/components/ui
mkdir -p src/components/public
mkdir -p src/components/dashboard
mkdir -p src/components/auth
```

**Copy these files from Design System page:**

1. `src/components/ui/Button.tsx`
2. `src/components/ui/Card.tsx`
3. `src/components/ui/Badge.tsx`
4. `src/components/ui/LoadingSpinner.tsx`
5. `src/components/ui/EmptyState.tsx`
6. `src/components/ui/SearchInput.tsx`
7. `src/components/ui/VenomLogo.tsx`

**Checkpoint 2.1**: Run `npm run build` - should compile without errors

---

### **Phase 3: Public Hub (4 hours) - NEW ROUTE**

**Goal**: Build new landing page at `/` WITHOUT touching dashboard

### Step 3.1: Rename Existing Home

```bash
# Move current homepage out of the way
mv src/app/page.tsx src/app/page.tsx.old
```

### Step 3.2: Create New Public Landing

**Copy implementation from Public Hub page:**

1. Create `src/app/page.tsx` (new landing)
2. Create `src/components/public/HeroSection.tsx`
3. Create `src/components/public/ProjectionsShowcase.tsx`
4. Create `src/components/public/TrustSection.tsx`
5. Create `src/components/public/FeaturesGrid.tsx`
6. Create `src/components/public/CTASection.tsx`

### Step 3.3: Add Public Layout

```tsx
// src/app/(public)/layout.tsx - NEW FILE
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      {/* Public header */}
      <header className="border-b border-gray-200 bg-white">
        {/* Add minimal header */}
      </header>
      
      {children}
    </div>
  )
}
```

**Checkpoint 3.1**: Visit [`http://localhost:3000/`](http://localhost:3000/) - new landing page loads

**Checkpoint 3.2**: Visit [`http://localhost:3000/dashboard`](http://localhost:3000/dashboard) - existing dashboard still works

---

### **Phase 4: Auth Framework (6 hours) - PARALLEL TO EXISTING**

**Goal**: Add authentication infrastructure without disrupting Yahoo OAuth

### Step 4.1: Database Schema

```bash
# Initialize Prisma if not already
npx prisma init
```

**Copy schema from Database Schema page:**

```
// prisma/schema.prisma
// Full schema provided in page [🗄️ User Database Schema & Permissions](https://www.notion.so/User-Database-Schema-Permissions-aac64215c21540ad867bdd5cc98cb9dd?pvs=21)
```

```bash
# Generate Prisma client
npx prisma generate

# Push to database (Neon)
npx prisma db push
```

### Step 4.2: NextAuth Setup

**Copy implementation:**

1. `src/app/api/auth/[...nextauth]/route.ts`
2. `src/app/api/auth/signup/route.ts`
3. `src/lib/prisma.ts`
4. `src/lib/auth.ts`

**Environment variables:**

```bash
# .env.local
NEXTAUTH_URL=[http://localhost:3000](http://localhost:3000)
NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
DATABASE_URL=<your-neon-postgres-url>
```

**Checkpoint 4.1**: NextAuth endpoints work (`/api/auth/providers`)

**Checkpoint 4.2**: Yahoo OAuth still works (no disruption)

---

### **Phase 5: Login/Signup Pages (3 hours)**

**Goal**: Add auth pages without affecting Yahoo league connection

**Copy implementation from Login & Signup page:**

1. `src/app/login/page.tsx`
2. `src/app/signup/page.tsx`
3. `src/app/account/page.tsx`
4. `src/components/auth/LoginForm.tsx`
5. `src/components/auth/SignupForm.tsx`

**Checkpoint 5.1**: Visit `/login` - page renders

**Checkpoint 5.2**: Can create account and sign in

**Checkpoint 5.3**: Yahoo OAuth flow unaffected

---

### **Phase 6: Dashboard Redesign (8 hours) - CAREFUL MIGRATION**

**Goal**: Rebuild dashboard with new design while preserving functionality

### Step 6.1: Create New Dashboard Shell

```bash
# Keep old dashboard as backup
mv src/app/dashboard/page.tsx src/app/dashboard/page.tsx.old
```

**Copy new dashboard from Dashboard Hub page:**

1. `src/app/dashboard/page.tsx` (new)
2. `src/components/dashboard/DashboardHeader.tsx`
3. `src/components/dashboard/QuickStats.tsx`
4. `src/components/dashboard/ToolTabs.tsx`
5. `src/components/dashboard/TeamSelector.tsx`

### Step 6.2: Wire Existing APIs

**CRITICAL**: Reuse existing API calls - don't recreate

```tsx
// In new dashboard components, import existing API utils
import { fetchYahooTeams } from '@/lib/yahoo-api'  // KEEP EXISTING
import { getProjections } from '@/lib/api-client'  // KEEP EXISTING

// Don't create new API logic - reuse what works
```

### Step 6.3: Gradual Feature Migration

**Do NOT migrate all at once**. Test each section:

1. ✅ Header + Navigation
2. ✅ Quick Stats Cards
3. ✅ Team Selector (REUSE existing logic)
4. ✅ Roster view
5. ✅ Players view

**Checkpoint 6.1**: Dashboard renders with new design

**Checkpoint 6.2**: Team selector works (Yahoo data loads)

**Checkpoint 6.3**: Roster view shows players

**Checkpoint 6.4**: All existing functionality preserved

---

### **Phase 7: Paywall Component (2 hours) - NON-BLOCKING**

**Goal**: Add paywall UI without enforcing restrictions

**Copy StrikeForce component:**

1. `src/components/auth/StrikeForce.tsx`

**Usage in dashboard:**

```tsx
// Wrap premium features but don't block for MVP
<StrikeForce requiredTier="MAMBA" featureName="Kill Shots">
  <KillShotsContent />  {/* Will show for everyone during dev */}
</StrikeForce>
```

**Set role to DEVELOPER to bypass all paywalls:**

```sql
-- In your database
UPDATE "User" SET role = 'DEVELOPER' WHERE email = '[your-email@example.com](mailto:your-email@example.com)';
```

---

### **Phase 8: Middleware & Route Protection (1 hour) - FINAL STEP**

**Goal**: Add route protection after everything else works

```tsx
// middleware.ts
// Copy from Auth Framework page
// BUT: Add DEVELOPER bypass first
```

**Checkpoint 8.1**: Unauthenticated users redirected to `/login`

**Checkpoint 8.2**: DEVELOPER role bypasses all restrictions

**Checkpoint 8.3**: Free tier sees public projections

---

## 🧪 Testing Checklist

### **Critical Path Tests (Run After Each Phase)**

```bash
# Health checks
curl [http://localhost:8787/health](http://localhost:8787/health)  # Workers API
curl [http://localhost:3000/api/projections?week=2025-09](http://localhost:3000/api/projections?week=2025-09)  # Player data

# Yahoo OAuth
# 1. Click "Connect League"
# 2. Authorize Yahoo
# 3. Redirects to dashboard
# 4. Team data loads

# New UI
# 1. Visit [http://localhost:3000/](http://localhost:3000/) - new landing
# 2. Visit /dashboard - new war room
# 3. Change teams - dropdown works
# 4. View roster - player list loads
```

### **Smoke Tests**

- [ ]  Public landing page loads (light mode)
- [ ]  Dashboard loads (dark mode, scale pattern visible)
- [ ]  Login/signup flow works
- [ ]  Yahoo OAuth unaffected
- [ ]  Team selector shows correct teams
- [ ]  Roster displays player projections
- [ ]  API calls return data (`/api/projections`)
- [ ]  No console errors
- [ ]  Mobile responsive
- [ ]  All links navigate correctly

---

## 📝 Implementation Notes

### **Do's ✅**

- Build new components in parallel to existing code
- Test after every phase
- Keep `*.old` backups of replaced files
- Reuse existing API calls and data fetching
- Use DEVELOPER role to bypass paywalls during development

### **Don'ts ❌**

- DON'T delete working code until migration is complete
- DON'T touch Yahoo OAuth flow (Workers API handles it)
- DON'T recreate API logic that already works
- DON'T enable middleware protection until Phase 8
- DON'T merge to main until all checkpoints pass

---

## 🚨 If Something Breaks

### **Rollback Plan**

```bash
# Quick rollback
cp src.backup/* src/
git checkout src/app/dashboard/page.tsx.old
mv src/app/dashboard/page.tsx.old src/app/dashboard/page.tsx
npm run dev
```

### **Debug Steps**

1. **Check console**: `F12` → Console tab
2. **Check network**: `F12` → Network tab (look for 500 errors)
3. **Check API health**: `curl [http://localhost:8787/health](http://localhost:8787/health)`
4. **Check NextAuth**: Visit `/api/auth/session`
5. **Check database**: `npx prisma studio`

---

## 📦 Deployment Order

### **Staging Deployment**

```bash
# After all phases pass locally
git add .
git commit -m "feat(ui): complete redesign with two worlds architecture"
git push origin redesign/ui-v2

# Vercel will auto-deploy preview
# Test preview URL before merging
```

### **Production Deployment**

```bash
# Only after staging tests pass
git checkout main
git merge redesign/ui-v2
git push origin main
```

---

## 📚 Reference Documentation

### **Component Documentation**

- All components include TypeScript types
- Props documented in JSDoc comments
- Variants use `class-variance-authority`
- Styling uses Tailwind utilities

### **API Integration**

- Existing API client at `src/lib/api-client.ts` - REUSE THIS
- Yahoo API at `src/lib/yahoo-api.ts` - REUSE THIS
- Don't create new API logic

### **Styling Guidelines**

- Public Hub: Light mode (`bg-white`, `text-gray-900`)
- Dashboard: Dark mode (`bg-field-900`, `text-gray-100`)
- Venom accent: `text-venom-500`
- Strike accent: `text-strike-500`

---

## ✅ Final Acceptance

**Before considering complete:**

- [ ]  All 8 phases completed
- [ ]  All checkpoints passed
- [ ]  Yahoo OAuth flow intact
- [ ]  Player data loads correctly
- [ ]  Roster integration works
- [ ]  New landing page live
- [ ]  Dashboard redesigned
- [ ]  Auth framework functional
- [ ]  No console errors
- [ ]  Mobile responsive
- [ ]  Performance acceptable (LCP < 2.5s)
- [ ]  All existing features preserved

---

## 🆘 Get Help

**If blocked:**

1. Check this handoff document first
2. Review specific implementation page
3. Check existing code in `src.backup/`
4. Rollback and try phase again

**Common Issues:**

- "NextAuth not found" → Run `npm install`
- "Prisma client not generated" → Run `npx prisma generate`
- "Yahoo OAuth broken" → Revert middleware changes
- "API 500 errors" → Check Workers API is running

---

**Implementation Time Estimate**: 25-30 hours total

**Priority**: Start with Phase 1 (Foundation) immediately

**Risk Level**: Low if following phased approach

**Rollback Difficulty**: Easy (backups created)

---

**Ready to begin** ✅