// League Import Component (Preview Testing)
// Shows Yahoo connection status and fetches leagues

'use client';

import { fetchJson, probeYahooMe } from '@/lib/api';
import { useEffect, useState } from 'react';

// Define a narrow helper to extract GUID safely
function extractYahooGuid(data: unknown): string | null {
  try {
    // Very defensive: fantasy_content.users[0].user[0].guid
    const fc = (data as Record<string, unknown>)?.['fantasy_content'] as
      | Record<string, unknown>
      | undefined;
    const users = fc?.['users'];
    if (!Array.isArray(users) || users.length === 0) return null;
    const userNode = users[0]?.['user'];
    if (!Array.isArray(userNode) || userNode.length === 0) return null;
    const first = userNode[0];
    return typeof first?.['guid'] === 'string' ? first['guid'] : null;
  } catch {
    return null;
  }
}

// Define a narrow helper to extract leagues safely
function extractYahooLeagues(data: unknown): Array<{
  name?: string;
  league_id?: string;
  season?: string;
}> {
  try {
    // Very defensive: fantasy_content.users[0].user[1].games[0].game[1].leagues
    const fc = (data as Record<string, unknown>)?.['fantasy_content'] as
      | Record<string, unknown>
      | undefined;
    const users = fc?.['users'];
    if (!Array.isArray(users) || users.length === 0) return [];
    const userNode = users[0]?.['user'];
    if (!Array.isArray(userNode) || userNode.length < 2) return [];
    const games = userNode[1]?.['games'];
    if (!Array.isArray(games) || games.length === 0) return [];
    const game = games[0]?.['game'];
    if (!Array.isArray(game) || game.length < 2) return [];
    const leagues = game[1]?.['leagues'];
    if (!Array.isArray(leagues)) return [];

    // Safely map the leagues to the expected type
    return leagues.map((league: Record<string, unknown>) => {
      const name = typeof league?.['name'] === 'string' ? league['name'] : undefined;
      const league_id = typeof league?.['league_id'] === 'string' ? league['league_id'] : undefined;
      const season = typeof league?.['season'] === 'string' ? league['season'] : undefined;

      return {
        ...(name !== undefined && { name }),
        ...(league_id !== undefined && { league_id }),
        ...(season !== undefined && { season }),
      };
    });
  } catch {
    return [];
  }
}

export function LeagueImport() {
  const [leagueId, setLeagueId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [yahooConnected, setYahooConnected] = useState(false);
  const [yahooGuid, setYahooGuid] = useState<string | null>(null);
  const [leagues, setLeagues] = useState<Array<{
    name?: string;
    league_id?: string;
    season?: string;
  }> | null>(null);
  const [fetchingLeagues, setFetchingLeagues] = useState(false);

  // Check Yahoo connection status on mount
  useEffect(() => {
    const checkYahooConnection = async () => {
      try {
        const result = await probeYahooMe();
        if (result.ok && result.data) {
          setYahooConnected(true);
          // Extract GUID from Yahoo response safely
          const guid = extractYahooGuid(result.data);
          setYahooGuid(guid ?? '');
        } else {
          console.warn('Yahoo /me failed', {
            error: result.error,
            requestId: result.requestId,
          });
        }
      } catch (err) {
        console.log('Yahoo not connected:', err);
      }
    };
    checkYahooConnection();
  }, []);

  const fetchLeagues = async () => {
    setFetchingLeagues(true);
    setError(null);
    try {
      const result = await fetchJson('/yahoo/leagues');
      if (!result.ok) {
        console.warn('Yahoo /leagues failed', {
          error: result.error,
          requestId: result.requestId,
        });
        throw new Error(result.error || 'Failed to fetch leagues');
      }
      console.log('Leagues response:', result.data);

      // Extract leagues from Yahoo response safely
      const leagues = extractYahooLeagues(result.data);
      setLeagues(leagues);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch leagues');
    } finally {
      setFetchingLeagues(false);
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!leagueId.trim()) {
      setError('Please enter a league ID');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const result = await fetchJson('/api/league/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'yahoo',
          league_id: leagueId.trim(),
        }),
      });

      if (!result.ok) {
        throw new Error(result.error || 'Import failed');
      }

      const data = result.data as Record<string, unknown>;

      setResult(data);
      console.log('League import result:', data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Something went wrong';
      setError(errorMessage);
      console.error('Import error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        padding: '24px',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        maxWidth: '600px',
      }}
    >
      <h2 style={{ marginTop: 0, marginBottom: '16px' }}>Yahoo Fantasy Integration</h2>

      {/* Yahoo Connection Status */}
      <div
        style={{
          marginBottom: '20px',
          padding: '16px',
          backgroundColor: yahooConnected ? '#d1fae5' : '#fef3c7',
          borderRadius: '8px',
          border: `1px solid ${yahooConnected ? '#6ee7b7' : '#fbbf24'}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
          <span style={{ fontSize: '18px', marginRight: '8px' }}>
            {yahooConnected ? '✅' : '⚠️'}
          </span>
          <strong style={{ color: yahooConnected ? '#065f46' : '#92400e' }}>
            {yahooConnected ? 'Yahoo Connected' : 'Yahoo Not Connected'}
          </strong>
        </div>
        {yahooConnected && yahooGuid && (
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px' }}>
            GUID:{' '}
            <code style={{ backgroundColor: '#f3f4f6', padding: '2px 4px', borderRadius: '4px' }}>
              {yahooGuid}
            </code>
          </div>
        )}
        {yahooConnected ? (
          <button
            onClick={fetchLeagues}
            disabled={fetchingLeagues}
            style={{
              backgroundColor: fetchingLeagues ? '#9ca3af' : '#3b82f6',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              cursor: fetchingLeagues ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            {fetchingLeagues ? 'Fetching...' : 'Fetch My Leagues'}
          </button>
        ) : (
          <a
            href="/tools"
            style={{
              display: 'inline-block',
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 500,
            }}
          >
            Go to Tools to Connect
          </a>
        )}
      </div>

      {/* Leagues Display */}
      {leagues && leagues.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ marginBottom: '12px', fontSize: '16px', fontWeight: 600 }}>
            Your Leagues ({leagues.length})
          </h3>
          <div
            style={{
              maxHeight: '200px',
              overflowY: 'auto',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
            }}
          >
            {leagues.map((league, index: number) => (
              <div
                key={index}
                style={{
                  padding: '12px',
                  borderBottom: index < leagues.length - 1 ? '1px solid #f3f4f6' : 'none',
                }}
              >
                <div style={{ fontWeight: 500, marginBottom: '4px' }}>
                  {league.name || 'Unnamed League'}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  ID: {league.league_id || 'N/A'} • Season: {league.season || 'N/A'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <h3 style={{ marginBottom: '8px', fontSize: '16px' }}>Import Yahoo League</h3>
      <p style={{ color: '#6b7280', marginBottom: '16px', fontSize: '14px' }}>
        Preview mode - tests API endpoint without actual import
      </p>

      <form onSubmit={handleImport}>
        <div style={{ marginBottom: '16px' }}>
          <label
            htmlFor="leagueId"
            style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}
          >
            Yahoo League ID:
          </label>
          <input
            id="leagueId"
            type="text"
            value={leagueId}
            onChange={(e) => setLeagueId(e.target.value)}
            placeholder="e.g., 12345"
            disabled={loading}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            backgroundColor: loading ? '#9ca3af' : '#3b82f6',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '6px',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 500,
          }}
        >
          {loading ? 'Testing...' : 'Test Import'}
        </button>
      </form>

      {error && (
        <div
          style={{
            marginTop: '16px',
            padding: '12px',
            backgroundColor: '#fee2e2',
            border: '1px solid #fca5a5',
            borderRadius: '6px',
            color: '#991b1b',
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div
          style={{
            marginTop: '16px',
            padding: '12px',
            backgroundColor: '#d1fae5',
            border: '1px solid #6ee7b7',
            borderRadius: '6px',
          }}
        >
          <strong style={{ color: '#065f46' }}>✅ Success!</strong>
          <pre
            style={{
              marginTop: '8px',
              padding: '8px',
              backgroundColor: '#f9fafb',
              borderRadius: '4px',
              fontSize: '12px',
              overflow: 'auto',
            }}
          >
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
