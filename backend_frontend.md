# Scoring Format Support

**Priority:** P0

**Estimated Time:** 90 minutes

**Status:** Not Started

## Objective

Add `?format=standard|half_ppr|full_ppr` parameter support to `/projections` endpoint.

## Current State

- `/projections` endpoint exists
- Returns Prophet baseline (standard scoring only)
- No format parameter handling

## Implementation

### 1. Add Format Parameter Parsing

**File:** `workers-api/src/routes/projections.ts`

```tsx
const format = url.searchParams.get('format') || 'half_ppr';
if (!['standard', 'half_ppr', 'full_ppr'].includes(format)) {
  return new Response(
    JSON.stringify({ error: 'Invalid format. Use: standard, half_ppr, full_ppr' }),
    { status: 400 }
  );
}
```

### 2. Apply PPR Multipliers

**File:** `workers-api/src/lib/scoring.ts` (create if needed)

```tsx
function applyPPR(player: Player, format: string): Player {
  if (format === 'standard') return player;
  
  const multiplier = format === 'half_ppr' ? 0.5 : 1.0;
  
  if (['RB', 'WR', 'TE'].includes(player.position)) {
    player.p50 += (player.receptions_p50 * multiplier);
    player.p10 += (player.receptions_p10 * multiplier);
    player.p90 += (player.receptions_p90 * multiplier);
  }
  
  return player;
}
```

### 3. Verify Prophet Baseline Includes Receptions

Check `baseline.json` schema includes:

```json
{
  "receptions_p50": 6.0,
  "receptions_p10": 4.0,
  "receptions_p90": 8.0
}
```

**If missing:** Update Prophet script to output reception projections.

## Testing

```bash
# Standard scoring
curl "http://localhost:8787/projections?week=2025-10&format=standard"

# Half PPR
curl "http://localhost:8787/projections?week=2025-10&format=half_ppr"

# Full PPR  
curl "http://localhost:8787/projections?week=2025-10&format=full_ppr"
```

## Acceptance Criteria

- [ ]  Format parameter accepted and validated
- [ ]  Standard/Half PPR/Full PPR scoring applied correctly
- [ ]  Invalid format returns 400 error
- [ ]  RB/WR/TE positions show PPR adjustments
- [ ]  QB/K/DEF positions unchanged
- [ ]  Response includes `format` field

## Deployment

```bash
wrangler deploy --env staging
wrangler deploy --env production
```


# Opponent Field (NFL Schedule Lookup)

**Priority:** P0

**Estimated Time:** 90 minutes

**Status:** Not Started

## Objective

Add `opponent` field to every player in projections response using NFL schedule data.

## Current State

- Player objects don't include opponent
- NFL schedule data available from NFLverse
- Need to map team → opponent for each week

## Implementation

### 1. Load NFL Schedule

**File:** `workers-api/src/lib/schedule.ts` (create)

```tsx
interface ScheduleGame {
  week: number;
  home_team: string;
  away_team: string;
}

// Load from R2 or embed as constant
const NFL_SCHEDULE_2025: ScheduleGame[] = [
  { week: 10, home_team: 'KC', away_team: 'DEN' },
  // ... full schedule
];

export function getOpponent(team: string, week: number): string {
  const game = NFL_SCHEDULE_2025.find(
    g => g.week === week && (g.home_team === team || g.away_team === team)
  );
  
  if (!game) return 'BYE';
  
  if (game.home_team === team) {
    return `vs ${game.away_team}`;
  } else {
    return `@${game.home_team}`;
  }
}
```

### 2. Add Opponent to Each Player

**File:** `workers-api/src/routes/projections.ts`

```tsx
import { getOpponent } from '../lib/schedule';

const projections = [baselineData.players.map](http://baselineData.players.map)(player => ({
  ...player,
  opponent: getOpponent([player.team](http://player.team), week)
}));
```

### 3. Get Schedule Data

**Option A:** Load from NFLverse

```bash
# In data-pipelines repo
python scripts/fetch_[schedule.py](http://schedule.py) --season 2025
```

**Option B:** Manual entry for remaining 2025 weeks

## Testing

```bash
curl "http://localhost:8787/projections?week=2025-10" | jq '.projections[0].opponent'
# Should return: "@DEN" or "vs DAL" or "BYE"
```

## Acceptance Criteria

- [ ]  All players include `opponent` field
- [ ]  Home games show `vs TEAM` format
- [ ]  Away games show `@TEAM` format
- [ ]  Bye weeks show `BYE`
- [ ]  Schedule accurate for 2025 season weeks 1-18
- [ ]  Works for all 32 NFL teams

## Deployment

```bash
wrangler deploy --env staging
wrangler deploy --env production
```

# /yahoo/matchup Endpoint

**Priority:** P0

**Estimated Time:** 2 hours

**Status:** Not Started

## Objective

Create new endpoint to fetch user's weekly matchup from Yahoo Fantasy API.

## Current State

- Endpoint does NOT exist
- Frontend expects matchup data
- Yahoo API can provide matchup info

## Implementation

### 1. Create Route

**File:** `workers-api/src/routes/yahoo/matchup.ts` (create)

```tsx
import { Hono } from 'hono';

const app = new Hono();

app.get('/matchup', async (c) => {
  const week = c.req.query('week') || getCurrentWeek();
  const cookie = c.req.header('Cookie');
  
  // Check auth
  if (!cookie?.includes('cv_yahoo')) {
    return c.json({
      authenticated: false,
      error: 'Yahoo authentication required',
      error_code: 'AUTH_REQUIRED'
    }, 401);
  }
  
  // Fetch from Yahoo API
  const matchupData = await fetchYahooMatchup(cookie, week);
  
  // Enrich with projections
  const enriched = await enrichMatchupWithProjections(matchupData, week);
  
  return c.json({
    week: parseInt(week),
    format: enriched.format,
    last_updated: new Date().toISOString(),
    authenticated: true,
    your_team: enriched.your_team,
    opponent: enriched.opponent,
    win_probability: calculateWinProb(enriched.your_team, enriched.opponent)
  });
});

export default app;
```

### 2. Fetch Yahoo Matchup Data

**File:** `workers-api/src/lib/yahoo-api.ts` (enhance)

```tsx
export async function fetchYahooMatchup(cookie: string, week: string) {
  // Call Yahoo Fantasy API
  // GET /fantasy/v2/team/{team_key}/matchups;weeks={week}
  const response = await fetch(
    `https://fantasysports.yahooapis.com/fantasy/v2/team/${teamKey}/matchups;weeks=${week}`,
    { headers: { Cookie: cookie } }
  );
  
  const xml = await response.text();
  return parseYahooMatchup(xml);
}
```

### 3. Enrich with Projections

```tsx
async function enrichMatchupWithProjections(matchup: any, week: string) {
  // Load projections for this week
  const projections = await loadProjections(week);
  
  // Enrich your team's roster
  matchup.your_team.starters = enrichPlayers(
    matchup.your_team.starters,
    projections
  );
  
  // Enrich opponent's roster
  matchup.opponent.starters = enrichPlayers(
    matchup.opponent.starters,
    projections
  );
  
  // Calculate totals
  matchup.your_team.projected_total = sumProjections(matchup.your_team.starters);
  matchup.opponent.projected_total = sumProjections(matchup.opponent.starters);
  
  return matchup;
}
```

### 4. Wire into Main App

**File:** `workers-api/src/index.ts`

```tsx
import yahooMatchup from './routes/yahoo/matchup';

app.route('/yahoo', yahooMatchup);
```

## Testing

```bash
# With auth cookie
curl -H "Cookie: cv_yahoo=..." \
  "http://localhost:8787/yahoo/matchup?week=10"

# Without auth (should return 401)
curl "http://localhost:8787/yahoo/matchup?week=10"
```

## Acceptance Criteria

- [ ]  Endpoint exists at `/yahoo/matchup`
- [ ]  Accepts `week` parameter
- [ ]  Returns 401 when not authenticated
- [ ]  Returns matchup with both teams
- [ ]  All players enriched with projections
- [ ]  Projected totals calculated
- [ ]  Includes `last_updated` timestamp
- [ ]  Future weeks work (if scheduled)

## Deployment

```bash
wrangler deploy --env staging
wrangler deploy --env production
```

# Week Parameter Support

**Priority:** P0

**Estimated Time:** 30 minutes

**Status:** Not Started

## Objective

Ensure all projection endpoints accept and validate `?week=N` parameter.

## Current State

- `/projections` may accept week parameter
- Need validation and default logic
- Need to apply to all relevant endpoints

## Implementation

### 1. Week Parameter Utility

**File:** `workers-api/src/lib/nfl-week.ts` (create)

```tsx
export function getCurrentWeek(): number {
  // Calculate current NFL week based on date
  const seasonStart = new Date('2025-09-05');  // Week 1 Thursday
  const now = new Date();
  const diff = now.getTime() - seasonStart.getTime();
  const weekNumber = Math.floor(diff / (7 * 24 * 60 * 60 * 1000)) + 1;
  return Math.max(1, Math.min(18, weekNumber));
}

export function validateWeek(week: string | null): number {
  if (!week) return getCurrentWeek();
  
  const weekNum = parseInt(week);
  if (isNaN(weekNum) || weekNum < 1 || weekNum > 18) {
    throw new Error('Invalid week parameter. Must be 1-18.');
  }
  
  return weekNum;
}
```

### 2. Apply to Endpoints

**Files to update:**

- `workers-api/src/routes/projections.ts`
- `workers-api/src/routes/yahoo/roster.ts`
- `workers-api/src/routes/yahoo/matchup.ts`

```tsx
import { validateWeek } from '../lib/nfl-week';

try {
  const week = validateWeek(c.req.query('week'));
  // ... use week
} catch (error) {
  return c.json({
    error: error.message,
    error_code: 'INVALID_PARAMETER'
  }, 400);
}
```

### 3. Handle Missing Data

```tsx
const key = `projections/${week}/baseline.json`;
const obj = await c.env.R2_BUCKET.get(key);

if (!obj) {
  return c.json({
    week,
    error: `Projections not available for Week ${week} yet`,
    error_code: 'PROJECTIONS_NOT_READY',
    last_available_week: getCurrentWeek()
  }, 404);
}
```

## Testing

```bash
# Valid week
curl "http://localhost:8787/projections?week=10"

# No week (uses current)
curl "http://localhost:8787/projections"

# Invalid week
curl "http://localhost:8787/projections?week=99"
# Should return 400

# Future week (not ready)
curl "http://localhost:8787/projections?week=18"
# Should return 404 with PROJECTIONS_NOT_READY
```

## Acceptance Criteria

- [ ]  `?week=N` parameter works on all endpoints
- [ ]  Missing week defaults to current NFL week
- [ ]  Invalid weeks return 400 error
- [ ]  Future weeks return 404 with helpful message
- [ ]  Week validation consistent across endpoints

## Deployment

```bash
wrangler deploy --env staging
wrangler deploy --env production
```

# Player Status (Injury Data)

**Priority:** P1

**Estimated Time:** 90 minutes

**Status:** Not Started

## Objective

Add `status` field to players showing injury/availability status.

## Current State

- No injury status in projections
- Yahoo roster data includes status
- NFLverse may have injury reports

## Implementation

### Option 1: From Yahoo Roster Data (Preferred)

**File:** `workers-api/src/routes/yahoo/roster.ts`

```tsx
// When fetching roster, include status
const players = [yahooRoster.players.map](http://yahooRoster.players.map)(p => ({
  ...p,
  status: p.status || null  // Q, O, D, IR, null
}));
```

### Option 2: From NFLverse

**File:** `workers-api/src/lib/injuries.ts`

```tsx
export async function getInjuryStatus(playerId: string): Promise<string | null> {
  // Load from NFLverse injury reports
  const injuries = await loadInjuryReports();
  const player = injuries.find(i => i.player_id === playerId);
  return player?.status || null;
}
```

### 3. Add to Projections Endpoint

**File:** `workers-api/src/routes/projections.ts`

```tsx
const projections = [baselineData.players.map](http://baselineData.players.map)(async (player) => ({
  ...player,
  status: await getInjuryStatus(player.player_id)
}));
```

## Testing

```bash
curl "http://localhost:8787/projections?week=2025-10" | \
  jq '.projections[] | select(.status != null)'
```

## Acceptance Criteria

- [ ]  Players include `status` field
- [ ]  Status values: "Q", "O", "D", "IR", or null
- [ ]  Data updates daily
- [ ]  Healthy players show `null`
- [ ]  Works in both roster and projections endpoints

## Deployment

```bash
wrangler deploy --env staging
wrangler deploy --env production
```

# Data Freshness Timestamps

**Priority:** P1

**Estimated Time:** 30 minutes

**Status:** Not Started

## Objective

Add `last_updated` and `schema_version` to all GET responses.

## Current State

- Some endpoints have timestamps
- Need consistency across all endpoints
- Trust-first pattern already established

## Implementation

### 1. Add to All Responses

**Files to update:**

- `workers-api/src/routes/projections.ts`
- `workers-api/src/routes/yahoo/roster.ts`
- `workers-api/src/routes/yahoo/matchup.ts`
- `workers-api/src/routes/yahoo/standings.ts`

```tsx
return c.json({
  // ... existing data
  schema_version: 'v1',
  last_updated: new Date().toISOString()
});
```

### 2. For R2 Data

Use R2 object metadata:

```tsx
const obj = await c.env.R2_BUCKET.get(key);
const lastUpdated = obj?.uploaded || new Date().toISOString();
```

### 3. Add Cache Headers

```tsx
c.header('cache-control', 'public, max-age=300');
c.header('x-last-refresh', lastUpdated);
```

## Testing

```bash
# Check all endpoints
curl "http://localhost:8787/projections?week=2025-10" | jq '{schema_version, last_updated}'
curl "http://localhost:8787/yahoo/matchup?week=10" | jq '{schema_version, last_updated}'
curl "http://localhost:8787/yahoo/standings" | jq '{schema_version, last_updated}'
```

## Acceptance Criteria

- [ ]  All GET endpoints include `last_updated`
- [ ]  All GET endpoints include `schema_version`
- [ ]  Timestamps in ISO 8601 format
- [ ]  Cache headers set appropriately
- [ ]  Headers include `x-last-refresh`

## Deployment

```bash
wrangler deploy --env staging
wrangler deploy --env production
```
