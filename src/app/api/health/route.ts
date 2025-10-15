// app/api/health/route.ts
export const dynamic = 'force-dynamic'; // ensure no static caching
export const revalidate = 0;

export async function GET() {
  const API_BASE = process.env.API_BASE;
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
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'content-type': 'application/json',
      'cache-control': 'no-store',
    },
  });
}