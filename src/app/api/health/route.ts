// app/api/health/route.ts
export const dynamic = 'force-dynamic'; // ensure no static caching
export const revalidate = 0;

export async function GET() {
  const API_BASE = process.env['API_BASE'];
  if (!API_BASE) {
    return new Response(JSON.stringify({ ok: false, error: 'missing_API_BASE' }), {
      status: 500,
      headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
    });
  }

  const upstream = `${API_BASE}/health`;
  const r = await fetch(upstream, { cache: 'no-store' });

  if (!r.ok) {
    return new Response(JSON.stringify({ ok: false, error: 'upstream_failed', status: r.status }), {
      status: 502,
      headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
    });
  }

  // Expect: { ok, schema_version, last_refresh }
  const data = await r.json();
  const body = JSON.stringify(data);

  // Start response with upstream status and clone upstream headers wholesale first
  const res = new Response(body, {
    status: r.status,
    headers: r.headers,
  });

  // Ensure JSON content-type if missing
  if (!res.headers.has('content-type')) {
    res.headers.set('content-type', 'application/json');
  }

  // Explicitly set or re-ensure the key headers (case-insensitive on set)
  const rid = r.headers.get('x-request-id');
  if (rid) res.headers.set('x-request-id', rid);

  const cors =
    r.headers.get('Access-Control-Allow-Origin') || r.headers.get('access-control-allow-origin');
  if (cors) res.headers.set('Access-Control-Allow-Origin', cors);

  const cc = r.headers.get('cache-control');
  if (cc) res.headers.set('cache-control', cc);

  // Make x-request-id readable by client JS (fetch().headers.get(...))
  const exposed = new Set(
    (res.headers.get('Access-Control-Expose-Headers') || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  );
  exposed.add('x-request-id');
  res.headers.set('Access-Control-Expose-Headers', Array.from(exposed).join(', '));

  return res;
}
