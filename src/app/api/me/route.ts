export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    // Workers-only: forward the browser cookie to API (no NextAuth)
    const apiBase = process.env['API_BASE'] || process.env['NEXT_PUBLIC_API_BASE'] || 'https://api.customvenom.com';
    const cookie = req.headers.get('cookie') || '';

    // Check Yahoo connection status
    const yahooRes = await fetch(`${apiBase}/api/yahoo/me`, {
      headers: {
        'accept': 'application/json',
        'cookie': cookie,
      },
      cache: 'no-store',
    });

    const yahooConnected = yahooRes.ok;

    // Return connection status
    return NextResponse.json({
      connected: yahooConnected,
      connections: yahooConnected ? ['yahoo'] : [],
      providers: {
        yahoo: yahooConnected
      }
    }, {
      status: 200,
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-store',
      }
    });
  } catch (error) {
    console.error('[api/me]', error);
    return NextResponse.json({
      connected: false,
      connections: [],
      providers: {
        yahoo: false
      },
      error: 'internal_error'
    }, {
      status: 200, // Return 200 with error info rather than 500
      headers: {
        'content-type': 'application/json',
        'cache-control': 'no-store',
      }
    });
  }
}
