# Yahoo OAuth Implementation - Copy-Ready Handoff

## 🎯 **Purpose**

Copy-ready handoff so Cursor can implement, verify, and maintain Yahoo OAuth in Custom Venom without guesswork.

## 📋 **Summary (What We're Building)**

- HTTPS-only OAuth flow: connect → consent → callback → secure session → fetch leagues → roster
- Same-host callback, Secure+HttpOnly cookies, fspt-r scope
- Client UI: Settings panel with guarded states (not configured, not connected, connected)

## 🔒 **Non-Negotiable Security (Apply First)**

### **HTTPS Only Everywhere**

- ❌ **No HTTP allowed** anywhere (blocked by browser)
- ✅ **HSTS headers** on all responses
- ✅ **HTTPS redirects** at edge (Workers + Next.js)

### **OAuth Security**

- ✅ **Redirect URI** in Yahoo console must be HTTPS and exactly match deployed callback
- ✅ **Cookies**: HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=86400
- ✅ **Same host**: Connect link and callback must be on the same host

## 🌍 **Environment Variables (Vercel → Frontend)**

```bash
NEXT_PUBLIC_API_BASE = https://customvenom-workers-api.jdewett81.workers.dev
NEXT_PUBLIC_ENABLE_YAHOO = true
```

**Note**: Values live in Vercel, never committed to repository.

## 🔧 **Workers API Routes (Copy-Ready)**

### **OAuth Flow Routes**

```typescript
// GET /api/yahoo/connect?returnTo=/settings
// → 302 to Yahoo consent with state

// GET /api/yahoo/callback
// → exchanges code, sets Secure HttpOnly cookie, redirects to returnTo

// GET /yahoo/me
// → 200 with user JSON when session valid, 401 otherwise

// GET /yahoo/leagues
// → user leagues JSON

// GET /yahoo/leagues/:leagueKey/teams
// → teams JSON

// GET /yahoo/team/:teamKey/roster
// → players JSON
```

### **Response Headers**

```typescript
// Set on all responses
'cache-control': 'no-store', // on callback
'access-control-allow-origin': '*',
'x-request-id': crypto.randomUUID()
```

### **Secure Cookie**

```typescript
r.headers.append(
  'Set-Cookie',
  'cv_yahoo=' + session + '; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400',
);
```

## 🎨 **Frontend Settings Panel Rules**

### **Route Structure**

```typescript
// app/settings/
// ├── page.tsx          (Server Component)
// ├── error.tsx         (Route-level error boundary)
// └── loading.tsx       (Route-level loading)
```

### **Client Panel Mount**

```typescript
// ❌ WRONG - Don't use next/dynamic in Server Component
const YahooPanel = dynamic(() => import('./YahooPanel'), { ssr: false });

// ✅ CORRECT - Use tiny client wrapper
'use client';
export default function YahooPanelMount({ enabled }: { enabled: boolean }) {
  return (
    <ErrorBoundary fallback={<div>Panel error</div>}>
      <YahooPanelClient enabled={enabled} />
    </ErrorBoundary>
  );
}
```

### **Guarded States**

```typescript
// 1. Not configured (missing API base)
if (!process.env['NEXT_PUBLIC_API_BASE']) {
  return <div>API not configured. Set NEXT_PUBLIC_API_BASE.</div>;
}

// 2. Not connected (401/empty leagues)
if (error === 'not_connected' || leagues.length === 0) {
  return (
    <div>
      Yahoo: not connected.
      <a href="/api/yahoo/connect?returnTo=/settings">Connect Yahoo</a>
    </div>
  );
}

// 3. Connected (leagues banner + roster table)
return (
  <div>
    Yahoo Connected — {league.name} ({league.season})
    <table>{roster.players.map(p => <tr key={p.id}>...</tr>)}</table>
  </div>
);
```

### **Client Fetch Pattern**

```typescript
const r = await fetch(`${API_BASE}/yahoo/leagues`, {
  credentials: 'include',
  cache: 'no-store',
  headers: { accept: 'application/json' },
});
```

## 🔐 **Scope and Consent**

### **Yahoo Scope Required**

```typescript
const scope = 'fspt-r'; // Fantasy Sports Read
```

### **Consent URL (Server Builds This)**

```typescript
const authUrl = new URL('https://api.login.yahoo.com/oauth2/request_auth');
authUrl.searchParams.set('client_id', YAHOO_CLIENT_ID);
authUrl.searchParams.set('redirect_uri', 'https://your-domain.com/api/yahoo/callback');
authUrl.searchParams.set('response_type', 'code');
authUrl.searchParams.set('scope', 'fspt-r');
authUrl.searchParams.set('state', crypto.randomUUID());
```

### **Token Exchange**

```typescript
const tokenUrl = 'https://api.login.yahoo.com/oauth2/get_token';
const response = await fetch(tokenUrl, {
  method: 'POST',
  headers: {
    Authorization: `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`,
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: new URLSearchParams({
    grant_type: 'authorization_code',
    code: authCode,
    redirect_uri: callbackUrl,
  }),
});
```

## 📋 **Copy-Ready Snippets**

### **1. HTTPS Front Door (Workers Edge)**

```typescript
export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    if (url.protocol !== 'https:') {
      url.protocol = 'https:';
      return Response.redirect(url.toString(), 301);
    }
    return app.fetch(req, env, ctx);
  },
};
```

### **2. Secure Cookie**

```typescript
r.headers.append(
  'Set-Cookie',
  'cv_yahoo=' + session + '; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400',
);
```

### **3. Client Fetch (Settings Panel)**

```typescript
const r = await fetch(`${API_BASE}/yahoo/leagues`, {
  credentials: 'include',
  cache: 'no-store',
  headers: { accept: 'application/json' },
});
```

## 🧪 **Test Plan (Copy-Paste Receipts)**

### **Health Headers**

```bash
curl -sSD - "$API_BASE/health" -o /dev/null | grep -Ei '^(cache-control: no-store|x-request-id:)'
```

### **Leagues (Connected)**

```bash
curl -s "$API_BASE/yahoo/leagues" | jq '.schema_version and .last_refresh and (.leagues|type=="array")'
```

### **Session (After Consent)**

```bash
curl -sSD - "$API_BASE/yahoo/me" -o /dev/null | grep -i '^status'
```

### **UI Screenshot**

- Screenshot `/settings` showing "Yahoo Connected — <league> (year)" and roster table

## 🚫 **Known-Bads to Avoid**

- ❌ **Any HTTP** in links, examples, or fetches — blocked
- ❌ **Mismatched redirect URI** between Yahoo console and deployed callback
- ❌ **Reading env in client components** at runtime without guards
- ❌ **Using next/dynamic({ ssr:false })** in a Server Component
- ❌ **Calling API on different origin** than the one that set the cookie

## 🔧 **Troubleshooting**

### **Common Issues**

- **connections: 0 / leagues: 0** → No valid session cookie; redo consent on same host
- **401 on leagues** → Session expired; reconnect
- **State invalid** → Start flow from `/api/yahoo/connect` in same tab
- **RSC crash** → Ensure client wrapper + route error.tsx/loading.tsx

## ✅ **Acceptance (Green)**

- [ ] `/settings` renders without 500 in all states
- [ ] After "Connect Yahoo", `/settings` shows Connected + roster table
- [ ] Health headers show no-store + x-request-id (HTTPS)
- [ ] Leagues JSON includes schema_version + last_refresh
- [ ] Release notes include 3 receipts + screenshot

## 📚 **Reference Documentation**

- **Production Workflow**: `PRODUCTION_WORKFLOW.md`
- **Cursor Guardrails**: `CURSOR_GUARDRAILS.md`
- **OAuth Security**: `OAUTH_SECURITY.md`
- **HTTPS Front Door**: `HTTPS_FRONT_DOOR.md`
- **For Contributors**: `FOR_CONTRIBUTORS.md`
