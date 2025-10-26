'use client'

export default function YahooConnectButton() {
  const connect = () => {
    // Point directly to Workers API connect route
    window.location.href = `https://customvenom-workers-api.jdewett81.workers.dev/api/yahoo/connect?returnTo=${encodeURIComponent('/tools')}`;
  }

  return (
    <div className="p-4 border rounded-lg bg-yellow-50">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium">Yahoo Fantasy (read‑only)</div>
          <div className="text-sm opacity-80">Connect once, always return here.</div>
        </div>
        <button onClick={connect} className="px-3 py-2 rounded bg-black text-white">
          Connect Yahoo
        </button>
      </div>
    </div>
  )
}
