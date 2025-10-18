import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/analytics/rollups?hours=168
 * Retrieve hourly rollup data
 * Default: last 7 days (168 hours)
 */

// This would access the same hourlyRollups from track/route.ts
// For now, returning placeholder until we have shared state

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hours = parseInt(searchParams.get('hours') || '168');
    
    // TODO: Access shared hourlyRollups from track route
    // For now, return empty structure
    
    return NextResponse.json({
      ok: true,
      rollups: [],
      hours,
      note: 'Hourly rollups available in track endpoint - shared state coming in Phase 2.1b',
    });
    
  } catch (error) {
    console.error('Error retrieving rollups:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve rollups' },
      { status: 500 }
    );
  }
}

