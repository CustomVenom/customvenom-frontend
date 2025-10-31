'use client';

import { WeeklyTrackingTable } from '@/components/tracking/WeeklyTrackingTable';
import { useEffect, useState } from 'react';

export default function TrackingPage() {
  const [teamKey, setTeamKey] = useState<string | null>(null);

  useEffect(() => {
    // Get team selection from session storage or API
    const fetchTeamKey = async () => {
      try {
        const API_BASE = process.env['NEXT_PUBLIC_API_BASE'] || 'https://api.customvenom.com';
        const res = await fetch(`${API_BASE}/api/session/selection`, {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setTeamKey(data.teamKey || data.active_team_key || null);
        }
      } catch (e) {
        console.error('Failed to get team selection:', e);
      }
    };

    fetchTeamKey();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Player Tracking</h1>
        <p className="text-gray-600 mt-2">
          Compare projected vs actual fantasy points for your roster
        </p>
      </div>

      <WeeklyTrackingTable teamKey={teamKey || undefined} />
    </div>
  );
}
