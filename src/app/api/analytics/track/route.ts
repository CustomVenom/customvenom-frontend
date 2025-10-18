import { NextRequest, NextResponse } from 'next/server';
import type { AnalyticsEvent } from '@/lib/analytics';

/**
 * Analytics event tracking endpoint
 * Receives events from frontend and stores them
 * Phase 2.1: Server-side persistence with hourly rollups
 */

interface StoredEvent extends AnalyticsEvent {
  id: string;
  received_at: string;
}

// In-memory storage for now (Phase 2.1a)
// Phase 2.1b will use Prisma/database
const eventStore: StoredEvent[] = [];
const MAX_EVENTS = 10000; // Keep last 10k events

// Hourly rollup storage
interface HourlyRollup {
  hour: string; // ISO hour (e.g., "2025-10-18T01:00:00.000Z")
  event_counts: Record<string, number>;
  tool_usage: Record<string, number>;
  risk_distribution: Record<string, number>;
  unique_sessions: Set<string>;
  total_events: number;
}

const hourlyRollups = new Map<string, HourlyRollup>();

/**
 * Get hour key for rollup (start of hour)
 */
function getHourKey(timestamp: string): string {
  const date = new Date(timestamp);
  date.setMinutes(0, 0, 0);
  return date.toISOString();
}

/**
 * Add event to hourly rollup
 */
function addToRollup(event: AnalyticsEvent): void {
  const hourKey = getHourKey(event.timestamp);
  
  let rollup = hourlyRollups.get(hourKey);
  if (!rollup) {
    rollup = {
      hour: hourKey,
      event_counts: {},
      tool_usage: {},
      risk_distribution: {},
      unique_sessions: new Set(),
      total_events: 0,
    };
    hourlyRollups.set(hourKey, rollup);
  }
  
  // Update counts
  rollup.total_events += 1;
  rollup.event_counts[event.event_type] = (rollup.event_counts[event.event_type] || 0) + 1;
  rollup.unique_sessions.add(event.session_id);
  
  // Track tool usage
  if (event.tool_name) {
    rollup.tool_usage[event.tool_name] = (rollup.tool_usage[event.tool_name] || 0) + 1;
  }
  
  // Track risk modes
  if (event.event_type === 'risk_mode_changed' && event.properties?.risk_mode) {
    const mode = event.properties.risk_mode;
    rollup.risk_distribution[mode] = (rollup.risk_distribution[mode] || 0) + 1;
  }
}

/**
 * Clean up old rollups (keep last 7 days)
 */
function cleanupOldRollups(): void {
  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  
  for (const [hourKey, rollup] of hourlyRollups.entries()) {
    const rollupTime = new Date(rollup.hour).getTime();
    if (rollupTime < sevenDaysAgo) {
      hourlyRollups.delete(hourKey);
    }
  }
}

/**
 * POST /api/analytics/track
 * Receive and store analytics events
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
    
    // Create stored event
    const storedEvent: StoredEvent = {
      ...event,
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      received_at: new Date().toISOString(),
    };
    
    // Add to event store
    eventStore.push(storedEvent);
    
    // Trim if exceeds max
    if (eventStore.length > MAX_EVENTS) {
      eventStore.splice(0, eventStore.length - MAX_EVENTS);
    }
    
    // Add to hourly rollup
    addToRollup(event);
    
    // Periodic cleanup (every 100 events)
    if (eventStore.length % 100 === 0) {
      cleanupOldRollups();
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
 * Retrieve events (for testing/debugging)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hours = parseInt(searchParams.get('hours') || '24');
    
    const cutoff = Date.now() - hours * 60 * 60 * 1000;
    const recentEvents = eventStore.filter(e => 
      new Date(e.timestamp).getTime() > cutoff
    );
    
    return NextResponse.json({
      ok: true,
      count: recentEvents.length,
      total_stored: eventStore.length,
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

