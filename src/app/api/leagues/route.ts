import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const reqId = crypto.randomUUID();

  try {
    // Workers-only: forward the browser cookie to API (no NextAuth)
    const apiBase = process.env['API_BASE'] || process.env['NEXT_PUBLIC_API_BASE'] || 'https://api.customvenom.com';
    const cookie = request.headers.get('cookie') || '';
    const r = await fetch(`${apiBase}/yahoo/leagues?season=2025`, {
      headers: {
        'x-request-id': reqId,
        'accept': 'application/json',
        // Forward Yahoo cookie to API for auth
        'cookie': cookie,
      },
      cache: 'no-store',
    });

    if (!r.ok) {
      // Try to get error details from Workers API
      let errorDetails = 'upstream_unavailable';
      try {
        const errorBody = await r.json();
        if (errorBody.error) {
          errorDetails = errorBody.error;
        }
      } catch {
        // Ignore JSON parsing errors, use default
      }

      // Return JSON error response in frontend format
      return NextResponse.json(
        {
          connected: false,
          leagues: [],
          connections: [],
          entitlements: {
            is_superuser: false,
            free_slots: 1,
            purchased_slots: 0,
            max_sync_slots: 1,
            used_slots: 0,
          },
          synced_leagues: [],
          active_league: null,
          error: errorDetails
        },
        {
          status: r.status,
          headers: {
            'content-type': 'application/json',
            'cache-control': 'no-store',
            'x-request-id': reqId,
          },
        }
      );
    }

    const contentType = r.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      // Upstream returned non-JSON, return safe fallback
      return NextResponse.json(
        {
          connected: false,
          leagues: [],
          connections: [],
          entitlements: {
            is_superuser: false,
            free_slots: 1,
            purchased_slots: 0,
            max_sync_slots: 1,
            used_slots: 0,
          },
          synced_leagues: [],
          active_league: null,
          error: 'invalid_response'
        },
        {
          status: 200,
          headers: {
            'content-type': 'application/json',
            'cache-control': 'no-store',
            'x-request-id': reqId,
          },
        }
      );
    }

    const body = await r.json();

    // Transform Workers API response to frontend format
    if (body.ok && body.leagues) {
      // Transform Yahoo leagues to frontend format
      const leagues = body.leagues.map((item: { id: string; name: string; season: string }) => ({
        key: `yahoo:${item.id}`,
        provider: 'yahoo' as const,
        external_league_id: item.id,
        team_id: 'unknown', // Will be filled when we get team data
        name: item.name,
        season: item.season,
        team_name: 'Unknown Team', // Will be filled when we get team data
      }));

      const transformedResponse = {
        connected: true,
        connections: [{
          provider: 'yahoo' as const,
          connected_at: body.last_refresh || new Date().toISOString(),
        }],
        leagues,
        entitlements: {
          is_superuser: false,
          free_slots: 1,
          purchased_slots: 0,
          max_sync_slots: 1,
          used_slots: leagues.length,
        },
        synced_leagues: leagues.map((l: { key: string }) => l.key),
        active_league: leagues.length > 0 ? leagues[0].key : null,
        schema_version: body.schema_version,
        last_refresh: body.last_refresh,
        request_id: body.request_id,
      };

      return NextResponse.json(transformedResponse, {
        headers: {
          'content-type': 'application/json',
          'cache-control': 'no-store',
          'x-request-id': reqId,
        },
      });
    } else {
      // Workers API returned error or unexpected format
      return NextResponse.json(
        {
          connected: false,
          leagues: [],
          connections: [],
          entitlements: {
            is_superuser: false,
            free_slots: 1,
            purchased_slots: 0,
            max_sync_slots: 1,
            used_slots: 0,
          },
          synced_leagues: [],
          active_league: null,
          error: body.error || 'upstream_error'
        },
        {
          status: 200,
          headers: {
            'content-type': 'application/json',
            'cache-control': 'no-store',
            'x-request-id': reqId,
          },
        }
      );
    }
  } catch (error) {
    console.error('[api/leagues]', error);
    // Return JSON error response
    return NextResponse.json(
      {
        connected: false,
        leagues: [],
        connections: [],
        entitlements: {
          is_superuser: false,
          free_slots: 1,
          purchased_slots: 0,
          max_sync_slots: 1,
          used_slots: 0,
        },
        synced_leagues: [],
        active_league: null,
        error: 'internal_error'
      },
      {
        status: 500,
        headers: {
          'content-type': 'application/json',
          'cache-control': 'no-store',
          'x-request-id': reqId,
        },
      }
    );
  }
}

