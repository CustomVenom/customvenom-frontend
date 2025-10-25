'use client';
import { useEffect, useState } from 'react';

interface FaabItem {
  player_id: string;
  name: string;
  team: string;
  position: string;
  suggested_min: number;
  suggested_mid: number;
  suggested_max: number;
  reason: string;
  confidence: number;
}

interface FaabBandsProps {
  week?: string;
}

export function FaabBands({ week = '2025-06' }: FaabBandsProps) {
  const [items, setItems] = useState<FaabItem[]>([]);
  const [schemaVersion, setSchemaVersion] = useState<string>('');
  const [lastRefresh, setLastRefresh] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFaabBands = async () => {
      try {
        setLoading(true);
        const apiBase = process.env['NEXT_PUBLIC_API_BASE'] || 'https://api.customvenom.com';
        const response = await fetch(`${apiBase}/faab_bands?week=${week}`, {
          cache: 'no-store'
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch FAAB bands: ${response.status}`);
        }

        const data = await response.json();
        // Show top 5-10 items
        setItems((data.items || []).slice(0, 10));
        setSchemaVersion(data.schema_version || 'v1');
        setLastRefresh(data.last_refresh || '');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch FAAB bands');
      } finally {
        setLoading(false);
      }
    };

    fetchFaabBands();
  }, [week]);

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-sm">
        <div className="text-center text-lg text-gray-600 py-5">Loading FAAB suggestions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-sm">
        <div className="text-center text-lg text-red-600 py-5">Error: {error}</div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 m-0">FAAB Bid Bands</h2>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Schema: {schemaVersion}</span>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <span className="text-5xl mb-4">💰</span>
          <span className="text-gray-600 text-lg">No FAAB suggestions</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 m-0">FAAB Bid Bands</h2>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Schema: {schemaVersion}</span>
          {lastRefresh && (
            <span>
              · Updated {new Date(lastRefresh).toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {items.map((item, index) => (
          <div key={item.player_id} className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-[#667eea] text-white rounded-full text-sm font-bold">#{index + 1}</span>
                <div>
                  <span className="font-semibold text-gray-900 text-lg block">{item.name}</span>
                  <span className="text-sm text-gray-600">
                    {item.team} · {item.position}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  {(item.confidence * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                <span className="block text-xs text-gray-600 mb-1">Min</span>
                <span className="block text-lg font-bold text-gray-900">${item.suggested_min}</span>
              </div>
              <div className="bg-[#667eea] text-white rounded-lg p-3 text-center">
                <span className="block text-xs mb-1">Mid</span>
                <span className="block text-lg font-bold">${item.suggested_mid}</span>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                <span className="block text-xs text-gray-600 mb-1">Max</span>
                <span className="block text-lg font-bold text-gray-900">${item.suggested_max}</span>
              </div>
            </div>

            {item.reason && (
              <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <span className="text-lg">💡</span>
                <span className="text-sm text-gray-700 flex-1">{item.reason}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}


