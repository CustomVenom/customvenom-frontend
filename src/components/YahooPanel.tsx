'use server';

import { cookies } from 'next/headers';
import Link from 'next/link';

async function safeJson<T>(promise: Promise<Response>): Promise<T | null> {
  try {
    const response = await promise;
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

export default async function YahooPanel() {
  try {
    const base = process.env['NEXT_PUBLIC_API_BASE'];
    if (!base) {
      return (
        <div
          data-testid="yahoo-status"
          className="p-3 bg-yellow-50 border border-yellow-200 rounded"
        >
          Yahoo: not configured
        </div>
      );
    }

    // Get NextAuth session
    const { auth } = await import('../lib/auth');
    const session = await auth();

    if (!session?.user?.sub) {
      return (
        <div
          data-testid="yahoo-status"
          className="p-3 bg-yellow-50 border border-yellow-200 rounded"
        >
          Yahoo: not connected.{' '}
          <Link
            href="/api/auth/signin/yahoo?callbackUrl=/settings"
            className="underline text-blue-600"
            data-testid="yahoo-connect-btn"
          >
            Connect Yahoo
          </Link>
        </div>
      );
    }

    // Fetch user info
    const userInfo = await safeJson<{ user?: { email?: string } }>(
      fetch(`${base}/api/yahoo/me`, {
        headers: {
          'authorization': `Bearer ${session.user.sub}`,
        },
        cache: 'no-store',
      })
    );

    // Fetch leagues
    const leagues = await safeJson<{ leagues?: unknown[] }>(
      fetch(`${base}/api/yahoo/leagues`, {
        headers: {
          'authorization': `Bearer ${session.user.sub}`,
        },
        cache: 'no-store',
      })
    );

    const leagueCount = leagues?.leagues?.length ?? 0;

    return (
      <div
        data-testid="yahoo-connected"
        className="p-3 bg-green-50 border border-green-200 rounded"
      >
        <div className="font-semibold text-green-900 mb-2">Yahoo Connected</div>
        <div className="text-sm text-green-700">
          {userInfo?.user?.email && <div>Email: {userInfo.user.email}</div>}
          {leagueCount > 0 && <div>Leagues: {leagueCount}</div>}
        </div>
      </div>
    );
  } catch (error: unknown) {
    const err = error as { message?: string; digest?: string };
    console.error(
      JSON.stringify({
        scope: '[settings.yahoo]',
        err: err?.message,
        digest: err?.digest || null,
      })
    );
    // Re-throw to trigger error boundary if present
    throw error;
  }
}
