# Yahoo OAuth Production Verification Receipts

## Date: {{DATE}}

### 1. OAuth Connect Flow (302 Headers)

```bash
# Check OAuth redirect
curl -sSD - "https://www.customvenom.com/api/yahoo/connect?returnTo=/settings" -o /dev/null | head -30
```

**Expected:**
- Status: `302 Found`
- Location: Yahoo OAuth URL with `client_id` and `redirect_uri` parameters
- Set-Cookie: `y_state` with HttpOnly, Secure flags

### 2. Yahoo User Info API (/yahoo/me)

```bash
# After consent, with OAuth cookie
curl -sSD - "https://customvenom-workers-api.jdewett81.workers.dev/yahoo/me" \
  -H "Cookie: y_at={{REDACTED_TOKEN}}" \
  -o /dev/null | head -20
```

**Expected:**
- Status: `200 OK`
- Headers: `x-request-id`, `x-schema-version`, `cache-control: no-cache`
- Body (redacted):
```json
{
  "schema_version": "v1",
  "last_refresh": "2025-01-XX...",
  "user": {
    "sub": "...",
    "email": "user@example.com"
  }
}
```

### 3. Yahoo Leagues API (/yahoo/leagues)

```bash
# Fetch leagues
curl -s "https://customvenom-workers-api.jdewett81.workers.dev/yahoo/leagues" \
  -H "Cookie: y_at={{REDACTED_TOKEN}}" | jq
```

**Expected:**
- Status: `200 OK`
- Body:
```json
{
  "schema_version": "v1",
  "last_refresh": "2025-01-XX...",
  "leagues": [
    {
      "key": "414.l.12345",
      "name": "My Fantasy League",
      "season": "2025"
    }
  ]
}
```

### 4. Settings UI Screenshot Checklist

- [ ] "Yahoo Connected" card with green background
- [ ] League name and season displayed
- [ ] Roster table visible with columns: Player, Pos, Team
- [ ] At least 10-16 players in table
- [ ] "Reconnect" link present

### 5. Quick Smokes

```bash
# Session check (should return 200 after OAuth)
curl -sSD - "$API_BASE/yahoo/me" -o /dev/null | grep -i "^HTTP"

# League count (should be > 0)
curl -s "$API_BASE/yahoo/leagues" | jq '.leagues | length'
```

**Acceptance:**
- /yahoo/me returns 200 with user JSON
- /yahoo/leagues returns at least one league_key
- Settings shows "Yahoo Connected" badge
- Roster table renders without errors

---

## Notes

- Keep tokens redacted in receipts
- Screenshots should show full browser URL bar for context
- If any step fails, note the exact error message and telemetry headers
