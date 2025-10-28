# League Connection Guardrails

## Non-negotiable Rules (Enforced)

### Single Entry Point
- Only one launcher lives on `/tools`
- No other page renders any "connect", "login", or provider mentions

### One URL Back
- OAuth callback always redirects to `/tools`
- Never `/settings`, never deep links

### One Screen
- On `/tools` only: "Connect league" when not connected
- After return: "Refresh league" and one Team dropdown (only if >1 team)

### One API Base
- All browser calls go to `${NEXT_PUBLIC_API_BASE}/yahoo/*` with `credentials:'include'` and `Accept: application/json`

### No Brand Text
- Button text = "Connect league"
- No "Yahoo" labels anywhere in the UI

## Enforcement

### Environment Variable
Set `NEXT_PUBLIC_ENABLE_MULTI_CONNECT=false` to enforce single connect mode.

### CI Checks
Run `npm run guardrails-check` to verify:
- No `/api/yahoo/` or `/api/leagues` in client code
- No "Connect Yahoo" or "YahooStatusBadge" strings
- Only `/yahoo/*` endpoints in client code

### Playwright Test
`npm run test:guardrails` verifies:
- Only one "Connect league" button on `/tools`
- No "Yahoo" text on `/tools`
- After consent, `/tools` shows "Refresh league" and at most one team dropdown
