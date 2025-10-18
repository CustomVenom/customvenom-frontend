import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * GET /api/analytics/rollups?hours=168
 * Retrieve hourly rollup data from database
 * Default: last 7 days (168 hours)
 */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hours = parseInt(searchParams.get('hours') || '168');
    
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    // Fetch rollups from database
    const rollups = await prisma.hourlyRollup.findMany({
      where: {
        hour: {
          gte: cutoff,
        },
      },
      orderBy: {
        hour: 'desc',
      },
    });
    
    // Calculate aggregate stats
    const totalEvents = rollups.reduce((sum, r) => sum + r.totalEvents, 0);
    const totalSessions = rollups.reduce((sum, r) => sum + r.uniqueSessions, 0);
    
    return NextResponse.json({
      ok: true,
      count: rollups.length,
      hours,
      total_events: totalEvents,
      total_sessions: totalSessions,
      rollups: rollups.map(r => ({
        hour: r.hour,
        event_counts: r.eventCounts,
        tool_usage: r.toolUsage,
        risk_distribution: r.riskDistribution,
        unique_sessions: r.uniqueSessions,
        total_events: r.totalEvents,
      })),
    });
    
  } catch (error) {
    console.error('Error retrieving rollups:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve rollups' },
      { status: 500 }
    );
  }
}

