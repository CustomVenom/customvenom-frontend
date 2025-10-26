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

    // Workers-only: Use cookie-based auth (no NextAuth for Yahoo)
    // Session check removed - API will handle auth via cookies
    const hasSession = false; // Simplified for Workers-only flow

    if (!hasSession) {
      const connectHref = `${base}/api/connect/start?host=yahoo&from=${encodeURIComponent('/settings')}`;
      return (
        <div
          data-testid="yahoo-status"
          className="p-3 bg-yellow-50 border border-yellow-200 rounded"
        >
          Yahoo: not connected.{' '}
          <Link
            href={connectHref}
            className="underline text-blue-600"
            data-testid="yahoo-connect-btn"
          >
            Connect Yahoo
          </Link>
        </div>
      );
    }

    // Workers-only: Forward cookie to API (no Bearer token)
    const cookieHeader = cookies().toString();
    const fetchOptions: RequestInit = {
      headers: { 'cookie': cookieHeader },
      cache: 'no-store',
    };

    // Fetch user info
    const userInfo = await safeJson<{ user?: { email?: string } }>(
      fetch(`${base}/api/yahoo/me`, fetchOptions)
    );

    // Fetch leagues
    const leagues = await safeJson<{ leagues?: unknown[] }>(
      fetch(`${base}/api/yahoo/leagues`, fetchOptions)
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
