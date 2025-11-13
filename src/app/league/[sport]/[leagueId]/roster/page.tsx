import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{
    sport: string;
    leagueId: string;
  }>;
}

export default async function SportLeagueRosterPage({ params }: PageProps) {
  const { sport, leagueId } = await params;

  // Validate sport
  if (sport !== 'nfl' && sport !== 'nba') {
    notFound();
  }

  // NBA stub
  if (sport === 'nba') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            NBA League Roster
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Coming soon</p>
        </div>
      </div>
    );
  }

  // NFL: Redirect to existing implementation or show placeholder
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">
        NFL League Roster
      </h1>
      <p className="text-gray-600 dark:text-gray-400">League ID: {leagueId}</p>
      {/* TODO: Integrate existing roster component */}
    </div>
  );
}
