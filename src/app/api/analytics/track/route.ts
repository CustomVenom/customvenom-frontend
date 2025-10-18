import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import type { AnalyticsEvent } from '@/lib/analytics';

/**
 * Analytics event tracking endpoint
 * Phase 2.1b: Prisma/database persistence with hourly rollups
 */

const prisma = new PrismaClient();

interface RollupData {
  event_counts: Record<string, number>;
  tool_usage: Record<string, number>;
  risk_distribution: Record<string, number>;
  unique_sessions: string[];
  total_events: number;
}

/**
 * Get hour key for rollup (start of hour)
 */
function getHourKey(timestamp: string): Date {
  const date = new Date(timestamp);
  date.setMinutes(0, 0, 0);
  return date;
}

/**
 * Update hourly rollup in database
 */
async function updateHourlyRollup(event: AnalyticsEvent): Promise<void> {
  try {
    const hourKey = getHourKey(event.timestamp);
    
    // Get or create rollup
    let rollup = await prisma.hourlyRollup.findUnique({
      where: { hour: hourKey },
    });
    
    if (!rollup) {
      // Create new rollup
      rollup = await prisma.hourlyRollup.create({
        data: {
          hour: hourKey,
          eventCounts: {},
          toolUsage: {},
          riskDistribution: {},
          uniqueSessions: 0,
          totalEvents: 0,
        },
      });
    }
    
    // Parse existing JSON data
    const eventCounts = rollup.eventCounts as Record<string, number>;
    const toolUsage = rollup.toolUsage as Record<string, number>;
    const riskDistribution = rollup.riskDistribution as Record<string, number>;
    
    // Update counts
    eventCounts[event.event_type] = (eventCounts[event.event_type] || 0) + 1;
    
    if (event.tool_name) {
      toolUsage[event.tool_name] = (toolUsage[event.tool_name] || 0) + 1;
    }
    
    if (event.event_type === 'risk_mode_changed' && event.properties?.risk_mode) {
      const mode = event.properties.risk_mode as string;
      riskDistribution[mode] = (riskDistribution[mode] || 0) + 1;
    }
    
    // Get unique sessions count (approximate - would need to track in separate table for exact count)
    const sessionCount = await prisma.analyticsEvent.groupBy({
      by: ['sessionId'],
      where: {
        timestamp: {
          gte: hourKey,
          lt: new Date(hourKey.getTime() + 60 * 60 * 1000),
        },
      },
    });
    
    // Update rollup
    await prisma.hourlyRollup.update({
      where: { hour: hourKey },
      data: {
        eventCounts,
        toolUsage,
        riskDistribution,
        uniqueSessions: sessionCount.length,
        totalEvents: rollup.totalEvents + 1,
      },
    });
  } catch (error) {
    console.error('Failed to update hourly rollup:', error);
    // Don't throw - rollup update failure shouldn't block event storage
  }
}

/**
 * POST /api/analytics/track
 * Receive and store analytics events in database
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate event structure
    if (!body.event_type || !body.timestamp || !body.session_id) {
      return NextResponse.json(
        { error: 'Invalid event format' },
        { status: 400 }
      );
    }
    
    const event: AnalyticsEvent = body;
    
    // Store event in database
    const storedEvent = await prisma.analyticsEvent.create({
      data: {
        userId: event.user_id || null,
        sessionId: event.session_id,
        eventType: event.event_type,
        toolName: event.tool_name || null,
        action: event.action || null,
        properties: event.properties || {},
        demoMode: event.demo_mode ?? true,
        timestamp: new Date(event.timestamp),
      },
    });
    
    // Update hourly rollup (async, non-blocking)
    updateHourlyRollup(event).catch(err => {
      console.error('Rollup update failed (non-critical):', err);
    });
    
    // Periodic cleanup: Delete events older than 30 days (every 100th request)
    if (Math.random() < 0.01) { // ~1% of requests
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      prisma.analyticsEvent.deleteMany({
        where: {
          timestamp: {
            lt: thirtyDaysAgo,
          },
        },
      }).catch(err => {
        console.error('Cleanup failed (non-critical):', err);
      });
      
      // Also cleanup old rollups (>90 days)
      const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
      prisma.hourlyRollup.deleteMany({
        where: {
          hour: {
            lt: ninetyDaysAgo,
          },
        },
      }).catch(err => {
        console.error('Rollup cleanup failed (non-critical):', err);
      });
    }
    
    return NextResponse.json({
      ok: true,
      event_id: storedEvent.id,
    });
    
  } catch (error) {
    console.error('Error storing analytics event:', error);
    return NextResponse.json(
      { error: 'Failed to store event' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/analytics/track?hours=24
 * Retrieve events from database (for testing/debugging)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hours = parseInt(searchParams.get('hours') || '24');
    
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    const recentEvents = await prisma.analyticsEvent.findMany({
      where: {
        timestamp: {
          gte: cutoff,
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: 1000, // Limit for performance
    });
    
    const totalCount = await prisma.analyticsEvent.count({
      where: {
        timestamp: {
          gte: cutoff,
        },
      },
    });
    
    return NextResponse.json({
      ok: true,
      count: recentEvents.length,
      total_in_range: totalCount,
      events: recentEvents,
    });
    
  } catch (error) {
    console.error('Error retrieving analytics events:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve events' },
      { status: 500 }
    );
  }
}

