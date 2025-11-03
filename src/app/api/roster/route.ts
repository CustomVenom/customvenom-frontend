import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const API_BASE = process.env['NEXT_PUBLIC_API_BASE'] || 'https://api.customvenom.com';

interface YahooPlayer {
  player_key: string;
  name: { full: string };
  display_position: string;
  editorial_team_abbr: string;
  selected_position?: { position: string };
}

interface YahooRosterResponse {
  ok: boolean;
  roster: YahooPlayer[];
  team_key?: string;
}

interface EnrichedPlayer {
  player_key: string;
  name: { full: string };
  display_position: string;
  editorial_team_abbr: string;
  selected_position: { position: string };
  nflverse_id: string | null;
  projected_points: number | null;
  mapped: boolean;
  confidence?: number | undefined;
}

interface RosterResponse {
  roster: EnrichedPlayer[];
  stats: {
    total: number;
    mapped: number;
    unmapped: number;
  };
  week: string;
}

/**
 * Calculate current NFL week
 * Season starts Sept 1, weeks 1-18
 */
function getCurrentNFLWeek(): string {
  const now = new Date();
  const year = now.getFullYear();
  const startOfSeason = new Date(year, 8, 1); // Sept 1

  const weeksSinceStart = Math.floor(
    (now.getTime() - startOfSeason.getTime()) / (7 * 24 * 60 * 60 * 1000),
  );

  const nflWeek = Math.max(1, Math.min(18, weeksSinceStart + 1));

  return `${year}-${String(nflWeek).padStart(2, '0')}`;
}

export async function GET(request: NextRequest) {
  try {
    // Forward cookies to backend
    const cookieHeader = request.headers.get('cookie') || '';

    const response = await fetch(`${API_BASE}/yahoo/roster`, {
      headers: {
        Cookie: cookieHeader,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: 'Failed to fetch roster',
      }));

      return NextResponse.json(errorData, {
        status: response.status,
      });
    }

    const data: YahooRosterResponse = await response.json();
    const roster = data.roster || [];

    // Get current NFL week
    const week = getCurrentNFLWeek();

    // Step 1: Extract Yahoo IDs from roster
    const yahooIds = roster
      .map((p) => p.player_key)
      .filter((id): id is string => Boolean(id && id.startsWith('nfl.p.')));

    // Step 2: Map Yahoo IDs to NFLverse IDs via batch endpoint
    let nflverseIdMap: Map<string, string> = new Map();
    if (yahooIds.length > 0) {
      try {
        const mapResponse = await fetch(`${API_BASE}/api/players/map/batch`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Cookie: cookieHeader,
          },
          body: JSON.stringify({ yahoo_ids: yahooIds }),
        });

        if (mapResponse.ok) {
          const mapData = await mapResponse.json();
          const mappings = mapData.mappings || [];
          mappings.forEach((m: { yahoo_id: string; nflverse_id: string }) => {
            if (m.yahoo_id && m.nflverse_id) {
              nflverseIdMap.set(m.yahoo_id, m.nflverse_id);
            }
          });
        }
      } catch (e) {
        console.error('[/api/roster] Failed to map player IDs:', e);
        // Continue without mappings
      }
    }

    // Step 2b: Build reverse map (NFLverse ID → Yahoo ID) for later lookup
    const nflverseToYahooMap: Map<string, string> = new Map();
    for (const [yahooId, nflverseId] of nflverseIdMap.entries()) {
      if (nflverseId) {
        nflverseToYahooMap.set(nflverseId, yahooId);
      }
    }

    // Step 3: Fetch projections for mapped players
    // Note: Projections adapter returns player_id in espn:XXX format after ESPN ID lookup
    // We'll match projections back to NFLverse IDs by building ESPN ID → NFLverse ID map
    const nflverseIds = Array.from(nflverseIdMap.values()).filter((id): id is string => Boolean(id));
    const espnToNflverseMap: Map<string, string> = new Map(); // ESPN ID → NFLverse ID
    let projectionsByEspnId: Map<string, { projected_points: number; reasons?: any[] }> = new Map();

    if (nflverseIds.length > 0) {
      try {
        // Fetch projections with NFLverse IDs (adapter will do ESPN lookup internally)
        const projectionsUrl = `${API_BASE}/api/projections?week=${week}&player_ids=${nflverseIds.join(',')}`;
        const projResponse = await fetch(projectionsUrl, {
          headers: {
            Cookie: cookieHeader,
          },
        });

        if (projResponse.ok) {
          const projData = await projResponse.json();
          // Projections come back with player_id in espn:XXX format
          // Adapter now includes nflverse_id field for matching
          (projData || []).forEach((proj: any) => {
            if (proj.player_id && typeof proj.projected_points === 'number') {
              // Use nflverse_id if provided (adapter enhancement), otherwise fall back to ESPN ID
              const matchKey = proj.nflverse_id || proj.player_id;
              projectionsByEspnId.set(matchKey, {
                projected_points: proj.projected_points,
                reasons: proj.reasons || [],
              });
            }
          });
        }
      } catch (e) {
        console.error('[/api/roster] Failed to fetch projections:', e);
        // Continue without projections
      }

      // Build ESPN ID → NFLverse ID map by querying database
      // Since we can't easily query from frontend API route, we'll use a workaround:
      // Match projections by maintaining order (if adapter preserves it) or
      // by making a separate call to get ESPN IDs for our NFLverse IDs
      // For now, simpler approach: match by position/index (assumes adapter preserves order)
    }

    // Step 4: Enrich roster with mappings and projections
    const enrichedRoster: EnrichedPlayer[] = roster.map((player) => {
      const yahooId = player.player_key;
      const nflverseId = nflverseIdMap.get(yahooId) || null;
      const mapped = Boolean(nflverseId);

      // Match projection: Adapter now includes nflverse_id field for direct matching
      const foundProjection = nflverseId ? projectionsByEspnId.get(nflverseId) : null;

      return {
        player_key: player.player_key,
        name: player.name,
        display_position: player.display_position,
        editorial_team_abbr: player.editorial_team_abbr,
        selected_position: player.selected_position || { position: 'BN' },
        nflverse_id: nflverseId,
        projected_points: foundProjection?.projected_points ?? null,
        mapped,
        confidence: foundProjection?.reasons?.[0]?.confidence ?? undefined,
      };
    });

    // Step 5: Calculate stats
    const mapped = enrichedRoster.filter((p) => p.mapped).length;
    const stats = {
      total: enrichedRoster.length,
      mapped,
      unmapped: enrichedRoster.length - mapped,
    };

    const transformedResponse: RosterResponse = {
      roster: enrichedRoster,
      stats,
      week,
    };

    return NextResponse.json(transformedResponse, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('[/api/roster] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch roster' }, { status: 500 });
  }
}
