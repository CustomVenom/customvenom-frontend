# Data schema

## Entities

- players: who generated the stats
- teams: team metadata
- games: schedule and opponent context
- weekly_stats: normalized metrics per player per week per source

## IDs and keys

- player_id: stable identifier you control. Start with "source:player_key" then add mapping table later. Example: "espn:12345".
- team_id: "league:TEAM" or "source:TEAM". Example: "nfl:KC".
- game_id: "league:YYYY-WEEK-home-away" or source equivalent. Example: "nfl:2025-05-KC-LV".
- week: ISO week or league week integer. Example: 5.
- opponent: opponent team code. Example: "LV".

## Weekly stat record (flat)

- player_id: string
- team_id: string
- game_id: string
- week: number
- opponent: string
- stat_name: string // e.g., "targets", "yards", "xg", "minutes"
- value: number
- unit: string // e.g., "count", "yards", "minutes"
- source: string // e.g., "espn", "freeapi1"
- ingested_at: ISO-8601 string

## JSON layout in storage (R2)

Store one JSON per source per week:

- r2://customvenom/stats/{league}/{year}/week={W}/{source}.json
- file contents: array of weekly_stats records (flat)

Why: keeps files small, parallelizable, and simple to re-run per source.

## Rate limits and headers

- espn: rate-limit unknown; throttle to 1 req/sec; add User-Agent.
- freeapi1: x-ratelimit-remaining/x-ratelimit-reset headers; pause if remaining < 2.

Keep notes below per source.

## Missing values policy

- If a numeric metric is missing, omit the stat or record it with value=0 only if the metric semantically means “count that didn’t happen”.
- Never write NaN. Use null only if you must and document it.

## Units

- Always include unit. If the source has implicit units, convert and set unit explicitly.

## Key mapping

- Keep a simple mapping table in code: display name -> canonical code. Example: "Kansas City Chiefs" -> "KC".
- Same for players when possible: "Patrick Mahomes" + team + source id -> stable player_id.

## Validation

- Reject records missing player_id, week, stat_name, value, source.
- value must be a number. Strings are parsed with Number() or dropped.

## Sources to start

- Source A: espn (public HTML or lightweight endpoints)
  - Headers: User-Agent, Accept: application/json
  - Throttle: 1 req/sec
- Source B: freeapi1 (document later)
  - Auth: none
  - Throttle: respect x-ratelimit headers
