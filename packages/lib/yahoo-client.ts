export async function getActiveLeagueKey({ sport }: { sport: 'nfl' | 'nba' }): Promise<string> {
  const res = await fetch(`/api/yahoo/leagues?sport=${sport}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch leagues');
  const data = await res.json();
  return data.leagues?.[0]?.league_key ?? null;
}

export async function getRoster({ leagueKey }: { leagueKey: string }) {
  const res = await fetch(`/api/yahoo/roster?league_key=${leagueKey}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch roster');
  const data = await res.json();
  // Normalize to a consistent shape
  return {
    leagueKey,
    roster: data?.roster ?? data?.data?.roster ?? [],
  };
}
