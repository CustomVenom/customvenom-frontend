// Analytics event tracking system
// Phase 2: Logs to console and localStorage
// Phase 2.1: Also sends to backend for persistence

// Configuration
const SEND_TO_BACKEND = true; // Set to false to disable server persistence
const BACKEND_ENDPOINT = '/api/analytics/track';

// Prisma-compatible JSON value type
export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export interface AnalyticsEvent {
  event_type: string;
  tool_name?: string;
  action?: string;
  properties?: Record<string, JsonValue>;
  user_id?: string;
  session_id: string;
  timestamp: string;
  demo_mode: boolean;
}

interface StoredEvent extends AnalyticsEvent {
  id: string;
}

// Generate or retrieve session ID
function getSessionId(): string {
  if (typeof window === 'undefined') return 'server';
  
  let sessionId = sessionStorage.getItem('cv_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    sessionStorage.setItem('cv_session_id', sessionId);
  }
  return sessionId;
}

// Check if in demo mode (no authentication)
function isDemoMode(): boolean {
  if (typeof window === 'undefined') return true;
  // Check for auth session - adjust based on your auth implementation
  return !sessionStorage.getItem('cv_user_id');
}

// Get user ID if authenticated
function getUserId(): string | undefined {
  if (typeof window === 'undefined') return undefined;
  return sessionStorage.getItem('cv_user_id') || undefined;
}

// Store event in localStorage (last 24h only)
function storeEvent(event: AnalyticsEvent): void {
  if (typeof window === 'undefined') return;
  
  try {
    const stored: StoredEvent = {
      ...event,
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
    };
    
    // Get existing events
    const eventsJson = localStorage.getItem('cv_analytics_events') || '[]';
    const events: StoredEvent[] = JSON.parse(eventsJson);
    
    // Add new event
    events.push(stored);
    
    // Clean up events older than 24h
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    const recentEvents = events.filter(e => 
      new Date(e.timestamp).getTime() > oneDayAgo
    );
    
    // Store back (limit to 1000 events max)
    const limitedEvents = recentEvents.slice(-1000);
    localStorage.setItem('cv_analytics_events', JSON.stringify(limitedEvents));
  } catch (error) {
    console.warn('Failed to store analytics event:', error);
  }
}

/**
 * Track an analytics event
 * @param event_type - Type of event (e.g., 'tool_used', 'risk_mode_changed')
 * @param properties - Additional event properties
 */
export function trackEvent(
  event_type: string,
  properties?: Record<string, JsonValue>
): void {
  const startTime = performance.now();
  
  try {
    const event: AnalyticsEvent = {
      event_type,
      tool_name: typeof properties?.tool_name === 'string' ? properties.tool_name : undefined,
      action: typeof properties?.action === 'string' ? properties.action : undefined,
      properties: properties || {},
      user_id: getUserId(),
      session_id: getSessionId(),
      timestamp: new Date().toISOString(),
      demo_mode: isDemoMode(),
    };
    
    // Log to console (structured format)
    if (typeof window !== 'undefined' && console.log) {
      console.log(JSON.stringify({
        type: 'analytics_event',
        ...event,
      }));
    }
    
    // Store in localStorage for dashboard
    storeEvent(event);
    
    // Send to backend for persistence (non-blocking)
    if (SEND_TO_BACKEND && typeof window !== 'undefined') {
      fetch(BACKEND_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      }).catch(error => {
        // Silent failure - don't block user experience
        console.warn('Failed to send analytics to backend:', error);
      });
    }
    
  } catch (error) {
    console.warn('Analytics tracking error:', error);
  } finally {
    const duration = performance.now() - startTime;
    
    // Warn if overhead exceeds 5ms target
    if (duration > 5) {
      console.warn(`Analytics overhead: ${duration.toFixed(2)}ms (target: <5ms)`);
    }
  }
}

/**
 * Track tool usage
 */
export function trackToolUsage(
  tool_name: string,
  action: string,
  metadata?: Record<string, JsonValue>
): void {
  trackEvent('tool_used', {
    tool_name,
    action,
    ...metadata,
  });
}

/**
 * Track risk mode changes
 */
export function trackRiskModeChange(
  tool_name: string,
  risk_mode: 'protect' | 'neutral' | 'chase',
  previous_mode?: 'protect' | 'neutral' | 'chase'
): void {
  const props: Record<string, JsonValue> = {
    tool_name,
    risk_mode,
  };
  if (previous_mode) {
    props.previous_mode = previous_mode;
  }
  trackEvent('risk_mode_changed', props);
}

/**
 * Track feature interactions
 */
export function trackFeatureInteraction(
  feature_name: string,
  action: string,
  metadata?: Record<string, JsonValue>
): void {
  trackEvent('feature_interaction', {
    feature_name,
    action,
    ...metadata,
  });
}

/**
 * Get stored events (for dashboard)
 */
export function getStoredEvents(): StoredEvent[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const eventsJson = localStorage.getItem('cv_analytics_events') || '[]';
    return JSON.parse(eventsJson);
  } catch (error) {
    console.warn('Failed to retrieve analytics events:', error);
    return [];
  }
}

/**
 * Get events within time range
 */
export function getEventsSince(hoursAgo: number): StoredEvent[] {
  const cutoff = Date.now() - hoursAgo * 60 * 60 * 1000;
  return getStoredEvents().filter(e => 
    new Date(e.timestamp).getTime() > cutoff
  );
}

/**
 * Get event counts by type
 */
export function getEventCountsByType(events: StoredEvent[]): Record<string, number> {
  return events.reduce((acc, event) => {
    acc[event.event_type] = (acc[event.event_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

/**
 * Get tool usage stats
 */
export function getToolUsageStats(events: StoredEvent[]) {
  const toolEvents = events.filter(e => e.event_type === 'tool_used');
  
  const byTool = toolEvents.reduce((acc, event) => {
    const tool = event.tool_name || 'unknown';
    acc[tool] = (acc[tool] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return {
    total: toolEvents.length,
    by_tool: byTool,
  };
}

/**
 * Get risk mode distribution
 */
export function getRiskModeDistribution(events: StoredEvent[]) {
  const riskEvents = events.filter(e => e.event_type === 'risk_mode_changed');
  
  const distribution = riskEvents.reduce((acc, event) => {
    const mode = typeof event.properties?.risk_mode === 'string' 
      ? event.properties.risk_mode 
      : 'unknown';
    acc[mode] = (acc[mode] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  return distribution;
}

/**
 * Clear stored events (for testing or privacy)
 */
export function clearStoredEvents(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('cv_analytics_events');
}

