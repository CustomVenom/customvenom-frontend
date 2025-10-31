'use client';

import { WeeklyTrackingTable } from '@/components/tracking/WeeklyTrackingTable';
import { useEffect, useState } from 'react';

export default function TrackingPage() {
  const [teamKey, setTeamKey] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTeamKey = async () => {
      try {
        const API_BASE = process.env['NEXT_PUBLIC_API_BASE'] || 'https://api.customvenom.com';
        const res = await fetch(`${API_BASE}/api/session/selection`, {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setTeamKey(data.selection?.teamKey || undefined);
        }
      } catch (e) {
        console.error('Failed to get team selection:', e);
      } finally {
        setLoading(false);
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

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : !teamKey ? (
        <div className="text-center py-8 text-gray-500">
          Please select a team from your dashboard to view tracking data.
        </div>
      ) : (
        <WeeklyTrackingTable teamKey={teamKey} />
      )}
    </div>
  );
}
