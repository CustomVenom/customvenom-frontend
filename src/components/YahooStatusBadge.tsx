// Yahoo Status Badge Component
// Server-side component that reads y_at cookie and displays connection status

import { cookies } from 'next/headers';

export async function YahooStatusBadge() {
  const { auth } = await import('../lib/auth');
  const session = await auth();
  const yahooToken = session?.user?.sub;
  const yahooGuid = session?.user?.yah;

  if (!yahooToken) {
    return (
      <div
        data-testid="yahoo-status"
        className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
      >
        <span className="text-yellow-600">⚠️</span>
        <div>
          <div className="font-medium text-yellow-800">Yahoo Not Connected</div>
          <div className="text-sm text-yellow-600">Connect to import your fantasy leagues</div>
        </div>
        <a
          data-testid="yahoo-connect-btn"
          href="https://www.customvenom.com/api/yahoo/connect"
          className="ml-auto px-3 py-1 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700 transition-colors"
        >
          Connect Yahoo
        </a>
      </div>
    );
  }

  return (
    <div
      data-testid="yahoo-status"
      className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg"
    >
      <span className="text-green-600">✅</span>
      <div className="flex-1">
        <div data-testid="yahoo-connected" className="font-medium text-green-800">
          Yahoo Connected {yahooGuid && `— ${yahooGuid}`}
        </div>
        {yahooGuid && (
          <div className="text-sm text-green-600">
            GUID: <code className="bg-green-100 px-1 rounded text-xs">{yahooGuid}</code>
          </div>
        )}
      </div>
      <div className="text-sm text-green-600">Ready to fetch leagues</div>
    </div>
  );
}
