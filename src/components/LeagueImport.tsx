// League Import Component (Preview Testing)
// Simple form to test /api/league/import endpoint

'use client';

import { useState } from 'react';

export function LeagueImport() {
  const [leagueId, setLeagueId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

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
      const response = await fetch('/api/league/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'yahoo',
          league_id: leagueId.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Import failed');
      }

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
    <div style={{ 
      padding: '24px', 
      border: '1px solid #e5e7eb', 
      borderRadius: '8px',
      maxWidth: '600px',
    }}>
      <h2 style={{ marginTop: 0, marginBottom: '8px' }}>Import Yahoo League</h2>
      <p style={{ color: '#6b7280', marginBottom: '16px', fontSize: '14px' }}>
        Preview mode - tests API endpoint without actual import
      </p>

      <form onSubmit={handleImport}>
        <div style={{ marginBottom: '16px' }}>
          <label htmlFor="leagueId" style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>
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
        <div style={{
          marginTop: '16px',
          padding: '12px',
          backgroundColor: '#fee2e2',
          border: '1px solid #fca5a5',
          borderRadius: '6px',
          color: '#991b1b',
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {result && (
        <div style={{
          marginTop: '16px',
          padding: '12px',
          backgroundColor: '#d1fae5',
          border: '1px solid #6ee7b7',
          borderRadius: '6px',
        }}>
          <strong style={{ color: '#065f46' }}>✅ Success!</strong>
          <pre style={{
            marginTop: '8px',
            padding: '8px',
            backgroundColor: '#f9fafb',
            borderRadius: '4px',
            fontSize: '12px',
            overflow: 'auto',
          }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

