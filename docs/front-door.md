# Cloudflare Front‑door (Pages + DNS + SSL) — TL;DR

Purpose

- Ensure the frontend serves securely and consistently across preview and production with correct DNS, SSL/TLS, CORS, and caching.

What "good" looks like

- Apex and www resolve to Pages and load over HTTPS without warnings
- Strict-Transport-Security present
- API calls succeed with CORS and expected cache headers
- First smokes pass for /health and /projections

## DNS and SSL

- Domain: [customvenom.com](https://www.customvenom.com)
- DNS
  - Apex: A or CNAME per Cloudflare Pages guidance
  - www: CNAME to Pages project
- SSL/TLS
  - Mode: Full (strict)
  - Always use HTTPS: On
  - HSTS: On (enable preload only after verifying no mixed content)
  - Minimum TLS: 1.2
  - Automatic HTTPS Rewrites: On

## Environment variables (Pages)

- NEXT_PUBLIC_API_BASE: Text (public) for any direct browser calls
- API_BASE: Secret (server-only) for Route Handlers or Server Actions
- NOTION_*: Secret (if used by any server-side tooling)

Rule of thumb

- Client-visible → Text var
- Server-only or credentials → Secret

## CORS and caching (API expectations)

- /health
  - cache-control: no-store
  - headers: access-control-allow-origin: *
  - JSON must include: { ok, schema_version, last_refresh }
- /projections and /players/:id/projection
  - cache-control: public, max-age=60, stale-if-error=86400
  - headers: access-control-allow-origin: *
  - x-key: backing object key (e.g., R2 key)

## Quick smokes

```bash
# Health JSON shape
curl -s "$API_BASE/health" | jq '{ok, schema_version, last_refresh}'

# Projections headers: expect x-key in response headers
curl -fsSi "$API_BASE/projections?week=2025-06" | sed -n '1,20p'

# Projections JSON shape (fields present)
curl -s "$API_BASE/projections?week=2025-06" | jq '{schema_version, last_refresh}'
```

## Browser/network checks

- Open the site and verify:
  - Network panel for /health shows 200 and no-store
  - Network panel for /projections shows 200, cache headers, and x-key
  - Document response has Strict-Transport-Security

## Acceptance

- DNS: apex and www resolve, both load via HTTPS without warning
- SSL/TLS: Full (strict); HSTS present
- API:
  - /health returns ok, schema_version, last_refresh
  - /projections returns schema_version, last_refresh and x-key header present
- No CORS failures in console; cache headers align with route purpose
