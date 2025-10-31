# Team Selector Data Flow Documentation

## Implementation Complete ✅

**Created:** Team selector dropdown component that appears next to Refresh League button on `/dashboard/leagues`

**Files:**

- `src/components/TeamSelector.tsx` - Main dropdown component
- `src/app/dashboard/leagues/page.tsx` - Updated to include TeamSelector and make leagues clickable

---

## Complete Data Flow Path

### 1. **User Authentication** (Already Working)

```
User clicks "Connect League"
→ /api/connect/start
→ Yahoo OAuth consent
→ /api/yahoo/callback
→ Sets cv_yahoo cookie (HttpOnly, Secure)
→ Redirects to /dashboard
```

**Status:** ✅ Complete

---

### 2. **League Selection** (Enhanced)

```
User navigates to /dashboard/leagues
→ GET /yahoo/leagues (fetches user's league keys)
→ User clicks a league from the list
→ useSelectedLeague() hook sets league in localStorage + URL params
→ League highlighted with visual feedback
```

**Status:** ✅ Complete (leagues are now clickable, selection persists)

---

### 3. **Team Selection** (New Implementation)

```
User opens team selector dropdown (next to Refresh League button)
→ TeamSelector component checks useSelectedLeague() for current league
→ If league selected: GET /yahoo/leagues/{leagueKey}/teams
  ↓
Backend reads cv_yahoo cookie
  ↓
Backend calls Yahoo API:
  GET https://fantasysports.yahooapis.com/fantasy/v2/league/{leagueKey}/teams
  ↓
Yahoo returns nested JSON with 12 teams
  ↓
Backend parses + normalizes to:
  [{ team_key, name, team_logos }]
  ↓
Returns to frontend
  ↓
Frontend displays teams in dropdown (with logos)
  ↓
User clicks a team
  ↓
POST /api/session/selection
  Body: { teamKey, leagueKey }
  ↓
Backend sets cv_selection cookie
  ↓
Selection persists across reloads
```

**Status:** ✅ Complete

**Implementation Details:**

- Dropdown shows team logos and names
- Selected team highlighted with checkmark
- Selection saved to `/api/session/selection` endpoint
- Component loads current selection on mount
- Error handling with visual feedback

---

### 4. **Player Data Fetch** (Current Path - Existing)

```
Frontend component loads (e.g., RosterViewer)
→ Checks cv_selection cookie for teamKey via GET /api/session/selection
→ GET /yahoo/team/{teamKey}/roster (backend route)
  ↓
Backend reads cv_yahoo + cv_selection cookies
  ↓
Backend calls Yahoo API:
  GET https://fantasysports.yahooapis.com/fantasy/v2/team/{teamKey}/roster
  ↓
Yahoo returns nested JSON with 15 players
  ↓
Backend parses + normalizes to:
  [{ player_key, name, position, team }]
  ↓
Returns to frontend with Trust Bundle headers
  (x-request-id, cache-control, CORS)
  ↓
Frontend displays roster table
```

**Status:** ✅ Complete (existing implementation)

---

### 5. **Projection Data Path** (Planned, Not Yet Wired)

```
User's roster players (from Yahoo)
  ↓
Backend maps Yahoo player_key → NFLVerse player_id
  (using player-mapper.ts or /api/players/sync endpoint)
  ↓
Fetch projections from R2:
  GET data/projections/nfl/2025/week={week}/baseline.json
  OR
  GET data/stats/nfl/2025/week={week}/nflverse.json
  ↓
Filter projections to user's roster players only
  ↓
Return enriched data:
  {
    yahoo_player,
    nflverse_projections,
    confidence,
    reasons,
    projected_points,
    actual_points,
    variance
  }
  ↓
Frontend displays in WeeklyTrackingTable:
  | Player | Projected | Actual | Variance |
```

**Status:** ❌ Not yet wired

**Current Limitations:**

- ❌ Projection data not yet wired to roster display
- ❌ Player mapping (Yahoo → NFLVerse) exists but not called in roster flow
- ✅ WeeklyTrackingTable component exists (`src/components/tracking/WeeklyTrackingTable.tsx`)
- ✅ Player mapping endpoint exists (`/api/players/sync`)
- ✅ Tracking endpoint exists (`/api/tracking/week/:week`)

---

## Next Steps to Complete the Flow

### Step 1: Wire Player Mapping to Roster View

**Location:** `src/components/roster/RosterViewer.tsx` or `src/components/roster/PlayerMappingStatus.tsx`

**Action:** When roster is loaded, automatically call `/api/players/sync` to map Yahoo IDs to NFLVerse IDs

**Current State:** PlayerMappingStatus component exists and is already called in RosterViewer, but verify it's working correctly

### Step 2: Wire Projections to Tracking Table

**Location:** `src/components/tracking/WeeklyTrackingTable.tsx`

**Action:** Update the component to:

1. Get selected team from `/api/session/selection`
2. Fetch roster for that team
3. Map roster players to NFLVerse IDs
4. Fetch projections from R2 for the selected week
5. Merge Yahoo roster data with projection data
6. Display in table format

**Current State:** Component exists but currently calls `/api/tracking/week/:week` which may not be fully implemented

### Step 3: Backend Implementation (if needed)

**Check if these endpoints exist:**

- `GET /api/tracking/week/:week?team={teamKey}` - Should return merged Yahoo roster + projections
- Or enhance existing endpoint to support team filtering

---

## Component Locations

### Frontend Components

- `src/components/TeamSelector.tsx` - Team dropdown selector
- `src/components/roster/RosterViewer.tsx` - Roster display with league/team/roster flow
- `src/components/roster/PlayerMappingStatus.tsx` - Shows player mapping status
- `src/components/tracking/WeeklyTrackingTable.tsx` - Shows projected vs actual points
- `src/app/dashboard/leagues/page.tsx` - Leagues page with team selector

### Backend Endpoints (via frontend API routes)

- `GET /api/session/selection` - Get current team/league selection
- `POST /api/session/selection` - Save team/league selection
- `GET /yahoo/leagues` - Get user's leagues
- `GET /yahoo/leagues/:leagueKey/teams` - Get teams for a league
- `GET /yahoo/team/:teamKey/roster` - Get roster for a team
- `POST /api/players/sync` - Map Yahoo players to NFLVerse IDs
- `GET /api/tracking/week/:week` - Get tracking data for a week

---

## Testing Checklist

- [ ] User can select a league from the list
- [ ] Team selector appears after league selection
- [ ] Team selector loads teams from `/yahoo/leagues/:leagueKey/teams`
- [ ] Team logos display correctly
- [ ] Selecting a team saves to `/api/session/selection`
- [ ] Team selection persists across page reloads
- [ ] Current selection loads on component mount
- [ ] Error states display correctly

---

## Files Modified

1. **src/components/TeamSelector.tsx** (NEW)
   - Team dropdown component with fetch/save logic

2. **src/app/dashboard/leagues/page.tsx** (MODIFIED)
   - Added TeamSelector component
   - Added RefreshLeaguesButton import
   - Made leagues clickable to set selection
   - Added visual feedback for selected league

---

## Future Enhancements

1. **League Selector Dropdown** - Instead of clicking leagues in a list, use a dropdown like team selector
2. **Auto-select First League** - Automatically select first league on load if none selected
3. **Team Selection Persistence** - Currently persists, but could add UI indicator showing current selection
4. **Loading States** - Add skeleton loaders for better UX
5. **Error Recovery** - Better error messages and retry logic
