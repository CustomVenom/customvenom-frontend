import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface YahooRosterPlayer {
  player_key: string;
  name: {
    full: string;
    first: string;
    last: string;
  };
  display_position: string;
  editorial_team_abbr: string;
  selected_position: {
    position: string;
  };
}

interface YahooRosterResponse {
  roster?: {
    players?: Array<{ player?: YahooRosterPlayer[] }>;
  };
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

/**
 * Calculate current NFL week (season starts Sept 1, weeks 1-18)
 */
function getCurrentNFLWeek(): string {
  const now = new Date();
  const year = now.getFullYear();
  const startOfSeason = new Date(year, 8, 1); // Sept 1 (month is 0-indexed)
  const weeksSinceStart = Math.floor(
    (now.getTime() - startOfSeason.getTime()) / (7 * 24 * 60 * 60 * 1000),
  );
  const nflWeek = Math.max(1, Math.min(18, weeksSinceStart + 1));
  const weekStr = String(nflWeek).padStart(2, '0');
  return `${year}-${weekStr}`;
}

export async function GET(req: NextRequest): Promise<Response> {
  const reqId = crypto.randomUUID();
  const apiBase =
    process.env['API_BASE'] || process.env['NEXT_PUBLIC_API_BASE'] || 'https://api.customvenom.com';
  const cookie = req.headers.get('cookie') || '';

  try {
    // Step 1: Get active league/team from session selection or leagues
    let teamKey: string | null = null;
    let leagueKey: string | null = null;

    // Try to get active selection from session
    try {
      const selectionRes = await fetch(`${apiBase}/session/selection`, {
        headers: {
          accept: 'application/json',
          cookie: cookie,
        },
        cache: 'no-store',
      });

      if (selectionRes.ok) {
        const selection = await selectionRes.json();
        if (selection.league_key && selection.team_key) {
          leagueKey = selection.league_key;
          teamKey = selection.team_key;
        }
      }
    } catch {
      // Continue without selection
    }

    // If no active selection, get first available league/team
    if (!teamKey || !leagueKey) {
      try {
        const leaguesRes = await fetch(`${apiBase}/yahoo/leagues?format=json`, {
          headers: {
            accept: 'application/json',
            cookie: cookie,
          },
          cache: 'no-store',
        });

        if (leaguesRes.ok) {
          const leaguesData = await leaguesRes.json();
          const leagues = leaguesData.leagues || [];
          if (leagues.length > 0) {
            leagueKey = leagues[0].key;
            // Get teams for this league
            const teamsRes = await fetch(
              `${apiBase}/yahoo/leagues/${leagueKey}/teams?format=json`,
              {
                headers: {
                  accept: 'application/json',
                  cookie: cookie,
                },
                cache: 'no-store',
              },
            );

            if (teamsRes.ok) {
              const teamsData = await teamsRes.json();
              const teams = teamsData.teams || [];
              if (teams.length > 0) {
                teamKey = teams[0].key;
              }
            }
          }
        }
      } catch {
        // Continue without league/team
      }
    }

    if (!teamKey) {
      return NextResponse.json(
        { error: 'No team found. Please connect Yahoo and select a league.' },
        { status: 404 },
      );
    }

    // Step 2: Fetch Yahoo roster
    const rosterRes = await fetch(`${apiBase}/yahoo/team/${teamKey}/roster?format=json`, {
      headers: {
        'x-request-id': reqId,
        accept: 'application/json',
        cookie: cookie,
      },
      cache: 'no-store',
    });

    if (!rosterRes.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch roster from Yahoo', status: rosterRes.status },
        { status: rosterRes.status },
      );
    }

    const rosterData = (await rosterRes.json()) as YahooRosterResponse;
    const players: YahooRosterPlayer[] = [];

    // Parse Yahoo's nested structure
    if (rosterData.roster?.players) {
      for (const playerEntry of rosterData.roster.players) {
        if (playerEntry.player && Array.isArray(playerEntry.player)) {
          for (const player of playerEntry.player) {
            if (player && typeof player === 'object' && 'player_key' in player) {
              players.push(player as YahooRosterPlayer);
            }
          }
        }
      }
    }

    if (players.length === 0) {
      return NextResponse.json({
        roster: [],
        stats: { total: 0, mapped: 0, unmapped: 0 },
        week: getCurrentNFLWeek(),
      });
    }

    // Step 3: Extract Yahoo IDs and map to NFLverse IDs
    const yahooIds = players
      .map((p) => {
        // Yahoo player_key format: "123.p.12345" - extract numeric ID
        const parts = p.player_key.split('.');
        return parts[parts.length - 1];
      })
      .filter((id) => id && id !== '');

    let mappings: Record<string, string | null> = {};

    if (yahooIds.length > 0) {
      try {
        const mappingRes = await fetch(`${apiBase}/api/players/map/batch`, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            cookie: cookie,
          },
          body: JSON.stringify({ yahoo_ids: yahooIds }),
          cache: 'no-store',
        });

        if (mappingRes.ok) {
          const mappingData = await mappingRes.json();
          mappings = mappingData.mappings || {};
        }
      } catch (error) {
        console.error('[api/roster] Mapping error:', error);
        // Continue with empty mappings
      }
    }

    // Step 4: Get current NFL week and fetch projections
    const currentWeek = getCurrentNFLWeek();
    let projections: Array<{ player_id: string; median?: number; confidence?: number }> = [];

    try {
      const projectionsRes = await fetch(`${apiBase}/projections?week=${currentWeek}`, {
        headers: {
          accept: 'application/json',
          cookie: cookie,
        },
        cache: 'no-store',
      });

      if (projectionsRes.ok) {
        const projectionsData = await projectionsRes.json();
        projections = projectionsData.projections || [];
      }
    } catch (error) {
      console.error('[api/roster] Projections error:', error);
      // Continue with empty projections
    }

    // Step 5: Enrich roster with mappings and projections
    const enrichedPlayers: EnrichedPlayer[] = players.map((player) => {
      const yahooIdParts = player.player_key.split('.');
      const yahooId = yahooIdParts[yahooIdParts.length - 1];
      const nflverseId = mappings[yahooId] || null;
      const mapped = !!nflverseId;

      // Find matching projection by NFLverse ID
      let projectedPoints: number | null = null;
      let confidence: number | undefined;

      if (nflverseId) {
        // Match by NFLverse ID format (e.g., "00-0037248" or "espn:12345")
        const projection = projections.find((p) => {
          const projId = p.player_id;
          return (
            projId === nflverseId || projId.endsWith(`:${yahooId}`) || projId.includes(nflverseId)
          );
        });

        if (projection) {
          projectedPoints = projection.median ?? null;
          confidence = projection.confidence;
        }
      }

      return {
        player_key: player.player_key,
        name: { full: player.name.full },
        display_position: player.display_position,
        editorial_team_abbr: player.editorial_team_abbr,
        selected_position: player.selected_position,
        nflverse_id: nflverseId,
        projected_points: projectedPoints,
        mapped,
        confidence,
      };
    });

    // Step 6: Calculate stats
    const stats = {
      total: enrichedPlayers.length,
      mapped: enrichedPlayers.filter((p) => p.mapped).length,
      unmapped: enrichedPlayers.filter((p) => !p.mapped).length,
    };

    return NextResponse.json(
      {
        roster: enrichedPlayers,
        stats,
        week: currentWeek,
      },
      {
        headers: {
          'content-type': 'application/json',
          'cache-control': 'no-store',
          'x-request-id': reqId,
        },
      },
    );
  } catch (error) {
    console.error('[api/roster] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 },
    );
  }
}
