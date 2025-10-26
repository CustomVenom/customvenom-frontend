import 'server-only';
import { cookies } from 'next/headers';

type YahooLeague = { id: string; name: string; season: string; teams: number };

function kvKey(_userId: string) {
  return `yahoo:leagues:${_userId}`;
}

// Get Yahoo tokens from cookies
async function getYahooTokens(_userId: string): Promise<{ accessToken: string } | null> {
  const { auth } = await import('../lib/auth');
  const session = await auth();
  const accessToken = session?.user?.sub;
  if (!accessToken) return null;
  return { accessToken };
}

export async function getYahooStatus(userId: string) {
  const t = await getYahooTokens(userId);
  return { connected: !!t };
}

export async function listYahooLeagues(userId: string): Promise<YahooLeague[]> {
  const t = await getYahooTokens(userId);
  if (!t) return [];

  // Fetch leagues from Workers API
  try {
    const apiBase = process.env['NEXT_PUBLIC_API_BASE'] || 'https://api.customvenom.com';
    const response = await fetch(`${apiBase}/api/yahoo/leagues`, {
      headers: {
        'authorization': `Bearer ${t.accessToken}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) return [];

    const data = await response.json();
    // Parse Yahoo API response structure
    const leaguesData =
      data?.fantasy_content?.users?.[0]?.user?.[1]?.games?.[0]?.game?.[1]?.leagues || [];

    return leaguesData.map(
      (league: {
        league_id?: string;
        league_key?: string;
        name: string;
        season?: string;
        num_teams?: number;
      }) => ({
        id: league.league_id || league.league_key,
        name: league.name,
        season: league.season || '2025',
        teams: league.num_teams || 0,
      })
    );
  } catch (error) {
    console.error('[Yahoo Leagues]', error);
    return [];
  }
}

// Simple, short-lived in-memory cache per process
const mem = new Map<string, { at: number; data: YahooLeague[] }>();
const TTL_MS = 60_000;

export async function getCachedLeagues(userId: string): Promise<YahooLeague[]> {
  const key = kvKey(userId);
  const hit = mem.get(key);
  const now = Date.now();
  if (hit && now - hit.at < TTL_MS) return hit.data;
  const leagues = await listYahooLeagues(userId);
  mem.set(key, { at: now, data: leagues });
  return leagues;
}

