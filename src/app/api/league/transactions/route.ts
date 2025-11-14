import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(_req: NextRequest) {

  // Mock response - replace with real Yahoo API call when ready
  const mockTransactions = [
    {
      id: 'txn1',
      type: 'add',
      player: { name: 'Tank Dell', team: 'HOU' },
      team: 'Team Alpha',
      timestamp: '2025-11-13T10:30:00Z',
    },
    {
      id: 'txn2',
      type: 'drop',
      player: { name: 'Darnell Mooney', team: 'ATL' },
      team: 'Team Alpha',
      timestamp: '2025-11-13T10:30:00Z',
    },
    {
      id: 'txn3',
      type: 'trade',
      player: { name: 'Josh Allen', team: 'BUF' },
      team: 'Team Beta',
      timestamp: '2025-11-12T15:20:00Z',
    },
  ];

  const headers = new Headers({
    'x-schema-version': 'v2.1',
    'x-last-refresh': new Date().toISOString(),
    'x-request-id': 'mock-transactions',
    'x-stale': 'false',
    'content-type': 'application/json',
  });

  return new Response(JSON.stringify({ transactions: mockTransactions }), {
    headers,
    status: 200,
  });
}
