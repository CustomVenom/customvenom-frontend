# Manual Testing Guide - UI Redesign

## 🚀 Quick Start

1. **Dev server**: `npm run dev` (should be running on http://localhost:3000)
2. **Open browser**: Navigate to http://localhost:3000
3. **Open DevTools**: F12 → Console tab and Network tab

---

## 📋 P0 Blocker Tests (Critical - Do These First)

### Test 1: Dashboard Shows Real Team Data (Not Hardcoded)

**Steps**:

1. Navigate to `http://localhost:3000/dashboard`
2. If not connected, connect to Yahoo Fantasy
3. Select a team from the dropdown
4. **Verify**: Check "Team Overview" section shows:
   - ✅ Your Record: Should match Yahoo (e.g., "5-2", "8-1", NOT "7-3")
   - ✅ Avg Points: Should match Yahoo (e.g., "112.3", NOT "124.5")
   - ✅ Power Rank: Should match Yahoo (e.g., "#2", "#5", NOT "#4")

**Expected Result**:

- Data matches what you see in Yahoo Fantasy website
- Values are different for different teams
- No hardcoded placeholder values

**If FAIL**:

- Check Network tab for API calls to `/yahoo/leagues/{leagueKey}/standings`
- Verify response contains correct team data
- Check Console for errors

---

### Test 2: Team Selector Actually Switches Data

**Steps**:

1. Connect to Yahoo (if not already)
2. Select **Team A** from dropdown
3. **Note**: Record, Avg Points, Rank for Team A
4. Select **Team B** from dropdown
5. **Verify**:
   - ✅ Team selector shows Team B's name
   - ✅ "Team Overview" section updates
   - ✅ Record, Avg Points, Rank are **different** from Team A
   - ✅ Loading state appears briefly (skeleton/pulse animation)

**Expected Result**:

- Data updates immediately when team changes
- Loading state visible during transition
- New data matches selected team

**If FAIL**:

- Check Console for `team-selected` event being dispatched
- Verify Network tab shows new API call with different `team_key`
- Check if `DashboardMetrics` component is receiving new `teamKey` prop

---

### Test 3: Connect Button Visibility & Prominence

**Steps**:

1. Log out or disconnect from Yahoo (or navigate while not connected)
2. Navigate to `http://localhost:3000/dashboard`
3. **Verify**:
   - ✅ "Connect Your Fantasy League" heading is visible
   - ✅ "Connect Yahoo Fantasy" button is:
     - Large and prominent
     - Venom green color (not gray/blue)
     - Centered on page
     - Easy to find and click
   - ✅ Button text is clear: "Connect Yahoo Fantasy"

**Expected Result**:

- Button is immediately visible and obvious
- Uses new design system (venom green, glow effect)
- Placement makes sense for user flow

**If FAIL**:

- Check if button uses `variant="primary"` in `ConnectLeagueButton.tsx`
- Verify styling from design system is applied
- Check browser zoom level (should be 100%)

---

## 🔄 Core Flow Tests

### Test 4: Yahoo OAuth Flow

**Steps**:

1. Click "Connect Yahoo Fantasy" button
2. **Verify**:
   - ✅ Redirects to Workers API OAuth endpoint
   - ✅ Yahoo OAuth consent screen appears
   - ✅ After authorization, redirects back to dashboard
   - ✅ Connection status shows as connected
   - ✅ Teams are loaded and available in dropdown

**Expected Result**:

- OAuth flow completes without errors
- User lands back on dashboard
- Can see their teams

**If FAIL**:

- Check Network tab for OAuth redirect URLs
- Verify `NEXT_PUBLIC_API_BASE` env var is set correctly
- Check Workers API is responding to `/api/connect/start?host=yahoo`

---

### Test 5: Auth Flow (Login → Dashboard)

**Steps**:

1. Navigate to `http://localhost:3000/login`
2. Enter email/password (or create account via `/signup`)
3. **Verify**:
   - ✅ Login page loads (dark theme, scale pattern)
   - ✅ VenomLogo displays
   - ✅ Form validation works
   - ✅ After login, redirects to `/dashboard`
   - ✅ Dashboard loads with user data

**Expected Result**:

- Login works smoothly
- Redirect happens automatically
- Session persists on refresh

**If FAIL**:

- Check Console for NextAuth errors
- Verify `NEXTAUTH_SECRET` is set
- Check if Prisma client is generated (`npx prisma generate`)

---

### Test 6: Middleware Tier Protection

**Steps**:

1. Login as FREE tier user (or ensure you're on FREE tier)
2. Try to access `/dashboard/killshots` (MAMBA-only route)
3. **Verify**:
   - ✅ Redirects to `/dashboard` (or shows upgrade message)
   - ✅ Does NOT show MAMBA-only content

**Steps (Development Mode)**:

- Note: In dev mode, FREE users can access dashboard
- In production, FREE users should be redirected to home with upgrade param

**Expected Result**:

- Tier protection works
- Users can't access features above their tier
- Graceful redirect, not error page

**If FAIL**:

- Check middleware.ts is running
- Verify `getToken` is working
- Check user tier in session object

---

### Test 7: StrikeForce Paywall Component

**Steps**:

1. As FREE user, navigate to dashboard
2. Find a feature wrapped in `<StrikeForce>` component
3. **Verify**:
   - ✅ Upgrade card/message appears
   - ✅ Shows correct tier requirement (VIPER or MAMBA)
   - ✅ "Upgrade to [Tier]" button visible
   - ✅ Button links to `/account?upgrade=viper` or `/account?upgrade=mamba`
   - ✅ No generic "Go Pro" language (uses venom-themed copy)

**Expected Result**:

- Paywall renders correctly
- Messaging is venom-themed ("Unleash Full Venom", "Ascend to Mamba")
- CTA is clear and actionable

**If FAIL**:

- Check `StrikeForce.tsx` component is imported correctly
- Verify session includes `tier` field
- Check tier hierarchy logic

---

## 🎨 Visual/Design Tests

### Test 8: Public Hub (Light Mode)

**Steps**:

1. Navigate to `http://localhost:3000/` (homepage)
2. **Verify**:
   - ✅ Light background (white/light gray)
   - ✅ Yard-line pattern visible on background
   - ✅ VenomLogo displays correctly
   - ✅ "Pick Your Poison" hero section visible
   - ✅ Projections showcase table shows sample data
   - ✅ Trust Snapshot widget visible with version/time
   - ✅ Features grid displays
   - ✅ CTA section with gradient

**Expected Result**:

- Light, inviting aesthetic
- Pattern is subtle but visible
- All components styled correctly

---

### Test 9: Dashboard Hub (Dark Mode)

**Steps**:

1. Navigate to `/dashboard` (after login)
2. **Verify**:
   - ✅ Dark background (`bg-field-900`)
   - ✅ Scale pattern visible on background
   - ✅ "War Room" heading displays
   - ✅ Text is light colored (gray-100, gray-400)
   - ✅ Venom green accents on interactive elements
   - ✅ Cards have dark theme styling

**Expected Result**:

- Dark, intense aesthetic
- Scale pattern is subtle but visible
- Consistent dark theme throughout

---

### Test 10: Mobile Responsiveness

**Steps**:

1. Open DevTools (F12) → Toggle device toolbar (Ctrl+Shift+M)
2. Select mobile device (iPhone 12, Pixel 5, etc.)
3. Test on:
   - ✅ Homepage (`/`)
   - ✅ Login page (`/login`)
   - ✅ Dashboard (`/dashboard`)
4. **Verify**:
   - ✅ No horizontal scrolling
   - ✅ Text is readable
   - ✅ Buttons are tap-friendly (min 44x44px)
   - ✅ Dropdowns work on mobile
   - ✅ Forms are usable

**Expected Result**:

- Responsive design works
- Mobile UX is good

---

## 🐛 Error Handling Tests

### Test 11: API Error Handling

**Steps**:

1. Open Network tab in DevTools
2. Throttle network to "Slow 3G" or "Offline"
3. Try to:
   - Connect to Yahoo
   - Switch teams
   - Load dashboard
4. **Verify**:
   - ✅ Error messages appear (not crashes)
   - ✅ Loading states show
   - ✅ No blank screens

---

### Test 12: Console Errors

**Steps**:

1. Open Console tab in DevTools
2. Navigate through all pages
3. **Verify**:
   - ✅ No red errors
   - ✅ Warnings are acceptable (no critical ones)
   - ✅ No React hydration mismatches

---

## ✅ Test Results Template

```
Test Date: ___________
Tester: ___________
Environment: Development / Staging / Production

P0 Tests:
- [ ] Test 1: Real Team Data
- [ ] Test 2: Team Selector Switching
- [ ] Test 3: Connect Button Visibility

Core Flows:
- [ ] Test 4: Yahoo OAuth
- [ ] Test 5: Auth Flow
- [ ] Test 6: Middleware Protection
- [ ] Test 7: StrikeForce Paywall

Visual/Design:
- [ ] Test 8: Public Hub (Light)
- [ ] Test 9: Dashboard Hub (Dark)
- [ ] Test 10: Mobile Responsive

Error Handling:
- [ ] Test 11: API Errors
- [ ] Test 12: Console Errors

Issues Found:
1. ___________
2. ___________

Notes:
___________
```

---

## 🚨 Critical Issues to Watch For

1. **Hardcoded Data**: Dashboard shows same values regardless of team
2. **Team Switch Not Working**: Selecting new team doesn't update data
3. **Connect Button Hidden**: Can't find or click connect button
4. **Yahoo OAuth Broken**: Can't connect to Yahoo
5. **Auth Broken**: Can't login or session doesn't persist
6. **Tier Protection Broken**: FREE users can access MAMBA features
7. **Paywall Not Showing**: StrikeForce component not rendering
8. **Visual Bugs**: Colors wrong, patterns missing, layout broken

---

**Ready to test!** Start with P0 tests, then move to core flows. Document any issues you find.
