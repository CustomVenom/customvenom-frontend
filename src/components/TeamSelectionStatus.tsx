'use client';

import { useSelectedLeague, useSelectedTeam } from '@/lib/selection';

export default function TeamSelectionStatus() {
  const { league_key } = useSelectedLeague();
  const { team_key } = useSelectedTeam();

  if (!team_key) {
    return (
      <div className="p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/20">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Choose Your Team</div>
            <div className="text-sm opacity-80">Select a team to access personalized tools and recommendations.</div>
          </div>
          <button
            onClick={() => {
              // This will be replaced with actual team picker
              console.log('Open team picker');
            }}
            className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Select Team
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-900/20">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">Your Team Selected</div>
          <div className="text-sm opacity-80 flex items-center gap-2">
            <span className="inline-flex items-center rounded px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
              Team: {team_key}
            </span>
            {league_key && (
              <span className="inline-flex items-center rounded px-2 py-1 text-xs bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                League: {league_key}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => {
            // This will be replaced with actual team picker
            console.log('Change team');
          }}
          className="px-3 py-2 rounded bg-gray-600 text-white hover:bg-gray-700"
        >
          Change Team
        </button>
      </div>
    </div>
  );
}
