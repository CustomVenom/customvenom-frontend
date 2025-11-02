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

    // Transform backend response to match frontend UI format
    const enrichedRoster: EnrichedPlayer[] = (data.roster || []).map((player) => ({
      player_key: player.player_key,
      name: player.name,
      display_position: player.display_position,
      editorial_team_abbr: player.editorial_team_abbr,
      selected_position: player.selected_position || { position: 'BN' },
      nflverse_id: null, // Not mapped yet
      projected_points: null, // No projections yet
      mapped: false, // Not mapped to NFLverse yet
      confidence: undefined, // No confidence score yet
    }));

    // Calculate stats
    const stats = {
      total: enrichedRoster.length,
      mapped: 0, // No players mapped yet
      unmapped: enrichedRoster.length, // All players unmapped
    };

    // Get current NFL week
    const week = getCurrentNFLWeek();

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
