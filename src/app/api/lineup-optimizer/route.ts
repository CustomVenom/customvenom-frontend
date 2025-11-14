import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(_req: NextRequest) {

  // Mock response - replace with real optimizer when ready
  const mockSuggestions = [
    {
      swap: { out: 'player123', in: 'player456' },
      gain: 3.2,
      confidence: 0.78,
      reason: 'Better matchup',
    },
    {
      swap: { out: 'player789', in: 'player012' },
      gain: 2.1,
      confidence: 0.72,
      reason: 'Injury concern',
    },
    {
      swap: { out: 'player345', in: 'player678' },
      gain: 1.8,
      confidence: 0.68,
      reason: 'Volume increase',
    },
  ];

  const headers = new Headers({
    'x-schema-version': 'v2.1',
    'x-last-refresh': new Date().toISOString(),
    'x-request-id': 'mock-optimizer',
    'x-stale': 'false',
    'content-type': 'application/json',
  });

  return new Response(JSON.stringify({ suggestions: mockSuggestions }), {
    headers,
    status: 200,
  });
}
