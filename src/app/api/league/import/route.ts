// League import stub endpoint
// Preview-only: validates input and returns success (no actual import)

import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({} as Record<string, unknown>));
  const { provider, league_id } = body || {};
  
  // Validate input
  if (!provider || !league_id) {
    return NextResponse.json(
      { error: 'invalid_input', message: 'provider and league_id required' }, 
      { status: 400 }
    );
  }

  // Only Yahoo for now (can add Sleeper, ESPN later)
  if (provider !== 'yahoo') {
    return NextResponse.json(
      { error: 'invalid_provider', message: 'Only "yahoo" supported for now' }, 
      { status: 400 }
    );
  }

  // Stub response - in production, this would:
  // 1. Call Yahoo Fantasy API to fetch league data
  // 2. Store user's team/league info in database
  // 3. Return personalized recommendations
  
  console.log('league_import_preview', {
    provider,
    league_id,
    timestamp: new Date().toISOString(),
    note: 'Preview mode - no actual import performed',
  });

  return NextResponse.json({
    ok: true,
    schema_version: 'v1',
    last_refresh: new Date().toISOString(),
    received: { provider, league_id },
    message: 'Preview mode - import stub successful',
  });
}

