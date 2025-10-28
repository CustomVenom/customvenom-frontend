'use client'

import { useYahooLeagues, useYahooMe } from '@/hooks/useYahoo'
import Link from 'next/link'

export default function LeaguesPage() {
  const { data: me, isLoading: isLoadingMe, isError: isErrorMe } = useYahooMe()
  const { data: leagues, isLoading: isLoadingLeagues, isError: isErrorLeagues } = useYahooLeagues()

  if (isLoadingMe || isLoadingLeagues) return <div>Loading Yahoo data…</div>
  if (isErrorMe || isErrorLeagues) return <div>Could not load Yahoo data. Please connect Yahoo.</div>

  if (!me?.guid) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-3">
        <h1 className="text-lg font-semibold mb-3">My Yahoo Leagues</h1>
        <p>Please connect Yahoo to view your leagues.</p>
        <Link href="/tools" className="text-blue-500 hover:underline">
          Go to Tools to Connect Yahoo
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-3">
      <h1 className="text-lg font-semibold mb-3">My Yahoo Leagues</h1>
      
      {/* Clear Connected PASS Indicator */}
      <div role="status" className="text-sm text-green-700 bg-green-50 border border-green-200 rounded px-2 py-1 mb-4">
        Yahoo Connected — GUID: {me.guid} · Leagues: {leagues?.league_keys?.length || 0}
      </div>

      {leagues?.league_keys && leagues.league_keys.length > 0 ? (
        <>
          <h2 className="text-md font-semibold mt-4 mb-2">Your Leagues:</h2>
          <ul className="space-y-2">
            {leagues.league_keys.map((key) => (
              <li key={key} className="p-2 border rounded bg-gray-50">
                {key}
              </li>
            ))}
          </ul>
        </>
      ) : (
        <p className="mt-4">No leagues found for this Yahoo account.</p>
      )}
    </div>
  )
}