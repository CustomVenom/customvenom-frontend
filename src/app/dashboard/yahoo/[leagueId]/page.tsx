import Link from 'next/link';

import { getServerSession } from '@/lib/auth-helpers';

async function getLeagueRoster(userId: string, leagueId: string) {
  const { auth } = await import('../../../../lib/auth');
  const session = await auth();
  const accessToken = session?.user?.sub;

  if (!accessToken) {
    return null;
  }

  // TODO: Implement actual Yahoo API call to fetch roster
  // For now, return demo data
  return {
    league: { id: leagueId, name: 'Demo League', season: '2025' },
    team: { name: 'My Team' },
    roster: [
      { pos: 'QB', name: 'Player A' },
      { pos: 'RB', name: 'Player B' },
      { pos: 'WR', name: 'Player C' },
    ],
  };
}

export default async function YahooLeaguePage({
  params,
}: {
  params: Promise<{ leagueId: string }>;
}) {
  const session = await getServerSession();
  const userId = session?.user?.id as string | undefined;

  if (!userId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>You need to sign in to view this league.</p>
        <Link href="/dashboard/yahoo" className="btn">
          Back to leagues
        </Link>
      </div>
    );
  }

  const { leagueId } = await params;
  const data = await getLeagueRoster(userId, leagueId);

  if (!data) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Unable to load league data.</p>
        <Link href="/dashboard/yahoo" className="btn">
          Back to leagues
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-4">
      <Link href="/dashboard/yahoo" className="text-sm underline">
        ← Back to leagues
      </Link>
      {!data ? (
        <div className="space-y-4">
          <div className="skeleton h-8 w-60" />
          <div className="skeleton h-6 w-40" />
          <div className="skeleton h-64 w-full" />
        </div>
      ) : (
        <>
          <h2 className="text-xl font-semibold">
            {data.league.name} • {data.league.season}
          </h2>
          <h3 className="font-medium">{data.team.name}</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2 pr-3">Pos</th>
                <th className="py-2">Player</th>
              </tr>
            </thead>
            <tbody>
              {data.roster.map((r, i) => (
                <tr key={i} className="border-b last:border-0">
                  <td className="py-2 pr-3">{r.pos}</td>
                  <td className="py-2">{r.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
