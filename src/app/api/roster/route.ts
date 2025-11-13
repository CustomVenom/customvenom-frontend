import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';

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

type ScoringFormat = 'standard' | 'half_ppr' | 'full_ppr';

interface RosterResponse {
  roster: EnrichedPlayer[];
  stats: {
    total: number;
    mapped: number;
    unmapped: number;
  };
  week: string;
  scoring_format?: ScoringFormat;
}

/**
 * Calculate current NFL week
 * Season starts Sept 1, weeks 1-18
 * Returns the most recent week with data available (week 9 as of Nov 3, 2025)
 */
function getCurrentNFLWeek(): string {
  const now = new Date();
  const year = now.getFullYear();
  const startOfSeason = new Date(year, 8, 1); // Sept 1

  const weeksSinceStart = Math.floor(
    (now.getTime() - startOfSeason.getTime()) / (7 * 24 * 60 * 60 * 1000),
  );

  // Don't add 1 - weeksSinceStart already gives us the current week
  // But cap at week 9 for now since that's the latest week we have projection data for
  const nflWeek = Math.max(1, Math.min(9, weeksSinceStart));

  return `${year}-${String(nflWeek).padStart(2, '0')}`;
}

export async function GET(request: NextRequest) {
  try {
    // Forward cookies to backend
    const cookieHeader = request.headers.get('cookie') || '';

    // Support teamKey query parameter (optional - falls back to cookie)
    const teamKey = request.nextUrl.searchParams.get('teamKey');
    const scoringFormatParam = request.nextUrl.searchParams.get('scoring_format') || 'half_ppr';
    const validFormats: ScoringFormat[] = ['standard', 'half_ppr', 'full_ppr'];
    const scoringFormat = validFormats.includes(scoringFormatParam as ScoringFormat)
      ? (scoringFormatParam as ScoringFormat)
      : 'half_ppr';

    const rosterUrl = teamKey
      ? `${API_BASE}/yahoo/roster?team_key=${encodeURIComponent(teamKey)}`
      : `${API_BASE}/yahoo/roster`;

    const response = await fetch(rosterUrl, {
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
    // Accept both 'nfl.p.*' and league-specific formats like '461.p.*'
    const yahooIds = roster
      .map((p) => p.player_key)
      .filter((id): id is string => Boolean(id && id.includes('.p.')));

    // Step 2: Map Yahoo IDs to NFLverse IDs via batch endpoint
    const nflverseIdMap: Map<string, string> = new Map();
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
        } else {
          const errorText = await mapResponse.text().catch(() => 'Unable to read error response');
          logger.error('[roster] Mapping endpoint failed', { status: mapResponse.status, error: errorText.substring(0, 200) });
          // Continue with unmapped players
        }
      } catch (e) {
        logger.error('[/api/roster] Failed to map player IDs', { error: e instanceof Error ? e.message : String(e) });
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
    const nflverseIds = Array.from(nflverseIdMap.values()).filter((id): id is string =>
      Boolean(id),
    );
    const projectionsByEspnId: Map<
      string,
      {
        projected_points: number;
        reasons?: Array<{ label: string; effect: string; confidence: number }>;
      }
    > = new Map();

    if (nflverseIds.length > 0) {
      try {
        // Fetch projections with NFLverse IDs (adapter will do ESPN lookup internally)
        const projectionParams = new URLSearchParams({
          week,
          player_ids: nflverseIds.join(','),
          scoring_format: scoringFormat,
        });
        const projectionsUrl = `${API_BASE}/api/projections?${projectionParams.toString()}`;
        const projResponse = await fetch(projectionsUrl, {
          headers: {
            Cookie: cookieHeader,
          },
        });

        if (projResponse.ok) {
          const projData = await projResponse.json();
          // Projections come back with player_id in espn:XXX format
          // Adapter now includes nflverse_id field for matching
          (projData || []).forEach(
            (proj: {
              player_id: string;
              nflverse_id?: string;
              projected_points: number;
              reasons?: Array<{ label: string; effect: string; confidence: number }>;
            }) => {
              if (proj.player_id && typeof proj.projected_points === 'number') {
                // Use nflverse_id if provided (adapter enhancement), otherwise fall back to ESPN ID
                const matchKey = proj.nflverse_id || proj.player_id;
                projectionsByEspnId.set(matchKey, {
                  projected_points: proj.projected_points,
                  reasons: proj.reasons || [],
                });
              }
            },
          );
        } else {
          const errorText = await projResponse.text().catch(() => 'Unable to read error response');
          logger.error('[roster] Projection endpoint failed', { status: projResponse.status, error: errorText.substring(0, 200) });
          // Continue without projections
        }
      } catch (e) {
        logger.error('[/api/roster] Failed to fetch projections', { error: e instanceof Error ? e.message : String(e) });
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
      scoring_format: scoringFormat,
    };

    return NextResponse.json(transformedResponse, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    logger.error('[/api/roster] Error', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: 'Failed to fetch roster' }, { status: 500 });
  }
}
