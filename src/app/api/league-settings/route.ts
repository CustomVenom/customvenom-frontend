import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const API_BASE = process.env['NEXT_PUBLIC_API_BASE'] || 'https://api.customvenom.com';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teamKey = searchParams.get('team_key');

    if (!teamKey) {
      return NextResponse.json({ error: 'team_key required' }, { status: 400 });
    }

    // Forward cookies to backend
    const cookieHeader = request.headers.get('cookie') || '';

    // Forward to Workers API (endpoint may need to be created in Workers API)
    const response = await fetch(
      `${API_BASE}/yahoo/league-settings?team_key=${encodeURIComponent(teamKey)}`,
      {
        headers: {
          Cookie: cookieHeader,
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: 'Failed to fetch league settings',
      }));

      return NextResponse.json(errorData, {
        status: response.status,
      });
    }

    const data = await response.json();
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('[/api/league-settings] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch league settings' }, { status: 500 });
  }
}
