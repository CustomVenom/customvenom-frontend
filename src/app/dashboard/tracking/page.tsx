'use client';

import Link from 'next/link';
import { WeeklyTrackingTable } from '@/components/tracking/WeeklyTrackingTable';
import { useEffect, useState } from 'react';
import { logger } from '@/lib/logger';

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
        logger.error('Failed to get team selection', {
          error: e instanceof Error ? e.message : String(e),
        });
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
        <div className="text-center py-12 space-y-4">
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Please select a team from your dashboard to view tracking data.
          </p>
          <Link
            href="/dashboard"
            className="inline-block text-primary-600 dark:text-primary-400 hover:underline"
          >
            Go to Dashboard â†’
          </Link>
        </div>
      ) : (
        <WeeklyTrackingTable teamKey={teamKey} />
      )}
    </div>
  );
}
