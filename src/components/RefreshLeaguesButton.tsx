'use client';

import { useState } from 'react';

export default function RefreshLeaguesButton() {
  const [loading, setLoading] = useState(false);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      // Force reload by clearing cache and refreshing
      window.location.reload();
    } catch (e) {
      console.error('Refresh failed:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleRefresh}
      disabled={loading}
      className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium shadow-sm"
    >
      {loading ? 'Refreshing...' : 'Refresh Leagues'}
    </button>
  );
}
